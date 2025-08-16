// Dashboard-specific functionality
let player = {};
let habits = [];
let dailies = [];
let todos = [];
let achievementManager = null;

function initializeDashboard() {
    // Load data
    player = loadPlayerData();
    habits = loadTasks('habits');
    dailies = loadTasks('dailies');
    todos = loadTasks('todos');
    achievementManager = new AchievementManager();
    
    updateDashboard();
    checkDailyReset();
}

function updateDashboard() {
    updateHeaderStats(player);
    updateDashboardStats();
    updateXPBar();
}

function updateDashboardStats() {
    // Player stats
    document.getElementById('player-level-dash').textContent = player.level;
    document.getElementById('player-xp-dash').textContent = player.xp;
    document.getElementById('player-gold-dash').textContent = player.gold;
    document.getElementById('player-streak-dash').textContent = player.currentStreak;
    
    // Daily overview
    document.getElementById('daily-count-dash').textContent = dailies.length;
    document.getElementById('daily-completed-dash').textContent = player.stats.dailiesCompletedToday;
    
    // Tasks overview
    document.getElementById('tasks-count-dash').textContent = todos.length;
    document.getElementById('tasks-completed-dash').textContent = player.stats.tasksCompletedToday;
    
    // StarCores overview
    document.getElementById('starcores-count-dash').textContent = habits.length;
    document.getElementById('starcores-completed-dash').textContent = player.stats.tasksCompletedToday;
    
    // Observatory stats
    document.getElementById('tasks-total-dash').textContent = player.stats.totalCompleted;
    document.getElementById('current-streak-dash').textContent = `${player.currentStreak} cycles`;
    document.getElementById('best-streak-dash').textContent = `${player.bestStreak} cycles`;
    document.getElementById('achievements-unlocked-dash').textContent = achievementManager ? achievementManager.getUnlockedCount() : 0;
}

function updateXPBar() {
    const xpNeeded = getXPNeededForLevel(player.level);
    const progress = (player.xp / xpNeeded) * 100;
    
    const xpFill = document.getElementById('xp-fill-dash');
    const xpText = document.getElementById('xp-text-dash');
    
    if (xpFill) xpFill.style.width = `${Math.min(progress, 100)}%`;
    if (xpText) xpText.textContent = `${player.xp} / ${xpNeeded} Stardust`;
}

function getXPNeededForLevel(level) {
    return Math.floor(100 * Math.pow(1.2, level - 1));
}

function checkDailyReset() {
    const today = new Date().toDateString();
    const lastReset = localStorage.getItem('questmaster_last_reset');
    
    if (lastReset !== today) {
        // Reset daily stats
        player.stats.tasksCompletedToday = 0;
        player.stats.dailiesCompletedToday = 0;
        
        // Check streak
        const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString();
        if (player.lastActiveDate && player.lastActiveDate !== yesterday && player.lastActiveDate !== today) {
            player.currentStreak = 0;
        }
        
        savePlayerData(player);
        localStorage.setItem('questmaster_last_reset', today);
    }
}

// Initialize dashboard on page load
document.addEventListener('DOMContentLoaded', () => {
    if (checkAuth()) {
        initializeDashboard();
    }
});