// JavaScript для админ-панели

let currentOrderId = null;
let currentProductId = null;

// Проверка авторизации админа при загрузке страницы
document.addEventListener('DOMContentLoaded', function () {
    if (!window.authSystem.isAdmin()) {
        alert('Доступ запрещен. Требуются права администратора.');
        window.location.href = 'index.html';
        return;
    }

    // Обновляем информацию об админе
    const currentAdmin = window.authSystem.getCurrentUser();
    document.getElementById('adminInfo').textContent = `Добро пожаловать, ${currentAdmin.name}!`;

    // Загружаем дашборд
    loadDashboard();

    // Привязываем обработчик формы товара
    const productForm = document.getElementById('productForm');
    if (productForm) {
        productForm.addEventListener('submit', onSubmitProductForm);
    }

    // Переключение единого размера
    const oneSizeCb = document.getElementById('oneSize');
    if (oneSizeCb) {
        oneSizeCb.addEventListener('change', () => {
            toggleSizesDisabled(oneSizeCb.checked);
        });
    }
});

// Показать секцию
function showSection(sectionName) {
    // Скрываем все секции
    document.querySelectorAll('.admin-section').forEach(section => {
        section.classList.remove('active');
    });

    // Убираем активный класс у всех кнопок навигации
    document.querySelectorAll('.admin-nav button').forEach(btn => {
        btn.classList.remove('active');
    });

    // Показываем нужную секцию
    document.getElementById(sectionName).classList.add('active');
    document.getElementById(`nav-${sectionName}`).classList.add('active');

    // Загружаем данные для секции
    switch (sectionName) {
        case 'dashboard':
            loadDashboard();
            break;
        case 'users':
            loadUsers();
            break;
        case 'orders':
            loadOrders();
            break;
        case 'admins':
            loadAdmins();
            break;
        case 'products':
            loadProducts();
            break;
        case 'categories':
            loadCategories();
            break;
    }
}

