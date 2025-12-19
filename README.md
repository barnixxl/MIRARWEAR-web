# Mirar Wear - Clothing E-commerce Store

# Для запуска заходим на index.html и запускаем хост сервер 
- так как запуск осуществляется в сашего хоста, а не с моего сервера, то картинок нету и на сайте показаны базовые товары 

# Для входа в админ-панель: 
# логин 1238355@gmail.com 
# пароль barni_xxl

## LINK: place to the future link
## ✨ Features

### 🔐 Authentication System
- **User Registration** with email, phone, and password
- **Login System** for users and administrators
- **Logout functionality**
- **Automatic authentication check** on page load

### 👑 Admin System
- **Unified login form** - admins login through the same interface as users
- **Automatic role detection** - "Admin Panel" button appears only for admins
- **Add new administrators** by existing admins
- **User management** (view, delete users)
- **Order management** (view, change status, delete orders)
- **Product management** (add, edit, delete products with multiple images)
- **Statistics dashboard** with overview information

### 🛒 Order System
- **Order placement** (available for both authenticated and non-authenticated users)
- **Order storage** in localStorage
- **Form validation** for all inputs

### 💾 Data Storage
- All data is stored in browser **localStorage**
- **Users** - in key `mirar_shop_users`
- **Orders** - in key `mirar_shop_orders`
- **Admins** - in key `mirar_shop_admins`
- **Current user** - in key `mirar_shop_current_user`
- **Products** - in key `mirar_shop_products`
- **No server files** - everything works in the browser

## 📁 Project Structure

```
site/
├── index.html          # Main page
├── admin.html          # Admin panel
├── about.html          # About page
├── contact.html        # Contact page
├── css/
│   └── style.css       # Styles
├── js/
│   ├── auth.js         # Authentication and admin system
│   ├── main.js         # Main application logic
│   └── admin.js        # Admin panel logic
├── images/             # Images (backgrounds, product images)
│   ├── фон 1.jpg
│   ├── фон3.jpg
│   ├── фон4.jpg
│   ├── фон5.jpg
│   ├── фон6.png
│   └── Снимок экрана 2025-09-19 в 19.10.35.png
├── userstest.txt       # Test user credentials
└── README.md           # This file
```

## 🔧 Technical Details

- **Pure JavaScript** - no external dependencies
- **localStorage** for data persistence
- **Simple password hashing** (for demonstration purposes)
- **Client-side form validation**
- **Responsive design** for mobile devices
- **No server technologies** - works only in the browser

## 🎯 Key Features

- ✅ Data persists between sessions
- ✅ Complete authentication functionality
- ✅ Order management system
- ✅ Product management with multiple images
- ✅ Modern responsive design
- ✅ Admin dashboard with statistics

## 🚨 Important Notes

- Data is stored only in the user's browser
- Clearing browser data will result in loss of all information
- This is a demonstration version for local use only
- No server-side processing or database

## 🚀 Getting Started

1. Open `index.html` in your browser
2. Register as a new user or login with existing credentials
3. Browse products and place orders
4. For admin access, login with admin credentials and access the admin panel

## 📞 Support

If you encounter issues:
1. Check browser console (F12) for errors
2. Ensure all files are loaded correctly
3. Try clearing browser data and starting fresh