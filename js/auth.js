// Система авторизации и регистрации на JavaScript с localStorage

class AuthSystem {
    constructor() {
        this.usersKey = 'mirar_shop_users';
        this.currentUserKey = 'mirar_shop_current_user';
        this.ordersKey = 'mirar_shop_orders';
        this.adminsKey = 'mirar_shop_admins';
        this.productsKey = 'mirar_shop_products';
        this.categoriesKey = 'mirar_shop_categories';
        this.init();
    }

    // Инициализация системы
    init() {
        // Создаем пустой массив пользователей, если его нет
        if (!localStorage.getItem(this.usersKey)) {
            localStorage.setItem(this.usersKey, JSON.stringify([]));
        }
        
        // Создаем пустой массив заказов, если его нет
        if (!localStorage.getItem(this.ordersKey)) {
            localStorage.setItem(this.ordersKey, JSON.stringify([]));
        }
        
        // Создаем пустой массив админов, если его нет
        if (!localStorage.getItem(this.adminsKey)) {
            localStorage.setItem(this.adminsKey, JSON.stringify([]));
        }

        // Создаем пустой массив товаров, если его нет
        if (!localStorage.getItem(this.productsKey)) {
            localStorage.setItem(this.productsKey, JSON.stringify([]));
        }

        // Создаем пустой массив категорий, если его нет
        if (!localStorage.getItem(this.categoriesKey)) {
            localStorage.setItem(this.categoriesKey, JSON.stringify([]));
        }
    }

    // Получение всех пользователей
    getUsers() {
        const users = localStorage.getItem(this.usersKey);
        return users ? JSON.parse(users) : [];
    }

    // === КАТЕГОРИИ ===
    getCategories() {
        const categories = localStorage.getItem(this.categoriesKey);
        return categories ? JSON.parse(categories) : [];
    }

    saveCategories(categories) {
        localStorage.setItem(this.categoriesKey, JSON.stringify(categories));
    }

    // Добавление категории (только для админов)
    addCategory(categoryData) {
        if (!this.isAdmin()) {
            throw new Error('Доступ запрещен. Требуются права администратора');
        }

        const { key, name, description } = categoryData;

        if (!key || !name) {
            throw new Error('Ключ и название категории обязательны');
        }

        const categories = this.getCategories();
        
        // Проверяем, не существует ли уже категория с таким ключом
        if (categories.find(c => c.key === key)) {
            throw new Error('Категория с таким ключом уже существует');
        }

        const newCategory = {
            id: this.generateId(),
            key: key.trim(),
            name: name.trim(),
            description: (description || '').trim(),
            createdDate: new Date().toISOString(),
            updatedDate: new Date().toISOString()
        };

        categories.push(newCategory);
        this.saveCategories(categories);
        return { success: true, message: 'Категория добавлена', category: newCategory };
    }

    // Обновление категории (только для админов)
    updateCategory(categoryId, updates) {
        if (!this.isAdmin()) {
            throw new Error('Доступ запрещен. Требуются права администратора');
        }

        const categories = this.getCategories();
        const idx = categories.findIndex(c => c.id === categoryId);
        if (idx === -1) {
            throw new Error('Категория не найдена');
        }

        // Проверяем, не существует ли уже категория с таким ключом (если ключ изменился)
        if (updates.key && updates.key !== categories[idx].key) {
            if (categories.find(c => c.key === updates.key && c.id !== categoryId)) {
                throw new Error('Категория с таким ключом уже существует');
            }
        }

        categories[idx] = {
            ...categories[idx],
            ...updates,
            updatedDate: new Date().toISOString()
        };
        this.saveCategories(categories);
        return { success: true, message: 'Категория обновлена', category: categories[idx] };
    }

