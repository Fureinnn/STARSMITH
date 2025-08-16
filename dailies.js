// Dailies functionality - same structure as habits but for daily tasks
let player = {};
let dailies = [];
let currentEditingTask = null;
let achievementManager = null;

function initializeDailies() {
    player = loadPlayerData();
    dailies = loadTasks('dailies');
    achievementManager = new AchievementManager();
    
    updateDailies();
    initializeModal();
}

function updateDailies() {
    updateHeaderStats(player);
    renderDailies();
}

function renderDailies() {
    const container = document.getElementById('dailies-container');
    const emptyState = document.getElementById('dailies-empty');
    
    if (dailies.length === 0) {
        emptyState.style.display = 'block';
        container.innerHTML = '<div class="empty-state" id="dailies-empty"><i class="fas fa-sun"></i><h3>No daily quests!</h3><p>Create daily quests to maintain your cosmic energy and earn stellar rewards</p></div>';
        return;
    }
    
    emptyState.style.display = 'none';
    container.innerHTML = dailies.map(daily => `
        <div class="task-item daily-item" data-difficulty="${daily.difficulty}">
            <div class="task-content">
                <h4 class="task-title">${daily.title}</h4>
                ${daily.description ? `<p class="task-description">${daily.description}</p>` : ''}
                <div class="task-meta">
                    <span class="task-difficulty ${daily.difficulty}">${getDifficultyLabel(daily.difficulty)}</span>
                </div>
            </div>
            <div class="task-actions">
                <button class="action-btn complete" onclick="completeTask(${daily.id})">
                    <i class="fas fa-check"></i>
                </button>
                <button class="action-btn edit" onclick="editTask(${daily.id})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="action-btn delete" onclick="deleteTask(${daily.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `).join('');
}

function getDifficultyLabel(difficulty) {
    const labels = {
        easy: 'Spark',
        medium: 'Ember',
        hard: 'Flame',
        epic: 'Nova',
        legendary: 'Supernova',
        cosmic: 'Cosmic'
    };
    return labels[difficulty] || 'Unknown';
}

function initializeModal() {
    const addBtn = document.getElementById('add-daily-btn');
    const modal = document.getElementById('task-modal');
    const closeBtn = document.getElementById('modal-close');
    const cancelBtn = document.getElementById('cancel-btn');
    const form = document.getElementById('task-form');
    
    addBtn.addEventListener('click', () => openTaskModal());
    closeBtn.addEventListener('click', () => closeTaskModal());
    cancelBtn.addEventListener('click', () => closeTaskModal());
    form.addEventListener('submit', (e) => handleTaskSubmit(e));
    
    modal.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal-overlay')) {
            closeTaskModal();
        }
    });
}

function openTaskModal(editTask = null) {
    const modal = document.getElementById('task-modal');
    const modalTitle = document.getElementById('modal-title');
    const form = document.getElementById('task-form');
    
    currentEditingTask = editTask;
    modalTitle.textContent = editTask ? 'Edit Daily Quest' : 'Create Daily Quest';
    
    if (editTask) {
        document.getElementById('task-title').value = editTask.title;
        document.getElementById('task-description').value = editTask.description || '';
        document.getElementById('task-difficulty').value = editTask.difficulty;
    } else {
        form.reset();
    }
    
    modal.classList.add('active');
}

function closeTaskModal() {
    const modal = document.getElementById('task-modal');
    modal.classList.remove('active');
    currentEditingTask = null;
}

function handleTaskSubmit(e) {
    e.preventDefault();
    
    const taskData = {
        id: currentEditingTask?.id || Date.now(),
        title: document.getElementById('task-title').value.trim(),
        description: document.getElementById('task-description').value.trim(),
        difficulty: document.getElementById('task-difficulty').value,
        completed: false,
        createdAt: currentEditingTask?.createdAt || Date.now(),
        completedAt: null
    };

    if (!taskData.title) {
        alert('Please enter a quest title');
        return;
    }

    if (currentEditingTask) {
        const index = dailies.findIndex(d => d.id === currentEditingTask.id);
        if (index !== -1) {
            dailies[index] = { ...dailies[index], ...taskData };
        }
    } else {
        dailies.push(taskData);
        player.stats.dailiesCreated++;
    }

    saveTasks('dailies', dailies);
    savePlayerData(player);
    updateDailies();
    closeTaskModal();
    
    if (achievementManager) {
        achievementManager.checkAchievements({...player.stats, ...player});
    }
}

function editTask(taskId) {
    const task = dailies.find(d => d.id === taskId);
    if (task) {
        openTaskModal(task);
    }
}

function deleteTask(taskId) {
    if (confirm('Are you sure you want to destroy this Quest?')) {
        dailies = dailies.filter(d => d.id !== taskId);
        saveTasks('dailies', dailies);
        updateDailies();
    }
}

function completeTask(taskId) {
    const task = dailies.find(d => d.id === taskId);
    if (!task) return;

    const rewards = calculateRewards(task.difficulty);
    awardRewards(rewards.xp, rewards.gold);
    
    player.stats.totalCompleted++;
    player.stats.tasksCompletedToday++;
    player.stats.dailiesCompletedToday++;
    
    if (['epic', 'legendary', 'cosmic'].includes(task.difficulty)) {
        player.stats.epicTasksCompleted++;
    }

    dailies = dailies.filter(d => d.id !== taskId);
    updateStreak();
    
    saveTasks('dailies', dailies);
    savePlayerData(player);
    updateDailies();
    
    if (achievementManager) {
        achievementManager.checkAchievements({...player.stats, ...player});
    }
}

function calculateRewards(difficulty) {
    const baseRewards = {
        easy: { xp: 10, gold: 5 },
        medium: { xp: 20, gold: 10 },
        hard: { xp: 30, gold: 15 },
        epic: { xp: 40, gold: 20 },
        legendary: { xp: 50, gold: 25 },
        cosmic: { xp: 70, gold: 35 }
    };
    return baseRewards[difficulty] || baseRewards.easy;
}

function awardRewards(xp, gold) {
    const currentLevel = player.level;
    
    player.xp += xp;
    player.totalXP += Math.max(0, xp);
    player.gold = Math.max(0, player.gold + gold);

    if (player.xp < 0) {
        player.xp = 0;
    }

    const xpNeeded = Math.floor(100 * Math.pow(1.2, player.level - 1));
    if (player.xp >= xpNeeded) {
        player.level++;
        player.xp -= xpNeeded;
    }

    if (player.level !== currentLevel && achievementManager) {
        achievementManager.checkAchievements({...player.stats, ...player});
    }
}

function updateStreak() {
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString();
    
    if (player.lastActiveDate === yesterday) {
        player.currentStreak++;
    } else if (player.lastActiveDate !== today) {
        player.currentStreak = 1;
    }
    
    player.bestStreak = Math.max(player.bestStreak, player.currentStreak);
    player.lastActiveDate = today;
}

// Initialize dailies on page load
document.addEventListener('DOMContentLoaded', () => {
    if (checkAuth()) {
        initializeDailies();
    }
});