// SQLite3 Database Manager
class Database {
    constructor() {
        this.dbName = 'healthy_food';
        this.dbVersion = 1;
        this.initDatabase();
    }

    initDatabase() {
        try {
            // Use localStorage as a simple database for client-side
            // In a real project, this would be replaced with IndexedDB or server API
            if (!localStorage.getItem('healthy_food_users')) {
                localStorage.setItem('healthy_food_users', JSON.stringify([]));
            }
            if (!localStorage.getItem('healthy_food_recipes')) {
                this.createSampleRecipes();
            }
            if (!localStorage.getItem('healthy_food_saved_recipes')) {
                localStorage.setItem('healthy_food_saved_recipes', JSON.stringify([]));
            }
            if (!localStorage.getItem('healthy_food_consumed_foods')) {
                localStorage.setItem('healthy_food_consumed_foods', JSON.stringify([]));
            }
        } catch (error) {
            console.error('Database initialization error:', error);
        }
    }

    createSampleRecipes() {
        const sampleRecipes = [
            {
                id: 1,
                title: "Quinoa Salatasi",
                description: "Vitaminlarga boy sog'lom salat",
                ingredients: "Quinoa, pomidor, bodring, qalampir, limon sharbati, zaytun moyi",
                instructions: "1. Quinoani qaynatib tayyorlang. 2. Sabzavotlarni mayda to'g'rang. 3. Aralashtirib, zaytun moyi va limon sharbati sepib, xizmat qiling.",
                prep_time: 15,
                cook_time: 20,
                servings: 2,
                category: "salad",
                calories: 320,
                protein: 12,
                carbs: 45,
                fat: 8,
                image_url: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
                is_featured: true
            },
            {
                id: 2,
                title: "Sabzavotli Smoothie",
                description: "Energiya beruvchi seryog smoothie",
                ingredients: "Banana, ismaloq, yong'oq suti, urug'lar, asal",
                instructions: "1. Barcha ingredientlarni blenderda aralashtiring. 2. Toza idishga quying. 3. Darhol iste'mol qiling.",
                prep_time: 5,
                cook_time: 0,
                servings: 1,
                category: "smuzi",
                calories: 250,
                protein: 8,
                carbs: 35,
                fat: 6,
                image_url: "images/sabzavotsmoothie.png",
                is_featured: true
            },
            {
                id: 2,
                title: "Kukus bilan Baliq",
                description: "Protein boy ovqat",
                ingredients: "Losos balig'i, brokoli, kukus, zaytun moyi, limon",
                instructions: "1. Baligni zaytun moyida pishiring. 2. Sabzavotlarni bug'da pishiring. 3. Limon sharbati sepib xizmat qiling.",
                prep_time: 10,
                cook_time: 15,
                servings: 1,
                category: "taom",
                calories: 450,
                protein: 35,
                carbs: 20,
                fat: 18,
                image_url: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
                is_featured: true
            },
            {
                id: 3,
                title: "Coffe",
                description: "Hushyorlik ichimligi",
                ingredients: "Cappuchino",
                instructions: "Qovurilgan qahva donlari maydalanib, qaynoq suvda damlanadi. ☕",
                prep_time: 5,
                cook_time: 5,
                servings: 1,
                category: "ichimlik",
                calories: 30,
                protein: 0,
                carbs: 5,
                fat: 0,
                image_url: "https://images.unsplash.com/photo-1561047029-3000c68339ca?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
                is_featured: false
            },
            {
                id: 4,
                title: "Avokado Tost",
                description: "Nonushta uchun mukammal",
                ingredients: "Butun bug'doy noni, avokado, tuxum, pomidor",
                instructions: "1. Nonni qovuring. 2. Avokadoni ezib, nonga surting. 3. Ustiga pomidor va pishgan tuxum qo'ying.",
                prep_time: 10,
                cook_time: 10,
                servings: 1,
                category: "taom",
                calories: 380,
                protein: 15,
                carbs: 30,
                fat: 22,
                image_url: "https://images.unsplash.com/photo-1482049016688-2d3e1b311543?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
                is_featured: true
            },
            {
                id: 5,
                title: "Meyveli Yoğurt",
                description: "Probiyotik boy dessert",
                ingredients: "Yogurt, qulupnay, banana, yong'oq, asal",
                instructions: "1. Yogurtni idishga quying. 2. Ustiga mevalar va yong'oq sepib, asal quying.",
                prep_time: 5,
                cook_time: 0,
                servings: 1,
                category: "smuzi",
                calories: 280,
                protein: 12,
                carbs: 35,
                fat: 9,
                image_url: "https://images.unsplash.com/photo-1488477181946-6428a0291777?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
                is_featured: true
            }
        ];
        localStorage.setItem('healthy_food_recipes', JSON.stringify(sampleRecipes));
    }

