// Kaloriya Kalkulyatori
class CalorieCalculator {
    constructor() {
        this.currentStep = 1;
        this.userData = {};
        this.foodDatabase = {
            'salad': { calories: 150, name: 'Sabzavot salati' },
            'pizza': { calories: 285, name: 'Pizza' },
            'burger': { calories: 354, name: 'Burger' },
            'apple': { calories: 52, name: 'Olma' },
            'banana': { calories: 89, name: 'Banan' },
            'chicken': { calories: 239, name: 'Tovuq goshti' },
            'rice': { calories: 130, name: 'Guruch' },
            'bread': { calories: 265, name: 'Non' },
            'egg': { calories: 155, name: 'Tuxum' },
            'milk': { calories: 42, name: 'Sut' },
            'yogurt': { calories: 59, name: 'Yogurt' },
            'pasta': { calories: 131, name: 'Makaron' }
        };
    }

    // Step navigation
    nextStep() {
        if (this.validateStep(this.currentStep)) {
            this.saveStepData(this.currentStep);
            this.currentStep++;
            this.updateStepDisplay();
            this.animateStep();
            return true;
        }
        return false;
    }

    prevStep() {
        if (this.currentStep > 1) {
            this.currentStep--;
            this.updateStepDisplay();
            this.animateStep();
        }
    }

    validateStep(step) {
        switch(step) {
            case 1:
                const age = document.getElementById('age').value;
                const gender = document.getElementById('gender').value;
                if (!age || age < 10 || age > 100) {
                    showToast('Iltimos, to\'g\'ri yosh kiriting (10-100)', 'error');
                    return false;
                }
                if (!gender) {
                    showToast('Iltimos, jinsingizni tanlang', 'error');
                    return false;
                }
                return true;

            case 2:
                const weight = document.getElementById('weight').value;
                const height = document.getElementById('height').value;
                if (!weight || weight < 30 || weight > 200) {
                    showToast('Iltimos, to\'g\'ri og\'irlik kiriting (30-200 kg)', 'error');
                    return false;
                }
                if (!height || height < 100 || height > 250) {
                    showToast('Iltimos, to\'g\'ri bo\'y kiriting (100-250 cm)', 'error');
                    return false;
                }
                return true;

            case 3:
                const activity = document.getElementById('activity').value;
                if (!activity) {
                    showToast('Iltimos, faollik darajangizni tanlang', 'error');
                    return false;
                }
                return true;

            default:
                return true;
        }
    }

    saveStepData(step) {
        switch(step) {
            case 1:
                this.userData.age = parseInt(document.getElementById('age').value);
                this.userData.gender = document.getElementById('gender').value;
                break;
            case 2:
                this.userData.weight = parseFloat(document.getElementById('weight').value);
                this.userData.height = parseFloat(document.getElementById('height').value);
                break;
            case 3:
                this.userData.activity = document.getElementById('activity').value;
                break;
        }
    }

    updateStepDisplay() {
        // Hide all steps
        document.querySelectorAll('.form-step').forEach(step => {
            step.classList.remove('active');
        });

        // Show current step
        const currentStepElement = document.getElementById(`step-${this.currentStep}`);
        if (currentStepElement) {
            currentStepElement.classList.add('active');
        }

        // Update progress bar
        const progress = ((this.currentStep - 1) / 3) * 100;
        document.getElementById('progress-bar').style.width = `${progress}%`;

        // Update buttons
        document.getElementById('prev-btn').style.display = this.currentStep > 1 ? 'block' : 'none';
        document.getElementById('next-btn').style.display = this.currentStep < 4 ? 'block' : 'none';
        document.getElementById('calculate-btn').style.display = this.currentStep === 4 ? 'block' : 'none';
    }

    animateStep() {
        const stepElement = document.getElementById(`step-${this.currentStep}`);
        if (stepElement) {
            stepElement.style.animation = 'none';
            setTimeout(() => {
                stepElement.style.animation = 'fadeIn 0.5s ease';
            }, 10);
        }
    }

