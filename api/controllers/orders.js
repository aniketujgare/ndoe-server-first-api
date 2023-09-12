const mongoose = require('mongoose');

const Order = require('../models/order');
const Product = require('../models/products');
exports.orders_get_all = async (req, res, next) => {
    try {
        const docs = await Order.find()
            .select('_id product quantity')
            .populate('product', 'name');
        if (docs) {
            res.status(200).json({
                count: docs.length,
                orders: docs.map(doc => {
                    return {
                        ...doc._doc,
                        request: {
                            type: 'GET',
                            url: 'http://localhost:3000/orders/' + doc._id
                        }
                    }
                })
            });
        } else {
            res.status(200).json({ message: "No orders found" });
        }
    } catch (err) {
        res.status(500).json({ error: err });
    }
}

exports.order_create_order = async (req, res, next) => {
    try {
        const product = await Product.findById(req.body.productId);
        if (product) {
            const order = new Order({
                _id: new mongoose.Types.ObjectId(),
                quantity: req.body.quantity,
                product: req.body.productId
            });
            const result = await order.save();
            console.log(result);
            const { __v, ...values } = result._doc;
            res.status(201).json({
                message: 'Order stored',
                createdOrder: values,
                request: {
                    type: 'GET',
                    url: 'http://localhost:3000/orders/' + result._id
                }
            });
        } else {
            res.status(404).json({ message: 'No product found' });
        }
    } catch (err) {
        res.status(500).json({
            error: err
        });
    }
}

exports.orders_get_order = async (req, res, next) => {
    try {
        const order = await Order.findById(req.params.orderId)
            .populate('product');
        if (order) {
            res.status(200).json({
                order: order,
                request: {
                    type: 'GET',
                    url: 'http://localhost:3000/orders'
                }
            });
        }
    } catch (err) {
        res.status(500).json({
            error: err
        });
    }
}

exports.orders_delete_order = (req, res, next) => {
    Order.deleteOne({ _id: req.params.orderId })
        .exec()
        .then(result => {
            res.status(200).json({
                message: "Order deleted",
                request: {
                    type: 'GET',
                    url: 'http://localhost:3000/orders/' + result._id
                }
            });
        })
        .catch(err => {
            res.status(500).json({
                error: err
            });
        });
    res.status(201).json({
        message: 'Orders deleted',
        orderId: req.params.orderId
    });
}