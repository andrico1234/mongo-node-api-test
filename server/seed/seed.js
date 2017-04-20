const jwt = require('jsonwebtoken');
const {ObjectID} = require('mongodb');
const {Todo} = require('./../models/todo');
const {User} = require('./../models/user');

const todos = [{
    _id: new ObjectID,
    text: 'First test todo'
}, {
    _id: new ObjectID,
    completed: true,
    completedAt: 333,
    text: 'Second test todo'
}];

const userOneID = new ObjectID;
const userTwoID = new ObjectID;

const users = [{
    _id: userOneID,
    email: 'andrico1234@yahoo.co.uk',
    password: 'user1pass',
    tokens: [{
        access: 'auth',
        token: jwt.sign({
            _id: userOneID,
            access: 'auth'
        }, 'abc123').toString()
    }]
}, {
    _id: userTwoID,
    email: 'andrico1221@yahoo.co.uk',
    password: 'user2pass',
}];

const populateTodos = (done) => {

    Todo.remove({}).then(() => {

        return Todo.insertMany(todos);
    }).then(() => {

        done();
    });
};

const populateUsers = (done) => {

    User.remove({}).then(() => {

        var userOne = new User(users[0]).save();
        var userTwo = new User(users[1]).save();

        return Promise.all([userOne, userTwo]);
    }).then(() => {

        done();
    });
};

module.exports = {
    todos,
    populateTodos,
    populateUsers,
    users
};