// Загрузка дашборда
function loadDashboard() {
    try {
        const stats = window.authSystem.getStatistics();
        const products = window.authSystem.getProducts();
        const getProductName = (id) => {
            const p = products.find(x => x.id === id);
            return p ? p.name : `Товар ${id}`;
        };

        // Обновляем статистику
        const statsGrid = document.getElementById('statsGrid');
        statsGrid.innerHTML = `
            <div class="stat-card">
                <h3>Пользователи</h3>
                <div class="number">${stats.totalUsers}</div>
            </div>
            <div class="stat-card">
                <h3>Заказы</h3>
                <div class="number">${stats.totalOrders}</div>
            </div>
            <div class="stat-card">
                <h3>Админы</h3>
                <div class="number">${stats.totalAdmins}</div>
            </div>
            <div class="stat-card">
                <h3>Новые заказы</h3>
                <div class="number">${stats.orderStats['Новый'] || 0}</div>
            </div>
        `;

        // Показываем последние заказы
        const recentOrdersDiv = document.getElementById('recentOrders');
        if (stats.recentOrders.length > 0) {
            recentOrdersDiv.innerHTML = `
                <div class="table-responsive">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>ID заказа</th>
                            <th>Клиент</th>
                            <th>Email</th>
                            <th>Товар</th>
                            <th>Статус</th>
                            <th>Дата</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${stats.recentOrders.map(order => `
                            <tr>
                                <td>${order.id}</td>
                                <td>${order.customerName}</td>
                                <td>${order.customerEmail}</td>
                                <td>${getProductName(order.productId)}</td>
                                <td><span class="status-badge status-${order.status.toLowerCase().replace(' ', '')}">${order.status}</span></td>
                                <td>${new Date(order.orderDate).toLocaleDateString()}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
                </div>
            `;
        } else {
            recentOrdersDiv.innerHTML = '<p>Нет заказов</p>';
        }

    } catch (error) {
        console.error('Ошибка при загрузке дашборда:', error);
        alert('Ошибка при загрузке данных: ' + error.message);
    }
}

// Загрузка пользователей
function loadUsers() {
    try {
        const users = window.authSystem.getAllUsers();
        const usersTable = document.getElementById('usersTable');

        if (users.length > 0) {
            usersTable.innerHTML = `
                <div class="table-responsive">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Имя</th>
                            <th>Email</th>
                            <th>Телефон</th>
                            <th>Дата регистрации</th>
                            <th>Действия</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${users.map(user => `
                            <tr>
                                <td>${user.id.substring(0, 8)}...</td>
                                <td>${user.name}</td>
                                <td>${user.email}</td>
                                <td>${user.phone}</td>
                                <td>${new Date(user.registrationDate).toLocaleDateString()}</td>
                                <td>
                                    <button onclick="deleteUser('${user.id}')" class="btn btn-danger">
                                        <i class="fas fa-trash"></i> Удалить
                                    </button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
                </div>
            `;
        } else {
            usersTable.innerHTML = '<p>Пользователи не найдены</p>';
        }

    } catch (error) {
        console.error('Ошибка при загрузке пользователей:', error);
        alert('Ошибка при загрузке пользователей: ' + error.message);
    }
}

// Загрузка заказов
function loadOrders() {
    try {
        let orders = window.authSystem.getAllOrders();
        const products = window.authSystem.getProducts();
        const getProductName = (id) => {
            const p = products.find(x => x.id === id);
            return p ? p.name : `Товар ${id}`;
        };
        const ordersTable = document.getElementById('ordersTable');

        // Сортировка по дате (последние сверху)
        orders = orders.slice().sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate));

        if (orders.length > 0) {
            ordersTable.innerHTML = `
                <div class="table-responsive">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>ID заказа</th>
                            <th>Клиент</th>
                            <th>Email</th>
                            <th>Телефон</th>
                            <th>Товар</th>
                            <th>Размер</th>
                            <th>Статус</th>
                            <th>Дата</th>
                            <th>Действия</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${orders.map(order => `
                            <tr>
                                <td>${order.id}</td>
                                <td>${order.customerName}</td>
                                <td>${order.customerEmail}</td>
                                <td>${order.customerPhone}</td>
                                <td>${getProductName(order.productId)}</td>
                                <td>${order.size}</td>
                                <td><span class="status-badge status-${order.status.toLowerCase().replace(' ', '')}">${order.status}</span></td>
                                <td>${new Date(order.orderDate).toLocaleDateString()}</td>
                                <td>
                                    <button onclick="sendEmailToCustomer('${order.id}')" class="btn btn-warning">
                                        <i class="fas fa-envelope"></i> Отправить сообщение
                                    </button>
                                    <button onclick="deleteOrder('${order.id}')" class="btn btn-danger">
                                        <i class="fas fa-trash"></i> Удалить
                                    </button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
                </div>
            `;
        } else {
            ordersTable.innerHTML = '<p>Заказы не найдены</p>';
        }

    } catch (error) {
        console.error('Ошибка при загрузке заказов:', error);
        alert('Ошибка при загрузке заказов: ' + error.message);
    }
}

// Загрузка админов
function loadAdmins() {
    try {
        const admins = window.authSystem.getAdmins();
        const adminsTable = document.getElementById('adminsTable');
        const addAdminBtn = document.querySelector('button[onclick="openAddAdminModal()"]');

        // Показываем кнопку добавления админа только для главного админа
        if (addAdminBtn) {
            const isMainAdmin = window.authSystem.isMainAdmin();
            addAdminBtn.style.display = isMainAdmin ? 'inline-block' : 'none';
        }

        if (admins.length > 0) {
            adminsTable.innerHTML = `
                <div class="table-responsive">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Имя</th>
                            <th>Email</th>
                            <th>Роль</th>
                            <th>Создан</th>
                            <th>Создал</th>
                            <th>Действия</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${admins.map(admin => `
                            <tr>
                                <td>${admin.id.substring(0, 8)}...</td>
                                <td>${admin.name}</td>
                                <td>${admin.email}</td>
                                <td>${admin.isMainAdmin || admin.email === '1238355@gmail.com' ? 'Главный админ' : 'Админ'}</td>
                                <td>${new Date(admin.createdDate).toLocaleDateString()}</td>
                                <td>${admin.createdBy ? admin.createdBy.substring(0, 8) + '...' : 'Система'}</td>
                                <td>
                                    ${(admin.isMainAdmin || admin.email === '1238355@gmail.com')
                    ? '<span style="color: #666;">Нельзя удалить</span>'
                    : `<button onclick="deleteAdmin('${admin.id}')" class="btn btn-danger"><i class='fas fa-trash'></i> Удалить</button>`}
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
                </div>
            `;
        } else {
            adminsTable.innerHTML = '<p>Админы не найдены</p>';
        }

    } catch (error) {
        console.error('Ошибка при загрузке админов:', error);
        alert('Ошибка при загрузке админов: ' + error.message);
    }
}

// Удаление пользователя
function deleteUser(userId) {
    if (confirm('Вы уверены, что хотите удалить этого пользователя?')) {
        try {
            const result = window.authSystem.deleteUser(userId);
            alert(result.message);
            loadUsers();
        } catch (error) {
            alert('Ошибка при удалении пользователя: ' + error.message);
        }
    }
}

// Удаление заказа
function deleteOrder(orderId) {
    if (confirm('Вы уверены, что хотите удалить этот заказ?')) {
        try {
            const result = window.authSystem.deleteOrder(orderId);
            alert(result.message);
            loadOrders();
        } catch (error) {
            alert('Ошибка при удалении заказа: ' + error.message);
        }
    }
}

// Подготовка письма клиенту в Gmail (или почтовом клиенте)
function sendEmailToCustomer(orderId) {
    try {
        const orders = window.authSystem.getAllOrders();
        const products = window.authSystem.getProducts();
        const order = orders.find(o => o.id === orderId);
        if (!order) {
            alert('Заказ не найден');
            return;
        }
        const product = products.find(p => p.id === order.productId);
        const productName = product ? product.name : `Товар ${order.productId}`;
        const productPrice = product ? (Number(product.price).toLocaleString('ru-RU', { style: 'currency', currency: 'RUB' })) : '-';
        // ВАЖНО: не вставляем data:image/base64 в тело письма, т.к. это делает URL слишком длинным
        // и Gmail может возвращать 400 Bad Request. Достаточно текста с названием и ценой.
        const subject = encodeURIComponent(`Заказ ${order.id} — Mirar Wear`);

        let bodyContent =
            `Здравствуйте, ${order.customerName}!\n\n` +
            `Вы оформили заказ в Mirar Wear.\n` +
            `ID заказа: ${order.id}\n` +
            `Товар: ${productName}\n` +
            `Цена: ${productPrice}\n` +
            `Размер: ${order.size || '-'}\n` +
            `Дата: ${new Date(order.orderDate).toLocaleString('ru-RU')}\n\n` +
            `Для связи с администратором писать в телеграм @mirarmanager\n` +
            `Предоставьте ему свой айди ${order.id} заказа для оформления\n` +
            `Если у вас есть вопросы, ответьте на это письмо.`;
        const body = encodeURIComponent(bodyContent);
        const to = encodeURIComponent(order.customerEmail);
        const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${to}&su=${subject}&body=${body}`;
        const mailtoUrl = `mailto:${order.customerEmail}?subject=${subject}&body=${body}`;
        const win = window.open(gmailUrl, '_blank');
        if (!win) {
            window.location.href = mailtoUrl;
        }
    } catch (error) {
        alert('Не удалось подготовить письмо: ' + (error.message || error));
    }
}

// Открытие модального окна добавления админа
function openAddAdminModal() {
    document.getElementById('addAdminModal').style.display = 'block';
}

// Закрытие модального окна добавления админа
function closeAddAdminModal() {
    document.getElementById('addAdminModal').style.display = 'none';
    document.getElementById('addAdminForm').reset();
}

// Обработка формы добавления админа
document.getElementById('addAdminForm').addEventListener('submit', function (e) {
    e.preventDefault();

    const adminData = {
        name: document.getElementById('adminName').value,
        email: document.getElementById('adminEmail').value,
        password: document.getElementById('adminPassword').value
    };

    try {
        const result = window.authSystem.addAdmin(adminData);
        alert(result.message);
        closeAddAdminModal();
        loadAdmins();
    } catch (error) {
        alert('Ошибка при добавлении админа: ' + error.message);
    }
});

// Выход из системы
function logout() {
    if (confirm('Вы уверены, что хотите выйти?')) {
        window.authSystem.logout();
        window.location.href = 'index.html';
    }
}

// Закрытие модальных окон при клике вне их
window.addEventListener('click', function (e) {
    if (e.target.classList.contains('modal')) {
        e.target.style.display = 'none';
    }
});

// ======= Управление товарами =======
let filteredProducts = null; // Кэш отфильтрованных товаров
let currentSearchTerm = ''; // Текущий поисковый запрос

// Загрузка категорий в фильтр товаров
function loadCategoriesForFilter() {
    try {
        const categories = window.authSystem.getCategories();
        const categorySelect = document.getElementById('filterCategory');

        if (!categorySelect) return;

        // Очищаем существующие опции (кроме первой)
        categorySelect.innerHTML = '<option value="">Все категории</option>';

        // Добавляем актуальные категории
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.key;
            option.textContent = category.name;
            categorySelect.appendChild(option);
        });
    } catch (error) {
        console.error('Ошибка при загрузке категорий для фильтра:', error);
    }
}

// Поиск товаров по названию
function searchProducts() {
    const searchInput = document.getElementById('searchProducts');
    if (!searchInput) return;

    currentSearchTerm = searchInput.value.toLowerCase().trim();
    applyProductFilters();
}

// Применение фильтров к товарам
function applyProductFilters() {
    try {
        const products = window.authSystem.getProducts();
        const categoryFilter = document.getElementById('filterCategory').value;
        const priceFilter = document.getElementById('filterPrice').value;
        const quantityFilter = document.getElementById('filterQuantity').value;
        const sizesFilter = document.getElementById('filterSizes').value;

        let filtered = [...products];

        // Фильтр по поисковому запросу
        if (currentSearchTerm) {
            filtered = filtered.filter(p =>
                p.name.toLowerCase().includes(currentSearchTerm)
            );
        }

        // Фильтр по категории
        if (categoryFilter) {
            filtered = filtered.filter(p => p.category === categoryFilter);
        }

        // Фильтр по размерам
        if (sizesFilter) {
            if (sizesFilter === 'one-size') {
                filtered = filtered.filter(p => p.oneSize === true);
            } else {
                filtered = filtered.filter(p =>
                    !p.oneSize &&
                    p.sizes &&
                    p.sizes[sizesFilter] &&
                    p.sizes[sizesFilter].enabled
                );
            }
        }

        // Сортировка по цене
        if (priceFilter) {
            filtered.sort((a, b) => {
                return priceFilter === 'asc' ? a.price - b.price : b.price - a.price;
            });
        }

        // Сортировка по количеству
        if (quantityFilter) {
            filtered.sort((a, b) => {
                return quantityFilter === 'asc' ? a.quantity - b.quantity : b.quantity - a.quantity;
            });
        }

        filteredProducts = filtered;
        renderProductsTable(filtered);
    } catch (error) {
        console.error('Ошибка при применении фильтров:', error);
        alert('Ошибка при применении фильтров: ' + error.message);
    }
}

// Сброс фильтров
function resetProductFilters() {
    document.getElementById('filterCategory').value = '';
    document.getElementById('filterPrice').value = '';
    document.getElementById('filterQuantity').value = '';
    document.getElementById('filterSizes').value = '';
    const searchInput = document.getElementById('searchProducts');
    if (searchInput) {
        searchInput.value = '';
    }
    currentSearchTerm = '';
    filteredProducts = null;
    loadProducts();
}

// Рендеринг таблицы товаров
function renderProductsTable(products) {
    const productsTable = document.getElementById('productsTable');

    if (!productsTable) return;

    if (products.length === 0) {
        productsTable.innerHTML = '<p>Товары не найдены</p>';
        return;
    }

    productsTable.innerHTML = `
        <div class="table-responsive">
        <table class="data-table">
            <thead>
                <tr>
                    <th>Картинка</th>
                    <th>Название</th>
                    <th>Категория</th>
                    <th>Цена</th>
                    <th>Кол-во</th>
                    <th>Размеры</th>
                    <th>Действия</th>
                </tr>
            </thead>
            <tbody>
                ${products.map(p => `
                    <tr>
                        <td>${(Array.isArray(p.images) && p.images.length)
            ? `<img src="${p.images[0]}" alt="${p.name}" style="width:60px;height:60px;object-fit:cover;border-radius:6px;" />`
            : (p.imageDataUrl
                ? `<img src="${p.imageDataUrl}" alt="${p.name}" style="width:60px;height:60px;object-fit:cover;border-radius:6px;" />`
                : '-')}
                        </td>
                        <td>${p.name}</td>
                        <td>${getCategoryName(p.category)}</td>
                        <td>${Number(p.price).toLocaleString('ru-RU', { style: 'currency', currency: 'RUB' })}</td>
                        <td>${p.quantity}</td>
                        <td>${renderSizes(p.sizes)}</td>
                        <td>
                            <button class="btn btn-warning" onclick="editProduct('${p.id}')"><i class="fas fa-edit"></i> Редактировать</button>
                            <button class="btn btn-danger" onclick="deleteProductAdmin('${p.id}')"><i class="fas fa-trash"></i> Удалить</button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
        </div>
    `;
}

function loadProducts() {
    try {
        const products = window.authSystem.getProducts();

        // Загружаем категории для фильтра
        loadCategoriesForFilter();

        // Если нет активных фильтров, показываем все товары
        if (!filteredProducts) {
            renderProductsTable(products);
        } else {
            renderProductsTable(filteredProducts);
        }
    } catch (error) {
        alert('Ошибка при загрузке товаров: ' + error.message);
    }
}

function renderSizes(sizes) {
    if (!sizes) return '-';
    const entries = Object.entries(sizes)
        .map(([size, cfg]) => `${size}: ${cfg && cfg.enabled ? 'вкл' : 'выкл'}`);
    return entries.join('<br>');
}

function getCategoryName(category) {
    try {
        // Пытаемся получить название из актуальных категорий
        const categories = window.authSystem.getCategories();
        const categoryObj = categories.find(c => c.key === category);
        if (categoryObj) {
            return categoryObj.name;
        }
    } catch (error) {
        console.error('Ошибка при получении названия категории:', error);
    }

    // Fallback на старые названия, если категория не найдена
    const categoryNames = {
        'hat': 'Шапка',
        'sweater': 'Кофта',
        't-shirt': 'Майка',
        'pants': 'Штаны',
        'socks': 'Носки',
        'underwear': 'Нижнее белье',
        'jacket': 'Куртка',
        'shorts': 'Шорты'
    };
    return categoryNames[category] || category || '-';
}

// Функция для загрузки категорий в форму товара
function loadCategoriesForProduct() {
    try {
        const categories = window.authSystem.getCategories();
        const categorySelect = document.getElementById('productCategory');

        if (!categorySelect) return;

        // Очищаем существующие опции (кроме первой)
        categorySelect.innerHTML = '<option value="">Выберите категорию</option>';

        // Добавляем актуальные категории
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.key;
            option.textContent = category.name;
            categorySelect.appendChild(option);
        });

        // Также обновляем фильтр категорий
        loadCategoriesForFilter();
    } catch (error) {
        console.error('Ошибка при загрузке категорий:', error);
    }
}

function openProductModal() {
    currentProductId = null;
    document.getElementById('productModalTitle').textContent = 'Добавить товар';
    document.getElementById('productForm').reset();
    // По умолчанию включим все размеры
    setSizeCheckboxes({ S: true, M: true, L: true, XL: true });
    const oneSizeCb = document.getElementById('oneSize');
    if (oneSizeCb) oneSizeCb.checked = false;
    toggleSizesDisabled(false);

    // Загружаем актуальные категории
    loadCategoriesForProduct();

    document.getElementById('productModal').style.display = 'block';
}

function closeProductModal() {
    document.getElementById('productModal').style.display = 'none';
    currentProductId = null;
}

function editProduct(productId) {
    try {
        const products = window.authSystem.getProducts();
        const product = products.find(p => p.id === productId);
        if (!product) {
            alert('Товар не найден');
            return;
        }

        currentProductId = product.id;
        document.getElementById('productModalTitle').textContent = 'Редактировать товар';
        document.getElementById('productId').value = product.id;
        document.getElementById('productName').value = product.name;
        document.getElementById('productDescription').value = product.description || '';
        document.getElementById('productDescriptionFull').value = product.descriptionFull || '';
        document.getElementById('productPrice').value = product.price;
        document.getElementById('productQuantity').value = product.quantity;
        const oneSizeCb = document.getElementById('oneSize');
        if (oneSizeCb) oneSizeCb.checked = !!product.oneSize;
        toggleSizesDisabled(!!product.oneSize);
        setSizeCheckboxes({
            S: !!(product.sizes && product.sizes.S && product.sizes.S.enabled),
            M: !!(product.sizes && product.sizes.M && product.sizes.M.enabled),
            L: !!(product.sizes && product.sizes.L && product.sizes.L.enabled),
            XL: !!(product.sizes && product.sizes.XL && product.sizes.XL.enabled)
        });

        // Загружаем актуальные категории
        loadCategoriesForProduct();

        // Устанавливаем категорию товара после загрузки категорий
        setTimeout(() => {
            document.getElementById('productCategory').value = product.category || '';
        }, 100);

        document.getElementById('productModal').style.display = 'block';
    } catch (error) {
        alert('Ошибка при открытии товара: ' + error.message);
    }
}

function setSizeCheckboxes(map) {
    const s = document.getElementById('sizeS');
    const m = document.getElementById('sizeM');
    const l = document.getElementById('sizeL');
    const xl = document.getElementById('sizeXL');
    if (s) s.checked = !!map.S;
    if (m) m.checked = !!map.M;
    if (l) l.checked = !!map.L;
    if (xl) xl.checked = !!map.XL;
}

function toggleSizesDisabled(disabled) {
    ['sizeS', 'sizeM', 'sizeL', 'sizeXL'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.disabled = !!disabled;
    });
}

function onSubmitProductForm(e) {
    e.preventDefault();
    try {
        const id = document.getElementById('productId').value || null;
        const name = document.getElementById('productName').value;
        const description = document.getElementById('productDescription').value;
        const descriptionFull = document.getElementById('productDescriptionFull') ? document.getElementById('productDescriptionFull').value : '';
        const category = document.getElementById('productCategory').value;
        const price = document.getElementById('productPrice').value;
        const quantity = document.getElementById('productQuantity').value;
        const oneSize = document.getElementById('oneSize').checked;
        const sizes = {
            S: { enabled: document.getElementById('sizeS').checked },
            M: { enabled: document.getElementById('sizeM').checked },
            L: { enabled: document.getElementById('sizeL').checked },
            XL: { enabled: document.getElementById('sizeXL').checked }
        };

        const imagesInput = document.getElementById('productImages');
        const files = imagesInput && imagesInput.files ? Array.from(imagesInput.files) : [];

        // Простая валидация
        if (!name || name.trim() === '') {
            alert('Введите название товара');
            return;
        }
        if (!category || category.trim() === '') {
            alert('Выберите категорию товара');
            return;
        }
        const priceNum = Number(price);
        if (Number.isNaN(priceNum) || priceNum < 0) {
            alert('Введите корректную цену (0 или больше)');
            return;
        }
        const qtyNum = Number(quantity);
        if (Number.isNaN(qtyNum) || qtyNum < 0) {
            alert('Введите корректное количество (0 или больше)');
            return;
        }

        if (files.length > 0) {
            // Читаем все файлы
            Promise.all(files.map(file => new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result);
                reader.onerror = () => reject(new Error('Не удалось прочитать файл изображения'));
                reader.readAsDataURL(file);
            }))).then(images => {
                saveProduct({ id, name, description, descriptionFull, category, price: priceNum, quantity: qtyNum, sizes, oneSize, images });
            }).catch(err => {
                alert('Ошибка при чтении изображений: ' + err.message);
            });
        } else {
            // Без изменения изображений
            saveProduct({ id, name, description, descriptionFull, category, price: priceNum, quantity: qtyNum, sizes, oneSize });
        }
    } catch (error) {
        alert('Ошибка при сохранении товара: ' + error.message);
    }
}

