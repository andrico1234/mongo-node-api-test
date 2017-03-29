const mongoose = require('mongoose');

mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost:27017/TodoApp');

var successfulTodo = (res) => {

    console.log('Saved:', JSON.stringify(res, undefined, 2), '\n');
};

var unSuccessfulTodo = (err) => {

    console.log('Unable to save Todo', err, '\n');
};

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
    }
});

const User = mongoose.model('User', {

    email: {
        minlength: 1,
        required: true,
        trim: true,
        type: String
    }
});

let newTodo = new Todo({

    text: 'Cook Dinner'
});

newTodo.save().then((res) => {

    successfulTodo(res);
}, (err) => {

    unSuccessfulTodo(err);
});

let newTodo2 = new Todo({

    text: 'Go to Sleep'
});

let newUser = new User({

    email: 'andrico1234@yahoo.co.uk'
});

newTodo2.save().then((res) => {

    successfulTodo(res);
}, (err) => {

    unSuccessfulTodo(err);
});

newUser.save().then((res) => {

    successfulTodo(res);
}, (err) => {

    unSuccessfulTodo(err);
});