const express = require('express');
const Order = require('../models/Order');
const router = express.Router();

// Create new order
router.post('/', async (req, res) => {
    try {
        const { user, orderItems, shippingAddress, totalPrice } = req.body;

        if (orderItems && orderItems.length === 0) {
            res.status(400).json({ message: 'No order items' });
            return;
        } else {
            const order = new Order({
                user,
                orderItems,
                shippingAddress,
                totalPrice,
                paymentMethod: 'Cash on Delivery',
            });

            const createdOrder = await order.save();
            res.status(201).json(createdOrder);
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get user orders
router.get('/myorders/:id', async (req, res) => {
    try {
        const orders = await Order.find({ user: req.params.id }).sort('-createdAt');
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get all orders (for admin)
router.get('/', async (req, res) => {
    try {
        const orders = await Order.find({}).populate('user', 'name email').sort('-createdAt');
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update order to delivered
router.put('/:id/deliver', async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (order) {
            order.isDelivered = true;
            const updatedOrder = await order.save();
            res.json(updatedOrder);
        } else {
            res.status(404).json({ message: 'Order not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
