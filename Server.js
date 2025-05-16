const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const path = require('path');
const mongoose = require('mongoose');
const Player = require('./models/Player');

// 设置 Mongoose strictQuery 选项
mongoose.set('strictQuery', false);

// 连接MongoDB
mongoose.connect('mongodb://localhost:27017/quiz_game', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('MongoDB连接成功');
}).catch(err => {
    console.error('MongoDB连接失败:', err);
});

// 服务静态文件
app.use(express.static(path.join(__dirname)));
app.use('/public', express.static(path.join(__dirname, 'public')));
app.use('/img', express.static(path.join(__dirname, 'img')));
app.use('/music', express.static(path.join(__dirname, 'music')));


// 设置路由
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/game', (req, res) => {
    res.sendFile(path.join(__dirname, 'page3.html'));
});

// 确保其他页面也能正确路由
app.get('/wings', (req, res) => {
    res.sendFile(path.join(__dirname, 'wings.html'));
});

app.get('/page4', (req, res) => {
    res.sendFile(path.join(__dirname, 'page4.html'));
});



// 处理404错误
app.use((req, res) => {
    res.status(404).sendFile(path.join(__dirname, 'index.html'));
});

// 游戏配置
const QUESTION_TIME = 10; // 每个问题的答题时间（秒）
const BREAK_TIME = 5; // 问题之间的休息时间（秒）
const POINTS_CORRECT_FIRST = 2; // 第一个答对的玩家得分
const POINTS_CORRECT_SECOND = 1; // 第二个答对的玩家得分
const POINTS_WRONG = 0; // 答错得分

// 问题库 - 世界各国国旗主题
const questions = [
    {
        text: "这是哪个国家的国旗？",
        image: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/Flag_of_the_People%27s_Republic_of_China.svg/800px-Flag_of_the_People%27s_Republic_of_China.svg.png",
        options: ["中国", "越南", "苏联", "朝鲜"],
        correctAnswer: 0
    },
    {
        text: "这是哪个国家的国旗？",
        image: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/Flag_of_Japan.svg/800px-Flag_of_Japan.svg.png",
        options: ["韩国", "日本", "老挝", "新加坡"],
        correctAnswer: 1
    },
    {
        text: "这是哪个国家的国旗？",
        image: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/09/Flag_of_South_Korea.svg/800px-Flag_of_South_Korea.svg.png",
        options: ["朝鲜", "日本", "韩国", "蒙古"],
        correctAnswer: 2
    },
    {
        text: "这是哪个国家的国旗？",
        image: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/ba/Flag_of_Germany.svg/800px-Flag_of_Germany.svg.png",
        options: ["比利时", "德国", "荷兰", "法国"],
        correctAnswer: 1
    },
    {
        text: "这是哪个国家的国旗？",
        image: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e2/Flag_of_the_United_States.svg/800px-Flag_of_the_United_States.svg.png",
        options: ["英国", "澳大利亚", "新西兰", "美国"],
        correctAnswer: 3
    }
];

// 在线玩家管理
const onlinePlayers = new Map(); // socket.id -> playerName
const playerSockets = new Map(); // playerName -> socket.id

// 游戏会话管理
const activeGames = new Map(); // gameId -> gameState
const playerGames = new Map(); // playerName -> gameId

// 广播在线玩家列表
async function broadcastPlayersList() {
    const players = Array.from(onlinePlayers.values());
    const playersData = await Promise.all(players.map(async (playerName) => {
        const player = await Player.findOne({ name: playerName });
        return {
            name: playerName,
            stats: player ? player.getStats() : null
        };
    }));
    io.emit('playersList', playersData);
}

// 创建新游戏
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

// 开始新问题
function startNewQuestion(gameId) {
    const game = activeGames.get(gameId);
    if (!game || game.currentQuestionIndex >= questions.length) {
        endGame(gameId);
        return;
    }

    game.status = 'playing';
    game.answers.clear();
    const question = questions[game.currentQuestionIndex];
    
    // 向两个玩家发送问题
    game.players.forEach(playerName => {
        const socketId = playerSockets.get(playerName);
        io.to(socketId).emit('gameStart', {
            currentQuestion: {
                text: question.text,
                image: question.image,
                options: question.options
            },
            scores: game.scores
        });
    });

    // 设置问题计时器
    let timeLeft = QUESTION_TIME;
    game.timer = setInterval(() => {
        timeLeft--;
        game.players.forEach(playerName => {
            const socketId = playerSockets.get(playerName);
            io.to(socketId).emit('timer', timeLeft);
        });

        if (timeLeft <= 0) {
            clearInterval(game.timer);
            evaluateRound(gameId);
        }
    }, 1000);
}

