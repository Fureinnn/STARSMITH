// Todos (Cosmic Tasks) functionality
let player = {};
let todos = [];
let currentEditingTask = null;
let achievementManager = null;

function initializeTodos() {
    player = loadPlayerData();
    todos = loadTasks('todos');
    achievementManager = new AchievementManager();
    
    updateTodos();
    initializeModal();
}

function updateTodos() {
    updateHeaderStats(player);
    renderTodos();
}

function renderTodos() {
    const container = document.getElementById('todos-container');
    const emptyState = document.getElementById('todos-empty');
    
    if (todos.length === 0) {
        emptyState.style.display = 'block';
        container.innerHTML = '<div class="empty-state" id="todos-empty"><i class="fas fa-scroll"></i><h3>No cosmic tasks available!</h3><p>Create your first cosmic task to expand your stellar influence</p></div>';
        return;
    }
    
    emptyState.style.display = 'none';
    container.innerHTML = todos.map(todo => `
        <div class="task-item todo-item" data-difficulty="${todo.difficulty}">
            <div class="task-content">
                <h4 class="task-title">${todo.title}</h4>
                ${todo.description ? `<p class="task-description">${todo.description}</p>` : ''}
                <div class="task-meta">
                    <span class="task-difficulty ${todo.difficulty}">${getDifficultyLabel(todo.difficulty)}</span>
                    ${todo.dueDate ? `<span class="due-date">Due: ${new Date(todo.dueDate).toLocaleDateString()}</span>` : ''}
                </div>
            </div>
            <div class="task-actions">
                <button class="action-btn complete" onclick="completeTask(${todo.id})">
                    <i class="fas fa-check"></i>
                </button>
                <button class="action-btn edit" onclick="editTask(${todo.id})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="action-btn delete" onclick="deleteTask(${todo.id})">
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
    const addBtn = document.getElementById('add-todo-btn');
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
    modalTitle.textContent = editTask ? 'Edit Cosmic Task' : 'Create Cosmic Task';
    
    if (editTask) {
        document.getElementById('task-title').value = editTask.title;
        document.getElementById('task-description').value = editTask.description || '';
        document.getElementById('task-difficulty').value = editTask.difficulty;
        document.getElementById('task-due-date').value = editTask.dueDate || '';
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
        dueDate: document.getElementById('task-due-date').value || null,
        completed: false,
        createdAt: currentEditingTask?.createdAt || Date.now(),
        completedAt: null
    };

    if (!taskData.title) {
        alert('Please enter a task title');
        return;
    }

    if (currentEditingTask) {
        const index = todos.findIndex(t => t.id === currentEditingTask.id);
        if (index !== -1) {
            todos[index] = { ...todos[index], ...taskData };
        }
    } else {
        todos.push(taskData);
        player.stats.todosCreated++;
    }

    saveTasks('todos', todos);
    savePlayerData(player);
    updateTodos();
    closeTaskModal();
    
    if (achievementManager) {
        achievementManager.checkAchievements({...player.stats, ...player});
    }
}

function editTask(taskId) {
    const task = todos.find(t => t.id === taskId);
    if (task) {
        openTaskModal(task);
    }
}

function deleteTask(taskId) {
    if (confirm('Are you sure you want to destroy this Cosmic Task?')) {
        todos = todos.filter(t => t.id !== taskId);
        saveTasks('todos', todos);
        updateTodos();
    }
}

function completeTask(taskId) {
    const task = todos.find(t => t.id === taskId);
    if (!task) return;

    const rewards = calculateRewards(task.difficulty);
    awardRewards(rewards.xp, rewards.gold);
    
    player.stats.totalCompleted++;
    player.stats.tasksCompletedToday++;
    
    if (['epic', 'legendary', 'cosmic'].includes(task.difficulty)) {
        player.stats.epicTasksCompleted++;
    }

    todos = todos.filter(t => t.id !== taskId);
    updateStreak();
    
    saveTasks('todos', todos);
    savePlayerData(player);
    updateTodos();
    
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

// Initialize todos on page load
document.addEventListener('DOMContentLoaded', () => {
    if (checkAuth()) {
        initializeTodos();
    }
});