    // Удаление категории (только для админов)
    deleteCategory(categoryId) {
        if (!this.isAdmin()) {
            throw new Error('Доступ запрещен. Требуются права администратора');
        }

        const categories = this.getCategories();
        const idx = categories.findIndex(c => c.id === categoryId);
        if (idx === -1) {
            throw new Error('Категория не найдена');
        }

        // Проверяем, не используются ли товары с этой категорией
        const products = this.getProducts();
        const productsWithCategory = products.filter(p => p.category === categories[idx].key);
        if (productsWithCategory.length > 0) {
            throw new Error(`Нельзя удалить категорию, которая используется в ${productsWithCategory.length} товарах`);
        }

        const deleted = categories.splice(idx, 1)[0];
        this.saveCategories(categories);
        return { success: true, message: `Категория "${deleted.name}" удалена`, category: deleted };
    }

    // === ТОВАРЫ ===
    getProducts() {
        const products = localStorage.getItem(this.productsKey);
        return products ? JSON.parse(products) : [];
    }

    saveProducts(products) {
        localStorage.setItem(this.productsKey, JSON.stringify(products));
    }

    // Добавление товара (только для админов)
    addProduct(productData) {
        if (!this.isAdmin()) {
            throw new Error('Доступ запрещен. Требуются права администратора');
        }

        const {
            name,
            description,
            category,
            price,
            quantity,
            sizes, // объект вида { S: {enabled:true}, M:{enabled:false}, ... }
            imageDataUrl, // data URL изображения
            oneSize // boolean: единый размер
        } = productData;
        const images = Array.isArray(productData.images) ? productData.images.filter(Boolean) : [];

        if (!name || !price || !category) {
            throw new Error('Название, цена и категория обязательны');
        }

        const products = this.getProducts();
        const newProduct = {
            id: this.generateId(),
            name: name.trim(),
            description: (description || '').trim(),
            category: category.trim(),
            price: Number(price),
            quantity: Number(quantity || 0),
            oneSize: !!oneSize,
            sizes: oneSize ? null : (sizes || { S:{enabled:true}, M:{enabled:true}, L:{enabled:true}, XL:{enabled:true} }),
            // миграция: если пришел старый imageDataUrl, кладем как первый элемент
            images: images.length ? images : (imageDataUrl ? [imageDataUrl] : []),
            createdDate: new Date().toISOString(),
            updatedDate: new Date().toISOString()
        };

        products.push(newProduct);
        this.saveProducts(products);
        return { success: true, message: 'Товар добавлен', product: newProduct };
    }

    // Обновление товара (только для админов)
    updateProduct(productId, updates) {
        if (!this.isAdmin()) {
            throw new Error('Доступ запрещен. Требуются права администратора');
        }

        const products = this.getProducts();
        const idx = products.findIndex(p => p.id === productId);
        if (idx === -1) {
            throw new Error('Товар не найден');
        }

        const original = products[idx];
        const nextOneSize = updates.oneSize !== undefined ? !!updates.oneSize : !!original.oneSize;
        const nextSizes = nextOneSize ? null : (updates.sizes || original.sizes);
        const nextImages = Array.isArray(updates.images)
            ? updates.images.filter(Boolean)
            : (original.images || (original.imageDataUrl ? [original.imageDataUrl] : []));

        products[idx] = {
            ...original,
            ...updates,
            price: updates.price !== undefined ? Number(updates.price) : original.price,
            quantity: updates.quantity !== undefined ? Number(updates.quantity) : original.quantity,
            oneSize: nextOneSize,
            sizes: nextSizes,
            images: nextImages,
            updatedDate: new Date().toISOString()
        };
        this.saveProducts(products);
        return { success: true, message: 'Товар обновлен', product: products[idx] };
    }

    // Удаление товара (только для админов)
    deleteProduct(productId) {
        if (!this.isAdmin()) {
            throw new Error('Доступ запрещен. Требуются права администратора');
        }

        const products = this.getProducts();
        const idx = products.findIndex(p => p.id === productId);
        if (idx === -1) {
            throw new Error('Товар не найден');
        }
        const deleted = products.splice(idx, 1)[0];
        this.saveProducts(products);
        return { success: true, message: `Товар "${deleted.name}" удален`, product: deleted };
    }

