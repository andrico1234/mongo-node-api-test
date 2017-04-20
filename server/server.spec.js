const request = require('supertest');

const {app} = require('./server');
const {todos, populateTodos, populateUsers, users} = require('./seed/seed');
const {Todo} = require('./models/todo');
const {ObjectID} = require('mongodb');


beforeEach(populateUsers);
beforeEach(populateTodos);

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
                        done();
                    }).catch((e) => done(e));
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
                        done();
                    }).catch((e) => done(e));
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

describe('GET /todos/:id', () => {

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

describe('DELETE /todos/:id', () => {

    it('should delete todos by ID', (done) => {

        request(app)
            .delete(`/todos/${todos[0]._id.toHexString()}`)
            .expect(200)
            .expect((res) => {
                expect(res.body.todo.text).toBe(todos[0].text);
            })
            .end((err, res) => {

                if (err) {

                    return done(err);
                } else {

                    Todo.findById(todos[0]._id.toHexString()).then((todos) => {

                        expect(todos).toEqual(null);
                        done();
                    }).catch((err) => done(err));
                }
            });
    });

    it('should return 404 if todo not found', (done) => {
        var newId = new ObjectID().toHexString();

        request(app)
            .get(`/todos${newId}`)
            .expect(404)
            .end(done)
    });

    it('should return 400 if ID is invalid', (done) => {

        request(app)
            .get(`/todos/123123`)
            .expect(400)
            .end(done)
    });
});

describe('PATCH /todos/:id', () => {

    it('should set completed to true and add timestamp', (done) => {

        request(app)
            .patch(`/todos/${todos[0]._id.toHexString()}`)
            .send({
                completed: true,
                text: 'huge todo'
            })
            .expect(200)
            .expect((res) => {
                expect(res.body.todo.completed).toBe(true);
                expect(res.body.todo.completedAt).toBeTruthy();
                expect(res.body.todo.text).toBe('huge todo');
            })
            .end(done);
    });

    it('should set completed to false and remove timestamp', (done) => {

    request(app)
        .patch(`/todos/${todos[1]._id.toHexString()}`)
        .send({
            completed: false,
            text: 'huger todo'
        })
        .expect(200)
        .expect((res) => {
            expect(res.body.todo.completed).toBe(false);
            expect(res.body.todo.completedAt).toBe(null);
            expect(res.body.todo.text).toBe('huger todo');
        })
        .end(done);
    });
});