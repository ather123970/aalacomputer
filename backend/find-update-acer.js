// Script to find and update Acer Nitro laptop
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/aalacomputer';

const ProductSchema = new mongoose.Schema({}, { strict: false });
const Product = mongoose.model('Product', ProductSchema);

async function findAndUpdateLaptop() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB\n');

        // Search for Acer Nitro laptops
        const laptops = await Product.find({
            $or: [
                { Name: { $regex: 'Acer Nitro', $options: 'i' } },
                { name: { $regex: 'Acer Nitro', $options: 'i' } }
            ]
        }).limit(10);

        console.log(`Found ${laptops.length} Acer Nitro products:\n`);

        laptops.forEach((laptop, index) => {
            console.log(`${index + 1}. ${laptop.Name || laptop.name}`);
            console.log(`   ID: ${laptop._id}`);
            console.log(`   Category: ${JSON.stringify(laptop.category)}`);
            console.log('');
        });

        if (laptops.length > 0) {
            console.log('Updating all Acer Nitro products to category "laptops"...\n');

            const result = await Product.updateMany(
                {
                    $or: [
                        { Name: { $regex: 'Acer Nitro', $options: 'i' } },
                        { name: { $regex: 'Acer Nitro', $options: 'i' } }
                    ]
                },
                {
                    $set: { category: 'laptops' }
                }
            );

            console.log(`✅ Updated ${result.modifiedCount} product(s) to category "laptops"`);
        }

        await mongoose.connection.close();
        console.log('\nDatabase connection closed');
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

findAndUpdateLaptop();
