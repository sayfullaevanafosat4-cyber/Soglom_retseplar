// Profile Management Module
class ProfileManager {
    constructor() {
        this.weightHistory = [];
        this.achievements = [];
        this.loadProfileData();
    }

    loadProfileData() {
        if (!auth.isLoggedIn()) {
            window.location.href = 'login.html';
            return;
        }

        this.displayUserInfo();
        this.loadStatistics();
        this.loadWeightHistory();
        this.loadRecentActivity();
        this.loadAchievements();
        this.setupEventListeners();
    }

    displayUserInfo() {
        const user = auth.currentUser;
        if (!user) return;

        // Update username
        document.getElementById('profile-username').textContent = user.username;

        // Set form values
        document.getElementById('edit-username').value = user.username || '';
        document.getElementById('edit-email').value = user.email || '';
        document.getElementById('edit-age').value = user.age || '';
        document.getElementById('edit-weight').value = user.weight || '';
        document.getElementById('edit-height').value = user.height || '';
        document.getElementById('edit-gender').value = user.gender || '';
        document.getElementById('edit-activity').value = user.activity_level || 'moderate';
    }

    loadStatistics() {
        const user = auth.currentUser;
        if (!user) return;

        const statsContainer = document.getElementById('profile-stats');
        if (!statsContainer) return;

        const savedRecipes = db.getSavedRecipes(user.id);
        const consumedFoods = JSON.parse(localStorage.getItem('healthy_food_consumed_foods') || '[]')
            .filter(food => food.user_id === user.id);

        // Calculate total calories consumed
        const totalCalories = consumedFoods.reduce((sum, food) => sum + food.calories, 0);

        // Calculate days active
        const firstActivity = consumedFoods.length > 0 ? 
            new Date(Math.min(...consumedFoods.map(f => new Date(f.consumed_at)))) : 
            new Date();
        const daysActive = Math.ceil((new Date() - firstActivity) / (1000 * 60 * 60 * 24));

        const stats = [
            {
                title: 'Kunlik Maqsad',
                value: user.daily_calories || 2000,
                unit: 'kcal',
                icon: 'fa-bullseye',
                color: 'success'
            },
            {
                title: 'Saqlangan Retseptlar',
                value: savedRecipes.length,
                unit: 'ta',
                icon: 'fa-bookmark',
                color: 'primary'
            },
            {
                title: 'Jami Kaloriya',
                value: Math.round(totalCalories),
                unit: 'kcal',
                icon: 'fa-fire',
                color: 'warning'
            },
            {
                title: 'Faol Kunlar',
                value: daysActive,
                unit: 'kun',
                icon: 'fa-calendar-check',
                color: 'info'
            }
        ];

        statsContainer.innerHTML = stats.map(stat => `
            <div class="stat-item">
                <div class="d-flex align-items-center mb-2">
                    <div class="bg-${stat.color} bg-opacity-10 p-2 rounded me-3">
                        <i class="fas ${stat.icon} fa-2x text-${stat.color}"></i>
                    </div>
                    <div class="text-start">
                        <h3 class="mb-0">${stat.value} <small class="text-muted">${stat.unit}</small></h3>
                        <div class="text-muted">${stat.title}</div>
                    </div>
                </div>
            </div>
        `).join('');

        // Update daily progress
        this.updateDailyProgress();
    }

    updateDailyProgress() {
        const user = auth.currentUser;
        if (!user) return;

        const today = new Date().toISOString().split('T')[0];
        const consumedFoods = JSON.parse(localStorage.getItem('healthy_food_consumed_foods') || '[]')
            .filter(food => food.user_id === user.id && food.consumed_at.startsWith(today));

        const consumedCalories = consumedFoods.reduce((sum, food) => sum + food.calories, 0);
        const dailyGoal = user.daily_calories || 2000;
        const percentage = Math.min((consumedCalories / dailyGoal) * 100, 100);

        // Update progress bar
        const progressBar = document.querySelector('.progress-bar');
        if (progressBar) {
            progressBar.style.width = `${percentage}%`;
        }

        // Update calorie counters
        document.getElementById('current-calories').textContent = Math.round(consumedCalories);
        document.getElementById('daily-goal').textContent = dailyGoal;

        // Calculate macros (simplified)
        const protein = Math.round(consumedCalories * 0.3 / 4); // 30% from protein
        const carbs = Math.round(consumedCalories * 0.5 / 4);  // 50% from carbs
        const fat = Math.round(consumedCalories * 0.2 / 9);    // 20% from fat

        document.getElementById('protein-grams').textContent = protein;
        document.getElementById('carbs-grams').textContent = carbs;
        document.getElementById('fat-grams').textContent = fat;
    }