function saveProduct({ id, name, description, descriptionFull, category, price, quantity, sizes, oneSize, images, imageDataUrl }) {
    try {
        if (id) {
            // Обновление
            const updates = { name, description, descriptionFull, category, price, quantity, sizes };
            if (oneSize !== undefined) updates.oneSize = !!oneSize;
            if (Array.isArray(images) && images.length) updates.images = images;
            if (imageDataUrl) updates.imageDataUrl = imageDataUrl;
            const res = window.authSystem.updateProduct(id, updates);
            alert(res.message);
        } else {
            // Добавление
            const payload = { name, description, descriptionFull, category, price, quantity, sizes, oneSize };
            if (Array.isArray(images) && images.length) payload.images = images;
            if (imageDataUrl) payload.imageDataUrl = imageDataUrl;
            const res = window.authSystem.addProduct(payload);
            alert(res.message);
        }
        closeProductModal();
        loadProducts();
    } catch (error) {
        alert('Ошибка при сохранении: ' + error.message);
    }
}

function deleteProductAdmin(productId) {
    if (!confirm('Удалить этот товар?')) return;
    try {
        const res = window.authSystem.deleteProduct(productId);
        alert(res.message);
        loadProducts();
    } catch (error) {
        alert('Ошибка при удалении: ' + error.message);
    }
}

