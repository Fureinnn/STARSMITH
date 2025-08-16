// Settings page functionality
let player = {};

function initializeSettings() {
    player = loadPlayerData();
    updateSettings();
    initializeSettingsControls();
}

function updateSettings() {
    updateHeaderStats(player);
    loadUserSettings();
}

function loadUserSettings() {
    const user = JSON.parse(localStorage.getItem('questmaster_currentUser') || '{}');
    const displayName = document.getElementById('display-name');
    const email = document.getElementById('email');
    
    if (displayName && user.name) displayName.value = user.name;
    if (email && user.email) email.value = user.email;
}

function initializeSettingsControls() {
    const resetDataBtn = document.getElementById('reset-data-btn');
    if (resetDataBtn) {
        resetDataBtn.addEventListener('click', resetAllData);
    }
}

function resetAllData() {
    if (confirm('Are you sure you want to reset all data? This action cannot be undone.')) {
        localStorage.removeItem('questmaster_player');
        localStorage.removeItem('questmaster_habits');
        localStorage.removeItem('questmaster_dailies');
        localStorage.removeItem('questmaster_todos');
        localStorage.removeItem('questmaster_vault');
        localStorage.removeItem('questmaster_achievements');
        alert('All data has been reset. The page will reload.');
        location.reload();
    }
}

// Initialize settings on page load
document.addEventListener('DOMContentLoaded', () => {
    if (checkAuth()) {
        initializeSettings();
    }
});