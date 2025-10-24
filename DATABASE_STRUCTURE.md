# Рекомендации по структуре базы данных

## Текущее состояние (localStorage)

Сейчас все данные хранятся в localStorage браузера в следующих ключах:
- `mirar_shop_users` - пользователи
- `mirar_shop_orders` - заказы  
- `mirar_shop_admins` - администраторы
- `mirar_shop_products` - товары
- `mirar_shop_categories` - категории

## Рекомендуемая структура базы данных

### 1. **Пользователи (users)**
```sql
CREATE TABLE users (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(20),
    password_hash VARCHAR(255) NOT NULL,
    registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE
);
```

### 2. **Администраторы (admins)**
```sql
CREATE TABLE admins (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(36),
    is_active BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (created_by) REFERENCES admins(id)
);
```

### 3. **Категории (categories)**
```sql
CREATE TABLE categories (
    id VARCHAR(36) PRIMARY KEY,
    key VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE
);
```

### 4. **Товары (products)**
```sql
CREATE TABLE products (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    category_id VARCHAR(36) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    quantity INTEGER DEFAULT 0,
    one_size BOOLEAN DEFAULT FALSE,
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (category_id) REFERENCES categories(id)
);
```

### 5. **Размеры товаров (product_sizes)**
```sql
CREATE TABLE product_sizes (
    id VARCHAR(36) PRIMARY KEY,
    product_id VARCHAR(36) NOT NULL,
    size VARCHAR(10) NOT NULL,
    enabled BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);
```

### 6. **Изображения товаров (product_images)**
```sql
CREATE TABLE product_images (
    id VARCHAR(36) PRIMARY KEY,
    product_id VARCHAR(36) NOT NULL,
    image_url TEXT NOT NULL,
    image_order INTEGER DEFAULT 0,
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);
```

### 7. **Заказы (orders)**
```sql
CREATE TABLE orders (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36),
    customer_name VARCHAR(100) NOT NULL,
    customer_email VARCHAR(100) NOT NULL,
    customer_phone VARCHAR(20) NOT NULL,
    product_id VARCHAR(36) NOT NULL,
    size VARCHAR(10),
    quantity INTEGER DEFAULT 1,
    total_price DECIMAL(10,2) NOT NULL,
    status VARCHAR(20) DEFAULT 'Новый',
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (product_id) REFERENCES products(id)
);
```

## Альтернативные варианты БД

### 1. **SQLite (рекомендуется для начала)**
- Легко настроить
- Не требует сервера БД
- Хорошо подходит для небольших проектов
- Можно мигрировать на PostgreSQL/MySQL позже

### 2. **PostgreSQL (для продакшена)**
- Мощная реляционная БД
- Отличная поддержка JSON
- Хорошая производительность
- Поддержка полнотекстового поиска

### 3. **MongoDB (NoSQL вариант)**
```javascript
// Коллекция products
{
  _id: ObjectId,
  name: "Классическая шапка",
  category: {
    key: "hat",
    name: "Шапка"
  },
  price: 150,
  sizes: {
    S: {enabled: true},
    M: {enabled: true}
  },
  images: ["url1", "url2"],
  created_at: ISODate
}
```

## Рекомендации по миграции

### Этап 1: Подготовка
1. Создать скрипт экспорта данных из localStorage
2. Создать схему БД
3. Написать скрипт импорта данных

### Этап 2: Backend API
1. Создать REST API на Node.js/Express или Python/Flask
2. Эндпоинты:
   - `GET /api/products` - получить товары
   - `POST /api/products` - создать товар
   - `GET /api/categories` - получить категории
   - `POST /api/orders` - создать заказ

### Этап 3: Фронтенд
1. Заменить localStorage на API вызовы
2. Добавить обработку ошибок
3. Добавить индикаторы загрузки

## Пример структуры проекта

```
mirar-shop/
├── frontend/           # React/Vue/Angular приложение
│   ├── src/
│   ├── public/
│   └── package.json
├── backend/           # Node.js/Python API
│   ├── src/
│   │   ├── models/    # Модели БД
│   │   ├── routes/    # API роуты
│   │   ├── controllers/
│   │   └── middleware/
│   ├── migrations/    # Миграции БД
│   └── package.json
├── database/          # SQL скрипты
│   ├── schema.sql
│   └── seed.sql
└── docker-compose.yml # Для локальной разработки
```

## Следующие шаги

1. **Выбрать технологию БД** (SQLite для начала)
2. **Создать схему БД** по предложенной структуре
3. **Написать скрипт миграции** из localStorage
4. **Создать простой API** для работы с данными
5. **Обновить фронтенд** для работы с API