    // Calculate daily calories
    calculateCalories() {
        const { weight, height, age, gender, activity } = this.userData;

        // Harris-Benedict equation
        let bmr;
        if (gender === 'male') {
            bmr = 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age);
        } else {
            bmr = 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age);
        }

        // Activity multipliers
        const multipliers = {
            'sedentary': 1.2,
            'light': 1.375,
            'moderate': 1.55,
            'active': 1.725,
            'very_active': 1.9
        };

        const dailyCalories = Math.round(bmr * multipliers[activity] || 1.55);
        
        // Save to user profile if logged in
        if (auth.isLoggedIn()) {
            db.updateUser(auth.currentUser.id, {
                weight,
                height,
                age,
                gender,
                activity_level: activity,
                daily_calories: dailyCalories
            });
            
            // Update current user data
            auth.currentUser = db.getUser(auth.currentUser.id);
            auth.saveUser(auth.currentUser);
        }

        return dailyCalories;
    }

    // Display results
    showResults() {
        const dailyCalories = this.calculateCalories();
        
        // Calculate today's consumption
        let todayConsumed = 0;
        if (auth.isLoggedIn()) {
            todayConsumed = db.getTodayConsumedCalories(auth.currentUser.id);
        }

        const remaining = Math.max(0, dailyCalories - todayConsumed);

        const resultsHtml = `
            <div class="text-center">
                <h4 class="text-success mb-4">Sizning Natijalaringiz</h4>
                
                <div class="row mb-4">
                    <div class="col-md-6 mb-3">
                        <div class="stat-card">
                            <div class="stat-value">${dailyCalories}</div>
                            <div class="stat-label">Kunlik kaloriya</div>
                        </div>
                    </div>
                    <div class="col-md-6 mb-3">
                        <div class="stat-card">
                            <div class="stat-value">${remaining}</div>
                            <div class="stat-label">Qolgan kaloriya</div>
                        </div>
                    </div>
                </div>

                <div class="progress mb-3" style="height: 30px;">
                    <div class="progress-bar progress-bar-striped progress-bar-animated" 
                         role="progressbar" 
                         style="width: ${(todayConsumed / dailyCalories) * 100}%">
                        ${todayConsumed} kcal iste'mol qilindi
                    </div>
                </div>

                <p class="text-muted">
                    <i class="fas fa-info-circle"></i> 
                    Bu hisob sizning bazal metabolizm tezligingiz va faollik darajangiz asosida hisoblandi.
                </p>

                <div class="mt-4">
                    <a href="profile.html" class="btn btn-success">
                        <i class="fas fa-chart-line"></i> To'liq statistikani ko'rish
                    </a>
                </div>
            </div>
        `;

        document.getElementById('step-4').innerHTML = resultsHtml;
    }

    // Image-based food recognition (simulated)
    recognizeFoodFromImage(file) {
        return new Promise((resolve) => {
            // In a real app, this would call an AI/ML API
            // For demo, we'll simulate recognition with random food
            setTimeout(() => {
                const foods = Object.keys(this.foodDatabase);
                const randomFood = foods[Math.floor(Math.random() * foods.length)];
                const foodInfo = this.foodDatabase[randomFood];
                
                // Create image preview
                const reader = new FileReader();
                reader.onload = function(e) {
                    resolve({
                        food: foodInfo.name,
                        calories: foodInfo.calories,
                        imagePreview: e.target.result
                    });
                };
                reader.readAsDataURL(file);
            }, 1500);
        });
    }

    // Add consumed food
    addConsumedFood(foodName, calories, quantity) {
        if (!auth.isLoggedIn()) {
            showToast('Iltimos, avval tizimga kiring', 'error');
            return false;
        }

        db.addConsumedFood(auth.currentUser.id, foodName, calories, quantity);
        
        // Update daily calories display
        const dailyCalories = auth.currentUser.daily_calories || 2000;
        const todayConsumed = db.getTodayConsumedCalories(auth.currentUser.id);
        const remaining = Math.max(0, dailyCalories - todayConsumed);

        showToast(`${foodName} qo'shildi (${calories * quantity} kcal)`, 'success');
        
        // Update UI if on results page
        const remainingElement = document.querySelector('.stat-value:last-child');
        const progressBar = document.querySelector('.progress-bar');
        
        if (remainingElement) {
            remainingElement.textContent = remaining;
        }
        if (progressBar) {
            progressBar.style.width = `${(todayConsumed / dailyCalories) * 100}%`;
            progressBar.textContent = `${todayConsumed} kcal iste'mol qilindi`;
        }

        return true;
    }
}

