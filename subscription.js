// Subscription page functionality
let player = {};
let subscription = {};

function initializeSubscription() {
    player = loadPlayerData();
    subscription = loadSubscriptionData();
    updateSubscription();
    initializeSubscriptionControls();
}

function updateSubscription() {
    updateHeaderStats(player);
    updateCurrentPlan();
    updateBillingInfo();
}

function loadSubscriptionData() {
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
    return stored ? { ...defaultSubscription, ...JSON.parse(stored) } : defaultSubscription;
}

function saveSubscriptionData() {
    localStorage.setItem('questmaster_subscription', JSON.stringify(subscription));
}

function updateCurrentPlan() {
    const currentPlanName = document.getElementById('current-plan-name');
    const currentPlanStatus = document.getElementById('current-plan-status');
    
    const planNames = {
        'free': 'Free Stargazer',
        'premium': 'Cosmic Master',
        'enterprise': 'Cosmic Emperor'
    };
    
    const planStatuses = {
        'free': 'Basic cosmic journey',
        'premium': 'Premium stellar experience',
        'enterprise': 'Ultimate cosmic mastery'
    };
    
    if (currentPlanName) {
        currentPlanName.textContent = planNames[subscription.plan] || 'Unknown Plan';
    }
    
    if (currentPlanStatus) {
        currentPlanStatus.textContent = planStatuses[subscription.plan] || 'Unknown status';
    }
    
    // Update plan buttons
    updatePlanButtons();
}

function updatePlanButtons() {
    const premiumBtn = document.getElementById('subscribe-premium-btn');
    const enterpriseBtn = document.getElementById('subscribe-enterprise-btn');
    
    // Reset buttons
    if (premiumBtn) {
        premiumBtn.innerHTML = '<i class="fas fa-rocket"></i> Upgrade to Premium';
        premiumBtn.disabled = false;
        premiumBtn.className = 'plan-btn premium-btn';
    }
    
    if (enterpriseBtn) {
        enterpriseBtn.innerHTML = '<i class="fas fa-crown"></i> Upgrade to Emperor';
        enterpriseBtn.disabled = false;
        enterpriseBtn.className = 'plan-btn enterprise-btn';
    }
    
    // Update based on current plan
    if (subscription.plan === 'premium') {
        if (premiumBtn) {
            premiumBtn.innerHTML = 'Current Plan';
            premiumBtn.disabled = true;
            premiumBtn.className = 'plan-btn current-plan-btn';
        }
    } else if (subscription.plan === 'enterprise') {
        if (premiumBtn) {
            premiumBtn.innerHTML = 'Downgrade to Premium';
            premiumBtn.className = 'plan-btn premium-btn';
        }
        if (enterpriseBtn) {
            enterpriseBtn.innerHTML = 'Current Plan';
            enterpriseBtn.disabled = true;
            enterpriseBtn.className = 'plan-btn current-plan-btn';
        }
    }
}

function updateBillingInfo() {
    const billingSection = document.getElementById('billing-section');
    
    if (subscription.plan === 'free') {
        billingSection.style.display = 'none';
        return;
    }
    
    billingSection.style.display = 'block';
    
    const nextBillingDate = document.getElementById('next-billing-date');
    const billingAmount = document.getElementById('billing-amount');
    const paymentMethod = document.getElementById('payment-method');
    
    if (subscription.billingDate) {
        const nextDate = new Date(subscription.billingDate);
        nextBillingDate.textContent = nextDate.toLocaleDateString();
    } else {
        nextBillingDate.textContent = 'Not set';
    }
    
    const amounts = {
        'premium': '$9.99',
        'enterprise': '$19.99'
    };
    
    if (billingAmount) {
        billingAmount.textContent = amounts[subscription.plan] || 'N/A';
    }
    
    if (paymentMethod) {
        paymentMethod.textContent = subscription.paymentMethod || 'No payment method';
    }
}