    // Сохранение пользователей
    saveUsers(users) {
        localStorage.setItem(this.usersKey, JSON.stringify(users));
    }

    // Получение всех заказов
    getOrders() {
        const orders = localStorage.getItem(this.ordersKey);
        return orders ? JSON.parse(orders) : [];
    }

    // Сохранение заказов
    saveOrders(orders) {
        localStorage.setItem(this.ordersKey, JSON.stringify(orders));
    }

    // Получение всех админов
    getAdmins() {
        const admins = localStorage.getItem(this.adminsKey);
        return admins ? JSON.parse(admins) : [];
    }

    // Сохранение админов
    saveAdmins(admins) {
        localStorage.setItem(this.adminsKey, JSON.stringify(admins));
    }

    // Простое хеширование пароля (для демонстрации)
    hashPassword(password) {
        let hash = 0;
        for (let i = 0; i < password.length; i++) {
            const char = password.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32bit integer
        }
        return hash.toString();
    }

    // Регистрация нового пользователя
    register(userData) {
        const { name, email, phone, password } = userData;
        
        // Валидация данных
        if (!name || !email || !phone || !password) {
            throw new Error('Все поля обязательны для заполнения');
        }

        if (!this.isValidEmail(email)) {
            throw new Error('Некорректный email адрес');
        }

        if (password.length < 6) {
            throw new Error('Пароль должен содержать минимум 6 символов');
        }

        // Проверяем, существует ли пользователь с таким email
        const users = this.getUsers();
        const existingUser = users.find(user => user.email === email);
        
        if (existingUser) {
            throw new Error('Пользователь с таким email уже существует');
        }

        // Создаем нового пользователя
        const newUser = {
            id: this.generateId(),
            name: name.trim(),
            email: email.trim().toLowerCase(),
            phone: phone.trim(),
            password: this.hashPassword(password),
            registrationDate: new Date().toISOString()
        };

        // Добавляем пользователя
        users.push(newUser);
        this.saveUsers(users);

        return {
            success: true,
            message: 'Регистрация успешно завершена! Теперь вы можете войти в систему.',
            user: {
                id: newUser.id,
                name: newUser.name,
                email: newUser.email,
                phone: newUser.phone
            }
        };
    }

    // Вход в систему
    login(email, password) {
        if (!email || !password) {
            throw new Error('Введите email и пароль');
        }

        if (!this.isValidEmail(email)) {
            throw new Error('Некорректный email адрес');
        }

        const users = this.getUsers();
        const user = users.find(u => u.email === email.trim().toLowerCase());

        if (!user) {
            throw new Error('Пользователь с таким email не найден');
        }

        if (user.password !== this.hashPassword(password)) {
            throw new Error('Неверный пароль');
        }

        // Сохраняем текущего пользователя
        const currentUser = {
            id: user.id,
            name: user.name,
            email: user.email,
            phone: user.phone
        };
        
        localStorage.setItem(this.currentUserKey, JSON.stringify(currentUser));

        return {
            success: true,
            message: 'Вход выполнен успешно!',
            user: currentUser
        };
    }

    // Выход из системы
    logout() {
        localStorage.removeItem(this.currentUserKey);
        return {
            success: true,
            message: 'Выход выполнен успешно'
        };
    }

    // Вход админа
    adminLogin(email, password) {
        if (!email || !password) {
            throw new Error('Введите email и пароль');
        }

        if (!this.isValidEmail(email)) {
            throw new Error('Некорректный email адрес');
        }

        const admins = this.getAdmins();
        const admin = admins.find(a => a.email === email.trim().toLowerCase());

        if (!admin) {
            throw new Error('Админ с таким email не найден');
        }

        if (admin.password !== this.hashPassword(password)) {
            throw new Error('Неверный пароль');
        }

        // Сохраняем текущего админа
        const currentAdmin = {
            id: admin.id,
            name: admin.name,
            email: admin.email,
            role: 'admin',
            createdBy: admin.createdBy
        };
        
        localStorage.setItem(this.currentUserKey, JSON.stringify(currentAdmin));

        return {
            success: true,
            message: 'Вход в админ-панель выполнен успешно!',
            admin: currentAdmin
        };
    }