// Initialize calculator
const calculator = new CalorieCalculator();

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('step-1')) {
        calculator.updateStepDisplay();
        
        // Event listeners for navigation
        document.getElementById('next-btn')?.addEventListener('click', () => {
            calculator.nextStep();
        });

        document.getElementById('prev-btn')?.addEventListener('click', () => {
            calculator.prevStep();
        });

        document.getElementById('calculate-btn')?.addEventListener('click', () => {
            calculator.showResults();
        });

        // Image upload for food recognition
        const imageUpload = document.getElementById('image-upload');
        const imagePreview = document.getElementById('image-preview');
        const recognizeBtn = document.getElementById('recognize-btn');
        const foodResult = document.getElementById('food-result');
        const addFoodBtn = document.getElementById('add-food-btn');

        let currentFoodInfo = null;

        if (imageUpload) {
            imageUpload.addEventListener('change', function(e) {
                const file = e.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = function(e) {
                        imagePreview.innerHTML = `
                            <img src="${e.target.result}" class="img-fluid rounded" alt="Yuklangan rasm">
                        `;
                        recognizeBtn.disabled = false;
                    };
                    reader.readAsDataURL(file);
                }
            });
        }

        if (recognizeBtn) {
            recognizeBtn.addEventListener('click', function() {
                const file = imageUpload.files[0];
                if (!file) return;

                this.disabled = true;
                this.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Tahlil qilinmoqda...';

                calculator.recognizeFoodFromImage(file).then(result => {
                    this.disabled = false;
                    this.innerHTML = '<i class="fas fa-search"></i> Tahlil qilish';
                    
                    currentFoodInfo = result;
                    
                    foodResult.innerHTML = `
                        <div class="alert alert-success">
                            <h5><i class="fas fa-check-circle"></i> Tahlil natijasi</h5>
                            <p>Aniqlangan ovqat: <strong>${result.food}</strong></p>
                            <p>Kaloriya (100g): <strong>${result.calories} kcal</strong></p>
                            <div class="row mt-3">
                                <div class="col-md-6">
                                    <label for="quantity" class="form-label">Miqdori (gramm):</label>
                                    <input type="number" id="food-quantity" class="form-control" value="100" min="1" max="1000">
                                </div>
                                <div class="col-md-6">
                                    <label for="calories-total" class="form-label">Jami kaloriya:</label>
                                    <input type="text" id="calories-total" class="form-control" 
                                           value="${result.calories}" readonly>
                                </div>
                            </div>
                        </div>
                    `;

                    // Update total calories when quantity changes
                    document.getElementById('food-quantity')?.addEventListener('input', function() {
                        const quantity = parseInt(this.value) || 100;
                        const caloriesPer100g = result.calories;
                        const totalCalories = Math.round((caloriesPer100g * quantity) / 100);
                        document.getElementById('calories-total').value = totalCalories;
                    });

                    addFoodBtn.disabled = false;
                });
            });
        }

        if (addFoodBtn) {
            addFoodBtn.addEventListener('click', function() {
                if (!currentFoodInfo) return;

                const quantity = parseInt(document.getElementById('food-quantity')?.value) || 100;
                const calories = (currentFoodInfo.calories * quantity) / 100;

                calculator.addConsumedFood(currentFoodInfo.food, currentFoodInfo.calories, quantity / 100);
            });
        }

        // Manual food entry
        const manualFoodForm = document.getElementById('manual-food-form');
        if (manualFoodForm) {
            manualFoodForm.addEventListener('submit', function(e) {
                e.preventDefault();
                
                const foodName = document.getElementById('food-name').value;
                const calories = parseFloat(document.getElementById('food-calories').value);
                const quantity = parseFloat(document.getElementById('manual-quantity').value);

                if (!foodName || !calories || !quantity) {
                    showToast('Iltimos, barcha maydonlarni to\'ldiring', 'error');
                    return;
                }

                calculator.addConsumedFood(foodName, calories, quantity);
                this.reset();
            });
        }
    }
});
// Calculator Additional Functions
class CalculatorManager {
    constructor() {
        this.currentStep = 1;
        this.userData = {};
    }

    init() {
        this.setupFormNavigation();
        this.setupFoodLog();
        this.setupManualFoodForm();
    }

