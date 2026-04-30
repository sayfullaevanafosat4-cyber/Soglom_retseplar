// Authentication Management
class AuthManager {
    constructor() {
        this.currentUser = null;
        this.loadUser();
    }

    loadUser() {
        try {
            const userData = localStorage.getItem('current_user');
            if (userData) {
                this.currentUser = JSON.parse(userData);
            }
        } catch (error) {
            console.error('Error loading user:', error);
            this.currentUser = null;
        }
    }

    saveUser(user) {
        try {
            this.currentUser = user;
            localStorage.setItem('current_user', JSON.stringify(user));
            return true;
        } catch (error) {
            console.error('Error saving user:', error);
            return false;
        }
    }

    logout() {
        try {
            this.currentUser = null;
            localStorage.removeItem('current_user');
            return true;
        } catch (error) {
            console.error('Error logging out:', error);
            return false;
        }
    }

    isLoggedIn() {
        return this.currentUser !== null;
    }

    isAdmin() {
        return this.isLoggedIn() && this.currentUser.is_admin === true;
    }

    getUserId() {
        return this.isLoggedIn() ? this.currentUser.id : null;
    }

    getUsername() {
        return this.isLoggedIn() ? this.currentUser.username : 'Mehmon';
    }

    getUserData() {
        return this.isLoggedIn() ? { ...this.currentUser } : null;
    }
}

const auth = new AuthManager();

// Update authentication links in navbar
function updateAuthLinks() {
    const authLinks = document.getElementById('auth-links');
    if (!authLinks) return;

    if (auth.isLoggedIn()) {
        authLinks.innerHTML = `
            <li class="nav-item dropdown">
                <a class="nav-link dropdown-toggle" href="#" id="userDropdown" role="button" 
                   data-bs-toggle="dropdown" aria-expanded="false">
                    <i class="fas fa-user-circle"></i> ${auth.currentUser.username}
                </a>
                <ul class="dropdown-menu" aria-labelledby="userDropdown">
                    <li><a class="dropdown-item" href="profile.html">
                        <i class="fas fa-user"></i> Profil
                    </a></li>
                    <li><a class="dropdown-item" href="saved.html">
                        <i class="fas fa-bookmark"></i> Saqlanganlar
                    </a></li>
                   
                    <li><a class="dropdown-item" href="admin.html">
                        <i class="fas fa-cogs"></i> Admin Panel
                    </a></li>
                    
                    <li><hr class="dropdown-divider"></li>
                    <li><a class="dropdown-item text-danger" href="#" id="logout-btn">
                        <i class="fas fa-sign-out-alt"></i> Chiqish
                    </a></li>
                </ul>
            </li>
        `;

        // Add logout event listener
        document.getElementById('logout-btn')?.addEventListener('click', (e) => {
            e.preventDefault();
            auth.logout();
        });
    } else {
        authLinks.innerHTML = `
            <li class="nav-item">
                <a class="nav-link" href="login.html">
                    <i class="fas fa-sign-in-alt"></i> Kirish
                </a>
            </li>
            <li class="nav-item">
                <a class="nav-link" href="register.html">
                    <i class="fas fa-user-plus"></i> Ro'yxatdan o'tish
                </a>
            </li>
        `;
    }
}

// Recipe Loading
function loadFeaturedRecipes() {
    const container = document.getElementById('featured-recipes');
    if (!container) return;

    const featuredRecipes = db.getFeaturedRecipes();
    
    container.innerHTML = featuredRecipes.map(recipe => `
        <div class="col-md-4">
            <div class="recipe-card">
                <div class="position-relative">
                    <img src="${recipe.image_url}" alt="${recipe.title}" class="recipe-img">
                    <span class="recipe-badge">${recipe.category}</span>
                    <span class="recipe-badge calorie-badge" style="top: 45px;">
                        ${recipe.calories} kcal
                    </span>
                </div>
                <div class="card-body">
                    <h5 class="card-title">${recipe.title}</h5>
                    <p class="card-text text-muted">${recipe.description}</p>
                    <div class="d-flex justify-content-between align-items-center">
                        <div>
                            <small class="text-muted">
                                <i class="fas fa-clock"></i> ${recipe.prep_time + recipe.cook_time} min
                            </small>
                        </div>
                        <button class="btn btn-sm btn-outline-success view-recipe-btn" 
                                data-id="${recipe.id}">
                            <i class="fas fa-eye"></i> Ko'rish
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `).join('');

    // Add event listeners to view buttons
    document.querySelectorAll('.view-recipe-btn').forEach(button => {
        button.addEventListener('click', function() {
            const recipeId = parseInt(this.getAttribute('data-id'));
            viewRecipe(recipeId);
        });
    });
}

