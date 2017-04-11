const isEmail = require('validator/lib/isEmail');
const mongoose = require('mongoose');

const User = mongoose.model('User', {
    email: {
        minlength: 1,
        required: true,
        trim: true,
        type: String,
        unique: true,
        validate: {
            message: 'that email is not a valid email',
            validator: isEmail
        }
    },
    password: {
        minlength: 6,
        require: true,
        tokens: [{
            access: {
                required: true,
                type: String
            },
            token: {
                required: true,
                type: String
            }
        }],
        type: String
    }
});

module.exports = {

    User
};