# 👑 Mirar Wear Admin System Guide

## 🚀 Quick Start

### 1. Creating the First Admin
1. Open `admin.html` in your browser
2. If no admin exists, the system will prompt you to create one
3. Fill out the form:
   - **Name**: Administrator name
   - **Email**: Email for login
   - **Password**: Password (minimum 6 characters)
4. Click "Create Admin"

### 2. Accessing Admin Panel
1. Open `index.html` (main page)
2. Click "Login" button in the menu
3. Enter admin email and password
4. Click "Login" - system automatically detects you're an admin
5. "Admin Panel" button appears in the menu
6. Click "Admin Panel" to access the management interface

## 🎛️ Admin Panel Features

### 📊 Dashboard
- **Statistics**: Total users, orders, admins count
- **Recent orders**: Last 5 orders
- **New users**: Last 5 registered users
- **Order status breakdown**

### 👥 User Management
- **View all users** with information:
  - User ID
  - Name
  - Email
  - Phone
  - Registration date
- **Delete users** (with confirmation)

### 🛒 Order Management
- **View all orders** with information:
  - Order ID
  - Customer data (name, email, phone)
  - Product information (product ID, size)
  - Order status
  - Order date
- **Change order status**:
  - New
  - Processing
  - Completed
  - Cancelled
- **Delete orders** (with confirmation)

### 🏷️ Product Management
- **Add new products** with:
  - Product name and description
  - Price and quantity
  - Multiple images upload
  - Size configuration (S, M, L, XL or single size)
- **Edit existing products**
- **Delete products** (with confirmation)
- **View product gallery** in admin table

### 👑 Admin Management
- **View all admins** with information:
  - Admin ID
  - Name
  - Email
  - Creation date
  - Created by
- **Add new admins**:
  - Name of new admin
  - Email for login
  - Password (minimum 6 characters)

## 🔐 Security

- **Access control**: Only admins can manage the system
- **Password hashing**: Passwords stored in encrypted form
- **Authorization checks**: Every action verifies access rights
- **Data validation**: All forms are validated for correctness

## 📱 Interface

### Navigation
- **Dashboard**: Overall statistics and recent data
- **Users**: User management
- **Orders**: Order management
- **Products**: Product management
- **Admins**: Administrator management

### Modal Windows
- **Change order status**: Select new status
- **Add admin**: Form for creating new admin
- **Add/Edit product**: Product form with image upload

## 🛠️ Technical Details

### Data Storage
- All data stored in browser `localStorage`
- **Admins**: `localStorage['mirar_shop_admins']`
- **Users**: `localStorage['mirar_shop_users']`
- **Orders**: `localStorage['mirar_shop_orders']`
- **Products**: `localStorage['mirar_shop_products']`
- **Current user**: `localStorage['mirar_shop_current_user']`
- **No server files** - everything works in the browser

### Admin Data Structure
```javascript
{
    id: "unique_id",
    name: "Admin Name",
    email: "email@example.com",
    password: "hashed_password",
    createdBy: "creator_id",
    createdDate: "2024-01-01T00:00:00.000Z"
}
```

### Product Data Structure
```javascript
{
    id: "unique_id",
    name: "Product Name",
    description: "Product description",
    price: 100,
    quantity: 50,
    oneSize: false,
    sizes: {
        S: {enabled: true},
        M: {enabled: true},
        L: {enabled: true},
        XL: {enabled: true}
    },
    images: ["data:image/jpeg;base64,...", "data:image/jpeg;base64,..."],
    createdDate: "2024-01-01T00:00:00.000Z",
    updatedDate: "2024-01-01T00:00:00.000Z"
}
```

## 🚨 Important Notes

1. **First admin**: Created through admin panel initialization
2. **Admin chain**: Each new admin is created by an existing admin
3. **Security**: Data stored only in browser, clearing data will result in loss
4. **Demo version**: This is a demonstration system for local use
5. **No servers**: Everything works in browser without PHP or other server technologies

## 🔄 Workflow

### Typical usage scenario:
1. **Create first admin** → Admin panel initialization
2. **Login to system** → Main page → "Login" → enter admin credentials
3. **Access admin panel** → "Admin Panel" (appears automatically)
4. **Add other admins** → Admin panel → "Admins" → "Add Admin"
5. **Manage products** → Admin panel → "Products" → Add/Edit products
6. **Manage orders** → Admin panel → "Orders"
7. **Manage users** → Admin panel → "Users"

## 📞 Support

If you encounter problems:
1. Check browser console (F12) for errors
2. Ensure all files are loaded correctly
3. Try clearing browser data and starting fresh
4. Verify localStorage permissions in browser settings