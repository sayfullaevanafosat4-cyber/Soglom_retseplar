// Image Recognition and Analysis Module
class ImageRecognition {
    constructor() {
        this.foodDatabase = {
            'salad': { calories: 150, protein: 5, carbs: 10, fat: 10, name: 'Sabzavot salati' },
            'pizza': { calories: 285, protein: 12, carbs: 36, fat: 10, name: 'Pizza' },
            'burger': { calories: 354, protein: 17, carbs: 29, fat: 18, name: 'Burger' },
            'apple': { calories: 52, protein: 0, carbs: 14, fat: 0, name: 'Olma' },
            'banana': { calories: 89, protein: 1, carbs: 23, fat: 0, name: 'Banan' },
            'chicken': { calories: 239, protein: 27, carbs: 0, fat: 14, name: 'Tovuq go\'shti' },
            'rice': { calories: 130, protein: 3, carbs: 28, fat: 0, name: 'Guruch' },
            'bread': { calories: 265, protein: 9, carbs: 49, fat: 3, name: 'Non' },
            'egg': { calories: 155, protein: 13, carbs: 1, fat: 11, name: 'Tuxum' },
            'milk': { calories: 42, protein: 3, carbs: 5, fat: 2, name: 'Sut' },
            'yogurt': { calories: 59, protein: 10, carbs: 4, fat: 0, name: 'Yogurt' },
            'pasta': { calories: 131, protein: 5, carbs: 25, fat: 1, name: 'Makaron' },
            'fish': { calories: 206, protein: 22, carbs: 0, fat: 13, name: 'Baliq' },
            'steak': { calories: 271, protein: 25, carbs: 0, fat: 19, name: 'Mol go\'shti' },
            'potato': { calories: 77, protein: 2, carbs: 17, fat: 0, name: 'Kartoshka' },
            'carrot': { calories: 41, protein: 1, carbs: 10, fat: 0, name: 'Sabzi' },
            'broccoli': { calories: 34, protein: 3, carbs: 7, fat: 0, name: 'Brokoli' },
            'orange': { calories: 47, protein: 1, carbs: 12, fat: 0, name: 'Apelsin' },
            'cheese': { calories: 402, protein: 25, carbs: 1, fat: 33, name: 'Pishloq' },
            'butter': { calories: 717, protein: 1, carbs: 0, fat: 81, name: 'Saryog\'' }
        };
        
        this.uploadedImage = null;
        this.recognitionResult = null;
    }

