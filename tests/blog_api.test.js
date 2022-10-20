/* eslint-disable no-prototype-builtins */
'use strict'
const request = require('supertest')
const app = require('../app')
const mongoose = require('mongoose')
const Blog = require('../models/blog')
const helper = require('./blog_api_test_helper')
const { flatMap } = require('lodash')

beforeAll(async () => {
  const keys = Object.keys(mongoose.connection.collections)
  keys.forEach(async (key) => {
    await mongoose.connection.collections[key].deleteMany({})
  })

  const blogObjs = helper.testblogs
    .map(blog => new Blog(blog))
  const promises = blogObjs.map(b => b.save())
  await Promise.all(promises)
})


describe('if there is a saved collection of blogs', () => {
  test('it returns json-formatted bloglist with status code 200', async () => {
    await request(app)
      .get('/api/blogs')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200)
      .then((response) => {
        expect(response.type).toEqual('application/json')
        expect(response.statusCode).toEqual(200)
        expect(response.body.length).toBe(6)

      })
  })
  test('it returns all blogs with specified length', async () => {
    const response = await request(app).get('/api/blogs').set('Accept', 'application/json')

    expect(response.type).toEqual('application/json')

    expect(response.statusCode).toEqual(200)

    expect(Array.isArray(response.body)).toBeTruthy()

    expect(response.body.length).toEqual(6)

    const titles = response.body.map(res => res.title)

    const expected = ['Canonical string reduction', 'React patterns', 'Go To Statement Considered Harmful', 'First class tests', 'TDD harms architecture', 'Type wars']

    expect(titles).toEqual(expect.arrayContaining(expected))

  })
  test('it will retrieved specified blog', async () => {

    const blogsOnDB = await helper.savedBlog()

    const sampleBlog = blogsOnDB[4]

    const response = await request(app).get(`/api/blogs/${sampleBlog.id}`).set('Accept', 'application/json')

    expect(response.type).toEqual('application/json')
    expect(response.status).toEqual(200)
    expect(response.body).toEqual(JSON.parse(JSON.stringify(sampleBlog)))

  })
})

describe('check the default unique identifier of blog documents', () => {
  test('it will verify that id property in response body is the unique identifier', async () => {
    const response = await request(app).get('/api/blogs').set('Accept', 'application/json')

    expect(response.type).toEqual('application/json')
    expect(response.statusCode).toEqual(200)
    expect(Array.isArray(response.body)).toBeTruthy()

    const blogs = response.body.map(blog => Object.keys(blog))

    const mapKeys = flatMap(blogs, (key) => {return key})

    expect(mapKeys).toContain('id')
    expect(mapKeys.includes('_id')).toBeFalsy()
  })

  test('it will verify that the save blogs have id as unique identifier not _id', async () => {
    const response = await request(app).get('/api/blogs').set('Accept', 'application/json')

    expect(response.type).toEqual('application/json')
    expect(response.statusCode).toEqual(200)
    expect(Array.isArray(response.body)).toBeTruthy()

    const blogsOnDB = await helper.savedBlog()

    const blogs = blogsOnDB.map(blog => Object.keys(blog))

    const mapKeys = flatMap(blogs, (key) => {return key})

    expect(mapKeys).toContain('id')
    expect(mapKeys.includes('_id')).toBeFalsy()

  })

})

describe('if there is a new entry of blogs to be saved', () => {
  test('it checks if addition of blog is successful and all of the essential properties are included', async () => {
    await request(app).post('/api/blogs').send(helper.postData)
      .expect('Content-Type', /json/)
      .expect(201)
      .then(async (res) => {
        expect.objectContaining({
          title: expect(helper.postData.title),
          author: expect(helper.postData.author),
          url: expect(helper.postData.url),
          likes: expect(helper.postData.likes),
        })
        expect(res.body.id).toBeTruthy()
        expect(res.body.id).toBeDefined()
        expect(res.body).toHaveProperty('id')
        expect(res.body._id).toBeUndefined()
        expect(res.body._id).toBeFalsy()
        expect(res.body).not.toHaveProperty('_id')
        expect(res.body).toHaveProperty('title')
        expect(res.body).toHaveProperty('author')
        expect(res.body).toHaveProperty('url')
        expect(res.body).toHaveProperty('likes')
      })
  })


  test('it checks if the new posted blog has been added', async () => {
    const response = await request(app).get('/api/blogs').set('Accept', 'application/json')

    expect(response.type).toEqual('application/json')
    expect(response.statusCode).toEqual(200)

    const latest = await helper.savedBlog()

    expect(latest).toBeTruthy()
    expect(latest.length).toEqual(helper.testblogs.length + 1)
    expect(latest.length).toBe(7)
    expect(latest[6].title).toEqual(helper.postData.title)
    expect(latest[6].url).toEqual(helper.postData.url)

  })

})


describe('likes field is missing, null or undefined', () => {
  test('it checks if nullified likes field will default to zero', async () => {
    const blogs = await Blog.find({})
    await blogs[6].remove()

    const post = await request(app).post('/api/blogs').send(helper.postDataNoLikesProp)
    expect(post.type).toEqual('application/json')
    expect(post.statusCode).toEqual(201)
    expect(post.body).toMatchObject(helper.postDataNoLikesProp)
    expect(post.body.id).toBeTruthy()
    expect(post.body.id).toBeDefined()
    expect(post.body._id).toBeUndefined()
    expect(post.body).not.toHaveProperty('_id')
    expect(post.body.likes).toBeDefined()
    expect(post.body.likes).toEqual(0)

    const getLatest = await helper.savedBlog()

    expect(getLatest.length).toBe(7)
    expect(getLatest[6].likes).toEqual(helper.zeroLikesData.likes)

  })


})

describe('sending empty/blank title or url field', () => {
  test('it verifies if blank title fields will give a response of HTTP 400 error code', async () => {
    const blogs = await Blog.find({})
    await blogs[6].remove()

    const post = await request(app).post('/api/blogs').send(helper.blankTitle)

    expect(post.status).toEqual(400)
    expect(post.clientError).toBeTruthy()
    expect(post.body.error).toBe('title cannot be blank!')

  })

  test('it verifies if blank url fields will give a response of HTTP 400 error code', async () => {
    const post = await request(app).post('/api/blogs').send(helper.blankUrl)

    expect(post.status).toEqual(400)
    expect(post.clientError).toBeTruthy()
    expect(post.body.error).toBe('url cannot be empty!')

  })
})


afterAll( async () => {
  await mongoose.connection.dropDatabase()
  await mongoose.connection.close()
})