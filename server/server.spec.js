const request = require('supertest');

const {app} = require('./server');
const {todos, populateTodos, populateUsers, users} = require('./seed/seed');
const {Todo} = require('./models/todo');
const {ObjectID} = require('mongodb');
const {User} = require('./models/user');


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

describe('GET /users/me', () => {

    it('should return user if authenticated', (done) => {

        request(app)
            .get('/users/me')
            .set('x-auth', users[0].tokens[0].token)
            .expect(200)
            .expect((res) => {
                expect(res.body._id).toBe(users[0]._id.toHexString());
                expect(res.body.email).toBe(users[0].email);
            })
            .end(done);
    });

    it('should return a 401 if not authenticated', (done) => {

        request(app)
            .get('/users/me')
            .expect(401)
            .expect((res) => {
                expect(res.body).toEqual({});
            })
            .end(done);
    });
});

describe('POST /users', () => {

    it('should create a user', (done) => {

        var email = 'example@example.com';
        var password = '123mnb!';

        request(app)
            .post('/users')
            .send({
                email,
                password
            })
            .expect(200)
            .expect((res) => {
                expect(res.headers['x-auth']).toBeTruthy();
                expect(res.body._id).toBeTruthy();
                expect(res.body.email).toBe(email);
            })
            .end((err) => {

                if (err) {

                    return done(err);
                }

                User.findOne({email}).then((user) => {
                    expect(user).toBeTruthy();
                    expect(user.password).not.toBe(password);
                    done();
                }).catch((err) => {

                    done(err);
                });
            });
    });

    it('should return validation errors if request invalid', (done) => {

        var email = 'andrico333';
        var password = '123';

        request(app)
            .post('/users')
            .send({
                email,
                password
            })
            .expect(400)
            .end(done);
    });

    it('should not create user if email in use', (done) => {

        var email = users[0].email;
        var password = 'abc123123';

        request(app)
            .post('/users')
            .send({
                email,
                password
            })
            .expect(400)
            .end(done);
    });
});

describe('POST /users/login', () => {

    it('should login user and return auth token', (done) => {

        request(app)
            .post('/users/login')
            .send({
                email: users[1].email,
                password: users[1].password
            })
            .expect(200)
            .expect((res) => {
                expect(res.headers['x-auth']).toBeTruthy();
            })
            .end((err, res) => {

                if (err) {

                    return done(err)
                }

                User.findById(users[1]._id).then((user) => {

                    expect(user.tokens[0]).toEqual(jasmine.objectContaining({

                        access: 'auth',
                        token: res.headers['x-auth']
                    }));
                    done();
                }).catch((err) => {

                    done(err);
                });
            });
    });

    it('should reject invalid login', (done) => {

        request(app)
            .post('/users/login')
            .send({
                email: users[1].email,
                password: '123123'
            })
            .expect(400)
            .expect((res) => {
                expect(res.headers['x-auth']).toBeFalsy();
            })
            .end((err, res) => {

                if (err) {

                    return done(err)
                }

                User.findById(users[1]._id).then((user) => {
                    expect(user.tokens.length).toEqual(0);
                    done();
                }).catch((err) => {

                    done(err);
                });
            });
    });
});