require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Menu = require('./models/Menu');
const Table = require('./models/Table');

const seedData = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Connected');

        // Clear existing data
        await User.deleteMany({});
        await Menu.deleteMany({});
        await Table.deleteMany({});
        console.log('Cleared existing data');

        // Create admin user
        // Mobile: 7078490901, Password: 490901 (last 6 digits)
        const admin = await User.create({
            mobile: '7078490901',
            password: '490901',
            role: 'owner'
        });
        console.log('Admin user created:', admin.mobile);

        // Create sample menu items with images
        const menuItems = [
            // Starters
            {
                name: 'Paneer Tikka',
                description: 'Grilled cottage cheese with spices',
                category: 'Starters',
                price: 220,
                available: true,
                image: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=400&h=300&fit=crop'
            },
            {
                name: 'Chicken Wings',
                description: 'Crispy fried chicken wings with sauce',
                category: 'Starters',
                price: 280,
                available: true,
                image: 'https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?w=400&h=300&fit=crop'
            },
            {
                name: 'Veg Spring Rolls',
                description: 'Crispy rolls filled with vegetables',
                category: 'Starters',
                price: 180,
                available: true,
                image: 'https://images.unsplash.com/photo-1606525437679-037aca74a3e9?w=400&h=300&fit=crop'
            },
            {
                name: 'Fish Fingers',
                description: 'Breaded fish sticks with tartar sauce',
                category: 'Starters',
                price: 320,
                available: true,
                image: 'https://images.unsplash.com/photo-1604909052743-94e838986d24?w=400&h=300&fit=crop'
            },

            // Main Course
            {
                name: 'Butter Chicken',
                description: 'Creamy tomato-based chicken curry',
                category: 'Main Course',
                price: 350,
                available: true,
                image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=400&h=300&fit=crop'
            },
            {
                name: 'Dal Makhani',
                description: 'Rich black lentils cooked overnight',
                category: 'Main Course',
                price: 220,
                available: true,
                image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&h=300&fit=crop'
            },
            {
                name: 'Biryani',
                description: 'Aromatic rice with spices and meat/vegetables',
                category: 'Main Course',
                price: 300,
                available: true,
                image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400&h=300&fit=crop'
            },
            {
                name: 'Pasta Alfredo',
                description: 'Creamy white sauce pasta',
                category: 'Main Course',
                price: 280,
                available: true,
                image: 'https://images.unsplash.com/photo-1645112411341-6c4fd023714a?w=400&h=300&fit=crop'
            },

            // Drinks
            {
                name: 'Fresh Lime Soda',
                description: 'Refreshing lime with soda water',
                category: 'Drinks',
                price: 80,
                available: true,
                image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=400&h=300&fit=crop'
            },
            {
                name: 'Mango Lassi',
                description: 'Sweet mango yogurt drink',
                category: 'Drinks',
                price: 120,
                available: true,
                image: 'https://images.unsplash.com/photo-1527661591475-527312dd65f5?w=400&h=300&fit=crop'
            },
            {
                name: 'Cold Coffee',
                description: 'Iced coffee with cream',
                category: 'Drinks',
                price: 150,
                available: true,
                image: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400&h=300&fit=crop'
            },
            {
                name: 'Masala Chai',
                description: 'Traditional Indian spiced tea',
                category: 'Drinks',
                price: 50,
                available: true,
                image: 'https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?w=400&h=300&fit=crop'
            },

            // Desserts
            {
                name: 'Gulab Jamun',
                description: 'Sweet milk dumplings in syrup',
                category: 'Desserts',
                price: 100,
                available: true,
                image: 'https://images.unsplash.com/photo-1666190094762-2a71163e5133?w=400&h=300&fit=crop'
            },
            {
                name: 'Chocolate Brownie',
                description: 'Warm brownie with ice cream',
                category: 'Desserts',
                price: 180,
                available: true,
                image: 'https://images.unsplash.com/photo-1564355808539-22fda35bed7e?w=400&h=300&fit=crop'
            },
            {
                name: 'Kheer',
                description: 'Indian rice pudding',
                category: 'Desserts',
                price: 120,
                available: true,
                image: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=400&h=300&fit=crop'
            },
            {
                name: 'Ice Cream Sundae',
                description: 'Vanilla ice cream with toppings',
                category: 'Desserts',
                price: 150,
                available: true,
                image: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400&h=300&fit=crop'
            }
        ];

        await Menu.insertMany(menuItems);
        console.log(`${menuItems.length} menu items created with images`);

        // Create tables (1-20)
        const tables = [];
        for (let i = 1; i <= 20; i++) {
            tables.push({
                tableNumber: i,
                isActive: true,
                isOccupied: false
            });
        }
        await Table.insertMany(tables);
        console.log('20 tables created');

        console.log('\n✅ Database seeded successfully!');
        console.log('\nAdmin Login Credentials:');
        console.log('Mobile: 7078490901');
        console.log('Password: 490901');

        process.exit(0);
    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
};

seedData();
