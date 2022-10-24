'use strict'
const config = require('../utils/config')
const request = require('supertest')
const app = require('../app')
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const User = require('../models/user')
const Blog = require('../models/blog')
const helper = require('./helper')
const jwt = require('jsonwebtoken')
//const logger = require('../utils/logger')

describe('POST users - unit test for users with 2 users on db', () => {
  beforeEach(async () => {
    const passwordHash = await bcrypt.hash('pass', 10)

    const username1 = 'username1'
    const username2 = 'username2'

    const user1 = new User({
      username: username1,
      name: 'Juan Dela Cruz',
      passwordHash,
    })
    const user2 = new User({
      username: username2,
      name: 'Amber Alert',
      passwordHash,
    })

    const u1 = await User.create(user1)
    const u2 = await User.create(user2)

    await Promise.all([u1, u2])
  })

  afterEach(async () => {
    await User.deleteMany({})
  })

  test('it can create new user', async () => {
    const usersAtStart = await helper.savedUsers()

    const newUser = {
      username: 'user1',
      name: 'Boyd Montgomery',
      password: 'password',
    }

    const postUser = await request(app).post('/api/users').send(newUser)
    expect(postUser.type).toEqual('application/json')
    expect(postUser.status).toEqual(201)
    expect(postUser.body).toHaveProperty('blogs')

    const usersAtEnd = await helper.savedUsers()

    expect(usersAtEnd).toHaveLength(usersAtStart.length + 1)

    const usernames = usersAtEnd.map((user) => user.username)

    expect(usernames).toContain(newUser.username)
  })

  test('it checks for duplicate username as error', async () => {
    const usersOnDBBefore = await helper.savedUsers()

    const newUser = {
      username: 'username1',
      name: 'John Doe',
      password: 'password',
    }

    const postUser = await request(app).post('/api/users').send(newUser)
    expect(postUser.type).toEqual('application/json')
    expect(postUser.status).toEqual(400)
    expect(postUser.body.error).toBe(
      `duplicate username ${newUser.username} cannot be registered!`
    )

    const usersOnDBAfter = await helper.savedUsers()
    expect(usersOnDBAfter).toEqual(usersOnDBBefore)
  })

  test('it will fail on missing username', async () => {
    const newUser = {
      name: 'John Doe',
      password: 'password2',
    }

    const postUser = await request(app).post('/api/users').send(newUser)
    expect(postUser.type).toEqual('application/json')
    expect(postUser.status).toEqual(400)
    expect(postUser.body.error).toEqual(
      'User validation failed: username: Path `username` is required.'
    )
  })
  test('it will requires at least 3 chars long for username', async () => {
    const newUser = {
      username: 's#',
      name: 'John Doe',
      password: 'password2',
    }

    const postUser = await request(app).post('/api/users').send(newUser)
    expect(postUser.type).toEqual('application/json')
    expect(postUser.status).toEqual(400)
    expect(postUser.body.error).toEqual(
      'User validation failed: username: Path `username` (`s#`) is shorter than the minimum allowed length (3).'
    )
  })

  test('it will fail on missing password', async () => {
    const newUser = {
      username: 'username3',
      name: 'Amber Alert',
    }

    const postUser = await request(app).post('/api/users').send(newUser)
    expect(postUser.type).toEqual('application/json')
    expect(postUser.status).toEqual(400)
    expect(postUser.body.error).toEqual('password was not valid!')
  })

  test('it will requires at least 3 chars long for password', async () => {
    const newUser = {
      username: 's#Ä',
      name: 'Angela Thomas',
      password: 'pa',
    }

    const postUser = await request(app).post('/api/users').send(newUser)
    expect(postUser.type).toEqual('application/json')
    expect(postUser.status).toEqual(400)
    expect(postUser.body.error).toEqual('password was not valid!')
  })
})

describe('Get users - unit test for get request @ /api/users with 2 default users', () => {
  beforeEach(async () => {
    const passwordHash = await bcrypt.hash('pass', 10)

    const username1 = 'username1'
    const username2 = 'username2'

    const user1 = new User({
      username: username1,
      name: 'Juan Dela Cruz',
      passwordHash,
    })
    const user2 = new User({
      username: username2,
      name: 'Amber Alert',
      passwordHash,
    })

    const u1 = await User.create(user1)
    const u2 = await User.create(user2)

    const userOne = await User.findOne({ username: 'username1' })

    const userTwo = await User.findOne({ username: 'username2' })

    const token1 = jwt.sign(
      { username: userOne.username, id: userOne._id },
      config.jwt_key,
      { expiresIn: '1h' }
    )

    const token2 = jwt.sign(
      { username: userTwo.username, id: userTwo._id },
      config.jwt_key,
      { expiresIn: '1h' }
    )

    const post1 = await request(app)
      .post('/api/blogs')
      .set('Authorization', `Bearer ${token1}`)
      .send(helper.postBlog1)

    const post2 = await request(app)
      .post('/api/blogs')
      .set('Authorization', `Bearer ${token2}`)
      .send(helper.postBlog2)

    await Promise.all([u1, u2, post1, post2])
  })

  afterEach(async () => {
    await User.deleteMany({})
    await Blog.deleteMany({})
  })
  test('it renders all users with 1 blog property defined', async () => {
    const response = await request(app)
      .get('/api/users')
      .set('Accept', 'application/json')

    expect(response.type).toEqual('application/json')
    expect(response.statusCode).toEqual(200)
    expect(Array.isArray(response.body)).toBeTruthy()

    const usersAtStart = await helper.savedUsers()
    expect(usersAtStart).toHaveLength(2)

    const users = usersAtStart.map((user) => user.username)
    const expected = ['username1', 'username2']
    expect(users).toEqual(expect.arrayContaining(expected))

    const usersBlog = usersAtStart.map((ub) => ub.blogs)
    expect(Array.isArray(usersBlog)).toBeTruthy()

    const sample = usersBlog[0]
    const blog = await Blog.findById(sample[0])
    expect(blog.title).toBe('React patterns')

    const usersName = usersAtStart.map((us) => us.name)

    expect(usersName).toEqual(
      expect.arrayContaining(['Juan Dela Cruz', 'Amber Alert'])
    )
  })
})