    // User Methods
    registerUser(username, email, password) {
        const users = JSON.parse(localStorage.getItem('healthy_food_users')) || [];
        
        // Check if user exists
        if (users.find(u => u.username === username)) {
            throw new Error('Bu foydalanuvchi nomi band');
        }
        if (users.find(u => u.email === email)) {
            throw new Error('Bu email band');
        }

        const newUser = {
            id: Date.now(),
            username,
            email,
            password: btoa(password), // Simple encryption (in real app use bcrypt)
            weight: 70,
            height: 170,
            age: 30,
            gender: 'male',
            activity_level: 'moderate',
            daily_calories: 2000,
            created_at: new Date().toISOString(),
            is_admin: username === 'admin' // For demo purposes
        };

        users.push(newUser);
        localStorage.setItem('healthy_food_users', JSON.stringify(users));
        return newUser;
    }

    loginUser(username, password) {
        const users = JSON.parse(localStorage.getItem('healthy_food_users')) || [];
        const user = users.find(u => u.username === username);
        
        if (user && atob(user.password) === password) {
            return user;
        }
        return null;
    }

    getUser(id) {
        const users = JSON.parse(localStorage.getItem('healthy_food_users')) || [];
        return users.find(u => u.id === id);
    }

    updateUser(id, updates) {
        const users = JSON.parse(localStorage.getItem('healthy_food_users')) || [];
        const index = users.findIndex(u => u.id === id);
        
        if (index !== -1) {
            users[index] = { ...users[index], ...updates };
            localStorage.setItem('healthy_food_users', JSON.stringify(users));
            return users[index];
        }
        return null;
    }

    // Recipe Methods
    getAllRecipes() {
        return JSON.parse(localStorage.getItem('healthy_food_recipes')) || [];
    }

    getFeaturedRecipes() {
        const recipes = this.getAllRecipes();
        return recipes.filter(recipe => recipe.is_featured);
    }

    getRecipesByCategory(category) {
        const recipes = this.getAllRecipes();
        return recipes.filter(recipe => recipe.category === category);
    }

    getRecipeById(id) {
        const recipes = this.getAllRecipes();
        return recipes.find(recipe => recipe.id === id);
    }

    saveRecipe(userId, recipeId) {
        const savedRecipes = JSON.parse(localStorage.getItem('healthy_food_saved_recipes')) || [];
        
        // Check if already saved
        if (!savedRecipes.find(sr => sr.user_id === userId && sr.recipe_id === recipeId)) {
            savedRecipes.push({
                id: Date.now(),
                user_id: userId,
                recipe_id: recipeId,
                saved_at: new Date().toISOString()
            });
            localStorage.setItem('healthy_food_saved_recipes', JSON.stringify(savedRecipes));
        }
    }

    unsaveRecipe(userId, recipeId) {
        let savedRecipes = JSON.parse(localStorage.getItem('healthy_food_saved_recipes')) || [];
        savedRecipes = savedRecipes.filter(sr => !(sr.user_id === userId && sr.recipe_id === recipeId));
        localStorage.setItem('healthy_food_saved_recipes', JSON.stringify(savedRecipes));
    }

    getSavedRecipes(userId) {
        const savedRecipes = JSON.parse(localStorage.getItem('healthy_food_saved_recipes')) || [];
        const allRecipes = this.getAllRecipes();
        
        return savedRecipes
            .filter(sr => sr.user_id === userId)
            .map(sr => ({
                ...allRecipes.find(r => r.id === sr.recipe_id),
                saved_at: sr.saved_at
            }));
    }

    // Food Consumption Methods
    addConsumedFood(userId, foodName, calories, quantity = 1, recognizedFood = null) {
        const consumedFoods = JSON.parse(localStorage.getItem('healthy_food_consumed_foods')) || [];
        
        consumedFoods.push({
            id: Date.now(),
            user_id: userId,
            food_name: foodName,
            calories: calories * quantity,
            quantity,
            recognized_food: recognizedFood,
            consumed_at: new Date().toISOString()
        });
        
        localStorage.setItem('healthy_food_consumed_foods', JSON.stringify(consumedFoods));
    }

    getTodayConsumedCalories(userId) {
        const consumedFoods = JSON.parse(localStorage.getItem('healthy_food_consumed_foods')) || [];
        const today = new Date().toISOString().split('T')[0];
        
        return consumedFoods
            .filter(cf => cf.user_id === userId && cf.consumed_at.startsWith(today))
            .reduce((total, cf) => total + cf.calories, 0);
    }

    // Admin Methods
    getAllUsers() {
        return JSON.parse(localStorage.getItem('healthy_food_users')) || [];
    }

    deleteUser(userId) {
        let users = JSON.parse(localStorage.getItem('healthy_food_users')) || [];
        users = users.filter(u => u.id !== userId);
        localStorage.setItem('healthy_food_users', JSON.stringify(users));
    }

    addRecipe(recipe) {
        const recipes = this.getAllRecipes();
        const newRecipe = {
            id: Date.now(),
            ...recipe,
            created_at: new Date().toISOString()
        };
        recipes.push(newRecipe);
        localStorage.setItem('healthy_food_recipes', JSON.stringify(recipes));
        return newRecipe;
    }

    deleteRecipe(recipeId) {
        let recipes = this.getAllRecipes();
        recipes = recipes.filter(r => r.id !== recipeId);
        localStorage.setItem('healthy_food_recipes', JSON.stringify(recipes));
    }
}

// Initialize database
const db = new Database();