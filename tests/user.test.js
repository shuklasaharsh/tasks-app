const request = require('supertest')
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const app = require('../src/app')
const User = require('../src/models/user')
const userOneID = new mongoose.Types.ObjectId()


const userOne = {
    _id: userOneID,
    name: 'example',
    email: 'shukla.saharsh5@example.com',
    password: 'ReturnPass7!',
    tokens: [{
        token: jwt.sign({_id: userOneID}, process.env.JWT_SECRET)
    }]
}

beforeEach(async () => {
    await User.deleteMany()
    await new User(userOne).save()
})

test('Should Sign up a new user', async () => {
    await request(app)
        .post('/users')
        .send({
        name: 'Saharsh Shukla',
        email: 'shukla.saharsh5@outlook.com',
        password: 'ReturnPass7!'
    }).expect(201)
})

test('Should Login an existing user', async () => {
    const response = await request(app)
        .post('/users/login')
        .send({
        email: 'shukla.saharsh5@example.com',
        password: 'ReturnPass7!'
    }).expect(200)

    const user = await User.findById(userOneID)

    expect(response.body.token).toBe(user.tokens[1].token)

})

test('Should not Login as non existant user', async () => {
    await request(app)
        .post('/users/login')
        .send({
        email: userOne.email,
        password: 'ThisisNotMyPassword'
    }).expect(400)
})

test('Should get profile for user', async () => {
    await request(app)
        .get('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({})
        .expect(200)
})

test('Should not get profile for unauthenticated user', async () => {
    await request(app)
        .get('/users/me')
        .send()
        .expect(401)
})

test('Should delete account for user', async () => {
    await request(app)
        .delete('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)
})

test('Should not delete account for unauthenticated user', async () => {
    await request(app)
        .delete('/users/me')
        .send()
        .expect(401)
})