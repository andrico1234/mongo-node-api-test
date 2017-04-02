const request = require('supertest');

const {app} = require('./server');
const {Todo} = require('./models/todo');
const {ObjectID} = require('mongodb');

const todos = [{
    _id: new ObjectID,
    text: 'First test todo'
}, {
    _id: new ObjectID,
    text: 'Second test todo'
}];

beforeEach((done) => {

    Todo.remove({}).then(() => {
        return Todo.insertMany(todos);

    }).then(() => {

        done();
    });
});

describe('POST /todos', () => {

    it('should create a new todo', (done) => {

        var text = 'this is a test';

        request(app)
            .post('/todos')
            .send({text})
            .expect(200)
            .expect((res) => {

                expect(res.body.text).toBe(text)
            })
            .end((err, res) => {
                if (err) {

                    return done.fail(err);
                } else {

                    Todo.find({text: 'this is a test'}).then((todos) => {

                        expect(todos.length).toBe(1);
                        expect(todos[0].text).toBe(text);
                        done().catch((e) => done(e));
                    })
                }
            });
    });

    it('should not create todo with invalid date', (done) => {

        request(app)
            .post('/todos')
            .send({})
            .expect(400)
            .end((err, res) => {

                if (err) {

                    return done.fail(err);
                } else {

                    Todo.find().then((todos) => {

                        expect(todos.length).toBe(2);
                        done().catch((e) => done(e))
                    })
                }
            })
    })
});

describe('GET /todos', () => {

    it('should get all todos', (done) => {

        request(app)
            .get('/todos')
            .expect(200)
            .expect((res) => {
                expect(res.body.todos.length).toBe(2)
            })
            .end(done)
    })
});

describe('GET /todos/id', () => {

    it('should get todos by ID', (done) => {

        request(app)
            .get(`/todos/${todos[0]._id.toHexString()}`)
            .expect(200)
            .expect((res) => {
                expect(res.body.todo.text).toBe(todos[0].text);
            })
            .end(done);
    });

    it('should return 404 if todo not found', (done) => {
        var newId = new ObjectID().toHexString();

        request(app)
            .get(`/todos/${newId}`)
            .expect(404)
            .end(done)
    });

    it('should return 400 if Id is invalid', (done) => {

        request(app)
            .get(`/todos/12323`)
            .expect(400)
            .end(done)
    });
});