const mongoose = require('mongoose');

const User = mongoose.model('User', {

    email: {
        minlength: 1,
        required: true,
        trim: true,
        type: String
    }
});

module.exports = {

    User
};