    setupFormNavigation() {
        const nextBtn = document.getElementById('next-btn');
        const prevBtn = document.getElementById('prev-btn');
        const calculateBtn = document.getElementById('calculate-btn');

        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                if (this.validateCurrentStep()) {
                    this.saveStepData();
                    this.nextStep();
                }
            });
        }

        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                this.prevStep();
            });
        }

        if (calculateBtn) {
            calculateBtn.addEventListener('click', () => {
                this.calculateAndDisplay();
            });
        }

        // Set today's date for weight form
        const weightDate = document.getElementById('weight-date');
        if (weightDate) {
            weightDate.value = new Date().toISOString().split('T')[0];
        }
    }

    validateCurrentStep() {
        switch(this.currentStep) {
            case 1:
                const age = document.getElementById('calc-age');
                const gender = document.getElementById('calc-gender');
                if (!age.value || age.value < 10 || age.value > 100) {
                    showToast('Iltimos, to\'g\'ri yosh kiriting (10-100)', 'error');
                    age.focus();
                    return false;
                }
                if (!gender.value) {
                    showToast('Iltimos, jinsingizni tanlang', 'error');
                    gender.focus();
                    return false;
                }
                return true;

            case 2:
                const weight = document.getElementById('calc-weight');
                const height = document.getElementById('calc-height');
                if (!weight.value || weight.value < 30 || weight.value > 200) {
                    showToast('Iltimos, to\'g\'ri og\'irlik kiriting (30-200 kg)', 'error');
                    weight.focus();
                    return false;
                }
                if (!height.value || height.value < 100 || height.value > 250) {
                    showToast('Iltimos, to\'g\'ri bo\'y kiriting (100-250 cm)', 'error');
                    height.focus();
                    return false;
                }
                return true;

            case 3:
                const activity = document.getElementById('calc-activity');
                if (!activity.value) {
                    showToast('Iltimos, faollik darajangizni tanlang', 'error');
                    activity.focus();
                    return false;
                }
                return true;

            default:
                return true;
        }
    }

    saveStepData() {
        switch(this.currentStep) {
            case 1:
                this.userData.age = parseInt(document.getElementById('calc-age').value);
                this.userData.gender = document.getElementById('calc-gender').value;
                break;
            case 2:
                this.userData.weight = parseFloat(document.getElementById('calc-weight').value);
                this.userData.height = parseFloat(document.getElementById('calc-height').value);
                break;
            case 3:
                this.userData.activity = document.getElementById('calc-activity').value;
                break;
        }
    }

    nextStep() {
        if (this.currentStep < 4) {
            document.getElementById(`step-${this.currentStep}`).classList.remove('active');
            document.getElementById(`step-${this.currentStep}`).classList.add('d-none');
            
            this.currentStep++;
            
            document.getElementById(`step-${this.currentStep}`).classList.remove('d-none');
            document.getElementById(`step-${this.currentStep}`).classList.add('active');
            
            this.updateNavigationButtons();
            this.animateStep();
        }
    }

    prevStep() {
        if (this.currentStep > 1) {
            document.getElementById(`step-${this.currentStep}`).classList.remove('active');
            document.getElementById(`step-${this.currentStep}`).classList.add('d-none');
            
            this.currentStep--;
            
            document.getElementById(`step-${this.currentStep}`).classList.remove('d-none');
            document.getElementById(`step-${this.currentStep}`).classList.add('active');
            
            this.updateNavigationButtons();
            this.animateStep();
        }
    }

    updateNavigationButtons() {
        const prevBtn = document.getElementById('prev-btn');
        const nextBtn = document.getElementById('next-btn');
        const calculateBtn = document.getElementById('calculate-btn');

        if (prevBtn) {
            prevBtn.style.display = this.currentStep > 1 ? 'block' : 'none';
        }

        if (nextBtn) {
            nextBtn.style.display = this.currentStep < 4 ? 'block' : 'none';
        }

        if (calculateBtn) {
            calculateBtn.style.display = this.currentStep === 4 ? 'block' : 'none';
        }
    }

    animateStep() {
        const stepElement = document.getElementById(`step-${this.currentStep}`);
        if (stepElement) {
            stepElement.style.animation = 'none';
            setTimeout(() => {
                stepElement.style.animation = 'fadeIn 0.5s ease';
            }, 10);
        }
    }

    calculateAndDisplay() {
        const dailyCalories = this.calculateDailyCalories();
        
        // Save to user profile if logged in
        if (auth.isLoggedIn()) {
            db.updateUser(auth.currentUser.id, {
                weight: this.userData.weight,
                height: this.userData.height,
                age: this.userData.age,
                gender: this.userData.gender,
                activity_level: this.userData.activity,
                daily_calories: dailyCalories
            });
            
            auth.currentUser = db.getUser(auth.currentUser.id);
            auth.saveUser(auth.currentUser);
        }

        const resultsHtml = `
            <div class="text-center">
                <h4 class="text-success mb-4">Sizning Kunlik Kaloriya Ehtiyojingiz</h4>
                
                <div class="display-1 fw-bold text-success mb-3">${dailyCalories}</div>
                <div class="h4 mb-4">kaloriya / kun</div>
                
                <div class="row justify-content-center mb-4">
                    <div class="col-md-8">
                        <div class="alert alert-info">
                            <h5><i class="fas fa-info-circle"></i> Maqsadlar:</h5>
                            <div class="row text-center mt-3">
                                <div class="col-4">
                                    <div class="p-2">
                                        <div class="h4 text-success">${Math.round(dailyCalories - 500)}</div>
                                        <small>Vazn yo'qotish</small>
                                    </div>
                                </div>
                                <div class="col-4">
                                    <div class="p-2 border-start border-end">
                                        <div class="h4 text-primary">${dailyCalories}</div>
                                        <small>Saqlash</small>
                                    </div>
                                </div>
                                <div class="col-4">
                                    <div class="p-2">
                                        <div class="h4 text-warning">${Math.round(dailyCalories + 500)}</div>
                                        <small>Vazn olish</small>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="mb-4">
                    <h5>Qazilma maqsadlari:</h5>
                    <div class="row text-center">
                        <div class="col-md-4 mb-3">
                            <div class="p-3 border rounded">
                                <div class="h3 text-primary">${Math.round(dailyCalories * 0.3 / 4)}g</div>
                                <small>Protein (30%)</small>
                            </div>
                        </div>
                        <div class="col-md-4 mb-3">
                            <div class="p-3 border rounded">
                                <div class="h3 text-warning">${Math.round(dailyCalories * 0.5 / 4)}g</div>
                                <small>Uglevod (50%)</small>
                            </div>
                        </div>
                        <div class="col-md-4 mb-3">
                            <div class="p-3 border rounded">
                                <div class="h3 text-danger">${Math.round(dailyCalories * 0.2 / 9)}g</div>
                                <small>Yog' (20%)</small>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="mt-4">
                    <button class="btn btn-success me-2" onclick="window.location.href='profile.html'">
                        <i class="fas fa-chart-line"></i> Profilga o'tish
                    </button>
                    <button class="btn btn-outline-success" onclick="location.reload()">
                        <i class="fas fa-redo"></i> Yangi hisob
                    </button>
                </div>
            </div>
        `;

        document.getElementById('calculation-results').innerHTML = resultsHtml;
    }

    calculateDailyCalories() {
        const { weight, height, age, gender, activity } = this.userData;

        // Harris-Benedict equation
        let bmr;
        if (gender === 'male') {
            bmr = 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age);
        } else {
            bmr = 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age);
        }

        // Activity multipliers
        const multipliers = {
            'sedentary': 1.2,
            'light': 1.375,
            'moderate': 1.55,
            'active': 1.725,
            'very_active': 1.9
        };

        return Math.round(bmr * multipliers[activity] || 1.55);
    }

    setupFoodLog() {
        // Listen for food log updates
        document.addEventListener('foodLogUpdated', () => {
            loadFoodLog();
            updateCaloriesProgress();
        });
    }

    setupManualFoodForm() {
        const form = document.getElementById('manual-food-form');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                
                const foodName = document.getElementById('food-name').value;
                const calories = parseFloat(document.getElementById('food-calories').value);
                const quantity = parseFloat(document.getElementById('food-quantity').value);
                
                if (!foodName || !calories || !quantity) {
                    showToast('Iltimos, barcha maydonlarni to\'ldiring', 'error');
                    return;
                }
                
                if (auth.isLoggedIn()) {
                    db.addConsumedFood(
                        auth.currentUser.id,
                        foodName,
                        calories,
                        quantity / 100
                    );
                    
                    form.reset();
                    showToast('Ovqat qo\'shildi!', 'success');
                    
                    // Update food log
                    loadFoodLog();
                    updateCaloriesProgress();
                    
                    // Dispatch event for other components
                    document.dispatchEvent(new Event('foodLogUpdated'));
                } else {
                    showToast('Iltimos, avval tizimga kiring', 'error');
                }
            });
        }
    }
}