    // Initialize image upload
    initImageUpload() {
        const uploadArea = document.getElementById('image-upload-area');
        const fileInput = document.getElementById('food-image');
        const selectBtn = document.getElementById('select-image-btn');
        const analyzeBtn = document.getElementById('analyze-btn');
        const imagePreview = document.getElementById('image-preview');

        if (!uploadArea || !fileInput) return;

        // Click on area triggers file input
        uploadArea.addEventListener('click', () => {
            fileInput.click();
        });

        // Select button triggers file input
        if (selectBtn) {
            selectBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                fileInput.click();
            });
        }

        // Handle file selection
        fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file && this.validateImage(file)) {
                this.processImage(file);
            }
        });

        // Drag and drop support
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.style.borderColor = '#28a745';
            uploadArea.style.backgroundColor = '#e8f5e9';
        });

        uploadArea.addEventListener('dragleave', () => {
            uploadArea.style.borderColor = '#ddd';
            uploadArea.style.backgroundColor = '#f8f9fa';
        });

        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.style.borderColor = '#ddd';
            uploadArea.style.backgroundColor = '#f8f9fa';
            
            const file = e.dataTransfer.files[0];
            if (file && this.validateImage(file)) {
                fileInput.files = e.dataTransfer.files;
                this.processImage(file);
            }
        });

        // Analyze button
        if (analyzeBtn) {
            analyzeBtn.addEventListener('click', () => {
                if (this.uploadedImage) {
                    this.analyzeImage();
                }
            });
        }
    }

    validateImage(file) {
        const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        const maxSize = 5 * 1024 * 1024; // 5MB

        if (!validTypes.includes(file.type)) {
            showToast('Faqat JPEG, PNG, GIF yoki WebP formatidagi rasmlar qabul qilinadi', 'error');
            return false;
        }

        if (file.size > maxSize) {
            showToast('Rasm hajmi 5MB dan oshmasligi kerak', 'error');
            return false;
        }

        return true;
    }

    processImage(file) {
        const reader = new FileReader();
        
        reader.onload = (e) => {
            this.uploadedImage = e.target.result;
            this.displayImagePreview(e.target.result);
            
            // Enable analyze button
            const analyzeBtn = document.getElementById('analyze-btn');
            if (analyzeBtn) {
                analyzeBtn.disabled = false;
            }
            
            showToast('Rasm muvaffaqiyatli yuklandi', 'success');
        };
        
        reader.readAsDataURL(file);
    }

    displayImagePreview(imageData) {
        const previewContainer = document.getElementById('image-preview');
        if (!previewContainer) return;

        previewContainer.innerHTML = `
            <div class="card">
                <img src="${imageData}" class="card-img-top" alt="Yuklangan rasm" style="max-height: 300px; object-fit: cover;">
                <div class="card-body">
                    <h5 class="card-title">Yuklangan rasm</h5>
                    <p class="card-text text-muted">"Tahlil qilish" tugmasini bosing</p>
                </div>
            </div>
        `;
    }

    // Simulate AI analysis
    analyzeImage() {
        const analyzeBtn = document.getElementById('analyze-btn');
        const resultsContainer = document.getElementById('analysis-results');
        
        if (!analyzeBtn || !resultsContainer) return;

        // Show loading state
        analyzeBtn.disabled = true;
        analyzeBtn.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Tahlil qilinmoqda...';

        // Simulate AI processing time
        setTimeout(() => {
            this.simulateRecognition();
            this.displayResults();
            
            // Reset button
            analyzeBtn.disabled = false;
            analyzeBtn.innerHTML = '<i class="fas fa-search"></i> Tahlil qilish';
        }, 2000);
    }

    simulateRecognition() {
        // Simulate AI recognition by randomly selecting a food
        const foodKeys = Object.keys(this.foodDatabase);
        const randomFoodKey = foodKeys[Math.floor(Math.random() * foodKeys.length)];
        const foodInfo = this.foodDatabase[randomFoodKey];
        
        // Add some randomness to make it more realistic
        const confidence = Math.random() * 30 + 70; // 70-100%
        const calories = foodInfo.calories * (0.9 + Math.random() * 0.2); // ±10%
        
        this.recognitionResult = {
            food: foodInfo.name,
            originalFood: randomFoodKey,
            calories: Math.round(calories),
            protein: foodInfo.protein,
            carbs: foodInfo.carbs,
            fat: foodInfo.fat,
            confidence: Math.round(confidence),
            quantity: 100, // Default 100g
            image: this.uploadedImage
        };
    }

    displayResults() {
        const resultsContainer = document.getElementById('analysis-results');
        if (!resultsContainer || !this.recognitionResult) return;

        const result = this.recognitionResult;
        const totalCalories = Math.round((result.calories * result.quantity) / 100);

        resultsContainer.innerHTML = `
            <div class="card">
                <div class="card-header bg-success text-white">
                    <h5 class="mb-0"><i class="fas fa-check-circle"></i> Tahlil natijalari</h5>
                </div>
                <div class="card-body">
                    <div class="alert alert-success">
                        <div class="d-flex justify-content-between align-items-center">
                            <div>
                                <h6 class="mb-1">Aniqlangan ovqat:</h6>
                                <h4 class="text-success">${result.food}</h4>
                            </div>
                            <div class="text-end">
                                <small class="text-muted">Aniqlik darajasi</small>
                                <div class="h4 mb-0">${result.confidence}%</div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="row mb-4">
                        <div class="col-md-6">
                            <div class="form-group">
                                <label for="recognition-quantity" class="form-label">
                                    <i class="fas fa-weight"></i> Miqdor (gramm)
                                </label>
                                <input type="number" class="form-control" id="recognition-quantity" 
                                       value="${result.quantity}" min="1" max="10000">
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="form-group">
                                <label class="form-label">Jami kaloriya</label>
                                <div class="input-group">
                                    <input type="text" class="form-control" id="recognition-total-calories" 
                                           value="${totalCalories}" readonly>
                                    <span class="input-group-text">kcal</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <h6>Qazilma tarkibi (100g uchun):</h6>
                    <div class="row text-center mb-4">
                        <div class="col-3">
                            <div class="p-2 border rounded">
                                <div class="text-success fw-bold">${result.calories}</div>
                                <small>Kaloriya</small>
                            </div>
                        </div>
                        <div class="col-3">
                            <div class="p-2 border rounded">
                                <div class="text-primary fw-bold">${result.protein}g</div>
                                <small>Protein</small>
                            </div>
                        </div>
                        <div class="col-3">
                            <div class="p-2 border rounded">
                                <div class="text-warning fw-bold">${result.carbs}g</div>
                                <small>Uglevod</small>
                            </div>
                        </div>
                        <div class="col-3">
                            <div class="p-2 border rounded">
                                <div class="text-danger fw-bold">${result.fat}g</div>
                                <small>Yog'</small>
                            </div>
                        </div>
                    </div>
                    
                    <div class="d-grid gap-2">
                        <button class="btn btn-success" id="save-recognition-btn">
                            <i class="fas fa-plus"></i> Ovqatni kunlik hisobga qo'shish
                        </button>
                        <button class="btn btn-outline-success" id="new-analysis-btn">
                            <i class="fas fa-redo"></i> Yangi tahlil
                        </button>
                    </div>
                </div>
            </div>
        `;

        // Update total calories when quantity changes
        document.getElementById('recognition-quantity').addEventListener('input', (e) => {
            const quantity = parseInt(e.target.value) || 100;
            const totalCalories = Math.round((result.calories * quantity) / 100);
            document.getElementById('recognition-total-calories').value = totalCalories;
        });

        // Save button event
        document.getElementById('save-recognition-btn').addEventListener('click', () => {
            this.saveRecognitionResult();
        });

        // New analysis button
        document.getElementById('new-analysis-btn').addEventListener('click', () => {
            this.resetAnalysis();
        });
    }

    saveRecognitionResult() {
        if (!this.recognitionResult) return;

        const quantity = parseInt(document.getElementById('recognition-quantity').value) || 100;
        const calories = (this.recognitionResult.calories * quantity) / 100;

        // Add to consumed foods
        if (auth.isLoggedIn()) {
            db.addConsumedFood(
                auth.currentUser.id,
                this.recognitionResult.food,
                this.recognitionResult.calories,
                quantity / 100,
                this.recognitionResult.originalFood
            );

            showToast(`"${this.recognitionResult.food}" kunlik hisobga qo'shildi!`, 'success');
            
            // Switch to log tab and update
            setTimeout(() => {
                const logTab = document.querySelector('#log-tab');
                if (logTab) {
                    logTab.click();
                    // Trigger custom event to refresh log
                    document.dispatchEvent(new Event('foodLogUpdated'));
                }
            }, 1000);
        } else {
            showToast('Iltimos, avval tizimga kiring', 'error');
        }
    }

    resetAnalysis() {
        const previewContainer = document.getElementById('image-preview');
        const resultsContainer = document.getElementById('analysis-results');
        const fileInput = document.getElementById('food-image');
        const analyzeBtn = document.getElementById('analyze-btn');

        if (previewContainer) previewContainer.innerHTML = '';
        if (resultsContainer) {
            resultsContainer.innerHTML = `
                <div class="ai-processing">
                    <i class="fas fa-robot"></i>
                    <h4>AI tahlil tizimi</h4>
                    <p class="text-muted">Rasm yuklang, ovqat turini aniqlab, kaloriyasini hisoblaymiz</p>
                </div>
            `;
        }
        if (fileInput) fileInput.value = '';
        if (analyzeBtn) analyzeBtn.disabled = true;

        this.uploadedImage = null;
        this.recognitionResult = null;
    }

    // Batch recognition for multiple foods in one image
    detectMultipleFoods() {
        // This would be implemented with a real AI API
        // For demo, we'll simulate detecting 1-3 foods
        const foodKeys = Object.keys(this.foodDatabase);
        const numFoods = Math.floor(Math.random() * 3) + 1;
        const detectedFoods = [];

        for (let i = 0; i < numFoods; i++) {
            const randomFoodKey = foodKeys[Math.floor(Math.random() * foodKeys.length)];
            const foodInfo = this.foodDatabase[randomFoodKey];
            
            detectedFoods.push({
                food: foodInfo.name,
                calories: foodInfo.calories,
                confidence: Math.round(Math.random() * 20 + 80)
            });
        }

        return detectedFoods;
    }
}

// Initialize image recognition
const imageRecognition = new ImageRecognition();

document.addEventListener('DOMContentLoaded', function() {
    imageRecognition.initImageUpload();
});