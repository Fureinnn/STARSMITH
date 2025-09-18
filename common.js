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

// Subscription Manager
class SubscriptionManager {
    constructor() {
        this.subscription = null;
        this.load();
    }

    load() {
        const defaultSubscription = {
            plan: 'free',
            status: 'active',
            billingDate: null,
            paymentMethod: null,
            startDate: null,
            benefits: {
                xpMultiplier: 1.0,
                goldMultiplier: 1.0,
                premiumAchievements: false,
                premiumVault: false,
                customization: false
            }
        };
        
        const stored = localStorage.getItem('questmaster_subscription');
        this.subscription = stored ? { ...defaultSubscription, ...JSON.parse(stored) } : defaultSubscription;
    }

    save() {
        localStorage.setItem('questmaster_subscription', JSON.stringify(this.subscription));
        
        // Dispatch event for other pages to listen to
        const event = new CustomEvent('subscription:updated', { 
            detail: this.subscription 
        });
        window.dispatchEvent(event);
    }

    isPremium() {
        return this.subscription.plan !== 'free' && this.subscription.status === 'active';
    }

    hasFeature(feature) {
        return this.isPremium() && this.subscription.benefits[feature];
    }

    getMultiplier(type) {
        if (!this.isPremium()) return 1.0;
        return this.subscription.benefits[type + 'Multiplier'] || 1.0;
    }

    applyXP(baseXP) {
        return Math.floor(baseXP * this.getMultiplier('xp'));
    }

    applyGold(baseGold) {
        return Math.floor(baseGold * this.getMultiplier('gold'));
    }

    getPlan() {
        return this.subscription;
    }

    updatePlan(newPlan) {
        this.subscription = { ...this.subscription, ...newPlan };
        this.save();
    }
}

// Global subscription instance
window.Subscription = null;

// Update header stats
function updateHeaderStats(player) {
    const headerLevel = document.getElementById('header-level');
    const headerStardust = document.getElementById('header-stardust');
    const headerOrbs = document.getElementById('header-orbs');
    const headerStreak = document.getElementById('header-streak');
    
    if (headerLevel) headerLevel.textContent = player.level;
    if (headerStardust) headerStardust.textContent = player.xp;
    if (headerOrbs) headerOrbs.textContent = player.gold;
    if (headerStreak) headerStreak.textContent = player.currentStreak;
    
    // Add premium badge if user has premium
    updatePremiumBadge();
}

// Update premium badge in header
function updatePremiumBadge() {
    if (!window.Subscription) return;
    
    let premiumBadge = document.getElementById('premium-badge');
    
    if (window.Subscription.isPremium()) {
        if (!premiumBadge) {
            premiumBadge = document.createElement('div');
            premiumBadge.id = 'premium-badge';
            premiumBadge.className = 'premium-badge';
            premiumBadge.innerHTML = '<i class="fas fa-crown"></i> Premium';
            
            const headerStats = document.querySelector('.header-stats');
            if (headerStats) {
                headerStats.appendChild(premiumBadge);
            }
        }
    } else {
        if (premiumBadge) {
            premiumBadge.remove();
        }
    }
}

// Gate premium features
function gatePremiumFeatures() {
    if (!window.Subscription) return;
    
    // Hide premium-only elements by default
    const premiumElements = document.querySelectorAll('[data-premium-only]');
    premiumElements.forEach(element => {
        if (window.Subscription.isPremium()) {
            element.style.display = '';
            element.classList.remove('premium-locked');
        } else {
            element.style.display = 'none';
            element.classList.add('premium-locked');
        }
    });
    
    // Gate specific features
    const featureElements = document.querySelectorAll('[data-feature]');
    featureElements.forEach(element => {
        const feature = element.getAttribute('data-feature');
        if (window.Subscription.hasFeature(feature)) {
            element.style.display = '';
            element.classList.remove('feature-locked');
        } else {
            element.style.display = 'none';
            element.classList.add('feature-locked');
        }
    });
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
        // Initialize subscription manager globally
        if (!window.Subscription) {
            window.Subscription = new SubscriptionManager();
        }
        
        updateUserInfo();
        initializeMobileMenu();
        const player = loadPlayerData();
        updateHeaderStats(player);
        
        // Gate premium features
        gatePremiumFeatures();
        
        // Listen for subscription updates
        window.addEventListener('subscription:updated', () => {
            gatePremiumFeatures();
            updatePremiumBadge();
            const updatedPlayer = loadPlayerData();
            updateHeaderStats(updatedPlayer);
        });
    }
});