function initializeSubscriptionControls() {
    const premiumBtn = document.getElementById('subscribe-premium-btn');
    const enterpriseBtn = document.getElementById('subscribe-enterprise-btn');
    const manageBillingBtn = document.getElementById('manage-billing-btn');
    const cancelBtn = document.getElementById('cancel-subscription-btn');
    
    if (premiumBtn) {
        premiumBtn.addEventListener('click', () => handlePlanChange('premium'));
    }
    
    if (enterpriseBtn) {
        enterpriseBtn.addEventListener('click', () => handlePlanChange('enterprise'));
    }
    
    if (manageBillingBtn) {
        manageBillingBtn.addEventListener('click', manageBilling);
    }
    
    if (cancelBtn) {
        cancelBtn.addEventListener('click', cancelSubscription);
    }
}

function handlePlanChange(newPlan) {
    if (newPlan === subscription.plan) {
        return;
    }
    
    const planNames = {
        'premium': 'Cosmic Master',
        'enterprise': 'Cosmic Emperor'
    };
    
    const planCosts = {
        'premium': '$9.99/month',
        'enterprise': '$19.99/month'
    };
    
    if (confirm(`Are you sure you want to upgrade to ${planNames[newPlan]} for ${planCosts[newPlan]}?`)) {
        upgradeSubscription(newPlan);
    }
}

function upgradeSubscription(newPlan) {
    subscription.plan = newPlan;
    subscription.status = 'active';
    subscription.startDate = Date.now();
    
    // Set next billing date to 30 days from now
    const nextBilling = new Date();
    nextBilling.setMonth(nextBilling.getMonth() + 1);
    subscription.billingDate = nextBilling.getTime();
    
    // Set payment method placeholder
    subscription.paymentMethod = '**** **** **** 1234';
    
    // Update benefits
    if (newPlan === 'premium') {
        subscription.benefits = {
            xpMultiplier: 1.5,
            goldMultiplier: 1.5,
            premiumAchievements: true,
            premiumVault: true,
            customization: true
        };
    } else if (newPlan === 'enterprise') {
        subscription.benefits = {
            xpMultiplier: 2.0,
            goldMultiplier: 2.0,
            premiumAchievements: true,
            premiumVault: true,
            customization: true,
            teamFeatures: true,
            analytics: true
        };
    }
    
    saveSubscriptionData();
    updateSubscription();
    
    // Show success message
    showNotification(`Successfully upgraded to ${newPlan === 'premium' ? 'Cosmic Master' : 'Cosmic Emperor'}! Your enhanced cosmic journey begins now.`, 'success');
    
    // Apply premium benefits to player
    applyPremiumBenefits();
}

function applyPremiumBenefits() {
    // Update player data to reflect premium status
    if (!player.subscription) {
        player.subscription = {};
    }
    
    player.subscription = { ...subscription };
    savePlayerData(player);
    
    // Grant bonus XP and gold for upgrading
    const bonusXP = subscription.plan === 'premium' ? 100 : 200;
    const bonusGold = subscription.plan === 'premium' ? 50 : 100;
    
    player.xp += bonusXP;
    player.totalXP += bonusXP;
    player.gold += bonusGold;
    
    savePlayerData(player);
    updateHeaderStats(player);
    
    showNotification(`Welcome bonus: +${bonusXP} Stardust, +${bonusGold} Orbs!`, 'success');
}

function manageBilling() {
    // In a real implementation, this would redirect to Stripe billing portal
    alert('Billing management would open Stripe customer portal. This is a demo version.');
}

function cancelSubscription() {
    if (subscription.plan === 'free') {
        return;
    }
    
    if (confirm('Are you sure you want to cancel your subscription? You will lose premium benefits at the end of your billing period.')) {
        subscription.status = 'cancelled';
        saveSubscriptionData();
        showNotification('Subscription cancelled. Premium benefits will remain active until your next billing date.', 'info');
        updateSubscription();
    }
}

function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
            <span>${message}</span>
        </div>
    `;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Show notification
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    // Remove notification after 4 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 4000);
}

// Helper function to check if user has premium benefits
function hasPremiumBenefits() {
    return subscription.plan !== 'free' && subscription.status === 'active';
}

// Helper function to get XP multiplier
function getXPMultiplier() {
    return hasPremiumBenefits() ? subscription.benefits.xpMultiplier : 1.0;
}

// Helper function to get Gold multiplier
function getGoldMultiplier() {
    return hasPremiumBenefits() ? subscription.benefits.goldMultiplier : 1.0;
}

// Initialize subscription on page load
document.addEventListener('DOMContentLoaded', () => {
    if (checkAuth()) {
        initializeSubscription();
    }
});