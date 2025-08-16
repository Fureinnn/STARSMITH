// Vault-specific functionality
let player = {};
let vault = {};

function initializeVault() {
    player = loadPlayerData();
    vault = loadVaultData();
    updateVault();
}

function loadVaultData() {
    const defaultVault = {
        artifacts: [],
        boosters: []
    };
    const saved = localStorage.getItem('questmaster_vault');
    return saved ? { ...defaultVault, ...JSON.parse(saved) } : defaultVault;
}

function saveVaultData() {
    localStorage.setItem('questmaster_vault', JSON.stringify(vault));
}

function updateVault() {
    updateHeaderStats(player);
    document.getElementById('vault-orbs').textContent = player.gold;
    document.getElementById('vault-stardust').textContent = player.totalXP;
}

function purchaseArtifact(type) {
    const costs = {
        booster: 100,
        shield: 150,
        nova: 200
    };
    
    const cost = costs[type];
    if (player.gold >= cost) {
        player.gold -= cost;
        vault.artifacts.push({
            type: type,
            purchasedAt: Date.now(),
            used: false
        });
        
        savePlayerData(player);
        saveVaultData();
        updateVault();
        
        alert(`Acquired ${type.charAt(0).toUpperCase() + type.slice(1)}!`);
    } else {
        alert('Not enough Cosmic Orbs!');
    }
}

// Initialize vault on page load
document.addEventListener('DOMContentLoaded', () => {
    if (checkAuth()) {
        initializeVault();
    }
});