    // Добавление нового админа (только для существующих админов)
    addAdmin(adminData) {
        const currentUser = this.getCurrentUser();
        
        if (!currentUser || currentUser.role !== 'admin') {
            throw new Error('Только админы могут добавлять новых админов');
        }

        const { name, email, password } = adminData;
        
        // Валидация данных
        if (!name || !email || !password) {
            throw new Error('Все поля обязательны для заполнения');
        }

        if (!this.isValidEmail(email)) {
            throw new Error('Некорректный email адрес');
        }

        if (password.length < 6) {
            throw new Error('Пароль должен содержать минимум 6 символов');
        }

        // Проверяем, существует ли админ с таким email
        const admins = this.getAdmins();
        const existingAdmin = admins.find(admin => admin.email === email.trim().toLowerCase());
        
        if (existingAdmin) {
            throw new Error('Админ с таким email уже существует');
        }

        // Создаем нового админа
        const newAdmin = {
            id: this.generateId(),
            name: name.trim(),
            email: email.trim().toLowerCase(),
            password: this.hashPassword(password),
            createdBy: currentUser.id,
            createdDate: new Date().toISOString()
        };

        // Добавляем админа
        admins.push(newAdmin);
        this.saveAdmins(admins);

        return {
            success: true,
            message: `Админ ${newAdmin.name} успешно добавлен! Новый админ может войти в систему с email: ${newAdmin.email}`,
            admin: {
                id: newAdmin.id,
                name: newAdmin.name,
                email: newAdmin.email,
                createdBy: newAdmin.createdBy
            }
        };
    }

    // Удаление админа (только для админов, нельзя удалить самого себя/последнего админа)
    deleteAdmin(adminId) {
        if (!this.isAdmin()) {
            throw new Error('Access denied. Admin rights required');
        }
        const currentUser = this.getCurrentUser();
        const admins = this.getAdmins();

        // Предотвращаем удаление себя или последнего админа
        if (currentUser && currentUser.id === adminId) {
            throw new Error('Нельзя удалить себя');
        }
        if (admins.length <= 1) {
            throw new Error('Нельзя удалить последнего администратора');
        }
        const adminIdx = admins.findIndex(adm => adm.id === adminId);
        if (adminIdx === -1) {
            throw new Error('Админ не найден');
        }
        const removed = admins.splice(adminIdx, 1)[0];
        this.saveAdmins(admins);
        return { success: true, message: `Админ ${removed.name} удалён`, admin: removed };
    }

    // Проверка, является ли текущий пользователь админом
    isAdmin() {
        const currentUser = this.getCurrentUser();
        return currentUser && currentUser.role === 'admin';
    }

    // Получение текущего пользователя
    getCurrentUser() {
        const user = localStorage.getItem(this.currentUserKey);
        return user ? JSON.parse(user) : null;
    }

    // Проверка авторизации
    isAuthenticated() {
        return this.getCurrentUser() !== null;
    }

    // Создание заказа
    createOrder(orderData) {
        const { name, phone, email, productId, size } = orderData;
        
        // Валидация данных
        if (!name || !phone || !email || !productId) {
            throw new Error('Все поля обязательны для заполнения');
        }

        if (!this.isValidEmail(email)) {
            throw new Error('Некорректный email адрес');
        }

        const currentUser = this.getCurrentUser();
        // Проверяем товар на единый размер
        let finalSize = size;
        try {
            const product = this.getProducts().find(p => p.id === productId);
            if (product && product.oneSize) {
                finalSize = 'Единый';
            }
        } catch (_) {}
        const orders = this.getOrders();

        const newOrder = {
            id: this.generateId(),
            userId: currentUser ? currentUser.id : null,
            customerName: name.trim(),
            customerPhone: phone.trim(),
            customerEmail: email.trim().toLowerCase(),
            productId: productId,
            size: finalSize,
            orderDate: new Date().toISOString(),
            status: 'Новый'
        };

        orders.push(newOrder);
        this.saveOrders(orders);

        return {
            success: true,
            message: 'Заказ успешно создан! Мы свяжемся с вами в ближайшее время.',
            order: newOrder
        };
    }

