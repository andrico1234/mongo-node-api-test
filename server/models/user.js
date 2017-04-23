const _ = require('lodash');
const bcrypt = require('bcryptjs');
const isEmail = require('validator/lib/isEmail');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

var UserSchema = new mongoose.Schema({
    email: {
        minlength: 1,
        required: true,
        trim: true,
        type: String,
        unique: true,
        validate: {
            isAsync: true,
            message: 'that email is not a valid email',
            validator: isEmail
        }
    },
    password: {
        minlength: 6,
        require: true,
        type: String
    },
    tokens: [{
        access: {
            required: true,
            type: String
        },
        token: {
            required: true,
            type: String
        }
    }]
});

UserSchema.methods.toJSON = function() {

    var user = this;
    var userObject = user.toObject();

    return _.pick(userObject, ['_id', 'email']);
};

UserSchema.methods.generateAuthToken = function() {

    var user = this;
    var access = 'auth';
    var token = jwt.sign({
        _id: user._id.toHexString(),
        access
    }, 'abc123').toString();

    user.tokens.push({
        access,
        token
    });

    return user.save().then(() => {

        return token;
    });
};

UserSchema.statics.findByCredentials = function(email, password) {

    var User = this;

    return User.findOne({

        'email': email
    }).then((user) => {

        if (!user) {

            return Promise.reject();
        }

        return new Promise((resolve, reject) => {
            bcrypt.compare(password, user.password, (err, res) => {

                if (res) {

                    return resolve(user);
                }

                return reject();
            });
        });
    });
};

UserSchema.statics.findByToken = function(token) {

    var User = this;
    var decoded;

    try {

        decoded = jwt.verify(token, 'abc123');
    } catch (e) {

        return Promise.reject();
    }

    return User.findOne({

        '_id': decoded._id,
        'tokens.token': token,
        'tokens.access': 'auth'
    });
};

UserSchema.pre('save', function(next) {
    var user = this;

    if (user.isModified('password')) {

        bcrypt.genSalt(10, (err, salt) => {

            bcrypt.hash(user.password, salt, (err, hash) => {

                user.password = hash;
                next();
            });
        });
    } else {

        next();
    }
});

const User = mongoose.model('User', UserSchema);

module.exports = {

    User
};