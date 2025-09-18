// Habits (StarCores) functionality
let player = {};
let habits = [];
let currentEditingTask = null;
let achievementManager = null;

function initializeHabits() {
    player = loadPlayerData();
    habits = loadTasks('habits');
    achievementManager = new AchievementManager();
    
    updateHabits();
    initializeModal();
}

function updateHabits() {
    updateHeaderStats(player);
    renderHabits();
}

function renderHabits() {
    const container = document.getElementById('habits-container');
    const emptyState = document.getElementById('habits-empty');
    
    if (habits.length === 0) {
        emptyState.style.display = 'block';
        container.innerHTML = '<div class="empty-state" id="habits-empty"><i class="fas fa-star"></i><h3>No StarCores forged!</h3><p>Forge your first StarCore to begin your cosmic journey</p></div>';
        return;
    }
    
    emptyState.style.display = 'none';
    container.innerHTML = habits.map(habit => `
        <div class="task-item habit-item" data-difficulty="${habit.difficulty}">
            <div class="task-content">
                <h4 class="task-title">${habit.title}</h4>
                ${habit.description ? `<p class="task-description">${habit.description}</p>` : ''}
                <div class="task-meta">
                    <span class="task-difficulty ${habit.difficulty}">${getDifficultyLabel(habit.difficulty)}</span>
                </div>
            </div>
            <div class="task-actions">
                <button class="action-btn positive" onclick="handleHabitAction(${habit.id}, true)">
                    <i class="fas fa-plus"></i>
                </button>
                <button class="action-btn negative" onclick="handleHabitAction(${habit.id}, false)">
                    <i class="fas fa-minus"></i>
                </button>
                <button class="action-btn edit" onclick="editTask(${habit.id})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="action-btn delete" onclick="deleteTask(${habit.id})">
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
    const addBtn = document.getElementById('add-habit-btn');
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
    modalTitle.textContent = editTask ? 'Edit StarCore' : 'Forge New StarCore';
    
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
        lastCompleted: null
    };

    if (!taskData.title) {
        alert('Please enter a task title');
        return;
    }

    if (currentEditingTask) {
        const index = habits.findIndex(h => h.id === currentEditingTask.id);
        if (index !== -1) {
            habits[index] = { ...habits[index], ...taskData };
        }
    } else {
        habits.push(taskData);
        player.stats.habitsCreated++;
    }

    saveTasks('habits', habits);
    savePlayerData(player);
    updateHabits();
    closeTaskModal();
    
    if (achievementManager) {
        achievementManager.checkAchievements({...player.stats, ...player});
    }
}

function editTask(taskId) {
    const task = habits.find(h => h.id === taskId);
    if (task) {
        openTaskModal(task);
    }
}

function deleteTask(taskId) {
    if (confirm('Are you sure you want to destroy this StarCore?')) {
        habits = habits.filter(h => h.id !== taskId);
        saveTasks('habits', habits);
        updateHabits();
    }
}

function handleHabitAction(taskId, isPositive) {
    const task = habits.find(h => h.id === taskId);
    if (!task) return;

    const rewards = calculateRewards(task.difficulty);
    
    if (isPositive) {
        awardRewards(rewards.xp, rewards.gold);
        player.stats.totalCompleted++;
        player.stats.tasksCompletedToday++;
    } else {
        awardRewards(-Math.floor(rewards.xp / 2), -Math.floor(rewards.gold / 2));
    }

    task.lastCompleted = Date.now();
    updateStreak();
    
    saveTasks('habits', habits);
    savePlayerData(player);
    updateHabits();
    
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
    
    // Apply subscription multipliers
    const finalXP = window.Subscription ? window.Subscription.applyXP(xp) : xp;
    const finalGold = window.Subscription ? window.Subscription.applyGold(gold) : gold;
    
    player.xp += finalXP;
    player.totalXP += Math.max(0, finalXP);
    player.gold = Math.max(0, player.gold + finalGold);

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

// Initialize habits on page load
document.addEventListener('DOMContentLoaded', () => {
    if (checkAuth()) {
        initializeHabits();
    }
});