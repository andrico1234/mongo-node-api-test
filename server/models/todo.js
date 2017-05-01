const mongoose = require('mongoose');

const Todo = mongoose.model('Todo', {

    text: {
        minlength: 1,
        required: true,
        trim: true,
        type: String
    },
    completed: {
        default: false,
        type: Boolean
    },
    completedAt: {
        default: null,
        type: Number
    },
    _creator: {
      required: true,
        type: mongoose.Schema.Types.ObjectId
    }
});

module.exports = {

    Todo
};