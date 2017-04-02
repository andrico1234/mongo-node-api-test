const bodyParser = require('body-parser');
const express = require('express');
const {ObjectID} = require('mongodb');

const {mongoose} = require('./db/mongoose.js');
const {Todo} = require('./models/todo');
const {User} = require('./models/user');

var app = express();
//var id = '58dfe4451e510a3e2fb9c78d';

app.use(bodyParser.json());

app.post('/todos', (req, res) => {

    var todo = new Todo({

        text: req.body.text,
        completed: req.body.completed,
        completedAt: req.body.completedAt
    });

    todo.save().then((doc) => {

        res.send(doc);
    }, (err) => {

        res.status(400).send(err);
    });

    console.log(req.body);
});

app.get('/todos', (req, res) => {

    Todo.find().then((todos) => {

        res.send({todos});
    }, (err) => {

        res.status(400).send(err);
    })
});

app.get('/todos/:id', (req, res) => {

    let id = req.params.id;

    console.log(ObjectID.isValid(id));

    if (!ObjectID.isValid(id)) {

        return res.status(400).send();
    }

    Todo.findById(id).then((todo) => {

        if (!todo) {

            return res.status(404).send();
        } else {

            res.send(JSON.stringify(todo, undefined, 2));
        }
    }).catch((err) => {

        res.status(400).send();
    })
    // if no to-do 404 and send back empty body

    // fail - error 400 and .send()
});

app.listen(3000, () => {

    console.log('Started on Port 3000');
});

module.exports = {

    app
};