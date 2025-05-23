const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const path = require('path');
const mongoose = require('mongoose');
const Player = require('./models/Player');

// Set Mongoose strictQuery option
mongoose.set('strictQuery', false);

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/quiz_game', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('MongoDB connection successful');
}).catch(err => {
    console.error('MongoDB connection failed:', err);
});

// Serve static files
app.use('/styles', express.static(path.join(__dirname, 'src/styles')));
app.use('/scripts', express.static(path.join(__dirname, 'src/scripts')));
app.use('/img', express.static(path.join(__dirname, 'src/assets/img')));
app.use('/music', express.static(path.join(__dirname, 'src/assets/music')));
app.use('/public', express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'src/html')));

// Set routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'src/html/Homepage.html'));
});

app.get('/game', (req, res) => {
    res.sendFile(path.join(__dirname, 'src/html/OnlineGame.html'));
});

app.get('/wings', (req, res) => {
    res.sendFile(path.join(__dirname, 'src/html/Artworks_Wings.html'));
});

app.get('/page4', (req, res) => {
    res.sendFile(path.join(__dirname, 'src/html/AboutMe.html'));
});

app.get('/mytrace', (req, res) => {
    res.sendFile(path.join(__dirname, 'src/html/Mytrace.html'));
});

// Handle 404 errors
app.use((req, res) => {
    res.status(404).sendFile(path.join(__dirname, 'src/html/Homepage.html'));
});

// Game configuration
const QUESTION_TIME = 10; // Time for each question (seconds)
const BREAK_TIME = 5; // Break time between questions (seconds)
const POINTS_CORRECT_FIRST = 2; // Points for first correct answer
const POINTS_CORRECT_SECOND = 1; // Points for second correct answer
const POINTS_WRONG = 0; // Points for wrong answer

// Question bank - World Flags Theme
const questions = [
    {
        text: " Why we name 'Deep' learning ? ",
        
        options: ["A.Large quantity of nn layers", "B.Black box question", "C.Long time to train", "D.All of above"],
        correctAnswer: 0
    },
    {
        text: "To be or not to be, this is a ____.",
        options: ["Problem", "Question", "joke", "dilemma"],
        correctAnswer: 1
    },
    {
        text: "🎵 Do you wanna build a ______ ? 🎵",
        options: ["band", "house", "Snowman", "transfomer"],
        correctAnswer: 2
    },
    {
        text: "Which country's flag is this?",
        image: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/ba/Flag_of_Germany.svg/800px-Flag_of_Germany.svg.png",
        options: ["Belgium", "Germany", "Netherlands", "France"],
        correctAnswer: 1
    },
    {
        text: "What is the capital of France?",
        options: ["Paris", "London", "Berlin", "Madrid"],
        correctAnswer: 0
    }
];

// Online players management
const onlinePlayers = new Map(); // socket.id -> playerName
const playerSockets = new Map(); // playerName -> socket.id

// Game session management
const activeGames = new Map(); // gameId -> gameState
const playerGames = new Map(); // playerName -> gameId

// Broadcast online players list
async function broadcastPlayerList() {
    const players = Array.from(onlinePlayers.values());
    const playersData = await Promise.all(players.map(async (playerName) => {
        const player = await Player.findOne({ name: playerName });
        return {
            name: playerName,
            stats: player ? player.getStats() : null
        };
    }));

    // 向每个玩家广播其他玩家的列表（不包含自己）
    onlinePlayers.forEach((playerName, socketId) => {
        const otherPlayers = playersData.filter(p => p.name !== playerName);
        // 发送在线玩家列表（不包含自己）
        io.to(socketId).emit('playersList', otherPlayers);
        // 发送完整排行榜（包含所有玩家）
        io.to(socketId).emit('rankList', playersData);
    });
}

// Create new game
function createGame(player1, player2) {
    const gameId = `${player1}_vs_${player2}`;
    const gameState = {
        players: [player1, player2],
        scores: {
            player1: { name: player1, score: 0 },
            player2: { name: player2, score: 0 }
        },
        currentQuestionIndex: 0,
        answers: new Map(),
        timer: null,
        status: 'waiting'
    };
    
    activeGames.set(gameId, gameState);
    playerGames.set(player1, gameId);
    playerGames.set(player2, gameId);
    
    return gameId;
}

