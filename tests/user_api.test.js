'use strict'
const request = require('supertest')
const app = require('../app')
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const User = require('../models/user')
const helper = require('./user_api_test_helper')


describe('POST users - unit test for post request @ /api/users', () => {
  beforeEach(async () => {
    await User.deleteMany()

    const passwordHash = await bcrypt.hash('somepassword', 10)

    const user = new User({ username: 'username1', name: 'John Doe', passwordHash })

    await User.create(user)
  })
  test('it can create new user', async () => {
    const usersOnDBBefore = await helper.savedUsers()

    const newUser = {
      username: 'username2',
      name: 'Amber Alert',
      password: 'samplepassword123',
    }

    const postUser = await request(app).post('/api/users').send(newUser)
    expect(postUser.type).toEqual('application/json')
    expect(postUser.status).toEqual(201)

    const usersOnDBAfter = await helper.savedUsers()

    expect(usersOnDBAfter).toHaveLength(usersOnDBBefore.length + 1)

    const usernames = usersOnDBAfter.map(user => user.username)

    expect(usernames).toContain(newUser.username)

  })

  test('it can check for duplicate name entries as error', async () => {

    const usersOnDBBefore = await helper.savedUsers()

    const newUser = {
      username: 'username1',
      name: 'Amber Alert',
      password: 'samplepassword123',
    }

    const postUser = await request(app).post('/api/users').send(newUser)
    expect(postUser.type).toEqual('application/json')
    expect(postUser.status).toEqual(422)
    expect(postUser.body.error).toBe(`duplicate username ${newUser.username} cannot be registered!`)

    const usersOnDBAfter = await helper.savedUsers()
    expect(usersOnDBAfter).toEqual(usersOnDBBefore)

  })

})

afterAll( async () => {
  await mongoose.connection.dropDatabase()
  await mongoose.connection.close()
})