    loadWeightHistory() {
        // Load weight history from localStorage
        const weightData = JSON.parse(localStorage.getItem('weight_history') || '[]')
            .filter(entry => entry.user_id === auth.currentUser.id)
            .sort((a, b) => new Date(a.date) - new Date(b.date));

        this.weightHistory = weightData;
        this.displayWeightChart();
    }

    displayWeightChart() {
        const chartContainer = document.getElementById('weight-chart');
        if (!chartContainer) return;

        if (this.weightHistory.length === 0) {
            chartContainer.innerHTML = `
                <div class="text-center py-5 text-muted">
                    <i class="fas fa-weight-scale fa-2x mb-3"></i>
                    <p>Og'irlik ma'lumotlari yo'q</p>
                    <p>Og'irlik tarixini kuzatish uchun birinchi yozuvni qo'shing</p>
                </div>
            `;
            return;
        }

        // Simple text-based chart
        const weights = this.weightHistory.map(entry => entry.weight);
        const dates = this.weightHistory.map(entry => 
            new Date(entry.date).toLocaleDateString('uz-UZ', { month: 'short', day: 'numeric' })
        );

        const minWeight = Math.min(...weights);
        const maxWeight = Math.max(...weights);
        const range = maxWeight - minWeight;

        chartContainer.innerHTML = `
            <div class="weight-chart-visual">
                <div class="d-flex align-items-end" style="height: 250px;">
                    ${weights.map((weight, index) => {
                        const height = range > 0 ? ((weight - minWeight) / range) * 100 + 20 : 50;
                        return `
                            <div class="d-flex flex-column align-items-center mx-1" style="height: 100%;">
                                <div class="tooltip-wrapper position-relative">
                                    <div class="bg-success rounded-top" 
                                         style="width: 20px; height: ${height}%;"></div>
                                    <div class="tooltip fade" style="position: absolute; bottom: 100%; left: 50%; transform: translateX(-50%); background: #333; color: white; padding: 5px 10px; border-radius: 5px; font-size: 12px; white-space: nowrap;">
                                        ${weight} kg<br>${dates[index]}
                                    </div>
                                </div>
                                <small class="mt-2 text-muted">${dates[index]}</small>
                            </div>
                        `;
                    }).join('')}
                </div>
                <div class="mt-3 text-center">
                    <div class="text-success fw-bold">${weights[weights.length - 1]} kg</div>
                    <small class="text-muted">So'nggi o'lchov</small>
                </div>
            </div>
        `;

        // Add hover effects
        chartContainer.querySelectorAll('.tooltip-wrapper').forEach(wrapper => {
            wrapper.addEventListener('mouseenter', function() {
                this.querySelector('.tooltip').classList.add('show');
            });
            wrapper.addEventListener('mouseleave', function() {
                this.querySelector('.tooltip').classList.remove('show');
            });
        });
    }

    loadRecentActivity() {
        const activityContainer = document.getElementById('recent-activity');
        if (!activityContainer) return;

        const activities = [];
        const user = auth.currentUser;

        // Get saved recipes
        const savedRecipes = db.getSavedRecipes(user.id)
            .slice(0, 3)
            .map(recipe => ({
                type: 'recipe',
                title: `"${recipe.title}" saqlandi`,
                time: recipe.saved_at,
                icon: 'fa-bookmark',
                color: 'recipe'
            }));

        // Get recent food consumption
        const consumedFoods = JSON.parse(localStorage.getItem('healthy_food_consumed_foods') || '[]')
            .filter(food => food.user_id === user.id)
            .sort((a, b) => new Date(b.consumed_at) - new Date(a.consumed_at))
            .slice(0, 3)
            .map(food => ({
                type: 'food',
                title: `${food.food_name} iste'mol qilindi (${Math.round(food.calories)} kcal)`,
                time: food.consumed_at,
                icon: 'fa-utensils',
                color: 'food'
            }));

        // Get calculations
        const calculations = JSON.parse(localStorage.getItem('calculations') || '[]')
            .filter(calc => calc.user_id === user.id)
            .slice(0, 2)
            .map(calc => ({
                type: 'calc',
                title: `Kaloriya hisobi amalga oshirildi`,
                time: calc.date,
                icon: 'fa-calculator',
                color: 'calc'
            }));

        // Combine and sort by time
        activities.push(...savedRecipes, ...consumedFoods, ...calculations);
        activities.sort((a, b) => new Date(b.time) - new Date(a.time));

        if (activities.length === 0) {
            activityContainer.innerHTML = `
                <div class="text-center py-5 text-muted">
                    <i class="fas fa-history fa-2x mb-3"></i>
                    <p>Faoliyat yo'q</p>
                    <p>Ovqat qo'shing yoki retseptlarni ko'ring</p>
                </div>
            `;
            return;
        }

        activityContainer.innerHTML = activities.map(activity => `
            <div class="activity-item">
                <div class="activity-icon ${activity.color}">
                    <i class="fas ${activity.icon}"></i>
                </div>
                <div class="flex-grow-1">
                    <h6 class="mb-1">${activity.title}</h6>
                    <small class="text-muted">
                        <i class="far fa-clock"></i> 
                        ${this.formatTimeAgo(new Date(activity.time))}
                    </small>
                </div>
            </div>
        `).join('');
    }

