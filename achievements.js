// Achievement System
const ACHIEVEMENTS = [
    {
        id: 'first_task',
        title: 'Stellar Ignition',
        description: 'Forge your first StarCore',
        icon: '✨',
        unlocked: false,
        condition: (stats) => stats.totalCompleted >= 1
    },
    {
        id: 'task_master',
        title: 'Cosmic Adept',
        description: 'Complete 10 stellar tasks',
        icon: '🔮',
        unlocked: false,
        condition: (stats) => stats.totalCompleted >= 10
    },
    {
        id: 'task_legend',
        title: 'Star Forger',
        description: 'Complete 50 stellar tasks',
        icon: '⭐',
        unlocked: false,
        condition: (stats) => stats.totalCompleted >= 50
    },
    {
        id: 'task_champion',
        title: 'Cosmic Master',
        description: 'Complete 100 stellar tasks',
        icon: '🌌',
        unlocked: false,
        condition: (stats) => stats.totalCompleted >= 100
    },
    {
        id: 'streak_starter',
        title: 'Streak Starter',
        description: 'Maintain a 3-day streak',
        icon: '🔥',
        unlocked: false,
        condition: (stats) => stats.currentStreak >= 3
    },
    {
        id: 'streak_keeper',
        title: 'Streak Keeper',
        description: 'Maintain a 7-day streak',
        icon: '🔥',
        unlocked: false,
        condition: (stats) => stats.currentStreak >= 7
    },
    {
        id: 'streak_master',
        title: 'Streak Master',
        description: 'Maintain a 30-day streak',
        icon: '🌋',
        unlocked: false,
        condition: (stats) => stats.currentStreak >= 30
    },
    {
        id: 'level_up',
        title: 'Level Up!',
        description: 'Reach level 5',
        icon: '📈',
        unlocked: false,
        condition: (stats) => stats.level >= 5
    },
    {
        id: 'high_achiever',
        title: 'High Achiever',
        description: 'Reach level 10',
        icon: '🎯',
        unlocked: false,
        condition: (stats) => stats.level >= 10
    },
    {
        id: 'habit_former',
        title: 'StarCore Architect',
        description: 'Forge your first StarCore',
        icon: '🌟',
        unlocked: false,
        condition: (stats) => stats.habitsCreated >= 1
    },
    {
        id: 'daily_warrior',
        title: 'Stellar Guardian',
        description: 'Complete all daily quests in a day',
        icon: '⚔️',
        unlocked: false,
        condition: (stats) => stats.dailiesCompletedToday > 0 && stats.activeDailies > 0 && stats.dailiesCompletedToday >= stats.activeDailies
    },
    {
        id: 'epic_conqueror',
        title: 'Nova Crusher',
        description: 'Complete a Nova-tier task or higher',
        icon: '💫',
        unlocked: false,
        condition: (stats) => stats.epicTasksCompleted >= 1
    },
    {
        id: 'productive_day',
        title: 'Stellar Surge',
        description: 'Complete 5 tasks in a single cosmic day',
        icon: '🌠',
        unlocked: false,
        condition: (stats) => stats.tasksCompletedToday >= 5
    },
    {
        id: 'gold_collector',
        title: 'Orb Harvester',
        description: 'Accumulate 500 cosmic orbs',
        icon: '🔮',
        unlocked: false,
        condition: (stats) => stats.gold >= 500
    },
    {
        id: 'xp_hunter',
        title: 'Stardust Collector',
        description: 'Accumulate 1000 total stardust',
        icon: '✨',
        unlocked: false,
        condition: (stats) => stats.totalXP >= 1000
    }
];

// Achievement Manager
class AchievementManager {
    constructor() {
        this.achievements = this.loadAchievements();
    }

    loadAchievements() {
        const saved = localStorage.getItem('achievements');
        if (saved) {
            const savedAchievements = JSON.parse(saved);
            return ACHIEVEMENTS.map(achievement => {
                const savedAchievement = savedAchievements.find(a => a.id === achievement.id);
                return { ...achievement, unlocked: savedAchievement ? savedAchievement.unlocked : false };
            });
        }
        return [...ACHIEVEMENTS];
    }

    saveAchievements() {
        localStorage.setItem('achievements', JSON.stringify(this.achievements));
    }

    checkAchievements(stats) {
        const newlyUnlocked = [];
        
        this.achievements.forEach(achievement => {
            if (!achievement.unlocked && achievement.condition(stats)) {
                achievement.unlocked = true;
                newlyUnlocked.push(achievement);
            }
        });

        if (newlyUnlocked.length > 0) {
            this.saveAchievements();
        }

        return newlyUnlocked;
    }







    getUnlockedCount() {
        return this.achievements.filter(a => a.unlocked).length;
    }

    renderAchievements() {
        const container = document.getElementById('achievements-grid');
        container.innerHTML = '';

        this.achievements.forEach(achievement => {
            const card = document.createElement('div');
            card.className = `achievement-card ${achievement.unlocked ? 'unlocked' : 'locked'}`;
            
            card.innerHTML = `
                <span class="achievement-icon">${achievement.icon}</span>
                <h4 class="achievement-title">${achievement.title}</h4>
                <p class="achievement-description">${achievement.description}</p>
            `;

            container.appendChild(card);
        });
    }
}

// Export for use in main script
window.AchievementManager = AchievementManager;