describe('POST login - unit test for users signin @ /api/login', () => {
  beforeEach(async () => {
    const passwordHash = await bcrypt.hash('pass', 10)

    const username1 = 'username1'
    const username2 = 'username2'

    const user1 = new User({
      username: username1,
      name: 'Juan Dela Cruz',
      passwordHash,
    })
    const user2 = new User({
      username: username2,
      name: 'Amber Alert',
      passwordHash,
    })

    const u1 = await User.create(user1)
    const u2 = await User.create(user2)

    await Promise.all([u1, u2])
  })

  afterEach(async () => {
    await User.deleteMany({})
  })

  test('it can sign in registered user and generates auth token', async () => {
    const user = {
      username: 'username1',
      password: 'pass',
    }

    const signin = await request(app).post('/api/login').send(user)
    expect(signin.type).toEqual('application/json')
    expect(signin.status).toEqual(200)
    expect(signin.body.username).toEqual(user.username)
    expect(signin.body).toHaveProperty('token')
    expect(typeof signin.body.token === 'string').toBeTruthy()
    expect(signin.body.message).toBe('login successful')

    const verifyUser = jwt.verify(signin.body.token, config.jwt_key)
    expect(verifyUser.username).toEqual(user.username)

    const findUser = await User.findOne({ username: user.username })

    expect(findUser.id).toEqual(verifyUser.id)
  })

  test('it should fail on missing/incorrect username', async () => {
    const user = {
      username: '',
      password: 'pass',
    }

    const signin = await request(app).post('/api/login').send(user)
    expect(signin.type).toEqual('application/json')
    expect(signin.status).toBe(400)
    expect(signin.body.error).toBe(
      'Cannot read properties of null (reading \'passwordHash\')'
    )
  })

  test('it should fail on incorrect password', async () => {
    const user = {
      username: 'username1',
      password: 'pas',
    }

    const signin = await request(app).post('/api/login').send(user)
    expect(signin.type).toEqual('application/json')
    expect(signin.status).toBe(400)
    expect(signin.body.error).toEqual('invalid username or password!')
  })
})

describe('GET blogs - unit test for get request @ /api/blogs with default 1 blog for each 2 default users', () => {
  beforeEach(async () => {
    const passwordHash = await bcrypt.hash('pass', 10)

    const username1 = 'username1'
    const username2 = 'username2'

    const user1 = new User({
      username: username1,
      name: 'Juan Dela Cruz',
      passwordHash,
    })
    const user2 = new User({
      username: username2,
      name: 'Amber Alert',
      passwordHash,
    })

    const u1 = await User.create(user1)
    const u2 = await User.create(user2)

    const userOne = await User.findOne({ username: 'username1' })

    const userTwo = await User.findOne({ username: 'username2' })

    const token1 = jwt.sign(
      { username: userOne.username, id: userOne._id },
      config.jwt_key,
      { expiresIn: '1h' }
    )

    const token2 = jwt.sign(
      { username: userTwo.username, id: userTwo._id },
      config.jwt_key,
      { expiresIn: '1h' }
    )

    const post1 = await request(app)
      .post('/api/blogs')
      .set('Authorization', `Bearer ${token1}`)
      .send(helper.postBlog1)

    const post2 = await request(app)
      .post('/api/blogs')
      .set('Authorization', `Bearer ${token2}`)
      .send(helper.postBlog2)

    await Promise.all([u1, u2, post1, post2])
  })

  afterEach(async () => {
    await User.deleteMany({})
    await Blog.deleteMany({})
  })

  test('it renders all blogs owned by registered users', async () => {
    const response = await request(app)
      .get('/api/blogs')
      .set('Accept', 'application/json')

    expect(response.type).toEqual('application/json')
    expect(response.statusCode).toEqual(200)
    expect(Array.isArray(response.body)).toBeTruthy()

    const blogsAtStart = await helper.savedBlogs()
    expect(blogsAtStart).toHaveLength(2)

    const blogs = blogsAtStart.map((blog) => blog.title)
    const expected = ['React patterns', 'TDD harms architecture']
    expect(blogs).toEqual(expect.arrayContaining(expected))

    const usersBlog = blogsAtStart.map((ub) => ub.user)
    expect(Array.isArray(usersBlog)).toBeTruthy()

    const sample = usersBlog[0]
    const user = await User.findById(sample[0])
    expect(user.username).toBe('username1')

    const blogSample = blogsAtStart.map((blog) => blog.user)

    const owner = blogSample[0]
    const blogOwner = await User.findById(owner[0])
    expect(blogOwner.name).toBe('Juan Dela Cruz')
  })
})

afterAll(async () => {
  await mongoose.connection.dropDatabase()
  await mongoose.connection.close()
})