    formatTimeAgo(date) {
        const now = new Date();
        const diff = now - date;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return 'hozirgina';
        if (minutes < 60) return `${minutes} daqiqa oldin`;
        if (hours < 24) return `${hours} soat oldin`;
        if (days < 7) return `${days} kun oldin`;
        return date.toLocaleDateString('uz-UZ');
    }

    loadAchievements() {
        const user = auth.currentUser;
        if (!user) return;

        const achievements = [];
        const savedRecipes = db.getSavedRecipes(user.id);
        const consumedFoods = JSON.parse(localStorage.getItem('healthy_food_consumed_foods') || '[]')
            .filter(food => food.user_id === user.id);

        // Check for achievements
        if (savedRecipes.length >= 1) {
            achievements.push({
                title: 'Birinchi Retsept',
                description: 'Birinchi retseptni saqlash',
                icon: 'fa-bookmark',
                unlocked: true
            });
        }

        if (savedRecipes.length >= 5) {
            achievements.push({
                title: 'Retsept Koleksiyasi',
                description: '5 ta retsept saqlash',
                icon: 'fa-book',
                unlocked: true
            });
        }

        if (consumedFoods.length >= 1) {
            achievements.push({
                title: 'Birinchi Ovqat',
                description: 'Birinchi ovqatni kiritish',
                icon: 'fa-utensils',
                unlocked: true
            });
        }

        if (consumedFoods.length >= 10) {
            achievements.push({
                title: 'Ovqat Kiritish',
                description: '10 ta ovqat kiritish',
                icon: 'fa-fire',
                unlocked: true
            });
        }

        if (this.weightHistory.length >= 5) {
            achievements.push({
                title: 'Kuzatuvchi',
                description: '5 marta og\'irlik kiritish',
                icon: 'fa-weight-scale',
                unlocked: true
            });
        }

        // Add locked achievements
        const allAchievements = [
            ...achievements,
            { title: 'Soglom Streak', description: '7 kun ketma-ket ovqat kiritish', icon: 'fa-calendar', unlocked: false },
            { title: 'Retsept Master', description: '20 ta retsept saqlash', icon: 'fa-crown', unlocked: false },
            { title: 'Kaloriya Expert', description: '10000 kaloriya kuzatish', icon: 'fa-chart-line', unlocked: false }
        ];

        this.displayAchievements(allAchievements);
    }

    displayAchievements(achievements) {
        const container = document.getElementById('achievements');
        if (!container) return;

        container.innerHTML = achievements.map(achievement => `
            <div class="col-md-3 mb-3">
                <div class="text-center ${achievement.unlocked ? '' : 'opacity-50'}">
                    <div class="achievement-icon mb-3">
                        <i class="fas ${achievement.icon} fa-3x ${achievement.unlocked ? 'text-success' : 'text-muted'}"></i>
                    </div>
                    <h6>${achievement.title}</h6>
                    <small class="text-muted">${achievement.description}</small>
                    ${achievement.unlocked ? 
                        '<span class="badge bg-success mt-2">Qo\'lga kiritildi</span>' : 
                        '<span class="badge bg-secondary mt-2">Qulf</span>'}
                </div>
            </div>
        `).join('');
    }