    // Получение заказов пользователя
    getUserOrders() {
        const currentUser = this.getCurrentUser();
        if (!currentUser) {
            throw new Error('Требуется авторизация');
        }

        const orders = this.getOrders();
        return orders.filter(order => order.userId === currentUser.id);
    }

    // Вспомогательные методы
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    // === МЕТОДЫ ДЛЯ АДМИНИСТРИРОВАНИЯ ===

    // Получение всех пользователей (только для админов)
    getAllUsers() {
        if (!this.isAdmin()) {
            throw new Error('Доступ запрещен. Требуются права администратора');
        }
        return this.getUsers();
    }

    // Удаление пользователя (только для админов)
    deleteUser(userId) {
        if (!this.isAdmin()) {
            throw new Error('Доступ запрещен. Требуются права администратора');
        }

        const users = this.getUsers();
        const userIndex = users.findIndex(user => user.id === userId);
        
        if (userIndex === -1) {
            throw new Error('Пользователь не найден');
        }

        const deletedUser = users.splice(userIndex, 1)[0];
        this.saveUsers(users);

        return {
            success: true,
            message: `Пользователь ${deletedUser.name} удален`,
            user: deletedUser
        };
    }

    // Получение всех заказов (только для админов)
    getAllOrders() {
        if (!this.isAdmin()) {
            throw new Error('Доступ запрещен. Требуются права администратора');
        }
        return this.getOrders();
    }

    // Обновление статуса заказа (только для админов)
    updateOrderStatus(orderId, newStatus) {
        if (!this.isAdmin()) {
            throw new Error('Доступ запрещен. Требуются права администратора');
        }

        const orders = this.getOrders();
        const orderIndex = orders.findIndex(order => order.id === orderId);
        
        if (orderIndex === -1) {
            throw new Error('Заказ не найден');
        }

        orders[orderIndex].status = newStatus;
        orders[orderIndex].updatedDate = new Date().toISOString();
        this.saveOrders(orders);

        return {
            success: true,
            message: `Статус заказа обновлен на: ${newStatus}`,
            order: orders[orderIndex]
        };
    }

    // Удаление заказа (только для админов)
    deleteOrder(orderId) {
        if (!this.isAdmin()) {
            throw new Error('Доступ запрещен. Требуются права администратора');
        }

        const orders = this.getOrders();
        const orderIndex = orders.findIndex(order => order.id === orderId);
        
        if (orderIndex === -1) {
            throw new Error('Заказ не найден');
        }

        const deletedOrder = orders.splice(orderIndex, 1)[0];
        this.saveOrders(orders);

        return {
            success: true,
            message: 'Заказ удален',
            order: deletedOrder
        };
    }

    // Получение статистики (только для админов)
    getStatistics() {
        if (!this.isAdmin()) {
            throw new Error('Доступ запрещен. Требуются права администратора');
        }

        const users = this.getUsers();
        const orders = this.getOrders();
        const admins = this.getAdmins();

        // Статистика по статусам заказов
        const orderStats = orders.reduce((stats, order) => {
            stats[order.status] = (stats[order.status] || 0) + 1;
            return stats;
        }, {});

        return {
            totalUsers: users.length,
            totalOrders: orders.length,
            totalAdmins: admins.length,
            orderStats: orderStats,
            recentOrders: orders.slice(-5).reverse(), // Последние 5 заказов
            recentUsers: users.slice(-5).reverse() // Последние 5 пользователей
        };
    }
}

// Создаем глобальный экземпляр системы авторизации
window.authSystem = new AuthSystem();
