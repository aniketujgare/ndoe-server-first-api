const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

exports.user_signup = (req, res, next) => {
    User.
        find({ email: req.body.email })
        .exec()
        .then(users => {
            if (users[0]) {
                return res.status(409).json({
                    message: "Mail Exists"
                });
            } else {
                bcrypt.hash(req.body.password, 10, (err, hash) => {
                    if (err) {
                        return res.status(500).json({
                            error: err
                        });
                    } else {
                        const user = new User({
                            _id: new mongoose.Types.ObjectId(),
                            email: req.body.email,
                            password: hash
                        });
                        user.save()
                            .then(result => {
                                console.log(result);
                                res.status(200).json({
                                    message: 'User created'
                                })
                            })
                            .catch(err => {
                                console.log(err);
                                res.status(500).json({
                                    error: err
                                });
                            });
                    }
                });
            }
        });
}

exports.user_login = async (req, res, next) => {
    try {
        const user = await User.findOne({ email: req.body.email });
        if (!user) {
            return res.status(401).json({ message: 'Auth failed' });
        }
        bcrypt.compare(req.body.password, user.password, (error, result) => {
            if (error) {
                return res.status(401).json({ message: 'Auth failed' });
            }
            if (result) {
                const token = jwt.sign(
                    {
                    email: user.email,
                    userId: user._id
                    }, 
                    process.env.JWT_KEY,
                    {
                        expiresIn: '1h'
                    }
                );
                return res.status(200).json({ message: 'Auth success', token: token });
            }
            return res.status(401).json({ message: 'Auth failed' });
        });

    } catch (err) {
        console.log(err);
        res.status(500).json({
            error: err
        });
    }
}

exports.user_delete = async (req, res, next) => {
    try {
        const user = await User.findOne(req.body.userId);
        user.deleteOne({ _id: req.body.userId });
        console.log(user);
        res.status(200).json({
            message: 'User deleted'
        })
    } catch (err) {
        console.log(err);
        res.status(500).json({
            error: err
        });
    }
}