function deleteAdmin(adminId) {
    if (confirm('Вы уверены, что хотите удалить этого админа?')) {
        try {
            const res = window.authSystem.deleteAdmin(adminId);
            alert(res.message);
            loadAdmins();
        } catch (error) {
            alert('Ошибка при удалении админа: ' + (error.message || error));
        }
    }
}

// ======= Управление категориями =======
function loadCategories() {
    try {
        const categories = window.authSystem.getCategories();
        const categoriesTable = document.getElementById('categoriesTable');

        if (!categoriesTable) return;

        if (categories.length === 0) {
            categoriesTable.innerHTML = '<p>Категории не найдены</p>';
            return;
        }

        categoriesTable.innerHTML = `
            <div class="table-responsive">
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Ключ</th>
                        <th>Название</th>
                        <th>Описание</th>
                        <th>Дата создания</th>
                        <th>Действия</th>
                    </tr>
                </thead>
                <tbody>
                    ${categories.map(c => `
                        <tr>
                            <td><code>${c.key}</code></td>
                            <td>${c.name}</td>
                            <td>${c.description || '-'}</td>
                            <td>${new Date(c.createdDate).toLocaleDateString()}</td>
                            <td>
                                <button class="btn btn-warning" onclick="editCategory('${c.id}')"><i class="fas fa-edit"></i> Редактировать</button>
                                <button class="btn btn-danger" onclick="deleteCategoryAdmin('${c.id}')"><i class="fas fa-trash"></i> Удалить</button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
            </div>
        `;
    } catch (error) {
        alert('Ошибка при загрузке категорий: ' + error.message);
    }
}

function openCategoryModal() {
    currentCategoryId = null;
    document.getElementById('categoryModalTitle').textContent = 'Добавить категорию';
    document.getElementById('categoryForm').reset();
    document.getElementById('categoryModal').style.display = 'block';
}

function closeCategoryModal() {
    document.getElementById('categoryModal').style.display = 'none';
    currentCategoryId = null;
}

function editCategory(categoryId) {
    try {
        const categories = window.authSystem.getCategories();
        const category = categories.find(c => c.id === categoryId);
        if (!category) {
            alert('Категория не найдена');
            return;
        }

        currentCategoryId = category.id;
        document.getElementById('categoryModalTitle').textContent = 'Редактировать категорию';
        document.getElementById('categoryId').value = category.id;
        document.getElementById('categoryKey').value = category.key;
        document.getElementById('categoryName').value = category.name;
        document.getElementById('categoryDescription').value = category.description || '';

        document.getElementById('categoryModal').style.display = 'block';
    } catch (error) {
        alert('Ошибка при открытии категории: ' + error.message);
    }
}

function deleteCategoryAdmin(categoryId) {
    if (!confirm('Удалить эту категорию?')) return;
    try {
        const res = window.authSystem.deleteCategory(categoryId);
        alert(res.message);
        loadCategories();
        // Обновляем список товаров, чтобы показать изменения
        loadProducts();
    } catch (error) {
        alert('Ошибка при удалении: ' + error.message);
    }
}

// Обработка формы категории
document.getElementById('categoryForm').addEventListener('submit', function (e) {
    e.preventDefault();
    try {
        const id = document.getElementById('categoryId').value || null;
        const key = document.getElementById('categoryKey').value;
        const name = document.getElementById('categoryName').value;
        const description = document.getElementById('categoryDescription').value;

        if (!key || !name) {
            alert('Ключ и название категории обязательны');
            return;
        }

        if (id) {
            // Обновление
            const updates = { key, name, description };
            const res = window.authSystem.updateCategory(id, updates);
            alert(res.message);
        } else {
            // Добавление
            const payload = { key, name, description };
            const res = window.authSystem.addCategory(payload);
            alert(res.message);
        }
        closeCategoryModal();
        loadCategories();
        // Обновляем список товаров, чтобы показать изменения в категориях
        loadProducts();
        // Сбрасываем фильтры, так как категории могли измениться
        resetProductFilters();
    } catch (error) {
        alert('Ошибка при сохранении: ' + error.message);
    }
});

let currentCategoryId = null;