// Start new question
function startNewQuestion(gameId) {
    console.log('Starting new question, Game ID:', gameId);
    const game = activeGames.get(gameId);
    if (!game) {
        console.log('Game does not exist:', gameId);
        return;
    }
    
    if (game.currentQuestionIndex >= questions.length) {
        console.log('Questions exhausted, ending game');
        endGame(gameId);
        return;
    }

    console.log('Game status:', {
        status: game.status,
        currentQuestionIndex: game.currentQuestionIndex,
        players: game.players
    });

    game.status = 'playing';
    game.answers.clear();
    const question = questions[game.currentQuestionIndex];
    
    // Send question to both players
    game.players.forEach(playerName => {
        const socketId = playerSockets.get(playerName);
        console.log('Sending question to player:', {
            playerName,
            socketId,
            hasSocket: !!socketId
        });
        
        if (socketId) {
            io.to(socketId).emit('gameStart', {
                currentQuestion: {
                    text: question.text,
                    image: question.image,
                    options: question.options
                },
                scores: game.scores
            });
        }
    });

    // Set question timer
    let timeLeft = QUESTION_TIME;
    if (game.timer) {
        console.log('Clearing old timer');
        clearInterval(game.timer);
    }
    
    console.log('Setting new timer');
    // Send initial time immediately
    game.players.forEach(playerName => {
        const socketId = playerSockets.get(playerName);
        if (socketId) {
            io.to(socketId).emit('timer', timeLeft);
        }
    });

    game.timer = setInterval(() => {
        timeLeft--;
        console.log('Timer update:', timeLeft);
        
        // Broadcast to all players
        game.players.forEach(playerName => {
            const socketId = playerSockets.get(playerName);
            if (socketId) {
                io.to(socketId).emit('timer', timeLeft);
            }
        });

        if (timeLeft <= 0) {
            console.log('Time up, evaluating round');
            clearInterval(game.timer);
            game.timer = null;
            evaluateRound(gameId);
        }
    }, 1000);
}

// Evaluate round results
function evaluateRound(gameId) {
    const game = activeGames.get(gameId);
    if (!game) return;

    clearInterval(game.timer);
    const question = questions[game.currentQuestionIndex];
    const correctAnswer = question.correctAnswer;
    
    // Calculate scores
    game.players.forEach(playerName => {
        const answer = game.answers.get(playerName);
        const socketId = playerSockets.get(playerName);
        
        if (answer !== undefined) {
            if (answer === correctAnswer) {
                // First correct answer gets 2 points, second gets 1 point
                const isFirstCorrect = Array.from(game.answers.values()).indexOf(correctAnswer) === Array.from(game.answers.keys()).indexOf(playerName);
                game.scores[playerName === game.players[0] ? 'player1' : 'player2'].score += isFirstCorrect ? POINTS_CORRECT_FIRST : POINTS_CORRECT_SECOND;
                
                io.to(socketId).emit('roundResult', {
                    correct: true,
                    message: isFirstCorrect ? 'Congratulations! You were the first to answer correctly!' : 'Correct answer!',
                    scores: game.scores
                });
            } else {
                game.scores[playerName === game.players[0] ? 'player1' : 'player2'].score += POINTS_WRONG;
                io.to(socketId).emit('roundResult', {
                    correct: false,
                    message: 'Wrong answer!',
                    scores: game.scores
                });
            }
        } else {
            // No answer
            game.scores[playerName === game.players[0] ? 'player1' : 'player2'].score += POINTS_WRONG;
            io.to(socketId).emit('roundResult', {
                correct: false,
                message: 'Time\'s up! You didn\'t answer.',
                scores: game.scores
            });
        }
    });

    game.currentQuestionIndex++;
    
    // Start next question after break time
    setTimeout(() => {
        if (game.currentQuestionIndex < questions.length) {
            startNewQuestion(gameId);
        } else {
            endGame(gameId);
        }
    }, BREAK_TIME * 1000);
}

// End game and update database
async function endGame(gameId) {
    const game = activeGames.get(gameId);
    if (!game) return;

    // Determine winner
    const player1Score = game.scores.player1.score;
    const player2Score = game.scores.player2.score;
    const winner = player1Score > player2Score ? game.players[0] : 
                  player2Score > player1Score ? game.players[1] : 
                  'Draw';

    // Update player records in database
    try {
        const player1 = await Player.findOne({ name: game.players[0] });
        const player2 = await Player.findOne({ name: game.players[1] });

        if (player1) {
            await player1.addGameRecord(game.players[1], player1Score, player2Score);
        }
        if (player2) {
            await player2.addGameRecord(game.players[0], player2Score, player1Score);
        }
    } catch (err) {
        console.error('Failed to update player records:', err);
    }

    // Notify players of game end
    game.players.forEach(async (playerName) => {
        const socketId = playerSockets.get(playerName);
        const player = await Player.findOne({ name: playerName });
        io.to(socketId).emit('gameEnd', {
            winner,
            scores: game.scores,
            stats: player ? player.getStats() : null
        });
    });

    // Clean up game state
    game.players.forEach(playerName => {
        playerGames.delete(playerName);
    });
    activeGames.delete(gameId);
}

