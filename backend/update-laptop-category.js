// Script to update Acer Nitro laptop category to "laptops"
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/aalacomputer';

// Product Schema
const ProductSchema = new mongoose.Schema({
    Name: String,
    name: String,
    category: mongoose.Schema.Types.Mixed,
    price: Number,
    stock: Number,
    img: String,
    imageUrl: String,
    images: Array,
    description: String,
    brand: String,
    specs: Object
}, { strict: false });

const Product = mongoose.model('Product', ProductSchema);

async function updateLaptopCategory() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        // Search for the Acer Nitro laptop
        const searchTerm = 'Acer Nitro V 16S AI ANV16S-41-R89V';
        console.log(`\nSearching for: ${searchTerm}`);

        const laptop = await Product.findOne({
            $or: [
                { Name: { $regex: searchTerm, $options: 'i' } },
                { name: { $regex: searchTerm, $options: 'i' } }
            ]
        });

        if (!laptop) {
            console.log('❌ Laptop not found');
            await mongoose.connection.close();
            return;
        }

        console.log(`\n✅ Found laptop:`);
        console.log(`   Name: ${laptop.Name || laptop.name}`);
        console.log(`   Current category: ${JSON.stringify(laptop.category)}`);

        // Update category to "laptops"
        const result = await Product.updateOne(
            { _id: laptop._id },
            {
                $set: {
                    category: 'laptops',
                    'category.main': 'laptops'
                }
            }
        );

        console.log(`\n✅ Updated ${result.modifiedCount} product(s)`);
        console.log(`   New category: laptops`);

        // Verify the update
        const updated = await Product.findById(laptop._id);
        console.log(`\n✅ Verification:`);
        console.log(`   Category is now: ${JSON.stringify(updated.category)}`);

        await mongoose.connection.close();
        console.log('\nDatabase connection closed');
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

updateLaptopCategory();
