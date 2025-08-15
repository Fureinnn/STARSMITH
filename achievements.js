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
            newlyUnlocked.forEach(achievement => {
                this.showAchievementNotification(achievement);
            });
        }

        return newlyUnlocked;
    }

    showAchievementNotification(achievement) {
        const notification = document.getElementById('achievement-notification');
        const title = document.getElementById('achievement-title');
        const description = document.getElementById('achievement-description');

        title.textContent = achievement.title;
        description.textContent = achievement.description;

        notification.classList.add('show');

        // Play achievement sound effect (if audio context is available)
        this.playAchievementSound();

        // Create confetti particles
        this.createConfetti();

        setTimeout(() => {
            notification.classList.remove('show');
        }, 4000);
    }

    showLevelUpNotification(newLevel) {
        const notification = document.getElementById('level-up-notification');
        const description = document.getElementById('level-up-description');

        description.textContent = `You've reached level ${newLevel}!`;

        notification.classList.add('show');

        // Play level up sound effect
        this.playLevelUpSound();

        // Create level up particles
        this.createLevelUpParticles();

        setTimeout(() => {
            notification.classList.remove('show');
        }, 3000);
    }

    playAchievementSound() {
        // Create a simple achievement sound using Web Audio API
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime); // C5
            oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.1); // E5
            oscillator.frequency.setValueAtTime(783.99, audioContext.currentTime + 0.2); // G5

            gainNode.gain.setValueAtTime(0, audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(0.1, audioContext.currentTime + 0.01);
            gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.3);

            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.3);
        } catch (e) {
            console.log('Web Audio API not supported');
        }
    }

    playLevelUpSound() {
        // Create a level up sound
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            // Ascending scale
            const frequencies = [261.63, 329.63, 392.00, 523.25]; // C4, E4, G4, C5
            frequencies.forEach((freq, index) => {
                oscillator.frequency.setValueAtTime(freq, audioContext.currentTime + index * 0.15);
            });

            gainNode.gain.setValueAtTime(0, audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(0.15, audioContext.currentTime + 0.01);
            gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.6);

            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.6);
        } catch (e) {
            console.log('Web Audio API not supported');
        }
    }

    createConfetti() {
        const container = document.getElementById('particles-container');
        const colors = ['#F59E0B', '#7C3AED', '#10B981', '#EC4899'];

        for (let i = 0; i < 50; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.left = Math.random() * window.innerWidth + 'px';
            particle.style.top = window.innerHeight + 'px';
            particle.style.background = colors[Math.floor(Math.random() * colors.length)];
            particle.style.animationDelay = Math.random() * 2 + 's';
            particle.style.animationDuration = (Math.random() * 2 + 2) + 's';

            container.appendChild(particle);

            setTimeout(() => {
                particle.remove();
            }, 4000);
        }
    }

    createLevelUpParticles() {
        const container = document.getElementById('particles-container');

        for (let i = 0; i < 30; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.left = Math.random() * window.innerWidth + 'px';
            particle.style.top = window.innerHeight + 'px';
            particle.style.background = '#F59E0B';
            particle.style.width = '12px';
            particle.style.height = '12px';
            particle.style.animationDelay = Math.random() * 1 + 's';

            container.appendChild(particle);

            setTimeout(() => {
                particle.remove();
            }, 3000);
        }
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
