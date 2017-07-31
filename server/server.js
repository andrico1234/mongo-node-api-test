require('./config/config');

const _ = require('lodash');
const bodyParser = require('body-parser');
const express = require('express');
const {ObjectID} = require('mongodb');

const {mongoose} = require('./db/mongoose.js');
const {Todo} = require('./models/todo');
const {User} = require('./models/user');
const {authenticate} = require('./middleware/authenticate');

let app = express();
const port = process.env.PORT;

app.use(bodyParser.json());

app.post('/todos', authenticate, (req, res) => {

    const todo = new Todo({
        text: req.body.text,
        completed: req.body.completed,
        completedAt: req.body.completedAt,
        _creator: req.user._id
    });

    todo.save().then((doc) => {

        res.send(doc);
    }, (err) => {

        res.status(400).send(err);
    });
});

app.get('/todos', authenticate, (req, res) => {

    Todo.find({
        _creator: req.user._id
    }).then((todos) => {

        res.send({todos});
    }, (err) => {

        res.status(400).send(err);
    })
});

app.get('/todos/:id', authenticate, (req, res) => {

    const id = req.params.id;

    if (!ObjectID.isValid(id)) {

        return res.status(400).send();
    }

    Todo.findOne({
        _id: id,
        _creator: req.user._id
    }).then((todo) => {

        if (!todo) {

            return res.status(404).send();
        }

        res.send({todo});
    }).catch((err) => {

        res.status(400).send();
    });
});

app.delete('/todos/:id', authenticate, async (req, res) => {

    const id = req.params.id;

    if (!ObjectID.isValid(id)) {

        return res.status(400).send()
    }

    try {

        const todo = await Todo.findOneAndRemove({
            _id: id,
            _creator: req.user._id
        });

        if (!todo) {

            return res.status(404).send();
        }

        res.send({todo});
    } catch (err) {

        res.status(400).send(err);
    }
});

app.patch('/todos/:id', authenticate, (req, res) => {

    const id = req.params.id;
    const body = _.pick(req.body, ['text', 'completed']);

    if (!ObjectID.isValid(id)) {

        return res.status(400).send();
    }

    if (_.isBoolean(body.completed) && body.completed) {

        body.completedAt = new Date().getTime();
    } else {

        body.completed = false;
        body.completedAt = null;
    }

    Todo.findOneAndUpdate({
        _id: id,
        _creator: req.user._id
    }, {

        $set: body
    }, {

        new: true
    }).then((todo) => {

        if (!todo) {
            return res.status(404).send();
        }

        res.send({todo});
    }).catch((err) => {

        res.status(400).send();
    });
});

app.post('/users', async (req, res) => {

    const body = _.pick(req.body, ['email', 'password']);
    const user = new User(body);

    try {
        await user.save();
        const token = await user.generateAuthToken();
        res.header('x-auth', token).send(user);
    } catch (err) {
        res.status(400).send(err);
    }
});

app.get('/users/me', authenticate, (req, res) => {

    res.send(req.user);
});

app.post('/users/login', async (req, res) => {

    const body = _.pick(req.body, ['email', 'password']);

    try {
        const user = await User.findByCredentials(body.email, body.password);
        const token = await user.generateAuthToken();
        res.header('x-auth', token).send(user);
    } catch (err) {
        res.status(400).send(err);
    }
});

app.delete('/users/me/token', authenticate, async (req, res) => {

    try {
        await req.user.removeToken(req.token);
        res.status(200).send();
    } catch (e) {
        res.status(400).send();
    }
});

app.listen(port, () => {

    console.log(`Started on Port ${port}`);
});

module.exports = {
    app
};