// Food Log Functions
function loadFoodLog() {
    const foodLog = document.getElementById('food-log');
    if (!foodLog) return;

    if (!auth.isLoggedIn()) {
        foodLog.innerHTML = `
            <div class="text-center py-5">
                <i class="fas fa-lock fa-3x text-muted mb-3"></i>
                <h5>Kirish talab qilinadi</h5>
                <p class="text-muted">Ovqat jurnalini ko'rish uchun tizimga kiring</p>
                <a href="login.html" class="btn btn-success">
                    <i class="fas fa-sign-in-alt"></i> Kirish
                </a>
            </div>
        `;
        return;
    }

    const today = new Date().toISOString().split('T')[0];
    const consumedFoods = JSON.parse(localStorage.getItem('healthy_food_consumed_foods') || '[]')
        .filter(food => food.user_id === auth.currentUser.id && food.consumed_at.startsWith(today))
        .sort((a, b) => new Date(b.consumed_at) - new Date(a.consumed_at));

    if (consumedFoods.length === 0) {
        foodLog.innerHTML = `
            <div class="text-center py-5">
                <i class="fas fa-utensils fa-3x text-muted mb-3"></i>
                <h5>Hozircha ovqat qo'shilmagan</h5>
                <p class="text-muted">Ovqat qo'shishni boshlang yoki rasm orqali aniqlang</p>
            </div>
        `;
        return;
    }

    let totalCalories = 0;
    const foodItems = consumedFoods.map(food => {
        totalCalories += food.calories;
        const time = new Date(food.consumed_at).toLocaleTimeString('uz-UZ', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
        
        return `
            <div class="food-log-item">
                <div>
                    <h6 class="mb-1">${food.food_name}</h6>
                    <small class="text-muted">
                        <i class="far fa-clock"></i> ${time} | 
                        ${food.quantity ? `${food.quantity * 100}g` : '100g'}
                    </small>
                </div>
                <div class="food-item-calories">${Math.round(food.calories)} kcal</div>
            </div>
        `;
    }).join('');

    foodLog.innerHTML = `
        <div class="mb-3">
            <h5>Bugungi ovqatlar (${consumedFoods.length})</h5>
        </div>
        ${foodItems}
        <div class="food-log-item" style="background: #f8f9fa;">
            <div>
                <h6 class="mb-0">Jami</h6>
            </div>
            <div class="food-item-calories">${Math.round(totalCalories)} kcal</div>
        </div>
    `;
}

function updateCaloriesProgress() {
    if (!auth.isLoggedIn()) return;

    const user = auth.currentUser;
    const dailyGoal = user.daily_calories || 2000;
    
    const today = new Date().toISOString().split('T')[0];
    const consumedFoods = JSON.parse(localStorage.getItem('healthy_food_consumed_foods') || '[]')
        .filter(food => food.user_id === user.id && food.consumed_at.startsWith(today));
    
    const consumedCalories = consumedFoods.reduce((sum, food) => sum + food.calories, 0);
    const remainingCalories = Math.max(0, dailyGoal - consumedCalories);
    const percentage = Math.min((consumedCalories / dailyGoal) * 100, 100);

    // Update calories circle
    const circle = document.getElementById('calories-circle');
    if (circle) {
        circle.style.setProperty('--progress', `${percentage}%`);
        document.getElementById('consumed-calories').textContent = Math.round(consumedCalories);
        document.getElementById('remaining-calories').textContent = `${Math.round(remainingCalories)} kcal`;
    }
}

// Initialize calculator manager
let calculatorManager;

document.addEventListener('DOMContentLoaded', function() {
    calculatorManager = new CalculatorManager();
    calculatorManager.init();
});