// Get current question
function getCurrentQuestion(gameId) {
    const game = activeGames.get(gameId);
    if (!game || game.currentQuestionIndex >= questions.length) {
        return null;
    }
    return questions[game.currentQuestionIndex];
}

// Get game scores
function getGameScores(gameId) {
    const game = activeGames.get(gameId);
    return game ? game.scores : null;
}

// Socket.IO connection handling
io.on('connection', (socket) => {
    // Player login
    socket.on('login', async (playerName) => {
        if (!onlinePlayers.has(socket.id) && !Array.from(onlinePlayers.values()).includes(playerName)) {
            // Find or create player in database
            try {
                let player = await Player.findOne({ name: playerName });
                if (!player) {
                    player = new Player({ name: playerName });
                    await player.save();
                }
                
                onlinePlayers.set(socket.id, playerName);
                playerSockets.set(playerName, socket.id);
                socket.emit('loginResponse', { success: true, stats: player.getStats() });
                broadcastPlayerList();
            } catch (err) {
                console.error('Player login failed:', err);
                socket.emit('loginResponse', { success: false, error: 'Login failed' });
            }
        } else {
            socket.emit('loginResponse', { success: false, error: 'Username already exists' });
        }
    });

    // Handle game invitation
    socket.on('challengePlayer', (targetPlayer) => {
        const challenger = onlinePlayers.get(socket.id);
        const targetSocketId = playerSockets.get(targetPlayer);
        
        if (targetSocketId) {
            // Send invitation to target player
            io.to(targetSocketId).emit('challengeRequest', challenger);
        }
    });

    // Handle challenge acceptance
    socket.on('acceptChallenge', (challenger) => {
        console.log('Received challenge request:', challenger);
        const player2 = onlinePlayers.get(socket.id);
        const player1SocketId = playerSockets.get(challenger);
        
        console.log('Player information:', {
            challenger,
            player2,
            player1SocketId,
            socketId: socket.id
        });
        
        if (player1SocketId && player2) {
            console.log('Starting game creation...');
            // Create new game
            const gameId = createGame(challenger, player2);
            console.log('Game created successfully, ID:', gameId);
            
            // Start new question
            startNewQuestion(gameId);
            console.log('New question started');
        } else {
            console.log('Cannot start game:', {
                hasPlayer1Socket: !!player1SocketId,
                hasPlayer2: !!player2
            });
        }
    });

    // Handle challenge rejection
    socket.on('rejectChallenge', (challenger) => {
        const player2 = onlinePlayers.get(socket.id);
        const player1SocketId = playerSockets.get(challenger);
        
        if (player1SocketId) {
            // Notify challenger of rejection
            io.to(player1SocketId).emit('challengeRejected', player2);
        }
    });

    // Submit answer
    socket.on('submitAnswer', (answerIndex) => {
        const playerName = onlinePlayers.get(socket.id);
        const gameId = playerGames.get(playerName);
        const game = activeGames.get(gameId);
        
        if (game && game.status === 'playing' && !game.answers.has(playerName)) {
            game.answers.set(playerName, answerIndex);
            
            // If both players have answered, evaluate results immediately
            if (game.answers.size === 2) {
                clearInterval(game.timer);
                evaluateRound(gameId);
            }
        }
    });

    // Return to lobby
    socket.on('returnToLobby', () => {
        const playerName = onlinePlayers.get(socket.id);
        if (playerName) {
            const gameId = playerGames.get(playerName);
            if (gameId) {
                const game = activeGames.get(gameId);
                if (game) {
                    game.players.forEach(p => {
                        if (p !== playerName) {
                            const otherSocketId = playerSockets.get(p);
                            io.to(otherSocketId).emit('opponentLeft');
                        }
                    });
                    endGame(gameId);
                }
            }
        }
    });

    // Disconnect handling
    socket.on('disconnect', () => {
        const playerName = onlinePlayers.get(socket.id);
        if (playerName) {
            const gameId = playerGames.get(playerName);
            if (gameId) {
                const game = activeGames.get(gameId);
                if (game) {
                    game.players.forEach(p => {
                        if (p !== playerName) {
                            const otherSocketId = playerSockets.get(p);
                            io.to(otherSocketId).emit('opponentLeft');
                        }
                    });
                    endGame(gameId);
                }
            }
            onlinePlayers.delete(socket.id);
            playerSockets.delete(playerName);
            broadcastPlayerList();
        }
    });
});

// Start server
const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
