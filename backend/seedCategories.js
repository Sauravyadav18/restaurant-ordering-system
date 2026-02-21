require('dotenv').config();
const mongoose = require('mongoose');
const Category = require('./models/Category');

async function seedCategories() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const defaults = ['Starters', 'Main Course', 'Drinks', 'Desserts'];

        for (const name of defaults) {
            const existing = await Category.findOne({ name });
            if (!existing) {
                await Category.create({ name });
                console.log(`  ✅ Added: ${name}`);
            } else {
                console.log(`  ⏭️  Exists: ${name}`);
            }
        }

        console.log('\nDefault categories seeded!');
        process.exit(0);
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
}

seedCategories();
