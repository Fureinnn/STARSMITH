// Main Application Class
class QuestMasterApp {
    constructor() {
        this.currentTab = 'habits';
        this.currentEditingTask = null;
        this.currentTaskType = null;

        // Initialize data
        this.player = this.loadPlayerData();
        this.habits = this.loadTasks('habits');
        this.dailies = this.loadTasks('dailies');
        this.todos = this.loadTasks('todos');

        // Initialize achievement manager
        this.achievementManager = new AchievementManager();

        // Initialize UI
        this.initializeUI();
        this.updateUI();
        this.checkDailyReset();
        
        // Check for achievements on startup
        this.checkAchievements();
    }

    loadPlayerData() {
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

    loadTasks(type) {
        const saved = localStorage.getItem(`questmaster_${type}`);
        return saved ? JSON.parse(saved) : [];
    }

    savePlayerData() {
        localStorage.setItem('questmaster_player', JSON.stringify(this.player));
    }

    saveTasks(type) {
        localStorage.setItem(`questmaster_${type}`, JSON.stringify(this[type]));
    }

    saveAllData() {
        this.savePlayerData();
        this.saveTasks('habits');
        this.saveTasks('dailies');
        this.saveTasks('todos');
    }

    initializeUI() {
        // Tab navigation
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                const tabId = tab.dataset.tab;
                this.switchTab(tabId);
            });
        });

        // Add task buttons
        document.getElementById('add-habit-btn').addEventListener('click', () => this.openTaskModal('habits'));
        document.getElementById('add-daily-btn').addEventListener('click', () => this.openTaskModal('dailies'));
        document.getElementById('add-todo-btn').addEventListener('click', () => this.openTaskModal('todos'));

        // Modal controls
        document.getElementById('modal-close').addEventListener('click', () => this.closeTaskModal());
        document.getElementById('cancel-btn').addEventListener('click', () => this.closeTaskModal());
        document.getElementById('task-form').addEventListener('submit', (e) => this.handleTaskSubmit(e));

        // Click outside modal to close
        document.getElementById('task-modal').addEventListener('click', (e) => {
            if (e.target.classList.contains('modal-overlay')) {
                this.closeTaskModal();
            }
        });
    }

    switchTab(tabId) {
        // Update active tab
        document.querySelectorAll('.nav-tab').forEach(tab => tab.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
        
        document.querySelector(`[data-tab="${tabId}"]`).classList.add('active');
        document.getElementById(`${tabId}-tab`).classList.add('active');
        
        this.currentTab = tabId;

        // Update achievements when viewing achievements tab
        if (tabId === 'achievements') {
            this.achievementManager.renderAchievements();
        }

        // Update stats when viewing stats tab
        if (tabId === 'stats') {
            this.updateStatsTab();
        }
    }

    openTaskModal(type) {
        this.currentTaskType = type;
        this.currentEditingTask = null;
        
        const modal = document.getElementById('task-modal');
        const modalTitle = document.getElementById('modal-title');
        const dueDateGroup = document.getElementById('due-date-group');
        
        const titles = {
            habits: 'StarCore',
            dailies: 'Daily Quest', 
            todos: 'Cosmic Task'
        };
        modalTitle.textContent = `Forge New ${titles[type]}`;
        
        // Show due date only for todos
        if (type === 'todos') {
            dueDateGroup.style.display = 'block';
        } else {
            dueDateGroup.style.display = 'none';
        }
        
        // Reset form
        document.getElementById('task-form').reset();
        
        modal.classList.add('active');
    }

    closeTaskModal() {
        document.getElementById('task-modal').classList.remove('active');
        this.currentEditingTask = null;
        this.currentTaskType = null;
    }

    handleTaskSubmit(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const taskData = {
            id: this.currentEditingTask?.id || Date.now(),
            title: document.getElementById('task-title').value.trim(),
            description: document.getElementById('task-description').value.trim(),
            difficulty: document.getElementById('task-difficulty').value,
            dueDate: document.getElementById('task-due-date').value || null,
            completed: false,
            createdAt: this.currentEditingTask?.createdAt || Date.now(),
            completedAt: null
        };

        if (!taskData.title) {
            alert('Please enter a task title');
            return;
        }

        if (this.currentEditingTask) {
            // Edit existing task
            const taskArray = this[this.currentTaskType];
            const index = taskArray.findIndex(t => t.id === this.currentEditingTask.id);
            if (index !== -1) {
                taskArray[index] = { ...taskArray[index], ...taskData };
            }
        } else {
            // Add new task
            this[this.currentTaskType].push(taskData);
            
            // Update creation stats
            this.player.stats[`${this.currentTaskType}Created`]++;
            if (this.currentTaskType === 'habits') {
                this.player.stats.habitsCreated++;
            }
        }

        this.saveTasks(this.currentTaskType);
        this.savePlayerData();
        this.updateUI();
        this.closeTaskModal();
        this.checkAchievements();
    }

    editTask(type, taskId) {
        const task = this[type].find(t => t.id === taskId);
        if (!task) return;

        this.currentEditingTask = task;
        this.currentTaskType = type;

        const modal = document.getElementById('task-modal');
        const modalTitle = document.getElementById('modal-title');
        const dueDateGroup = document.getElementById('due-date-group');

        const titles = {
            habits: 'StarCore',
            dailies: 'Daily Quest',
            todos: 'Cosmic Task'
        };
        modalTitle.textContent = `Edit ${titles[type]}`;
        
        // Show due date only for todos
        if (type === 'todos') {
            dueDateGroup.style.display = 'block';
        } else {
            dueDateGroup.style.display = 'none';
        }

        // Populate form
        document.getElementById('task-title').value = task.title;
        document.getElementById('task-description').value = task.description || '';
        document.getElementById('task-difficulty').value = task.difficulty;
        document.getElementById('task-due-date').value = task.dueDate || '';

        modal.classList.add('active');
    }

    deleteTask(type, taskId) {
        const itemType = type === 'habits' ? 'StarCore' : type === 'dailies' ? 'Quest' : 'Cosmic Task';
        if (!confirm(`Are you sure you want to destroy this ${itemType}?`)) return;

        this[type] = this[type].filter(t => t.id !== taskId);
        this.saveTasks(type);
        this.updateUI();
    }

    completeTask(type, taskId) {
        const task = this[type].find(t => t.id === taskId);
        if (!task) return;

        // Calculate rewards
        const rewards = this.calculateRewards(task.difficulty);
        
        // Award XP and Gold
        this.awardRewards(rewards.xp, rewards.gold);
        
        // Update stats
        this.player.stats.totalCompleted++;
        this.player.stats.tasksCompletedToday++;
        this.player.stats.tasksCompletedWeek++;
        
        if (type === 'dailies') {
            this.player.stats.dailiesCompletedToday++;
        }
        
        if (['epic', 'legendary', 'cosmic'].includes(task.difficulty)) {
            this.player.stats.epicTasksCompleted++;
        }

        // Handle task completion based on type
        if (type === 'habits') {
            // Habits don't get removed, just marked as completed for the day
            task.lastCompleted = Date.now();
        } else {
            // Remove dailies and todos when completed
            this[type] = this[type].filter(t => t.id !== taskId);
            this.saveTasks(type);
        }

        this.updateStreak();
        this.savePlayerData();
        this.updateUI();
        this.createTaskCompleteParticles();
        this.checkAchievements();
    }

    handleHabitAction(taskId, isPositive) {
        const task = this.habits.find(t => t.id === taskId);
        if (!task) return;

        const rewards = this.calculateRewards(task.difficulty);
        
        if (isPositive) {
            this.awardRewards(rewards.xp, rewards.gold);
            this.player.stats.totalCompleted++;
            this.player.stats.tasksCompletedToday++;
            this.player.stats.tasksCompletedWeek++;
        } else {
            // Negative habit - lose some progress
            this.awardRewards(-Math.floor(rewards.xp / 2), -Math.floor(rewards.gold / 2));
        }

        task.lastCompleted = Date.now();
        this.saveTasks('habits');
        this.updateStreak();
        this.savePlayerData();
        this.updateUI();
        this.createTaskCompleteParticles();
        this.checkAchievements();
    }

    calculateRewards(difficulty) {
        const baseRewards = {
            easy: { xp: 10, gold: 5 },      // Spark
            medium: { xp: 20, gold: 10 },   // Ember  
            hard: { xp: 30, gold: 15 },     // Flame
            epic: { xp: 40, gold: 20 },     // Nova
            legendary: { xp: 50, gold: 25 }, // Supernova
            cosmic: { xp: 70, gold: 35 }    // Cosmic
        };

        return baseRewards[difficulty] || baseRewards.easy;
    }

    awardRewards(xp, gold) {
        const currentLevel = this.player.level;
        
        this.player.xp += xp;
        this.player.totalXP += Math.max(0, xp); // Only positive XP counts toward total
        this.player.gold = Math.max(0, this.player.gold + gold); // Prevent negative gold

        // Handle XP overflow/underflow
        if (this.player.xp < 0) {
            this.player.xp = 0;
        }

        // Check for level up
        const xpNeeded = this.getXPNeededForLevel(this.player.level);
        if (this.player.xp >= xpNeeded) {
            this.player.level++;
            this.player.xp -= xpNeeded;
            this.achievementManager.showLevelUpNotification(this.player.level);
        }

        // Check if level changed for achievement purposes
        if (this.player.level !== currentLevel) {
            this.checkAchievements();
        }
    }

    getXPNeededForLevel(level) {
        return Math.floor(100 * Math.pow(1.2, level - 1));
    }

    updateStreak() {
        const today = new Date().toDateString();
        const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString();
        
        if (this.player.lastActiveDate === yesterday) {
            this.player.currentStreak++;
        } else if (this.player.lastActiveDate !== today) {
            this.player.currentStreak = 1;
        }
        
        this.player.bestStreak = Math.max(this.player.bestStreak, this.player.currentStreak);
        this.player.lastActiveDate = today;
    }

    checkDailyReset() {
        const today = new Date().toDateString();
        const lastReset = localStorage.getItem('questmaster_last_reset');
        
        if (lastReset !== today) {
            // Reset daily stats
            this.player.stats.tasksCompletedToday = 0;
            this.player.stats.dailiesCompletedToday = 0;
            
            // Check if streak should be broken
            const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString();
            if (this.player.lastActiveDate !== yesterday && this.player.lastActiveDate !== today) {
                this.player.currentStreak = 0;
            }
            
            localStorage.setItem('questmaster_last_reset', today);
            this.savePlayerData();
        }
    }

    checkAchievements() {
        const stats = {
            ...this.player.stats,
            level: this.player.level,
            gold: this.player.gold,
            totalXP: this.player.totalXP,
            currentStreak: this.player.currentStreak,
            activeDailies: this.dailies.length
        };

        this.achievementManager.checkAchievements(stats);
    }

    createTaskCompleteParticles() {
        const container = document.getElementById('particles-container');
        const colors = ['#10B981', '#F59E0B', '#7C3AED'];

        for (let i = 0; i < 15; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.left = Math.random() * window.innerWidth + 'px';
            particle.style.top = window.innerHeight * 0.8 + 'px';
            particle.style.background = colors[Math.floor(Math.random() * colors.length)];
            particle.style.animationDelay = Math.random() * 0.5 + 's';

            container.appendChild(particle);

            setTimeout(() => {
                particle.remove();
            }, 2500);
        }
    }

    updateUI() {
        this.updatePlayerStats();
        this.renderTasks();
    }

    updatePlayerStats() {
        document.getElementById('player-level').textContent = this.player.level;
        document.getElementById('player-xp').textContent = this.player.totalXP;
        document.getElementById('player-gold').textContent = this.player.gold;
        document.getElementById('player-streak').textContent = this.player.currentStreak;

        // Update XP bar
        const xpNeeded = this.getXPNeededForLevel(this.player.level);
        const xpPercentage = (this.player.xp / xpNeeded) * 100;
        
        document.getElementById('xp-fill').style.width = `${xpPercentage}%`;
        document.getElementById('xp-text').textContent = `${this.player.xp} / ${xpNeeded} Stardust`;
    }

    renderTasks() {
        this.renderTaskType('habits');
        this.renderTaskType('dailies');
        this.renderTaskType('todos');
    }

    renderTaskType(type) {
        const container = document.getElementById(`${type}-container`);
        const empty = document.getElementById(`${type}-empty`);
        const tasks = this[type];

        if (tasks.length === 0) {
            empty.style.display = 'block';
            container.querySelectorAll('.task-card').forEach(card => card.remove());
            return;
        }

        empty.style.display = 'none';
        
        // Clear existing task cards
        container.querySelectorAll('.task-card').forEach(card => card.remove());

        tasks.forEach(task => {
            const card = this.createTaskCard(task, type);
            container.appendChild(card);
        });
    }

    createTaskCard(task, type) {
        const card = document.createElement('div');
        card.className = `task-card ${type.slice(0, -1)}`;
        
        const rewards = this.calculateRewards(task.difficulty);
        
        let actionsHTML;
        if (type === 'habits') {
            actionsHTML = `
                <div class="habit-actions">
                    <button class="habit-btn habit-negative" onclick="app.handleHabitAction(${task.id}, false)">
                        <i class="fas fa-minus"></i> Diminish
                    </button>
                    <button class="habit-btn habit-positive" onclick="app.handleHabitAction(${task.id}, true)">
                        <i class="fas fa-plus"></i> Energize
                    </button>
                </div>
            `;
        } else {
            actionsHTML = `
                <div class="task-actions">
                    <button class="task-btn btn-complete" onclick="app.completeTask('${type}', ${task.id})" title="Complete ${type === 'habits' ? 'StarCore' : type === 'dailies' ? 'Quest' : 'Task'}">
                        <i class="fas fa-check"></i>
                    </button>
                    <button class="task-btn btn-edit" onclick="app.editTask('${type}', ${task.id})" title="Edit ${type === 'habits' ? 'StarCore' : type === 'dailies' ? 'Quest' : 'Task'}">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="task-btn btn-delete" onclick="app.deleteTask('${type}', ${task.id})" title="Destroy ${type === 'habits' ? 'StarCore' : type === 'dailies' ? 'Quest' : 'Task'}">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
        }

        card.innerHTML = `
            <div class="task-header">
                <div class="task-info">
                    <h4 class="task-title">${task.title}</h4>
                    ${task.description ? `<p class="task-description">${task.description}</p>` : ''}
                    <div class="task-meta">
                        <span class="difficulty-badge difficulty-${task.difficulty}">
                            ${task.difficulty.toUpperCase()}
                        </span>
                        <span>+${rewards.xp} Stardust</span>
                        <span>+${rewards.gold} Orbs</span>
                        ${task.dueDate ? `<span><i class="fas fa-calendar"></i> ${new Date(task.dueDate).toLocaleDateString()}</span>` : ''}
                    </div>
                </div>
            </div>
            ${actionsHTML}
        `;

        return card;
    }

    updateStatsTab() {
        // Update stats display
        document.getElementById('tasks-today').textContent = this.player.stats.tasksCompletedToday;
        document.getElementById('tasks-week').textContent = this.player.stats.tasksCompletedWeek;
        document.getElementById('tasks-total').textContent = this.player.stats.totalCompleted;
        document.getElementById('current-streak').textContent = `${this.player.currentStreak} cycles`;
        document.getElementById('best-streak').textContent = `${this.player.bestStreak} cycles`;
        
        document.getElementById('active-habits').textContent = this.habits.length;
        document.getElementById('active-dailies').textContent = this.dailies.length;
        document.getElementById('active-todos').textContent = this.todos.length;
        document.getElementById('achievements-unlocked').textContent = this.achievementManager.getUnlockedCount();
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new QuestMasterApp();
});

// Handle page visibility change for streak tracking
document.addEventListener('visibilitychange', () => {
    if (!document.hidden && window.app) {
        window.app.checkDailyReset();
        window.app.updateUI();
    }
});
