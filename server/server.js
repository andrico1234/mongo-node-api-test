const mongoose = require('mongoose');

mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost:27017/TodoApp');

var successfulTodo = (res) => {

    console.log('Saved Todo: ', JSON.stringify(res, undefined, 2), '\n');
};

var unSuccessfulTodo = (err) => {

    console.log('Unable to save Todo', err, '\n');
};

const Todo = mongoose.model('Todo', {

    text: {
        type: String
    },
    completed: {
        type: Boolean
    },
    completedAt: {
        type: Number
    }
});

var newTodo = new Todo({

    text: 'Cook Dinner',
    completed: false
});

newTodo.save().then((res) => {

    successfulTodo(res);
}, (err) => {

    unSuccessfulTodo(err);
});

var newTodo2 = new Todo({

    text: 'Go to Sleep',
    completed: true,
    completedAt: 22
});

newTodo2.save().then((res) => {

    successfulTodo(res);
}, (err) => {

    unSuccessfulTodo(err);
});