function viewRecipe(recipeId) {
    const recipe = db.getRecipeById(recipeId);
    if (!recipe) return;

    // Create modal for recipe details
    const modalHtml = `
        <div class="modal fade" id="recipeModal" tabindex="-1">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">${recipe.title}</h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <div class="row">
                            <div class="col-md-6">
                                <img src="${recipe.image_url}" alt="${recipe.title}" class="img-fluid rounded">
                            </div>
                            <div class="col-md-6">
                                <div class="d-flex justify-content-between mb-3">
                                    <span class="badge bg-success">${recipe.category}</span>
                                    <span class="badge bg-warning">${recipe.calories} kcal</span>
                                </div>
                                
                                <h6>Retsept tafsilotlari:</h6>
                                <ul class="list-unstyled">
                                    <li><i class="fas fa-clock"></i> Tayyorlash: ${recipe.prep_time} min</li>
                                    <li><i class="fas fa-fire"></i> Pishirish: ${recipe.cook_time} min</li>
                                    <li><i class="fas fa-users"></i> Portsiya: ${recipe.servings} kishi</li>
                                </ul>
                                
                                <h6>Mahsulotlar:</h6>
                                <p>${recipe.ingredients}</p>
                                
                                <h6>Tayyorlash usuli:</h6>
                                <p>${recipe.instructions}</p>
                                
                                <div class="nutrition-info">
                                    <h6>Qazilma:</h6>
                                    <div class="row text-center">
                                        <div class="col-3">
                                            <div class="bg-light p-2 rounded">
                                                <small>Protein</small>
                                                <div class="fw-bold">${recipe.protein || 0}g</div>
                                            </div>
                                        </div>
                                        <div class="col-3">
                                            <div class="bg-light p-2 rounded">
                                                <small>Uglevod</small>
                                                <div class="fw-bold">${recipe.carbs || 0}g</div>
                                            </div>
                                        </div>
                                        <div class="col-3">
                                            <div class="bg-light p-2 rounded">
                                                <small>Yog'</small>
                                                <div class="fw-bold">${recipe.fat || 0}g</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        ${auth.isLoggedIn() ? `
                        <button class="btn btn-success save-recipe-btn" data-id="${recipe.id}">
                            <i class="fas fa-bookmark"></i> Saqlash
                        </button>
                        ` : ''}
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Yopish</button>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Add modal to body and show it
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    const modal = new bootstrap.Modal(document.getElementById('recipeModal'));
    modal.show();

    // Add event listener for save button
    document.querySelector('.save-recipe-btn')?.addEventListener('click', function() {
        const recipeId = parseInt(this.getAttribute('data-id'));
        db.saveRecipe(auth.currentUser.id, recipeId);
        showToast('Retsept saqlandi!', 'success');
        this.innerHTML = '<i class="fas fa-check"></i> Saqlandi';
        this.disabled = true;
    });

    // Remove modal from DOM when hidden
    document.getElementById('recipeModal').addEventListener('hidden.bs.modal', function() {
        this.remove();
    });
}

// Toast notifications
function showToast(message, type = 'info') {
    const toastId = 'toast-' + Date.now();
    const toastHtml = `
        <div id="${toastId}" class="toast align-items-center ${type === 'error' ? 'error' : ''}" 
             role="alert" aria-live="assertive" aria-atomic="true">
            <div class="d-flex">
                <div class="toast-body">
                    <i class="fas fa-${type === 'error' ? 'exclamation-circle' : 'check-circle'} me-2"></i>
                    ${message}
                </div>
                <button type="button" class="btn-close me-2 m-auto" data-bs-dismiss="toast"></button>
            </div>
        </div>
    `;

    // Create toast container if it doesn't exist
    let container = document.querySelector('.toast-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'toast-container';
        document.body.appendChild(container);
    }

    container.insertAdjacentHTML('beforeend', toastHtml);
    const toastElement = document.getElementById(toastId);
    const toast = new bootstrap.Toast(toastElement, { delay: 3000 });
    toast.show();

    // Remove toast after it's hidden
    toastElement.addEventListener('hidden.bs.toast', function() {
        this.remove();
    });
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    updateAuthLinks();
    
    // Check if user needs to login for certain pages
    if (window.location.pathname.includes('profile.html') && !auth.isLoggedIn()) {
        window.location.href = 'login.html';
    }
    if (window.location.pathname.includes('admin.html') && (!auth.isLoggedIn() || !auth.isAdmin())) {
        window.location.href = 'login.html';
    }
});