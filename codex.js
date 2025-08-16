// Achievements (Codex) page functionality
let player = {};
let achievementManager = null;

function initializeCodex() {
    player = loadPlayerData();
    achievementManager = new AchievementManager();
    updateCodex();
}

function updateCodex() {
    updateHeaderStats(player);
    if (achievementManager) {
        achievementManager.renderAchievements();
    }
}

// Initialize codex on page load
document.addEventListener('DOMContentLoaded', () => {
    if (checkAuth()) {
        initializeCodex();
    }
});