const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const path = require('path');

// =============== 服务器配置 ===============
// Serve static files
app.use('/styles', express.static(path.join(__dirname, 'src/styles')));
app.use('/scripts', express.static(path.join(__dirname, 'src/scripts')));
app.use('/img', express.static(path.join(__dirname, 'src/assets/img')));
app.use('/music', express.static(path.join(__dirname, 'src/assets/music')));
app.use('/public', express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'src')));

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

// =============== 游戏配置 ===============
const QUESTION_TIME = 10; // Time for each question (seconds)
const BREAK_TIME = 8; // Break time between questions (seconds)
const POINTS_CORRECT_FIRST = 2; // Points for first correct answer
const POINTS_CORRECT_SECOND = 0; // Points for second correct answer
const POINTS_WRONG = 0; // Points for wrong answer
const POINTS_OPPONENT_WRONG = 1; // Points when opponent answers wrong

// Question bank
const questions = [
    {
        text: " Why we name 'Deep' learning ? ",
        
        options: ["A.Large quantity of nn layers", "B.Black box question", "C.Long time to train", "D.All of above"],
        correctAnswer: 0
    },
    {
        text: "To be or not to be, this is a ____.",
        options: ["A.Problem", "B.Question", "C.joke", "D.dilemma"],
        correctAnswer: 1
    },
    {
        text: "🎵 Do you wanna build a ______ ? 🎵",
        options: ["A.band", "B.house", "C.Snowman", "D.transfomer"],
        correctAnswer: 2
    },
    {
        text: "an __ a day, keeps the doctor away",
        options: ["A.banana", "B.apple", "C.orange", "D.pear"],
        correctAnswer: 1
    },
    {
        text: "Where is the capital of France?",
        options: ["A.Paris", "B.London", "C.Berlin", "D.Madrid"],
        correctAnswer: 0
    }
];

// =============== 用户数据管理 ===============
// 用户数据结构
class Player {
    constructor(name) {
        this.name = name;
        this.gamesPlayed = 0;
        this.gamesWon = 0;
        this.totalPoints = 0;
        this.gameHistory = [];
    }

    addGameRecord(opponent, myScore, opponentScore) {
        this.gamesPlayed++;
        if (myScore > opponentScore) {
            this.gamesWon++;
        }
        this.totalPoints += myScore;
        this.gameHistory.push({
            opponent,
            myScore,
            opponentScore,
            timestamp: Date.now()
        });
    }

    getStats() {
        const totalGames = this.gamesPlayed;
        const gamesWon = this.gamesWon;
        const winRate = totalGames > 0 ? (gamesWon / totalGames * 100).toFixed(1) : 0;
        const totalPoints = this.totalPoints;
        const averagePoints = totalGames > 0 ? (totalPoints / totalGames).toFixed(1) : 0;
        
        // 计算最近5场比赛的胜率
        const recentGames = this.gameHistory.slice(-5);
        const recentWins = recentGames.filter(game => game.myScore > game.opponentScore).length;
        const recentWinRate = recentGames.length > 0 ? (recentWins / recentGames.length * 100).toFixed(1) : 0;

        return {
            name: this.name,
            totalGames,
            gamesWon,
            winRate,
            totalPoints,
            averagePoints,
            recentWinRate,
            lastPlayed: this.gameHistory.length > 0 ? this.gameHistory[this.gameHistory.length - 1].timestamp : null
        };
    }
}

// 用户数据存储
const players = new Map(); // name -> Player object

// =============== 游戏状态管理 ===============
// Online players management
const onlinePlayers = new Map(); // socket.id -> playerName
const playerSockets = new Map(); // playerName -> socket.id

// Game session management
const activeGames = new Map(); // gameId -> gameState
const playerGames = new Map(); // playerName -> gameId

// 在文件开头的全局变量部分添加
const playerStatus = new Map(); // 跟踪玩家状态

// =============== 在线列表维护 ===============
// Broadcast online players list
function broadcastPlayerList() {
    const playersList = Array.from(onlinePlayers.values()).map(playerName => {
        const player = players.get(playerName);
        const status = playerStatus.get(playerName) || 'online';
        console.log(`Broadcasting player ${playerName} with status: ${status}`);
        return {
            name: playerName,
            stats: player ? player.getStats() : null,
            status: status
        };
    });
    io.emit('playersList', playersList);
    // 同时发送排行榜信息
    io.emit('rankList', playersList);
}

