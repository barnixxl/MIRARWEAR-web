// Скрипт для экспорта данных из localStorage в JSON файлы
// Используйте этот скрипт для миграции данных в базу данных

function exportAllData() {
    const data = {
        users: JSON.parse(localStorage.getItem('mirar_shop_users') || '[]'),
        admins: JSON.parse(localStorage.getItem('mirar_shop_admins') || '[]'),
        categories: JSON.parse(localStorage.getItem('mirar_shop_categories') || '[]'),
        products: JSON.parse(localStorage.getItem('mirar_shop_products') || '[]'),
        orders: JSON.parse(localStorage.getItem('mirar_shop_orders') || '[]')
    };

    // Создаем JSON файл для скачивания
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    // Создаем ссылку для скачивания
    const a = document.createElement('a');
    a.href = url;
    a.download = `mirar-shop-data-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    console.log('Данные экспортированы:', data);
    return data;
}

// Функция для импорта данных (для тестирования)
function importData(jsonData) {
    try {
        const data = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData;
        
        if (data.users) localStorage.setItem('mirar_shop_users', JSON.stringify(data.users));
        if (data.admins) localStorage.setItem('mirar_shop_admins', JSON.stringify(data.admins));
        if (data.categories) localStorage.setItem('mirar_shop_categories', JSON.stringify(data.categories));
        if (data.products) localStorage.setItem('mirar_shop_products', JSON.stringify(data.products));
        if (data.orders) localStorage.setItem('mirar_shop_orders', JSON.stringify(data.orders));
        
        console.log('Данные импортированы успешно');
        return true;
    } catch (error) {
        console.error('Ошибка при импорте данных:', error);
        return false;
    }
}

// Функция для создания SQL скриптов
function generateSQLScripts() {
    const data = {
        users: JSON.parse(localStorage.getItem('mirar_shop_users') || '[]'),
        admins: JSON.parse(localStorage.getItem('mirar_shop_admins') || '[]'),
        categories: JSON.parse(localStorage.getItem('mirar_shop_categories') || '[]'),
        products: JSON.parse(localStorage.getItem('mirar_shop_products') || '[]'),
        orders: JSON.parse(localStorage.getItem('mirar_shop_orders') || '[]')
    };

    let sql = '-- SQL скрипт для импорта данных Mirar Shop\n\n';
    
    // Категории
    if (data.categories.length > 0) {
        sql += '-- Категории\n';
        data.categories.forEach(cat => {
            sql += `INSERT INTO categories (id, key, name, description, created_date, updated_date) VALUES `;
            sql += `('${cat.id}', '${cat.key}', '${cat.name}', '${cat.description || ''}', '${cat.createdDate}', '${cat.updatedDate}');\n`;
        });
        sql += '\n';
    }

    // Пользователи
    if (data.users.length > 0) {
        sql += '-- Пользователи\n';
        data.users.forEach(user => {
            sql += `INSERT INTO users (id, name, email, phone, password_hash, registration_date) VALUES `;
            sql += `('${user.id}', '${user.name}', '${user.email}', '${user.phone}', '${user.password}', '${user.registrationDate}');\n`;
        });
        sql += '\n';
    }

    // Админы
    if (data.admins.length > 0) {
        sql += '-- Администраторы\n';
        data.admins.forEach(admin => {
            sql += `INSERT INTO admins (id, name, email, password_hash, created_date, created_by) VALUES `;
            sql += `('${admin.id}', '${admin.name}', '${admin.email}', '${admin.password}', '${admin.createdDate}', ${admin.createdBy ? `'${admin.createdBy}'` : 'NULL'});\n`;
        });
        sql += '\n';
    }

    // Товары
    if (data.products.length > 0) {
        sql += '-- Товары\n';
        data.products.forEach(product => {
            sql += `INSERT INTO products (id, name, description, category_id, price, quantity, one_size, created_date, updated_date) VALUES `;
            sql += `('${product.id}', '${product.name}', '${product.description || ''}', '${product.category}', ${product.price}, ${product.quantity}, ${product.oneSize}, '${product.createdDate}', '${product.updatedDate}');\n`;
        });
        sql += '\n';
    }

    // Заказы
    if (data.orders.length > 0) {
        sql += '-- Заказы\n';
        data.orders.forEach(order => {
            sql += `INSERT INTO orders (id, user_id, customer_name, customer_email, customer_phone, product_id, size, quantity, total_price, status, order_date) VALUES `;
            sql += `('${order.id}', ${order.userId ? `'${order.userId}'` : 'NULL'}, '${order.customerName}', '${order.customerEmail}', '${order.customerPhone}', '${order.productId}', '${order.size}', ${order.quantity || 1}, ${order.totalPrice || 0}, '${order.status}', '${order.orderDate}');\n`;
        });
    }

    // Создаем файл для скачивания
    const blob = new Blob([sql], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `mirar-shop-data-${new Date().toISOString().split('T')[0]}.sql`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    console.log('SQL скрипт создан');
    return sql;
}

// Добавляем функции в глобальную область видимости для использования в консоли
window.exportAllData = exportAllData;
window.importData = importData;
window.generateSQLScripts = generateSQLScripts;

console.log('Функции экспорта данных загружены:');
console.log('- exportAllData() - экспорт всех данных в JSON');
console.log('- generateSQLScripts() - создание SQL скриптов');
console.log('- importData(jsonData) - импорт данных из JSON');
