const express = require('express');
const Product = require('../models/Product');
const router = express.Router();

// Get all products
router.get('/', async (req, res) => {
    try {
        const products = await Product.find({});
        res.json(products);
    } catch (error) {
        console.error('API Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Admin Add Product
router.post('/', async (req, res) => {
    const { name, price, description, image, category, featured } = req.body;
    try {
        const product = new Product({
            user: "64fb56000000000000000001", // Placeholder Admin ID for now
            name,
            price,
            description,
            image,
            category,
            featured: featured || false,
            countInStock: 20
        });
        const createdProduct = await product.save();
        res.status(201).json(createdProduct);
    } catch (error) {
        console.error('API Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Admin Delete Product
router.delete('/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (product) {
            await Product.deleteOne({ _id: req.params.id });
            res.json({ message: 'Product removed' });
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        console.error('API Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Toggle Featured Status
router.put('/:id/featured', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (product) {
            product.featured = !product.featured;
            const updatedProduct = await product.save();
            res.json(updatedProduct);
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        console.error('API Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
