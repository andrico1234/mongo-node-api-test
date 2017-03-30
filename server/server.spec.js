const request = require('supertest');

const {app} = require('./server');
const {Todo} = require('./models/todo');

beforeEach((done) => {

    Todo.remove({}).then(() => {
        done();
    })
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

                    Todo.find().then((todos) => {

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

                        expect(todos.length).toBe(0);
                        done().catch((e) => done(e))
                    })
                }
            })
    })
});