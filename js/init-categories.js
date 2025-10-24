// Скрипт для инициализации базовых категорий

function initSampleCategories() {
    // Проверяем, есть ли уже категории
    const existingCategories = localStorage.getItem('mirar_shop_categories');
    if (existingCategories && JSON.parse(existingCategories).length > 0) {
        console.log('Категории уже существуют, пропускаем инициализацию');
        return;
    }

    const sampleCategories = [
        {
            id: 'cat_1',
            key: 'hat',
            name: 'Шапка',
            description: 'Головные уборы для защиты от холода',
            createdDate: new Date().toISOString(),
            updatedDate: new Date().toISOString()
        },
        {
            id: 'cat_2',
            key: 'sweater',
            name: 'Кофта',
            description: 'Теплая верхняя одежда',
            createdDate: new Date().toISOString(),
            updatedDate: new Date().toISOString()
        },
        {
            id: 'cat_3',
            key: 't-shirt',
            name: 'Майка',
            description: 'Легкая верхняя одежда',
            createdDate: new Date().toISOString(),
            updatedDate: new Date().toISOString()
        },
        {
            id: 'cat_4',
            key: 'pants',
            name: 'Штаны',
            description: 'Нижняя часть одежды',
            createdDate: new Date().toISOString(),
            updatedDate: new Date().toISOString()
        },
        {
            id: 'cat_5',
            key: 'socks',
            name: 'Носки',
            description: 'Одежда для ног',
            createdDate: new Date().toISOString(),
            updatedDate: new Date().toISOString()
        },
        {
            id: 'cat_6',
            key: 'underwear',
            name: 'Нижнее белье',
            description: 'Интимная одежда',
            createdDate: new Date().toISOString(),
            updatedDate: new Date().toISOString()
        },
        {
            id: 'cat_7',
            key: 'jacket',
            name: 'Куртка',
            description: 'Верхняя одежда с застежкой',
            createdDate: new Date().toISOString(),
            updatedDate: new Date().toISOString()
        },
        {
            id: 'cat_8',
            key: 'shorts',
            name: 'Шорты',
            description: 'Короткие штаны',
            createdDate: new Date().toISOString(),
            updatedDate: new Date().toISOString()
        }
    ];

    // Сохраняем категории в localStorage
    localStorage.setItem('mirar_shop_categories', JSON.stringify(sampleCategories));
    console.log('Инициализированы базовые категории:', sampleCategories.length);
}

// Запускаем инициализацию при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    initSampleCategories();
});