// =============== 游戏逻辑函数 ===============
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
    
    // Update player status to ingame
    playerStatus.set(player1, 'ingame');
    playerStatus.set(player2, 'ingame');
    
    // Broadcast updated player list to all clients
    const playersList = Array.from(onlinePlayers.values()).map(playerName => {
        const player = players.get(playerName);
        return {
            name: playerName,
            stats: player ? player.getStats() : null,
            status: playerStatus.get(playerName) || 'online'
        };
    });
    io.emit('playersList', playersList);
    
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
    if (!question) {
        console.error('No question found for index:', game.currentQuestionIndex);
        return;
    }
    const correctAnswer = question.correctAnswer;
    
    // 获取玩家回答的顺序
    const answerOrder = Array.from(game.answers.entries())
        .sort((a, b) => a[1].timestamp - b[1].timestamp);
    
    // 检查是否有玩家答对
    const firstCorrectAnswer = answerOrder.find(([_, answer]) => answer.answer === correctAnswer);
    
    if (firstCorrectAnswer) {
        // 有玩家答对了，第一个答对的得2分，回合结束
        const [playerName, _] = firstCorrectAnswer;
        const socketId = playerSockets.get(playerName);
        const opponentName = game.players.find(p => p !== playerName);
        
        // 给答对的玩家加2分
        game.scores[playerName === game.players[0] ? 'player1' : 'player2'].score += 2;
        
        // 通知答对的玩家
        io.to(socketId).emit('roundResult', {
            correct: true,
            message: 'Great! You answered correctly first and got 2 points!',
            scores: game.scores,
            correctAnswer: question.options[correctAnswer]
        });
        
        // 通知对手
        const opponentSocketId = playerSockets.get(opponentName);
        if (opponentSocketId) {
            io.to(opponentSocketId).emit('roundResult', {
                correct: false,
                message: 'Opponent answered correctly first, you get 0 points',
                scores: game.scores,
                correctAnswer: question.options[correctAnswer]
            });
        }
    } else {
        // 检查两个玩家的回答情况
        const player1Name = game.players[0];
        const player2Name = game.players[1];
        const player1Answer = game.answers.get(player1Name);
        const player2Answer = game.answers.get(player2Name);
        
        // 如果两个玩家都回答了（都答错了）
        if (player1Answer !== undefined && player2Answer !== undefined) {
            // 两个玩家都答错了，互相给对方1分
            game.scores.player1.score += 1;
            game.scores.player2.score += 1;
            
            // 通知两个玩家
            const player1SocketId = playerSockets.get(player1Name);
            const player2SocketId = playerSockets.get(player2Name);
            
            if (player1SocketId) {
                io.to(player1SocketId).emit('roundResult', {
                    correct: false,
                    message: 'Both players answered wrong, you both get 1 point!',
                    scores: game.scores,
                    correctAnswer: question.options[correctAnswer]
                });
            }
            
            if (player2SocketId) {
                io.to(player2SocketId).emit('roundResult', {
                    correct: false,
                    message: 'Both players answered wrong, you both get 1 point!',
                    scores: game.scores,
                    correctAnswer: question.options[correctAnswer]
                });
            }
        } else {
            // 只有一个玩家回答了（答错了）
            game.players.forEach(playerName => {
                const answer = game.answers.get(playerName);
                const socketId = playerSockets.get(playerName);
                const opponentName = game.players.find(p => p !== playerName);
                
                if (answer !== undefined) {
                    // 答错的玩家得0分，对手得1分
                    game.scores[playerName === game.players[0] ? 'player1' : 'player2'].score += 0;
                    game.scores[opponentName === game.players[0] ? 'player1' : 'player2'].score += 1;
                    
                    io.to(socketId).emit('roundResult', {
                        correct: false,
                        message: 'Wrong answer! You get 0 points.',
                        scores: game.scores,
                        correctAnswer: question.options[correctAnswer]
                    });
                    
                    // 通知对手
                    const opponentSocketId = playerSockets.get(opponentName);
                    if (opponentSocketId) {
                        io.to(opponentSocketId).emit('roundResult', {
                            correct: true,
                            message: 'Opponent answered wrong, you get 1 point!',
                            scores: game.scores,
                            correctAnswer: question.options[correctAnswer]
                        });
                    }
                } else {
                    // 没有回答，得0分
                    game.scores[playerName === game.players[0] ? 'player1' : 'player2'].score += 0;
                    io.to(socketId).emit('roundResult', {
                        correct: false,
                        message: 'Time\'s up! You didn\'t answer. No points.',
                        scores: game.scores,
                        correctAnswer: question.options[correctAnswer]
                    });
                }
            });
        }
    }

    game.currentQuestionIndex++;
    
    // 开始下一题
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

    // Update player records
    try {
        const player1 = players.get(game.players[0]);
        const player2 = players.get(game.players[1]);

        if (player1) {
            player1.addGameRecord(game.players[1], player1Score, player2Score);
        }
        if (player2) {
            player2.addGameRecord(game.players[0], player2Score, player1Score);
        }
    } catch (err) {
        console.error('Failed to update player records:', err);
    }

    // Notify players of game end
    game.players.forEach(async (playerName) => {
        const socketId = playerSockets.get(playerName);
        const player = players.get(playerName);
        if (socketId) {
            io.to(socketId).emit('gameEnd', {
                winner,
                scores: game.scores,
                stats: player ? player.getStats() : null
            });

            if (player) {
                io.to(socketId).emit('personalStatsUpdate', player.getStats());
            }
        }
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

// =============== Socket.IO 连接处理 ===============
io.on('connection', (socket) => {
    // 登录处理
    socket.on('login', (playerName) => {
        if (!onlinePlayers.has(socket.id) && !Array.from(onlinePlayers.values()).includes(playerName)) {
            let player = players.get(playerName);
            if (!player) {
                player = new Player(playerName);
                players.set(playerName, player);
            }
            
            onlinePlayers.set(socket.id, playerName);
            playerSockets.set(playerName, socket.id);
            playerStatus.set(playerName, 'online'); // 初始化玩家状态
            socket.emit('loginResponse', { success: true, stats: player.getStats() });
            broadcastPlayerList();
        } else {
            socket.emit('loginResponse', { success: false, error: 'Repeat name' });
        }
    });

    // Handle game invitation
    socket.on('challengePlayer', (targetPlayer) => {
        const challenger = onlinePlayers.get(socket.id);
        const targetSocketId = playerSockets.get(targetPlayer);
        
        if (targetSocketId) {
            const targetStatus = playerStatus.get(targetPlayer);
            if (targetStatus === 'ingame') {
                socket.emit('challengeRejected', {
                    player: targetPlayer,
                    reason: 'Player is currently in a game'
                });
                return;
            }
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
            game.answers.set(playerName, {
                answer: answerIndex,
                timestamp: Date.now()
            });
            
            // If both players have answered, evaluate results immediately
            if (game.answers.size === 2) {
                clearInterval(game.timer);
                evaluateRound(gameId);
            }
        }
    });

    // Handle return to lobby
    socket.on('returnToLobby', () => {
        const playerName = onlinePlayers.get(socket.id);
        if (playerName) {
            // Reset player status to online only when returning to lobby
            playerStatus.set(playerName, 'online');
            
            // Broadcast updated player list and rankings
            const playersList = Array.from(onlinePlayers.values()).map(playerName => {
                const player = players.get(playerName);
                return {
                    name: playerName,
                    stats: player ? player.getStats() : null,
                    status: playerStatus.get(playerName) || 'online'
                };
            });
            io.emit('playersList', playersList);
            io.emit('rankList', playersList);
        }
    });

    // Handle disconnect
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
            playerStatus.delete(playerName);
            
            // Broadcast updated player list and rankings
            const playersList = Array.from(onlinePlayers.values()).map(playerName => {
                const player = players.get(playerName);
                return {
                    name: playerName,
                    stats: player ? player.getStats() : null,
                    status: playerStatus.get(playerName) || 'online'
                };
            });
            io.emit('playersList', playersList);
            io.emit('rankList', playersList);
        }
    });
});

// =============== 启动服务器 ===============
const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