// 评估回合结果
function evaluateRound(gameId) {
    const game = activeGames.get(gameId);
    if (!game) return;

    clearInterval(game.timer);
    const question = questions[game.currentQuestionIndex];
    const correctAnswer = question.correctAnswer;
    
    // 计算得分
    game.players.forEach(playerName => {
        const answer = game.answers.get(playerName);
        const socketId = playerSockets.get(playerName);
        
        if (answer !== undefined) {
            if (answer === correctAnswer) {
                // 第一个答对得2分，第二个答对得1分
                const isFirstCorrect = Array.from(game.answers.values()).indexOf(correctAnswer) === Array.from(game.answers.keys()).indexOf(playerName);
                game.scores[playerName === game.players[0] ? 'player1' : 'player2'].score += isFirstCorrect ? POINTS_CORRECT_FIRST : POINTS_CORRECT_SECOND;
                
                io.to(socketId).emit('roundResult', {
                    correct: true,
                    message: isFirstCorrect ? '恭喜！你是第一个答对的！' : '答对了！',
                    scores: game.scores
                });
            } else {
                game.scores[playerName === game.players[0] ? 'player1' : 'player2'].score += POINTS_WRONG;
                io.to(socketId).emit('roundResult', {
                    correct: false,
                    message: '答错了！',
                    scores: game.scores
                });
            }
        } else {
            // 未作答
            game.scores[playerName === game.players[0] ? 'player1' : 'player2'].score += POINTS_WRONG;
            io.to(socketId).emit('roundResult', {
                correct: false,
                message: '时间到！你没有作答。',
                scores: game.scores
            });
        }
    });

    game.currentQuestionIndex++;
    
    // 设置休息时间后开始下一题
    setTimeout(() => {
        if (game.currentQuestionIndex < questions.length) {
            startNewQuestion(gameId);
        } else {
            endGame(gameId);
        }
    }, BREAK_TIME * 1000);
}

// 结束游戏并更新数据库
async function endGame(gameId) {
    const game = activeGames.get(gameId);
    if (!game) return;

    // 确定获胜者
    const player1Score = game.scores.player1.score;
    const player2Score = game.scores.player2.score;
    const winner = player1Score > player2Score ? game.players[0] : 
                  player2Score > player1Score ? game.players[1] : 
                  '平局';

    // 更新数据库中的玩家记录
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
        console.error('更新玩家记录失败:', err);
    }

    // 通知玩家游戏结束
    game.players.forEach(async (playerName) => {
        const socketId = playerSockets.get(playerName);
        const player = await Player.findOne({ name: playerName });
        io.to(socketId).emit('gameEnd', {
            winner,
            scores: game.scores,
            stats: player ? player.getStats() : null
        });
    });

    // 清理游戏状态
    game.players.forEach(playerName => {
        playerGames.delete(playerName);
    });
    activeGames.delete(gameId);
}

// Socket.IO 连接处理
io.on('connection', (socket) => {
    // 玩家登录
    socket.on('login', async (playerName) => {
        if (!onlinePlayers.has(socket.id) && !Array.from(onlinePlayers.values()).includes(playerName)) {
            // 在数据库中查找或创建玩家
            try {
                let player = await Player.findOne({ name: playerName });
                if (!player) {
                    player = new Player({ name: playerName });
                    await player.save();
                }
                
                onlinePlayers.set(socket.id, playerName);
                playerSockets.set(playerName, socket.id);
                socket.emit('loginResponse', { success: true, stats: player.getStats() });
                broadcastPlayersList();
            } catch (err) {
                console.error('玩家登录失败:', err);
                socket.emit('loginResponse', { success: false, error: '登录失败' });
            }
        } else {
            socket.emit('loginResponse', { success: false, error: '用户名已存在' });
        }
    });

    // 发起挑战
    socket.on('challengePlayer', (targetPlayer) => {
        const challenger = onlinePlayers.get(socket.id);
        const targetSocketId = playerSockets.get(targetPlayer);
        if (targetSocketId) {
            io.to(targetSocketId).emit('challengeRequest', challenger);
        }
    });

    // 接受挑战
    socket.on('acceptChallenge', (challenger) => {
        const accepter = onlinePlayers.get(socket.id);
        const gameId = createGame(challenger, accepter);
        startNewQuestion(gameId);
    });

    // 拒绝挑战
    socket.on('rejectChallenge', (challenger) => {
        const targetSocketId = playerSockets.get(challenger);
        if (targetSocketId) {
            io.to(targetSocketId).emit('challengeRejected', onlinePlayers.get(socket.id));
        }
    });

    // 提交答案
    socket.on('submitAnswer', (answerIndex) => {
        const playerName = onlinePlayers.get(socket.id);
        const gameId = playerGames.get(playerName);
        const game = activeGames.get(gameId);
        
        if (game && game.status === 'playing' && !game.answers.has(playerName)) {
            game.answers.set(playerName, answerIndex);
            
            // 如果两个玩家都已回答，立即评估结果
            if (game.answers.size === 2) {
                clearInterval(game.timer);
                evaluateRound(gameId);
            }
        }
    });

    // 返回大厅
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

    // 断开连接处理
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
            broadcastPlayersList();
        }
    });
});

// 启动服务器
const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
    console.log(`服务器运行在端口 ${PORT}`);
});
