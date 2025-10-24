// Скрипт для инициализации базы данных товаров с примерами

function initSampleProducts() {
    // Проверяем, есть ли уже товары
    const existingProducts = localStorage.getItem('mirar_shop_products');
    if (existingProducts && JSON.parse(existingProducts).length > 0) {
        console.log('Товары уже существуют, пропускаем инициализацию');
        return;
    }

    const sampleProducts = [
        {
            id: 'prod_1',
            name: 'Классическая шапка',
            description: 'Теплая вязаная шапка для холодной погоды',
            category: 'hat',
            price: 150,
            quantity: 20,
            oneSize: true,
            sizes: null,
            images: [],
            createdDate: new Date().toISOString(),
            updatedDate: new Date().toISOString()
        },
        {
            id: 'prod_2',
            name: 'Удобная кофта',
            description: 'Мягкая кофта из качественного материала',
            category: 'sweater',
            price: 800,
            quantity: 15,
            oneSize: false,
            sizes: {
                S: { enabled: true },
                M: { enabled: true },
                L: { enabled: true },
                XL: { enabled: false }
            },
            images: [],
            createdDate: new Date().toISOString(),
            updatedDate: new Date().toISOString()
        },
        {
            id: 'prod_3',
            name: 'Спортивная майка',
            description: 'Дышащая майка для занятий спортом',
            category: 't-shirt',
            price: 300,
            quantity: 30,
            oneSize: false,
            sizes: {
                S: { enabled: true },
                M: { enabled: true },
                L: { enabled: true },
                XL: { enabled: true }
            },
            images: [],
            createdDate: new Date().toISOString(),
            updatedDate: new Date().toISOString()
        },
        {
            id: 'prod_4',
            name: 'Джинсы классические',
            description: 'Удобные джинсы для повседневной носки',
            category: 'pants',
            price: 1200,
            quantity: 25,
            oneSize: false,
            sizes: {
                S: { enabled: true },
                M: { enabled: true },
                L: { enabled: true },
                XL: { enabled: true }
            },
            images: [],
            createdDate: new Date().toISOString(),
            updatedDate: new Date().toISOString()
        },
        {
            id: 'prod_5',
            name: 'Теплые носки',
            description: 'Мягкие носки из шерсти',
            category: 'socks',
            price: 100,
            quantity: 50,
            oneSize: true,
            sizes: null,
            images: [],
            createdDate: new Date().toISOString(),
            updatedDate: new Date().toISOString()
        },
        {
            id: 'prod_6',
            name: 'Семейные трусы',
            description: 'Удобное нижнее белье',
            category: 'underwear',
            price: 200,
            quantity: 40,
            oneSize: false,
            sizes: {
                S: { enabled: true },
                M: { enabled: true },
                L: { enabled: true },
                XL: { enabled: true }
            },
            images: [],
            createdDate: new Date().toISOString(),
            updatedDate: new Date().toISOString()
        },
        {
            id: 'prod_7',
            name: 'Демисезонная куртка',
            description: 'Легкая куртка для межсезонья',
            category: 'jacket',
            price: 1500,
            quantity: 10,
            oneSize: false,
            sizes: {
                S: { enabled: true },
                M: { enabled: true },
                L: { enabled: true },
                XL: { enabled: false }
            },
            images: [],
            createdDate: new Date().toISOString(),
            updatedDate: new Date().toISOString()
        },
        {
            id: 'prod_8',
            name: 'Летние шорты',
            description: 'Легкие шорты для жаркой погоды',
            category: 'shorts',
            price: 400,
            quantity: 35,
            oneSize: false,
            sizes: {
                S: { enabled: true },
                M: { enabled: true },
                L: { enabled: true },
                XL: { enabled: true }
            },
            images: [],
            createdDate: new Date().toISOString(),
            updatedDate: new Date().toISOString()
        }
    ];

    // Сохраняем товары в localStorage
    localStorage.setItem('mirar_shop_products', JSON.stringify(sampleProducts));
    console.log('Инициализированы примеры товаров:', sampleProducts.length);
}

// Запускаем инициализацию при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    initSampleProducts();
});
