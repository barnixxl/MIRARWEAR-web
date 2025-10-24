// JavaScript для админ-панели

let currentOrderId = null;
let currentProductId = null;

// Проверка авторизации админа при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
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
    switch(sectionName) {
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
    }
}

// Загрузка дашборда
function loadDashboard() {
    try {
        const stats = window.authSystem.getStatistics();
        
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
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Клиент</th>
                            <th>Товар</th>
                            <th>Статус</th>
                            <th>Дата</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${stats.recentOrders.map(order => `
                            <tr>
                                <td>${order.id.substring(0, 8)}...</td>
                                <td>${order.customerName}</td>
                                <td>Товар ${order.productId}</td>
                                <td><span class="status-badge status-${order.status.toLowerCase().replace(' ', '')}">${order.status}</span></td>
                                <td>${new Date(order.orderDate).toLocaleDateString()}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            `;
        } else {
            recentOrdersDiv.innerHTML = '<p>Нет заказов</p>';
        }
        
        // Показываем новых пользователей
        const recentUsersDiv = document.getElementById('recentUsers');
        if (stats.recentUsers.length > 0) {
            recentUsersDiv.innerHTML = `
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Имя</th>
                            <th>Email</th>
                            <th>Телефон</th>
                            <th>Дата регистрации</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${stats.recentUsers.map(user => `
                            <tr>
                                <td>${user.name}</td>
                                <td>${user.email}</td>
                                <td>${user.phone}</td>
                                <td>${new Date(user.registrationDate).toLocaleDateString()}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            `;
        } else {
            recentUsersDiv.innerHTML = '<p>Нет пользователей</p>';
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
        const orders = window.authSystem.getAllOrders();
        const ordersTable = document.getElementById('ordersTable');
        
        if (orders.length > 0) {
            ordersTable.innerHTML = `
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>ID</th>
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
                                <td>${order.id.substring(0, 8)}...</td>
                                <td>${order.customerName}</td>
                                <td>${order.customerEmail}</td>
                                <td>${order.customerPhone}</td>
                                <td>Товар ${order.productId}</td>
                                <td>${order.size}</td>
                                <td><span class="status-badge status-${order.status.toLowerCase().replace(' ', '')}">${order.status}</span></td>
                                <td>${new Date(order.orderDate).toLocaleDateString()}</td>
                                <td>
                                    <button onclick="openOrderStatusModal('${order.id}')" class="btn btn-warning">
                                        <i class="fas fa-edit"></i> Статус
                                    </button>
                                    <button onclick="deleteOrder('${order.id}')" class="btn btn-danger">
                                        <i class="fas fa-trash"></i> Удалить
                                    </button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
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
        
        if (admins.length > 0) {
            adminsTable.innerHTML = `
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Имя</th>
                            <th>Email</th>
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
                                <td>${new Date(admin.createdDate).toLocaleDateString()}</td>
                                <td>${admin.createdBy ? admin.createdBy.substring(0, 8) + '...' : 'Система'}</td>
                                <td>
                                    <button onclick="deleteAdmin('${admin.id}')" class="btn btn-danger"><i class='fas fa-trash'></i> Удалить</button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
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

// Открытие модального окна изменения статуса заказа
function openOrderStatusModal(orderId) {
    currentOrderId = orderId;
    document.getElementById('orderStatusModal').style.display = 'block';
}

// Закрытие модального окна изменения статуса заказа
function closeOrderStatusModal() {
    document.getElementById('orderStatusModal').style.display = 'none';
    currentOrderId = null;
}

// Обработка формы изменения статуса заказа
document.getElementById('orderStatusForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    if (!currentOrderId) {
        alert('Ошибка: ID заказа не найден');
        return;
    }
    
    const newStatus = document.getElementById('newStatus').value;
    
    try {
        const result = window.authSystem.updateOrderStatus(currentOrderId, newStatus);
        alert(result.message);
        closeOrderStatusModal();
        loadOrders();
        loadDashboard(); // Обновляем дашборд
    } catch (error) {
        alert('Ошибка при обновлении статуса: ' + error.message);
    }
});

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
document.getElementById('addAdminForm').addEventListener('submit', function(e) {
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
window.addEventListener('click', function(e) {
    if (e.target.classList.contains('modal')) {
        e.target.style.display = 'none';
    }
});

// ======= Управление товарами =======
function loadProducts() {
    try {
        const products = window.authSystem.getProducts();
        const productsTable = document.getElementById('productsTable');

        if (!productsTable) return;

        if (products.length === 0) {
            productsTable.innerHTML = '<p>Товары не найдены</p>';
            return;
        }

        productsTable.innerHTML = `
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Картинка</th>
                        <th>Название</th>
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
                            <td>${Number(p.price).toLocaleString('ru-RU', {style:'currency', currency:'RUB'})}</td>
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
        `;
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

function openProductModal() {
    currentProductId = null;
    document.getElementById('productModalTitle').textContent = 'Добавить товар';
    document.getElementById('productForm').reset();
    // По умолчанию включим все размеры
    setSizeCheckboxes({ S:true, M:true, L:true, XL:true });
    const oneSizeCb = document.getElementById('oneSize');
    if (oneSizeCb) oneSizeCb.checked = false;
    toggleSizesDisabled(false);
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
    ['sizeS','sizeM','sizeL','sizeXL'].forEach(id => {
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
        const price = document.getElementById('productPrice').value;
        const quantity = document.getElementById('productQuantity').value;
        const oneSize = document.getElementById('oneSize').checked;
        const sizes = {
            S: { enabled: document.getElementById('sizeS').checked },
            M: { enabled: document.getElementById('sizeM').checked },
            L: { enabled: document.getElementById('sizeL').checked },
            XL:{ enabled: document.getElementById('sizeXL').checked }
        };

        const imagesInput = document.getElementById('productImages');
        const files = imagesInput && imagesInput.files ? Array.from(imagesInput.files) : [];

        // Простая валидация
        if (!name || name.trim() === '') {
            alert('Введите название товара');
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
                saveProduct({ id, name, description, price: priceNum, quantity: qtyNum, sizes, oneSize, images });
            }).catch(err => {
                alert('Ошибка при чтении изображений: ' + err.message);
            });
        } else {
            // Без изменения изображений
            saveProduct({ id, name, description, price: priceNum, quantity: qtyNum, sizes, oneSize });
        }
    } catch (error) {
        alert('Ошибка при сохранении товара: ' + error.message);
    }
}

function saveProduct({ id, name, description, price, quantity, sizes, oneSize, images, imageDataUrl }) {
    try {
        if (id) {
            // Обновление
            const updates = { name, description, price, quantity, sizes };
            if (oneSize !== undefined) updates.oneSize = !!oneSize;
            if (Array.isArray(images) && images.length) updates.images = images;
            if (imageDataUrl) updates.imageDataUrl = imageDataUrl;
            const res = window.authSystem.updateProduct(id, updates);
            alert(res.message);
        } else {
            // Добавление
            const payload = { name, description, price, quantity, sizes, oneSize };
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
