// Admin Manager - Yangilangan versiya
class AdminManager {
    constructor() {
        this.currentSection = 'dashboard';
        this.init();
    }

    init() {
        // First check authentication
        if (!auth.isLoggedIn() || !auth.isAdmin()) {
            this.showAccessDenied();
            return;
        }
        
        this.loadDashboard();
        this.setupEventListeners();
        this.setupNavigation();
    }

    showAccessDenied() {
        const adminMain = document.querySelector('.admin-main');
        if (adminMain) {
            adminMain.innerHTML = `
                <div class="text-center py-5">
                    <div class="empty-state">
                        <i class="fas fa-lock fa-3x text-danger mb-3"></i>
                        <h3 class="mb-3">Kirish rad etildi</h3>
                        <p class="text-muted mb-4">Sizda admin panelga kirish huquqi yo'q.</p>
                        <div class="d-flex justify-content-center gap-3">
                            <a href="login.html" class="btn btn-success">
                                <i class="fas fa-sign-in-alt"></i> Boshqa hisob bilan kirish
                            </a>
                            <a href="index.html" class="btn btn-outline-success">
                                <i class="fas fa-home"></i> Bosh sahifaga qaytish
                            </a>
                        </div>
                    </div>
                </div>
            `;
        } else {
            // If admin-main doesn't exist, redirect to login
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 1000);
        }
    }

    setupNavigation() {
        // Navigation links
        document.querySelectorAll('.nav-link[data-section]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const section = link.getAttribute('data-section');
                
                // Update active link
                document.querySelectorAll('.nav-link').forEach(l => {
                    l.classList.remove('active');
                });
                link.classList.add('active');
                
                // Show section
                this.showSection(section);
            });
        });

        // Logout
        document.getElementById('admin-logout')?.addEventListener('click', (e) => {
            e.preventDefault();
            if (confirm('Admin paneldan chiqishni tasdiqlaysizmi?')) {
                auth.logout();
                window.location.href = 'index.html';
            }
        });
    }

    showSection(section) {
        // Hide all sections
        document.querySelectorAll('.admin-section').forEach(sec => {
            sec.classList.add('d-none');
        });

        // Show selected section
        const sectionElement = document.getElementById(`${section}-section`);
        if (sectionElement) {
            sectionElement.classList.remove('d-none');
            this.currentSection = section;

            // Load section data
            switch(section) {
                case 'dashboard':
                    this.loadDashboard();
                    break;
                case 'users':
                    this.loadUsers();
                    break;
                case 'recipes':
                    this.loadRecipes();
                    break;
                case 'add-recipe':
                    this.setupAddRecipeForm();
                    break;
            }
        }
    }

    loadDashboard() {
        const users = db.getAllUsers();
        const recipes = db.getAllRecipes();
        const savedRecipes = JSON.parse(localStorage.getItem('healthy_food_saved_recipes')) || [];
        const consumedFoods = JSON.parse(localStorage.getItem('healthy_food_consumed_foods')) || [];

        // Update stats
        document.getElementById('total-users')?.textContent = users.length;
        document.getElementById('total-recipes')?.textContent = recipes.length;
        document.getElementById('total-saved')?.textContent = savedRecipes.length;
        document.getElementById('total-calculations')?.textContent = consumedFoods.length;

        // Recent users
        const recentUsers = users
            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
            .slice(0, 5);

        const recentUsersContainer = document.getElementById('recent-users');
        if (recentUsersContainer) {
            recentUsersContainer.innerHTML = recentUsers.map(user => `
                <tr>
                    <td>
                        <strong>${user.username}</strong>
                        ${user.is_admin ? '<span class="badge bg-success ms-1">Admin</span>' : ''}
                    </td>
                    <td>${new Date(user.created_at).toLocaleDateString('uz-UZ')}</td>
                </tr>
            `).join('');
        }

        // Popular recipes (based on saves)
        const recipeSaves = {};
        savedRecipes.forEach(save => {
            recipeSaves[save.recipe_id] = (recipeSaves[save.recipe_id] || 0) + 1;
        });

        const popularRecipes = recipes
            .map(recipe => ({
                ...recipe,
                saves: recipeSaves[recipe.id] || 0
            }))
            .sort((a, b) => b.saves - a.saves)
            .slice(0, 5);

        const popularRecipesContainer = document.getElementById('popular-recipes');
        if (popularRecipesContainer) {
            popularRecipesContainer.innerHTML = popularRecipes.map(recipe => `
                <tr>
                    <td>${recipe.title}</td>
                    <td>${this.getCategoryName(recipe.category)}</td>
                    <td>${recipe.calories} kcal</td>
                </tr>
            `).join('');
        }
    }

    loadUsers() {
        const users = db.getAllUsers();
        const usersTable = document.getElementById('users-table');
        
        if (usersTable) {
            usersTable.innerHTML = users.map(user => `
                <tr>
                    <td>${user.id}</td>
                    <td>
                        <strong>${user.username}</strong>
                        ${user.is_admin ? '<span class="badge bg-success ms-1">Admin</span>' : ''}
                    </td>
                    <td>${user.email}</td>
                    <td>${new Date(user.created_at).toLocaleDateString('uz-UZ')}</td>
                    <td>
                        ${user.is_admin ? 
                            '<span class="badge bg-success">Ha</span>' : 
                            '<span class="badge bg-secondary">Yo\'q</span>'}
                    </td>
                    <td>
                        <div class="btn-group btn-group-sm">
                            <button class="btn btn-outline-primary edit-user-btn" data-id="${user.id}">
                                <i class="fas fa-edit"></i>
                            </button>
                            ${user.id !== auth.currentUser.id ? `
                            <button class="btn btn-outline-danger delete-user-btn" data-id="${user.id}">
                                <i class="fas fa-trash"></i>
                            </button>
                            ` : ''}
                        </div>
                    </td>
                </tr>
            `).join('');

            // Add event listeners
            document.querySelectorAll('.delete-user-btn').forEach(button => {
                button.addEventListener('click', () => {
                    const userId = parseInt(button.getAttribute('data-id'));
                    this.confirmDeleteUser(userId);
                });
            });
        }

        // Add user form
        document.getElementById('save-user-btn')?.addEventListener('click', () => {
            this.addNewUser();
        });
    }

    confirmDeleteUser(userId) {
        if (confirm('Foydalanuvchini o\'chirishni tasdiqlaysizmi? Bu amalni bekor qilib bo\'lmaydi.')) {
            try {
                db.deleteUser(userId);
                showToast('Foydalanuvchi muvaffaqiyatli o\'chirildi', 'success');
                this.loadUsers();
            } catch (error) {
                showToast('Xatolik: ' + error.message, 'error');
            }
        }
    }

    addNewUser() {
        const username = document.getElementById('new-username').value;
        const email = document.getElementById('new-email').value;
        const password = document.getElementById('new-password').value;
        const isAdmin = document.getElementById('new-admin').checked;

        if (!username || !email || !password) {
            showToast('Iltimos, barcha maydonlarni to\'ldiring', 'error');
            return;
        }

        try {
            const user = db.registerUser(username, email, password);
            
            if (isAdmin) {
                db.updateUser(user.id, { is_admin: true });
            }

            // Close modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('addUserModal'));
            if (modal) modal.hide();
            
            // Reset form
            document.getElementById('add-user-form').reset();
            
            // Reload users
            this.loadUsers();
            showToast('Foydalanuvchi muvaffaqiyatli qo\'shildi', 'success');
            
        } catch (error) {
            showToast('Xatolik: ' + error.message, 'error');
        }
    }

    loadRecipes() {
        const recipes = db.getAllRecipes();
        const categoryFilter = document.getElementById('recipe-category-filter')?.value || 'all';

        let filteredRecipes = recipes;
        if (categoryFilter !== 'all') {
            filteredRecipes = recipes.filter(r => r.category === categoryFilter);
        }

        const recipesTable = document.getElementById('recipes-table');
        if (recipesTable) {
            recipesTable.innerHTML = filteredRecipes.map(recipe => `
                <tr>
                    <td>${recipe.id}</td>
                    <td>${recipe.title}</td>
                    <td>${this.getCategoryName(recipe.category)}</td>
                    <td>${recipe.calories} kcal</td>
                    <td>${recipe.prep_time + recipe.cook_time} min</td>
                    <td>
                        <div class="btn-group btn-group-sm">
                            <button class="btn btn-outline-primary view-recipe-btn" data-id="${recipe.id}">
                                <i class="fas fa-eye"></i>
                            </button>
                            <button class="btn btn-outline-warning edit-recipe-btn" data-id="${recipe.id}">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn btn-outline-danger delete-recipe-btn" data-id="${recipe.id}">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `).join('');

            // Add event listeners
            document.querySelectorAll('.delete-recipe-btn').forEach(button => {
                button.addEventListener('click', () => {
                    const recipeId = parseInt(button.getAttribute('data-id'));
                    this.confirmDeleteRecipe(recipeId);
                });
            });

            document.querySelectorAll('.edit-recipe-btn').forEach(button => {
                button.addEventListener('click', () => {
                    const recipeId = parseInt(button.getAttribute('data-id'));
                    this.editRecipe(recipeId);
                });
            });
        }

        // Category filter
        document.getElementById('recipe-category-filter')?.addEventListener('change', () => {
            this.loadRecipes();
        });
    }

    confirmDeleteRecipe(recipeId) {
        if (confirm('Retseptni o\'chirishni tasdiqlaysizmi? Bu amalni bekor qilib bo\'lmaydi.')) {
            try {
                db.deleteRecipe(recipeId);
                showToast('Retsept muvaffaqiyatli o\'chirildi', 'success');
                this.loadRecipes();
            } catch (error) {
                showToast('Xatolik: ' + error.message, 'error');
            }
        }
    }

    editRecipe(recipeId) {
        const recipe = db.getRecipeById(recipeId);
        if (!recipe) return;

        // Create edit modal
        const modalHtml = `
            <div class="modal fade" id="editRecipeModal" tabindex="-1">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">Retseptni tahrirlash</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <form id="edit-recipe-form-${recipeId}">
                                <div class="row">
                                    <div class="col-md-8">
                                        <div class="mb-3">
                                            <label class="form-label">Retsept nomi *</label>
                                            <input type="text" class="form-control" 
                                                   id="edit-title-${recipeId}" 
                                                   value="${recipe.title}" required>
                                        </div>
                                        <div class="mb-3">
                                            <label class="form-label">Qisqacha tavsif *</label>
                                            <textarea class="form-control" 
                                                      id="edit-description-${recipeId}" 
                                                      rows="3" required>${recipe.description}</textarea>
                                        </div>
                                    </div>
                                    <div class="col-md-4">
                                        <div class="mb-3">
                                            <label class="form-label">Kategoriya *</label>
                                            <select class="form-select" id="edit-category-${recipeId}" required>
                                                <option value="taom" ${recipe.category === 'taom' ? 'selected' : ''}>Taom</option>
                                                <option value="salad" ${recipe.category === 'salad' ? 'selected' : ''}>Salat</option>
                                                <option value="ichimlik" ${recipe.category === 'ichimlik' ? 'selected' : ''}>Ichimlik</option>
                                                <option value="smuzi" ${recipe.category === 'smuzi' ? 'selected' : ''}>Smoothie</option>
                                            </select>
                                        </div>
                                        <div class="mb-3">
                                            <label class="form-label">Kaloriya (100g)*</label>
                                            <input type="number" class="form-control" 
                                                   id="edit-calories-${recipeId}" 
                                                   value="${recipe.calories}" required>
                                        </div>
                                    </div>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">Ingredientlar *</label>
                                    <textarea class="form-control" 
                                              id="edit-ingredients-${recipeId}" 
                                              rows="5" required>${recipe.ingredients}</textarea>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">Tayyorlash usuli *</label>
                                    <textarea class="form-control" 
                                              id="edit-instructions-${recipeId}" 
                                              rows="5" required>${recipe.instructions}</textarea>
                                </div>
                            </form>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Bekor qilish</button>
                            <button type="button" class="btn btn-success" 
                                    onclick="adminManager.saveRecipeEdit(${recipeId})">Saqlash</button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Add modal to body
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        
        // Show modal
        const modal = new bootstrap.Modal(document.getElementById('editRecipeModal'));
        modal.show();

        // Remove modal when hidden
        document.getElementById('editRecipeModal').addEventListener('hidden.bs.modal', function() {
            this.remove();
        });
    }

    saveRecipeEdit(recipeId) {
        const updates = {
            title: document.getElementById(`edit-title-${recipeId}`).value,
            description: document.getElementById(`edit-description-${recipeId}`).value,
            ingredients: document.getElementById(`edit-ingredients-${recipeId}`).value,
            instructions: document.getElementById(`edit-instructions-${recipeId}`).value,
            category: document.getElementById(`edit-category-${recipeId}`).value,
            calories: parseFloat(document.getElementById(`edit-calories-${recipeId}`).value)
        };

        try {
            db.updateRecipe(recipeId, updates);
            
            // Close modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('editRecipeModal'));
            if (modal) modal.hide();
            
            // Reload recipes
            this.loadRecipes();
            showToast('Retsept muvaffaqiyatli yangilandi', 'success');
            
        } catch (error) {
            showToast('Xatolik: ' + error.message, 'error');
        }
    }

    setupAddRecipeForm() {
        const form = document.getElementById('add-recipe-form');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.addNewRecipe();
            });
        }
    }

    addNewRecipe() {
        const title = document.getElementById('recipe-title').value;
        const description = document.getElementById('recipe-description').value;
        const ingredients = document.getElementById('recipe-ingredients').value;
        const instructions = document.getElementById('recipe-instructions').value;
        const category = document.getElementById('recipe-category').value;
        const calories = parseFloat(document.getElementById('recipe-calories').value);
        const prep_time = parseInt(document.getElementById('recipe-prep-time').value) || 0;
        const cook_time = parseInt(document.getElementById('recipe-cook-time').value) || 0;
        const servings = parseInt(document.getElementById('recipe-servings').value) || 1;
        const image_url = document.getElementById('recipe-image').value;
        const is_featured = document.getElementById('recipe-featured').checked;

        if (!title || !description || !ingredients || !instructions || !category || !calories) {
            showToast('Iltimos, barcha majburiy maydonlarni to\'ldiring (*)', 'error');
            return;
        }

        const recipe = {
            title,
            description,
            ingredients,
            instructions,
            category,
            calories,
            prep_time,
            cook_time,
            servings,
            image_url: image_url || 'https://images.unsplash.com/photo-1490818387583-1baba5e638af?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
            is_featured
        };

        try {
            db.addRecipe(recipe);
            
            // Reset form
            document.getElementById('add-recipe-form').reset();
            
            showToast('Retsept muvaffaqiyatli qo\'shildi!', 'success');
            
            // Switch to recipes section
            setTimeout(() => {
                this.showSection('recipes');
            }, 500);
            
        } catch (error) {
            showToast('Xatolik: ' + error.message, 'error');
        }
    }

    getCategoryName(category) {
        const names = {
            'taom': 'Taom',
            'salad': 'Salat',
            'ichimlik': 'Ichimlik',
            'smuzi': 'Smoothie'
        };
        return names[category] || category;
    }

    setupEventListeners() {
        // Add recipe form
        document.getElementById('add-recipe-form')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.addNewRecipe();
        });

        // Modal forms
        document.getElementById('save-user-btn')?.addEventListener('click', () => {
            this.addNewUser();
        });
    }
}

// Initialize admin manager
let adminManager;

document.addEventListener('DOMContentLoaded', function() {
    updateAuthLinks();
    
    // Check if we're on admin page
    if (window.location.pathname.includes('admin.html')) {
        adminManager = new AdminManager();
        
        // Add custom styles for admin panel
        const style = document.createElement('style');
        style.textContent = `
            .admin-section {
                animation: fadeIn 0.5s ease;
            }
            @keyframes fadeIn {
                from { opacity: 0; transform: translateY(20px); }
                to { opacity: 1; transform: translateY(0); }
            }
            .table-hover tbody tr:hover {
                background-color: rgba(40, 167, 69, 0.1);
            }
        `;
        document.head.appendChild(style);
    }
});