document.addEventListener('DOMContentLoaded', function() {
    // Проверяем статус авторизации при загрузке страницы
    checkAuthStatus();
    // Рендерим товары
    renderProducts();
    
    // Обработка навигации
    const navLinks = document.querySelectorAll('.nav-links a');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault(); // Отменяем стандартное действие для всех навигационных ссылок
            
            // Удаляем активный класс у всех ссылок
            navLinks.forEach(l => l.classList.remove('active'));
            
            // Добавляем активный класс к текущей ссылке
            this.classList.add('active');
            
            // Здесь можно добавить логику для загрузки контента
            const targetId = this.getAttribute('href').substring(1); // Get the target section ID (e.g., 'home', 'about', 'contact')
            
            // Определяем все основные секции контента, которыми мы будем управлять
            const homeSection = document.getElementById('home');
            const characteristicsFilterSection = document.querySelector('.characteristics-filter');
            const productsGridSection = document.getElementById('products');
            const aboutSection = document.getElementById('about');
            const contactSection = document.getElementById('contact');

            // Скрываем все секции по умолчанию
            if (homeSection) homeSection.style.display = 'none';
            if (characteristicsFilterSection) characteristicsFilterSection.style.display = 'none';
            if (productsGridSection) productsGridSection.style.display = 'none';
            if (aboutSection) aboutSection.style.display = 'none';
            if (contactSection) contactSection.style.display = 'none';

            // Показываем нужные секции в зависимости от targetId
            if (targetId === 'home') {
                if (homeSection) homeSection.style.display = 'block'; // Или 'flex'
                if (characteristicsFilterSection) characteristicsFilterSection.style.display = 'block'; // Или 'flex'
                if (productsGridSection) {
                    productsGridSection.style.display = 'grid'; // Сетка товаров использует display: grid
                    renderProducts();
                }
            } else if (targetId === 'about') {
                if (aboutSection) aboutSection.style.display = 'block'; // Или 'flex'
            } else if (targetId === 'contact') {
                if (contactSection) contactSection.style.display = 'block'; // Или 'flex'
            }
            
            console.log(`Переход к разделу: ${targetId}`);
        });
    });

    // Получаем элементы модальных окон
    const loginModal = document.getElementById('loginModal');
    const registerModal = document.getElementById('registerModal');
    const orderModal = document.getElementById('orderModal');

    // Получаем кнопки для открытия модальных окон
    const loginBtn = document.getElementById('loginBtn');
    const registerBtn = document.getElementById('registerBtn');
    const adminBtn = document.getElementById('adminBtn');
    // Кнопки заказа будут привязаны после рендера товаров

    // Получаем кнопки закрытия
    const closeBtns = document.querySelectorAll('.close');

    // Функция для открытия модального окна
    function openModal(modal) {
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden'; // Запрещаем прокрутку страницы
    }

    // Функция для закрытия модального окна
    function closeModal(modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto'; // Разрешаем прокрутку страницы
    }

    // Обработчики событий для кнопок открытия
    loginBtn.addEventListener('click', (e) => {
        e.preventDefault();
        openModal(loginModal);
    });

    registerBtn.addEventListener('click', (e) => {
        e.preventDefault();
        openModal(registerModal);
    });

    // Кнопка админ-панели теперь просто перенаправляет
    adminBtn.addEventListener('click', (e) => {
        e.preventDefault();
        window.location.href = 'admin.html';
    });

    function bindOrderButtons() {
        const orderBtns = document.querySelectorAll('.order-btn');
        orderBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const productCard = btn.closest('.product-card');
                const productId = productCard.dataset.productId;
                const selectedSizeSelect = productCard.querySelector('.size-select');
                const selectedSize = selectedSizeSelect ? selectedSizeSelect.value : '';

                if (selectedSizeSelect && !selectedSize) {
                    alert('Пожалуйста, выберите размер');
                    return;
                }

                // Заполняем форму заказа данными о товаре
                if (selectedSizeSelect) {
                    document.getElementById('orderSize').value = selectedSize;
                }
                document.getElementById('orderForm').dataset.productId = productId;
                openModal(orderModal);
            });
        });
        // навигация стрелками на карточках
        document.querySelectorAll('.product-card .carousel-prev').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const card = btn.closest('.product-card');
                rotateCardImage(card, -1);
            });
        });
        document.querySelectorAll('.product-card .carousel-next').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const card = btn.closest('.product-card');
                rotateCardImage(card, 1);
            });
        });
        // клик по карточке открывает модалку детального просмотра
        document.querySelectorAll('.product-card').forEach(card => {
            card.addEventListener('click', (e) => {
                // избегаем срабатывания при клике на кнопку заказа
                if (e.target.closest('.order-btn') || e.target.closest('.carousel-prev') || e.target.closest('.carousel-next')) return;
                const productId = card.dataset.productId;
                openProductDetail(productId);
            });
        });
    }

    // Обработчики событий для кнопок закрытия
    closeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const modal = btn.closest('.modal');
            closeModal(modal);
        });
    });

    // Закрытие модального окна при клике вне его содержимого
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            closeModal(e.target);
        }
    });

    // Обработка формы входа
    document.getElementById('loginForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;

        try {
            // Сначала пробуем войти как обычный пользователь
            let result = window.authSystem.login(email, password);
            
            if (result.success) {
                alert(result.message);
                closeModal(loginModal);
                // Очищаем форму
                document.getElementById('loginForm').reset();
                // Обновляем интерфейс для авторизованного пользователя
                updateUIForLoggedInUser(result.user);
                // Сразу переходим на главную страницу
                window.location.href = 'index.html';
            }
        } catch (error) {
            // Если не удалось войти как пользователь, пробуем как админ
            try {
                const adminResult = window.authSystem.adminLogin(email, password);
                
                if (adminResult.success) {
                    alert(adminResult.message);
                    closeModal(loginModal);
                    // Очищаем форму
                    document.getElementById('loginForm').reset();
                    // Обновляем интерфейс для авторизованного админа
                    updateUIForLoggedInAdmin(adminResult.admin);
                    // Сразу переходим в админ-панель
                    window.location.href = 'admin.html';
                }
            } catch (adminError) {
                alert('Неверный email или пароль');
            }
        }
    });

    // Обработка формы регистрации
    document.getElementById('registerForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('registerName').value;
        const email = document.getElementById('registerEmail').value;
        const phone = document.getElementById('registerPhone').value;
        const password = document.getElementById('registerPassword').value;

        try {
            const result = window.authSystem.register({
                name: name,
                email: email,
                phone: phone,
                password: password
            });
            
            if (result.success) {
                alert(result.message);
                closeModal(registerModal);
                // Очищаем форму
                document.getElementById('registerForm').reset();
                // Сразу переходим на главную страницу
                window.location.href = 'index.html';
            }
        } catch (error) {
            alert(error.message);
        }
    });


    // Обработка формы заказа
    document.getElementById('orderForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('orderName').value;
        const phone = document.getElementById('orderPhone').value;
        const email = document.getElementById('orderEmail').value;
        const size = document.getElementById('orderSize').value;
        const productId = document.getElementById('orderForm').dataset.productId;

        try {
            const result = window.authSystem.createOrder({
                name: name,
                phone: phone,
                email: email,
                productId: productId,
                size: size
            });
            
            if (result.success) {
                alert(result.message);
                closeModal(orderModal);
                // Очищаем форму
                document.getElementById('orderForm').reset();
            }
        } catch (error) {
            alert(error.message);
        }
    });

    // Функция обновления интерфейса для авторизованного пользователя
    function updateUIForLoggedInUser(user) {
        // Скрываем кнопки входа и регистрации
        document.getElementById('loginBtn').style.display = 'none';
        document.getElementById('registerBtn').style.display = 'none';
        
        // Добавляем информацию о пользователе и кнопку выхода
        const navLinks = document.querySelector('.nav-links');
        
        // Удаляем старые элементы пользователя, если они есть
        const existingUserInfo = document.querySelector('.user-info');
        if (existingUserInfo) {
            existingUserInfo.remove();
        }
        
        const userInfo = document.createElement('li');
        userInfo.className = 'user-info';
        userInfo.innerHTML = `
            <a href="#"><i class="fas fa-user"></i> ${user.name}</a>
            <a href="#" id="logoutBtn"><i class="fas fa-sign-out-alt"></i> Выйти</a>
        `;
        navLinks.appendChild(userInfo);
        
        // Добавляем обработчик для кнопки выхода
        document.getElementById('logoutBtn').addEventListener('click', (e) => {
            e.preventDefault();
            try {
                const result = window.authSystem.logout();
                if (result.success) {
                    location.reload(); // Перезагружаем страницу после выхода
                }
            } catch (error) {
                console.error('Ошибка при выходе:', error);
            }
        });
    }

    // Функция обновления интерфейса для авторизованного админа
    function updateUIForLoggedInAdmin(admin) {
        // Скрываем кнопки входа и регистрации
        document.getElementById('loginBtn').style.display = 'none';
        document.getElementById('registerBtn').style.display = 'none';
        
        // Показываем кнопку админ-панели
        document.getElementById('adminBtn').style.display = 'block';
        
        // Добавляем информацию об админе и кнопку выхода
        const navLinks = document.querySelector('.nav-links');
        
        // Удаляем старые элементы пользователя, если они есть
        const existingUserInfo = document.querySelector('.user-info');
        if (existingUserInfo) {
            existingUserInfo.remove();
        }
        
        const userInfo = document.createElement('li');
        userInfo.className = 'user-info';
        userInfo.innerHTML = `
            <a href="#"><i class="fas fa-shield-alt"></i> ${admin.name} (Админ)</a>
            <a href="#" id="logoutBtn"><i class="fas fa-sign-out-alt"></i> Выйти</a>
        `;
        navLinks.appendChild(userInfo);
        
        // Добавляем обработчик для кнопки выхода
        document.getElementById('logoutBtn').addEventListener('click', (e) => {
            e.preventDefault();
            try {
                const result = window.authSystem.logout();
                if (result.success) {
                    location.reload(); // Перезагружаем страницу после выхода
                }
            } catch (error) {
                console.error('Ошибка при выходе:', error);
            }
        });
    }

    // Обработка фильтров
    const toggleFiltersBtn = document.getElementById('toggle-filters');
    const filtersContainer = document.getElementById('filters-container');

    toggleFiltersBtn.addEventListener('click', () => {
        if (filtersContainer.style.display === 'none') {
            filtersContainer.style.display = 'block';
        } else {
            filtersContainer.style.display = 'none';
        }
    });

    // Обработка слайдера цены
    const priceRange = document.getElementById('price-range');
    const priceValue = document.getElementById('price-value');

    priceRange.addEventListener('input', () => {
        priceValue.textContent = priceRange.value;
    });

    // Функция для проверки статуса авторизации
    function checkAuthStatus() {
        try {
            if (window.authSystem.isAuthenticated()) {
                const user = window.authSystem.getCurrentUser();
                
                // Проверяем, является ли пользователь админом
                if (window.authSystem.isAdmin()) {
                    updateUIForLoggedInAdmin(user);
                } else {
                    updateUIForLoggedInUser(user);
                }
            }
        } catch (error) {
            console.error('Ошибка при проверке статуса авторизации:', error);
        }
    }

    // Рендер товаров на главной из localStorage
    function renderProducts() {
        try {
            const productsGridSection = document.getElementById('products');
            if (!productsGridSection) return;

            const products = (window.authSystem && typeof window.authSystem.getProducts === 'function')
                ? window.authSystem.getProducts()
                : [];

            if (!products || products.length === 0) {
                productsGridSection.innerHTML = '<p>Товары скоро появятся.</p>';
                return;
            }

            productsGridSection.innerHTML = products.map(p => {
                const enabledSizes = Object.entries(p.sizes || {})
                    .filter(([, cfg]) => cfg && cfg.enabled)
                    .map(([size]) => size);

                const hasOneSize = !!p.oneSize;
                const hasSizes = !hasOneSize && enabledSizes.length > 0;
                const sizeSelectHtml = hasOneSize ? `
                    <div class="size-selector"><span>Единый размер</span></div>
                ` : (hasSizes ? `
                    <div class="size-selector">
                        <select class="size-select">
                            <option value="">Выберите размер</option>
                            ${enabledSizes.map(s => `<option value="${s}">${s}</option>`).join('')}
                        </select>
                    </div>
                ` : '');

                const images = Array.isArray(p.images) ? p.images : (p.imageDataUrl ? [p.imageDataUrl] : []);
                const imgSrc = images[0] || 'images/placeholder.jpg';
                // Белорусский рубль (BYN) или символ бел. рубля
                const priceLabel = `${Number(p.price) || 0} Br`;

                return `
                    <div class="product-card" data-product-id="${p.id}">
                        <div class="product-image" data-index="0">
                            <img src="${imgSrc}" alt="${p.name}" loading="lazy">
                            ${images.length > 1 ? `
                                <button class="carousel-prev" aria-label="Предыдущая">&#10094;</button>
                                <button class="carousel-next" aria-label="Следующая">&#10095;</button>
                            ` : ''}
                        </div>
                        <div class="product-info">
                            <h3>${p.name}</h3>
                            
                            <p style="margin:8px 0;font-weight:600;">${priceLabel}</p>
                            ${sizeSelectHtml}
                            <button class="order-btn">Заказать</button>
                        </div>
                    </div>
                `;
            }).join('');

            // Привязать кнопки и стрелки заново
            bindOrderButtons();
        } catch (error) {
            console.error('Ошибка при рендере товаров:', error);
        }
    }

    function rotateCardImage(card, step) {
        const productId = card.dataset.productId;
        const products = (window.authSystem && window.authSystem.getProducts) ? window.authSystem.getProducts() : [];
        const product = products.find(p => p.id === productId);
        const images = Array.isArray(product && product.images) ? product.images : (product && product.imageDataUrl ? [product.imageDataUrl] : []);
        if (images.length < 2) return;
        const imgWrap = card.querySelector('.product-image');
        const img = imgWrap.querySelector('img');
        let index = parseInt(imgWrap.getAttribute('data-index') || '0', 10);
        index = (index + step + images.length) % images.length;
        imgWrap.setAttribute('data-index', String(index));
        img.src = images[index];
    }

    // ===== Детальная карточка товара =====
    function openProductDetail(productId) {
        ensureProductDetailModalExists();
        const products = (window.authSystem && window.authSystem.getProducts) ? window.authSystem.getProducts() : [];
        const p = products.find(x => x.id === productId);
        if (!p) return;
        const images = Array.isArray(p.images) ? p.images : (p.imageDataUrl ? [p.imageDataUrl] : []);
        const hasOneSize = !!p.oneSize;
        const enabledSizes = Object.entries(p.sizes || {}).filter(([, cfg]) => cfg && cfg.enabled).map(([s]) => s);
        const sizeHtml = hasOneSize ? '<div>Единый размер</div>' : (enabledSizes.length ? `
            <div>
                <label>Размер:</label>
                <select id="detailSize">
                    ${enabledSizes.map(s => `<option value="${s}">${s}</option>`).join('')}
                </select>
            </div>
        ` : '');
        const priceLabel = `${Number(p.price) || 0} Br`;

        const modal = document.getElementById('productDetailModal');
        modal.querySelector('.pdm-title').textContent = p.name;
        modal.querySelector('.pdm-price').textContent = priceLabel;
        modal.querySelector('.pdm-desc').textContent = p.description || '';
        modal.querySelector('.pdm-sizes').innerHTML = sizeHtml;
        const gallery = modal.querySelector('.pdm-gallery');
        gallery.innerHTML = images.map((src, i) => `
            <div class="pdm-slide${i===0?' active':''}"><img src="${src}" alt="${p.name}"></div>
        `).join('');
        modal.dataset.productId = productId;
        modal.style.display = 'block';
    }

    function ensureProductDetailModalExists() {
        if (document.getElementById('productDetailModal')) return;
        const wrapper = document.createElement('div');
        wrapper.innerHTML = `
            <div id="productDetailModal" class="modal">
                <div class="modal-content" style="max-width:800px;">
                    <span class="close" id="pdmClose">&times;</span>
                    <h2 class="pdm-title"></h2>
                    <div class="pdm-gallery" style="position:relative; overflow:hidden; height:400px; display:flex; align-items:center; justify-content:center; background:#f8f8f8; border-radius:8px;">
                    </div>
                    <div style="display:flex; gap:16px; align-items:center; margin-top:12px;">
                        <div class="pdm-price" style="font-weight:700;"></div>
                        <div class="pdm-sizes"></div>
                    </div>
                    <p class="pdm-desc" style="margin-top:12px;"></p>
                    <div style="display:flex; gap:8px; margin-top:16px;">
                        <button class="btn btn-primary" id="pdmOrder">Заказать</button>
                    </div>
                </div>
            </div>`;
        document.body.appendChild(wrapper.firstElementChild);
        document.getElementById('pdmClose').addEventListener('click', () => {
            document.getElementById('productDetailModal').style.display = 'none';
        });
        document.getElementById('pdmOrder').addEventListener('click', () => {
            const modal = document.getElementById('productDetailModal');
            const productId = modal.dataset.productId;
            const sizeSelect = modal.querySelector('#detailSize');
            if (sizeSelect && !sizeSelect.value) {
                alert('Выберите размер');
                return;
            }
            if (sizeSelect) {
                document.getElementById('orderSize').value = sizeSelect.value;
            }
            document.getElementById('orderForm').dataset.productId = productId;
            modal.style.display = 'none';
            const orderModal = document.getElementById('orderModal');
            openModal(orderModal);
        });
    }
});