    setupEventListeners() {
        // Save profile button
        document.getElementById('save-profile-btn').addEventListener('click', () => {
            this.saveProfile();
        });

        // Save weight button
        document.getElementById('save-weight-btn').addEventListener('click', () => {
            this.saveWeight();
        });

        // Password change
        document.getElementById('current-password')?.addEventListener('input', (e) => {
            this.validatePasswordChange(e.target.value);
        });
    }

    saveProfile() {
        const user = auth.currentUser;
        if (!user) return;

        const updates = {
            username: document.getElementById('edit-username').value || user.username,
            email: document.getElementById('edit-email').value || user.email,
            age: parseInt(document.getElementById('edit-age').value) || user.age,
            weight: parseFloat(document.getElementById('edit-weight').value) || user.weight,
            height: parseFloat(document.getElementById('edit-height').value) || user.height,
            gender: document.getElementById('edit-gender').value || user.gender,
            activity_level: document.getElementById('edit-activity').value || user.activity_level
        };

        // Update daily calories based on new info
        if (updates.weight && updates.height && updates.age && updates.gender && updates.activity_level) {
            const calories = this.calculateDailyCalories(
                updates.weight,
                updates.height,
                updates.age,
                updates.gender,
                updates.activity_level
            );
            updates.daily_calories = calories;
        }

        // Handle password change
        const currentPassword = document.getElementById('current-password').value;
        const newPassword = document.getElementById('new-password').value;
        
        if (currentPassword && newPassword) {
            // Verify current password
            const storedPassword = atob(user.password);
            if (currentPassword !== storedPassword) {
                showToast('Joriy parol noto\'g\'ri', 'error');
                return;
            }
            
            // Update password
            updates.password = btoa(newPassword);
        }

        try {
            db.updateUser(user.id, updates);
            auth.currentUser = { ...user, ...updates };
            auth.saveUser(auth.currentUser);
            
            showToast('Profil muvaffaqiyatli yangilandi', 'success');
            
            // Close modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('edit-profile'));
            modal.hide();
            
            // Reload profile data
            setTimeout(() => {
                this.loadProfileData();
            }, 500);
            
        } catch (error) {
            showToast('Profilni yangilashda xatolik', 'error');
        }
    }

    calculateDailyCalories(weight, height, age, gender, activity) {
        // Harris-Benedict equation
        let bmr;
        if (gender === 'male') {
            bmr = 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age);
        } else {
            bmr = 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age);
        }
        
        const multipliers = {
            'sedentary': 1.2,
            'light': 1.375,
            'moderate': 1.55,
            'active': 1.725,
            'very_active': 1.9
        };
        
        return Math.round(bmr * multipliers[activity] || 1.55);
    }

    saveWeight() {
        const weightValue = parseFloat(document.getElementById('weight-value').value);
        const weightDate = document.getElementById('weight-date').value;
        
        if (!weightValue || !weightDate) {
            showToast('Iltimos, barcha maydonlarni to\'ldiring', 'error');
            return;
        }
        
        // Save to weight history
        let weightHistory = JSON.parse(localStorage.getItem('weight_history') || '[]');
        weightHistory.push({
            user_id: auth.currentUser.id,
            weight: weightValue,
            date: weightDate,
            timestamp: new Date().toISOString()
        });
        
        localStorage.setItem('weight_history', JSON.stringify(weightHistory));
        
        // Update user's current weight
        db.updateUser(auth.currentUser.id, { weight: weightValue });
        
        // Close modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('weightModal'));
        modal.hide();
        
        // Reset form
        document.getElementById('weight-form').reset();
        
        showToast('Og\'irlik muvaffaqiyatli qo\'shildi', 'success');
        
        // Reload weight history
        setTimeout(() => {
            this.loadWeightHistory();
        }, 500);
    }

    validatePasswordChange(currentPassword) {
        const user = auth.currentUser;
        if (!user || !currentPassword) return;
        
        const storedPassword = atob(user.password);
        const newPasswordInput = document.getElementById('new-password');
        const saveBtn = document.getElementById('save-profile-btn');
        
        if (currentPassword !== storedPassword) {
            newPasswordInput.disabled = true;
            saveBtn.disabled = true;
            showToast('Joriy parol noto\'g\'ri', 'error');
        } else {
            newPasswordInput.disabled = false;
            saveBtn.disabled = false;
        }
    }
}

// Initialize profile manager
let profileManager;

document.addEventListener('DOMContentLoaded', function() {
    updateAuthLinks();
    
    if (auth.isLoggedIn()) {
        profileManager = new ProfileManager();
    } else {
        window.location.href = 'login.html';
    }
});