const mongoose = require('mongoose');

const playerSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    totalGames: {
        type: Number,
        default: 0
    },
    gamesWon: {
        type: Number,
        default: 0
    },
    totalScore: {
        type: Number,
        default: 0
    },
    averageScore: {
        type: Number,
        default: 0
    },
    lastPlayed: {
        type: Date,
        default: Date.now
    },
    gameHistory: [{
        opponent: String,
        score: Number,
        opponentScore: Number,
        result: String, // 'win', 'lose', 'draw'
        date: {
            type: Date,
            default: Date.now
        }
    }]
});

// 更新平均分数的中间件
playerSchema.pre('save', function(next) {
    if (this.totalGames > 0) {
        this.averageScore = this.totalScore / this.totalGames;
    }
    next();
});

// 添加游戏记录的方法
playerSchema.methods.addGameRecord = async function(opponent, score, opponentScore) {
    this.totalGames += 1;
    this.totalScore += score;
    
    const result = score > opponentScore ? 'win' : 
                   score < opponentScore ? 'lose' : 'draw';
    
    if (result === 'win') {
        this.gamesWon += 1;
    }

    this.gameHistory.push({
        opponent,
        score,
        opponentScore,
        result,
        date: new Date()
    });

    this.lastPlayed = new Date();
    return this.save();
};

// 获取玩家统计信息的方法
playerSchema.methods.getStats = function() {
    return {
        name: this.name,
        totalGames: this.totalGames,
        gamesWon: this.gamesWon,
        winRate: this.totalGames > 0 ? (this.gamesWon / this.totalGames * 100).toFixed(1) : 0,
        averageScore: this.averageScore.toFixed(1),
        lastPlayed: this.lastPlayed
    };
};

// 获取最近游戏记录的方法
playerSchema.methods.getRecentGames = function(limit = 5) {
    return this.gameHistory
        .sort((a, b) => b.date - a.date)
        .slice(0, limit);
};

module.exports = mongoose.model('Player', playerSchema); 