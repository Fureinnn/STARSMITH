// Character page functionality
let player = {};
let achievementManager = null;

function initializeCharacter() {
    player = loadPlayerData();
    achievementManager = new AchievementManager();
    updateCharacter();
}

function updateCharacter() {
    updateHeaderStats(player);
    updateCharacterStats();
    updateCharacterXPBar();
}

function updateCharacterStats() {
    // Character info
    document.getElementById('player-level-char').textContent = player.level;
    document.getElementById('total-stardust-char').textContent = player.totalXP;
    document.getElementById('total-orbs-char').textContent = player.gold;
    document.getElementById('current-level-char').textContent = player.level;
    
    // Achievements
    document.getElementById('tasks-completed-char').textContent = player.stats.totalCompleted;
    document.getElementById('best-streak-char').textContent = `${player.bestStreak} cycles`;
    document.getElementById('codex-entries-char').textContent = achievementManager ? achievementManager.getUnlockedCount() : 0;
}

function updateCharacterXPBar() {
    const xpNeeded = Math.floor(100 * Math.pow(1.2, player.level - 1));
    const progress = (player.xp / xpNeeded) * 100;
    
    const xpFill = document.getElementById('xp-fill-char');
    const xpText = document.getElementById('xp-text-char');
    
    if (xpFill) xpFill.style.width = `${Math.min(progress, 100)}%`;
    if (xpText) xpText.textContent = `${player.xp} / ${xpNeeded} Stardust`;
}

// Initialize character on page load
document.addEventListener('DOMContentLoaded', () => {
    if (checkAuth()) {
        initializeCharacter();
    }
});