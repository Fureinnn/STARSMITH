// Common functionality shared across all pages

// Check authentication on page load
function checkAuth() {
    const currentUser = localStorage.getItem('questmaster_currentUser');
    if (!currentUser && !window.location.pathname.includes('login.html')) {
        window.location.href = 'login.html';
        return false;
    }
    if (currentUser && window.location.pathname.includes('login.html')) {
        window.location.href = 'dashboard.html';
        return false;
    }
    return true;
}

// Logout function
function logout() {
    localStorage.removeItem('questmaster_currentUser');
    window.location.href = 'login.html';
}

// Load player data
function loadPlayerData() {
    const defaultPlayer = {
        level: 1,
        xp: 0,
        totalXP: 0,
        gold: 0,
        currentStreak: 0,
        bestStreak: 0,
        lastActiveDate: null,
        stats: {
            totalCompleted: 0,
            tasksCompletedToday: 0,
            tasksCompletedWeek: 0,
            habitsCreated: 0,
            dailiesCreated: 0,
            todosCreated: 0,
            epicTasksCompleted: 0,
            dailiesCompletedToday: 0
        }
    };

    const saved = localStorage.getItem('questmaster_player');
    return saved ? { ...defaultPlayer, ...JSON.parse(saved) } : defaultPlayer;
}

// Save player data
function savePlayerData(player) {
    localStorage.setItem('questmaster_player', JSON.stringify(player));
}

// Load tasks
function loadTasks(type) {
    const saved = localStorage.getItem(`questmaster_${type}`);
    return saved ? JSON.parse(saved) : [];
}

// Save tasks
function saveTasks(type, tasks) {
    localStorage.setItem(`questmaster_${type}`, JSON.stringify(tasks));
}

// Update header stats
function updateHeaderStats(player) {
    document.getElementById('header-level').textContent = player.level;
    document.getElementById('header-stardust').textContent = player.xp;
    document.getElementById('header-orbs').textContent = player.gold;
    document.getElementById('header-streak').textContent = player.currentStreak;
}

// Update user info in sidebar
function updateUserInfo() {
    const user = JSON.parse(localStorage.getItem('questmaster_currentUser') || '{}');
    const userName = document.getElementById('user-name');
    if (userName && user.name) {
        userName.textContent = user.name;
    }
}

// Mobile menu toggle
function initializeMobileMenu() {
    const mobileToggle = document.getElementById('mobile-menu-toggle');
    const sidebar = document.getElementById('sidebar');
    const sidebarOverlay = document.getElementById('sidebar-overlay');
    
    if (mobileToggle && sidebar) {
        mobileToggle.addEventListener('click', () => {
            if (window.innerWidth <= 1024) {
                sidebar.classList.toggle('active');
                mobileToggle.classList.toggle('active');
                if (sidebarOverlay) {
                    sidebarOverlay.classList.toggle('active');
                }
            }
        });
    }
    
    if (sidebarOverlay) {
        sidebarOverlay.addEventListener('click', () => {
            if (sidebar) sidebar.classList.remove('active');
            if (mobileToggle) mobileToggle.classList.remove('active');
            sidebarOverlay.classList.remove('active');
        });
    }
    
    // Close sidebar when nav item is clicked on mobile
    const navItems = document.querySelectorAll('.sidebar-nav .nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            if (window.innerWidth <= 1024) {
                if (sidebar) sidebar.classList.remove('active');
                if (mobileToggle) mobileToggle.classList.remove('active');
                if (sidebarOverlay) sidebarOverlay.classList.remove('active');
            }
        });
    });
}

// Initialize common functionality
document.addEventListener('DOMContentLoaded', () => {
    if (checkAuth()) {
        updateUserInfo();
        initializeMobileMenu();
        const player = loadPlayerData();
        updateHeaderStats(player);
    }
});