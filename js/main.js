let currentUserSearchTerm = ''; // Текущий поисковый запрос пользователя

document.addEventListener('DOMContentLoaded', function () {
    // Проверяем статус авторизации при загрузке страницы
    checkAuthStatus();
    // Загружаем категории для фильтров
    loadCategoriesForFilters();
    // Рендерим товары
    renderProducts();

    // Обработка навигации
    const navLinks = document.querySelectorAll('.nav-links a');

    navLinks.forEach(link => {
        link.addEventListener('click', function (e) {
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

            // Показываем секции в зависимости от targetId
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
            } else if (targetId === 'orders') {
                ensureUserOrdersSectionExists();
                // Скрыть все кроме orders
                if (homeSection) homeSection.style.display = 'none';
                if (characteristicsFilterSection) characteristicsFilterSection.style.display = 'none';
                if (productsGridSection) productsGridSection.style.display = 'none';
                if (aboutSection) aboutSection.style.display = 'none';
                if (contactSection) contactSection.style.display = 'none';
                // Показать только orders
                const ordersSection = document.getElementById('orders');
                if (ordersSection) {
                    ordersSection.style.display = 'block';
                    renderUserOrders();
                }
            } else {
                // скрыть секцию orders если она есть
                const ordersSection = document.getElementById('orders');
                if (ordersSection) ordersSection.style.display = 'none';
            }

            console.log(`Переход к разделу: ${targetId}`);
        });
    });

    // Получаем элементы модальных окон
    const loginModal = document.getElementById('loginModal');
    const registerModal = document.getElementById('registerModal');
    const orderModal = document.getElementById('orderModal');
    const orderPreviewImg = document.getElementById('orderPreviewImg');
    const orderPreviewName = document.getElementById('orderPreviewName');
    const orderPreviewPrice = document.getElementById('orderPreviewPrice');
    const orderPreviewPrev = document.getElementById('orderPreviewPrev');
    const orderPreviewNext = document.getElementById('orderPreviewNext');
    const orderPreviewStock = document.getElementById('orderPreviewStock');
    let currentOrderProduct = null;
    let orderPreviewImages = [];
    let orderPreviewIndex = 0;

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

    function updateOrderPreview() {
        if (!currentOrderProduct) return;
        if (orderPreviewImg) {
            orderPreviewImg.src = orderPreviewImages[orderPreviewIndex] || 'images/placeholder.jpg';
        }
        if (orderPreviewName) {
            orderPreviewName.textContent = currentOrderProduct.name || 'Товар';
        }
        if (orderPreviewPrice) {
            const priceLabel = Number(currentOrderProduct.price || 0).toLocaleString('ru-RU', { style: 'currency', currency: 'RUB' });
            orderPreviewPrice.textContent = priceLabel;
        }
        if (orderPreviewStock) {
            const qty = Math.max(0, Number(currentOrderProduct.quantity) || 0);
            orderPreviewStock.textContent = qty > 0 ? `Осталось ${qty} шт.` : 'Нет в наличии';
            orderPreviewStock.classList.toggle('soldout', qty <= 0);
        }
    }

    function setOrderPreviewProduct(product) {
        currentOrderProduct = product;
        const imgs = Array.isArray(product.images) ? product.images.filter(Boolean) : [];
        orderPreviewImages = imgs.length ? imgs : (product.imageDataUrl ? [product.imageDataUrl] : ['images/placeholder.jpg']);
        orderPreviewIndex = 0;
        const showNav = orderPreviewImages.length > 1;
        if (orderPreviewPrev) orderPreviewPrev.style.display = showNav ? 'flex' : 'none';
        if (orderPreviewNext) orderPreviewNext.style.display = showNav ? 'flex' : 'none';
        updateOrderPreview();
    }

    function rotateOrderPreview(step) {
        if (!orderPreviewImages.length) return;
        orderPreviewIndex = (orderPreviewIndex + step + orderPreviewImages.length) % orderPreviewImages.length;
        updateOrderPreview();
    }

    if (orderPreviewPrev) {
        orderPreviewPrev.addEventListener('click', (e) => {
            e.preventDefault();
            rotateOrderPreview(-1);
        });
    }
    if (orderPreviewNext) {
        orderPreviewNext.addEventListener('click', (e) => {
            e.preventDefault();
            rotateOrderPreview(1);
        });
    }

    function bindOrderButtons() {
        const orderBtns = document.querySelectorAll('.order-btn');
        orderBtns.forEach(btn => {
            if (btn.disabled) return;
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const productCard = btn.closest('.product-card');
                if (!productCard) return;
                const productId = productCard.dataset.productId;
                openOrderModalForProduct(productId);
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

        document.querySelectorAll('.product-card').forEach(card => {
            card.addEventListener('click', (e) => {
                if (e.target.closest('.order-btn') || e.target.closest('.carousel-prev') || e.target.closest('.carousel-next')) return;
                const productId = card.dataset.productId;
                window.location.href = 'product.html?id=' + encodeURIComponent(productId);
            });
        });
    }

    function fillOrderSizeOptions(product, preselectedSize) {
        const orderSizeSelect = document.getElementById('orderSize');
        if (!orderSizeSelect) return;
        orderSizeSelect.innerHTML = '';
        if (!product) {
            orderSizeSelect.innerHTML = '<option value="">Нет доступных размеров</option>';
            return;
        }
        if (product.oneSize) {
            orderSizeSelect.innerHTML = '<option value="one-size">Единый</option>';
        } else if (product.sizes) {
            let added = false;
            ['S', 'M', 'L', 'XL'].forEach(size => {
                if (product.sizes[size] && product.sizes[size].enabled) {
                    orderSizeSelect.innerHTML += `<option value="${size}">${size}</option>`;
                    added = true;
                }
            });
            if (!added) orderSizeSelect.innerHTML = '<option value="">Нет доступных размеров</option>';
        } else {
            orderSizeSelect.innerHTML = '<option value="">Нет доступных размеров</option>';
        }
        if (preselectedSize) {
            const option = Array.from(orderSizeSelect.options).find(opt => opt.value === preselectedSize);
            if (option) {
                orderSizeSelect.value = preselectedSize;
            }
        }
    }

    function openOrderModalForProduct(productId, preselectedSize) {
        const products = (window.authSystem && window.authSystem.getProducts) ? window.authSystem.getProducts() : [];
        const product = products.find(p => p.id === productId);
        if (!product) {
            alert('Товар недоступен');
            return;
        }
        if (Number(product.quantity || 0) <= 0) {
            alert('К сожалению, товар закончился');
            return;
        }
        fillOrderSizeOptions(product, preselectedSize);
        setOrderPreviewProduct(product);
        document.getElementById('orderForm').dataset.productId = productId;
        openModal(orderModal);
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

        // Добавляем пункт меню \"Заказы\"
        const ordersItem = document.createElement('li');
        ordersItem.innerHTML = `<a href="#orders" id="ordersNav"><i class="fas fa-receipt"></i> Заказы</a>`;
        navLinks.appendChild(ordersItem);

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

        // Показать секцию \"Мои заказы\" как полноценную вкладку
        const ordersNav = document.getElementById('ordersNav');
        if (ordersNav) {
            // Удаляем обработчик, если он уже есть, чтобы избежать дублирования
            const existingOrdersNavListener = ordersNav.addEventListener('click', (e) => {
                e.preventDefault();
                ensureUserOrdersSectionExists();
                // Скрываем прочие секции
                const homeSection = document.getElementById('home');
                const characteristicsFilterSection = document.querySelector('.characteristics-filter');
                const productsGridSection = document.getElementById('products');
                const aboutSection = document.getElementById('about');
                const contactSection = document.getElementById('contact');
                if (homeSection) homeSection.style.display = 'none';
                if (characteristicsFilterSection) characteristicsFilterSection.style.display = 'none';
                if (productsGridSection) productsGridSection.style.display = 'none';
                if (aboutSection) aboutSection.style.display = 'none';
                if (contactSection) contactSection.style.display = 'none';
                // Показываем заказы
                const ordersSection = document.getElementById('orders');
                if (ordersSection) {
                    ordersSection.style.display = 'block';
                    renderUserOrders();
                }
                // Переключаем активное меню
                document.querySelectorAll('.nav-links a').forEach(l => l.classList.remove('active'));
                ordersNav.classList.add('active');
            });
        }
    }

    // Создаёт секцию заказов, если её ещё нет
    function ensureUserOrdersSectionExists() {
        if (document.getElementById('orders')) return;
        const main = document.querySelector('.main-content');
        if (!main) return;
        const section = document.createElement('section');
        section.id = 'orders';
        section.style.display = 'none';
        section.innerHTML = `
            <div class="card" style="background:#fff; padding:24px; border-radius:12px;">
                <h2 style="margin-top:0;">Мои заказы</h2>
                <div id="userOrdersContainer"></div>
            </div>
        `;
        main.appendChild(section);
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
    const applyFiltersBtn = document.getElementById('apply-filters');
    const resetFiltersBtn = document.getElementById('reset-filters');

    let filtersFloatingMode = false;

    function updateFiltersMode() {
        if (!filtersContainer) return;
        filtersFloatingMode = window.innerWidth >= 992;
        filtersContainer.classList.toggle('filters-floating', filtersFloatingMode);
        if (filtersFloatingMode) {
            filtersContainer.classList.remove('filters-floating--visible');
            filtersContainer.style.display = '';
        } else {
            filtersContainer.classList.remove('filters-floating--visible');
            filtersContainer.style.display = 'none';
        }
    }

    toggleFiltersBtn.addEventListener('click', () => {
        if (!filtersContainer) return;
        if (filtersFloatingMode) {
            filtersContainer.classList.toggle('filters-floating--visible');
        } else {
            filtersContainer.style.display = (filtersContainer.style.display === 'block') ? 'none' : 'block';
        }
    });

    document.addEventListener('click', (e) => {
        if (!filtersFloatingMode || !filtersContainer) return;
        if (!filtersContainer.contains(e.target) && !toggleFiltersBtn.contains(e.target)) {
            filtersContainer.classList.remove('filters-floating--visible');
        }
    });

    window.addEventListener('resize', updateFiltersMode);
    updateFiltersMode();

    // Обработка слайдера цены
    const priceRange = document.getElementById('price-range');
    const priceValue = document.getElementById('price-value');

    priceRange.addEventListener('input', () => {
        priceValue.textContent = priceRange.value;
    });

    // Обработка применения фильтров
    applyFiltersBtn.addEventListener('click', () => {
        applyFilters();
    });

    // Обработка сброса фильтров
    resetFiltersBtn.addEventListener('click', () => {
        resetFilters();
    });

    // Функция поиска товаров для пользователей
    window.searchProductsUser = function () {
        const searchInput = document.getElementById('searchProductsUser');
        if (!searchInput) return;

        currentUserSearchTerm = searchInput.value.toLowerCase().trim();
        applyFilters();
    };

    // Функция применения фильтров
    function applyFilters() {
        const selectedCategories = Array.from(document.querySelectorAll('input[name="category"]:checked')).map(cb => cb.value);
        const selectedSizes = Array.from(document.querySelectorAll('input[name="size"]:checked')).map(cb => cb.value);
        const maxPrice = parseInt(priceRange.value);

        // Получаем все товары
        const products = (window.authSystem && typeof window.authSystem.getProducts === 'function')
            ? window.authSystem.getProducts()
            : [];

        // Фильтруем товары
        const filteredProducts = products.filter(product => {
            // Проверка поискового запроса
            const searchMatch = !currentUserSearchTerm ||
                product.name.toLowerCase().includes(currentUserSearchTerm);

            // Проверка категории
            const categoryMatch = selectedCategories.length === 0 || selectedCategories.includes(product.category);

            // Проверка размера
            const sizeMatch = selectedSizes.length === 0 ||
                selectedSizes.includes('one-size') && product.oneSize ||
                selectedSizes.some(size => product.sizes && product.sizes[size] && product.sizes[size].enabled);

            // Проверка цены
            const priceMatch = product.price <= maxPrice;

            return searchMatch && categoryMatch && sizeMatch && priceMatch;
        });

        // Отображаем отфильтрованные товары
        displayFilteredProducts(filteredProducts);
    }

    // Функция отображения отфильтрованных товаров
    function displayFilteredProducts(products) {
        const productsGridSection = document.getElementById('products');
        if (!productsGridSection) return;

        if (!products || products.length === 0) {
            productsGridSection.innerHTML = '<p>Товары по выбранным фильтрам не найдены.</p>';
            return;
        }

        productsGridSection.innerHTML = products.map(p => {
            const enabledSizes = Object.entries(p.sizes || {})
                .filter(([, cfg]) => cfg && cfg.enabled)
                .map(([size]) => size);

            const hasOneSize = !!p.oneSize;
            const hasSizes = !hasOneSize && enabledSizes.length > 0;
            const qty = Math.max(0, Number(p.quantity) || 0);
            const inStock = qty > 0;
            const stockLabel = inStock ? `Осталось ${qty} шт.` : 'Нет в наличии';
            const sizeDisplayHtml = hasOneSize ? `
                <div class="product-size">
                    <span class="size-label">Размеры:</span>
                    <span class="size-value">Единый размер</span>
                </div>
            ` : (hasSizes ? `
                <div class="product-size">
                    <span class="size-label">Размеры:</span>
                    <span class="size-value">${enabledSizes.join(', ')}</span>
                </div>
            ` : '');

            const images = Array.isArray(p.images) ? p.images : (p.imageDataUrl ? [p.imageDataUrl] : []);
            const imgSrc = images[0] || 'images/placeholder.jpg';
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
                        <div class="product-stock ${inStock ? '' : 'product-stock--empty'}">${stockLabel}</div>
                        ${sizeDisplayHtml}
                        <button class="order-btn"${inStock ? '' : ' disabled'}>${inStock ? 'Заказать' : 'Нет в наличии'}</button>
                    </div>
                </div>
            `;
        }).join('');

        // Привязать кнопки и стрелки заново
        bindOrderButtons();
    }

    // Функция сброса фильтров
    function resetFilters() {
        // Перезагружаем категории (на случай, если они изменились)
        loadCategoriesForFilters();

        // Сбрасываем все чекбоксы категорий
        document.querySelectorAll('input[name="category"]').forEach(cb => cb.checked = false);

        // Сбрасываем все чекбоксы размеров
        document.querySelectorAll('input[name="size"]').forEach(cb => cb.checked = false);

        // Сбрасываем слайдер цены
        priceRange.value = 2000;
        priceValue.textContent = '2000';

        // Сбрасываем поиск
        const searchInput = document.getElementById('searchProductsUser');
        if (searchInput) {
            searchInput.value = '';
        }
        currentUserSearchTerm = '';

        // Показываем все товары
        const products = (window.authSystem && typeof window.authSystem.getProducts === 'function')
            ? window.authSystem.getProducts()
            : [];
        displayFilteredProducts(products);
    }

    // Функция для загрузки категорий в фильтры
    function loadCategoriesForFilters() {
        try {
            const categories = (window.authSystem && typeof window.authSystem.getCategories === 'function')
                ? window.authSystem.getCategories()
                : [];

            const categoryFiltersContainer = document.getElementById('category-filters');
            if (!categoryFiltersContainer) return;

            // Очищаем контейнер
            categoryFiltersContainer.innerHTML = '';

            // Добавляем категории
            categories.forEach(category => {
                const label = document.createElement('label');
                label.innerHTML = `
                    <input type="checkbox" name="category" value="${category.key}"> ${category.name}
                `;
                categoryFiltersContainer.appendChild(label);
            });
        } catch (error) {
            console.error('Ошибка при загрузке категорий для фильтров:', error);
        }
    }

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

            // Показываем все товары по умолчанию
            displayFilteredProducts(products);
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
            <div class="pdm-slide${i === 0 ? ' active' : ''}"><img src="${src}" alt="${p.name}"></div>
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

    // ===== Мои заказы пользователя =====
    function ensureUserOrdersModalExists() {
        if (document.getElementById('userOrdersModal')) return;
        const wrapper = document.createElement('div');
        wrapper.innerHTML = `
            <div id="userOrdersModal" class="modal" style="background:#ffffff;">
                <div class="modal-content" style="max-width:1100px; box-shadow:none;">
                    <span class="close" id="uomClose">&times;</span>
                    <h2 style="margin-top:0;">Мои заказы</h2>
                    <div id="userOrdersContainer"></div>
                </div>
            </div>`;
        document.body.appendChild(wrapper.firstElementChild);
        document.getElementById('uomClose').addEventListener('click', () => {
            document.getElementById('userOrdersModal').style.display = 'none';
            document.body.style.overflow = 'auto';
        });
    }

    function renderUserOrders() {
        try {
            const container = document.getElementById('userOrdersContainer');
            if (!container) return;
            const orders = (window.authSystem && window.authSystem.getUserOrders) ? window.authSystem.getUserOrders() : [];
            const products = (window.authSystem && window.authSystem.getProducts) ? window.authSystem.getProducts() : [];
            const getProduct = (id) => products.find(x => x.id === id);
            if (!orders || orders.length === 0) {
                container.innerHTML = '<p class="muted-text">У вас пока нет заказов.</p>';
                return;
            }
            container.innerHTML = `
                <div class="user-orders-table">
                    <div class="user-orders-table__header">
                        <h3>История заказов</h3>
                        <p>${orders.length} шт.</p>
                    </div>
                    <div class="table-responsive">
                        <table class="data-table user-table">
                            <thead>
                                <tr>
                                    <th>ID заказа</th>
                                    <th>Товар</th>
                                    <th>Размер</th>
                                    <th>Статус</th>
                                    <th>Дата</th>
                                    <th>Действие</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${orders.map(o => {
                const p = getProduct(o.productId);
                const img = p && Array.isArray(p.images) && p.images.length > 0 ? p.images[0] : (p && p.imageDataUrl ? p.imageDataUrl : 'images/placeholder.jpg');
                const name = p ? p.name : `Товар ${o.productId}`;
                const price = p ? (Number(p.price).toLocaleString('ru-RU', { style: 'currency', currency: 'RUB' })) : '-';
                const statusKey = (o.status || '').toLowerCase().replace(/\s/g, '-');
                const statusBadge = `<span class="status-badge status-${statusKey || 'new'}">${o.status}</span>`;
                return `<tr>
                                        <td data-label="ID заказа"><code>${o.id}</code></td>
                                        <td data-label="Товар">
                                            <div class="order-product">
                                                <img src="${img}" alt="${name}">
                                                <div>
                                                    <div class="order-product__name">${name}</div>
                                                    <div class="order-product__price">${price}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td data-label="Размер">${o.size || '-'}</td>
                                        <td data-label="Статус">${statusBadge}</td>
                                        <td data-label="Дата">${new Date(o.orderDate).toLocaleString('ru-RU')}</td>
                                        <td data-label="Действие">
                                            <button class="order-cancel-btn" onclick="window.cancelUserOrder && window.cancelUserOrder('${o.id}')">Отменить</button>
                                        </td>
                                    </tr>`;
            }).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            `;
        } catch (error) {
            console.error('Ошибка при загрузке заказов пользователя:', error);
        }
    }

    window.cancelUserOrder = function (orderId) {
        if (!orderId) return;
        if (!window.authSystem || typeof window.authSystem.deleteOrder !== 'function') {
            alert('Отмена заказа временно недоступна');
            return;
        }
        if (!confirm('Вы действительно хотите отменить этот заказ?')) {
            return;
        }
        try {
            const result = window.authSystem.deleteOrder(orderId);
            alert(result.message || 'Заказ отменён');
            renderUserOrders();
            // Обновляем товары (возвращённый на склад товар может снова появиться)
            renderProducts();
        } catch (error) {
            alert(error.message || 'Не удалось отменить заказ');
        }
    };

    function openUserOrdersModal() {
        ensureUserOrdersModalExists();
        renderUserOrders();
        const modal = document.getElementById('userOrdersModal');
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }

    const urlParams = new URLSearchParams(window.location.search);
    const orderProductId = urlParams.get('order');
    if (orderProductId) {
        openOrderModalForProduct(orderProductId);
        if (window.history && window.history.replaceState) {
            const url = new URL(window.location.href);
            url.searchParams.delete('order');
            window.history.replaceState({}, '', url.pathname + url.search + url.hash);
        }
    }

    // ==== Тема ==== //
    const htmlBody = document.body;
    function setTheme(theme) {
        if (theme === 'dark') {
            htmlBody.classList.add('dark-theme');
            localStorage.setItem('mirar_shop_theme', 'dark');
        } else {
            htmlBody.classList.remove('dark-theme');
            localStorage.setItem('mirar_shop_theme', 'light');
        }
    }
    // При загрузке страницы — применить тему
    const initTheme = localStorage.getItem('mirar_shop_theme') || 'light';
    setTheme(initTheme);

    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', function () {
            const curTheme = htmlBody.classList.contains('dark-theme') ? 'dark' : 'light';
            setTheme(curTheme === 'dark' ? 'light' : 'dark');
        });
    }
});