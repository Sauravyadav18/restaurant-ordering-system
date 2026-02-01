require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Menu = require('./models/Menu');

const seedData = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Connected');

        // Clear existing data
        await User.deleteMany({});
        await Menu.deleteMany({});
        console.log('Cleared existing data');

        // Create admin user
        // Mobile: 7078490901, Password: 490901 (last 6 digits)
        const admin = await User.create({
            mobile: '7078490901',
            password: '490901',
            role: 'owner'
        });
        console.log('Admin user created:', admin.mobile);

        // Create sample menu items
        const menuItems = [
            // Starters
            { name: 'Paneer Tikka', description: 'Grilled cottage cheese with spices', category: 'Starters', price: 220, available: true },
            { name: 'Chicken Wings', description: 'Crispy fried chicken wings with sauce', category: 'Starters', price: 280, available: true },
            { name: 'Veg Spring Rolls', description: 'Crispy rolls filled with vegetables', category: 'Starters', price: 180, available: true },
            { name: 'Fish Fingers', description: 'Breaded fish sticks with tartar sauce', category: 'Starters', price: 320, available: true },

            // Main Course
            { name: 'Butter Chicken', description: 'Creamy tomato-based chicken curry', category: 'Main Course', price: 350, available: true },
            { name: 'Dal Makhani', description: 'Rich black lentils cooked overnight', category: 'Main Course', price: 220, available: true },
            { name: 'Biryani', description: 'Aromatic rice with spices and meat/vegetables', category: 'Main Course', price: 300, available: true },
            { name: 'Pasta Alfredo', description: 'Creamy white sauce pasta', category: 'Main Course', price: 280, available: true },

            // Drinks
            { name: 'Fresh Lime Soda', description: 'Refreshing lime with soda water', category: 'Drinks', price: 80, available: true },
            { name: 'Mango Lassi', description: 'Sweet mango yogurt drink', category: 'Drinks', price: 120, available: true },
            { name: 'Cold Coffee', description: 'Iced coffee with cream', category: 'Drinks', price: 150, available: true },
            { name: 'Masala Chai', description: 'Traditional Indian spiced tea', category: 'Drinks', price: 50, available: true },

            // Desserts
            { name: 'Gulab Jamun', description: 'Sweet milk dumplings in syrup', category: 'Desserts', price: 100, available: true },
            { name: 'Chocolate Brownie', description: 'Warm brownie with ice cream', category: 'Desserts', price: 180, available: true },
            { name: 'Kheer', description: 'Indian rice pudding', category: 'Desserts', price: 120, available: true },
            { name: 'Ice Cream Sundae', description: 'Vanilla ice cream with toppings', category: 'Desserts', price: 150, available: true }
        ];

        await Menu.insertMany(menuItems);
        console.log(`${menuItems.length} menu items created`);

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
