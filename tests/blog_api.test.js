/* eslint-disable quotes */
/* eslint-disable no-prototype-builtins */
'use strict'
const request = require('supertest')
const app = require('../app')
const mongoose = require('mongoose')
const Blog = require('../models/blog')
const helper = require('./blog_api_test_helper')
const { flatMap } = require('lodash')
const logger = require('../utils/logger')

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


describe('GET blogs - unit test for get request @ /api/blogs', () => {
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

  test('it returns all initialized blogs', async () => {
    const response = await request(app).get('/api/blogs').set('Accept', 'application/json')

    expect(response.type).toEqual('application/json')

    expect(response.statusCode).toEqual(200)

    expect(Array.isArray(response.body)).toBeTruthy()

    expect(response.body.length).toEqual(6)

    const titles = response.body.map(res => res.title)

    const expected = ['Canonical string reduction', 'React patterns', 'Go To Statement Considered Harmful', 'First class tests', 'TDD harms architecture', 'Type wars']

    expect(titles).toEqual(expect.arrayContaining(expected))

  })

  test('it retrieves a specified blog from the bloglist', async () => {

    const blogsOnDB = await helper.savedBlog()

    const sampleBlog = blogsOnDB[4]

    const response = await request(app).get(`/api/blogs/${sampleBlog.id}`).set('Accept', 'application/json')

    expect(response.type).toEqual('application/json')
    expect(response.status).toEqual(200)
    expect(response.body).toEqual(JSON.parse(JSON.stringify(sampleBlog)))

  })

  test('it returns HTTP 400 for using an invalid id', async () => {

    const inavalidID = '6351z595733562265y936xz4'

    const response = await request(app).get(`/api/blogs/${inavalidID}`).set('Accept', 'application/json')

    expect(response.status).toBe(400)

  })

  test('it returns HTTP 404 for using a non-existent id', async () => {

    const randomId = await helper.generateObjectID()

    logger.warn(randomId)

    const response = await request(app).get(`/api/blogs/${randomId}`).set('Accept', 'application/json')

    expect(response.status).toBe(404)

  })

  test('it verifies that id property in response body is the unique identifier', async () => {
    const response = await request(app).get('/api/blogs').set('Accept', 'application/json')

    expect(response.type).toEqual('application/json')
    expect(response.statusCode).toEqual(200)
    expect(Array.isArray(response.body)).toBeTruthy()

    const blogs = response.body.map(blog => Object.keys(blog))

    const mapKeys = flatMap(blogs, (key) => {return key})

    expect(mapKeys).toContain('id')
    expect(mapKeys.includes('_id')).toBeFalsy()
  })

  test('It checks that the saved blogs have a unique identifier known as id rather than _id.', async () => {
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

describe('POST blogs - unit test for post request @ /api/blogs', () => {
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

  test('it checks if likes field is null or missing, the like value will set to zero', async () => {
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

  test('It checks to see if blank title fields will result in an HTTP 400 error code response', async () => {
    const blogs = await Blog.find({})
    await blogs[6].remove()

    const post = await request(app).post('/api/blogs').send(helper.blankTitle)

    expect(post.status).toEqual(400)
    expect(post.clientError).toBeTruthy()

  })

  test('it verifies if blank url fields will give a response of HTTP 400 error code', async () => {
    const post = await request(app).post('/api/blogs').send(helper.blankUrl)

    expect(post.status).toEqual(400)
    expect(post.clientError).toBeTruthy()

  })
})

describe('DELETE blogs/:id - unit test for delete request @ /api/blogs/:id', () => {
  test('it can delete a blog of specified id', async () => {
    const initialBlogList = await helper.savedBlog()
    const sampleBlog = initialBlogList[5]

    const response = await request(app).delete(`/api/blogs/${sampleBlog.id}`)
    expect(response.status).toBe(200)

    const latestBlogList = await helper.savedBlog()

    expect(latestBlogList.length).toEqual(helper.testblogs.length - 1)

  })
  test('it returns HTTP 400 for using an invalid id', async () => {
    const inavalidID = '1051z795733562265a936fa3'

    const response = await request(app).delete(`/api/blogs/${inavalidID}`)
    expect(response.status).toBe(400)

  })

  test('it returns HTTP 404 for using a non-existent id', async () => {

    const randomId = await helper.generateObjectID()

    const response = await request(app).delete(`/api/blogs/${randomId}`)
    expect(response.status).toBe(404)

  })


})

describe('PATCH blogs/:id - unit test for patch request @ /api/blogs/:id', () => {

  test('it can update four fields at a time', async () => {
    const blogsOnDBBefore = await helper.savedBlog()

    const sampleBlogBefore = blogsOnDBBefore[3]

    const responseBefore = await request(app).patch(`/api/blogs/${sampleBlogBefore.id}`).send(helper.postData)

    expect(responseBefore.status).toBe(200)
    expect(responseBefore.type).toBe('application/json')
    expect(sampleBlogBefore.title).not.toEqual(helper.postData.title)
    expect(sampleBlogBefore.author).not.toEqual(helper.postData.author)
    expect(sampleBlogBefore.url).not.toEqual(helper.postData.url)
    expect(sampleBlogBefore.likes).not.toEqual(helper.postData.likes)

    const blogsOnDBAfter = await helper.savedBlog()

    const sampleBlogAfter = blogsOnDBAfter[3]

    const responseAfter = await request(app).get(`/api/blogs/${sampleBlogAfter.id}`).set('Accept', 'application/json')

    expect(responseAfter.status).toBe(200)
    expect(responseAfter.type).toBe('application/json')
    expect(sampleBlogBefore.id).toEqual(sampleBlogAfter.id)
    expect(sampleBlogAfter.title).toEqual(helper.postData.title)
    expect(sampleBlogAfter.author).toEqual(helper.postData.author)
    expect(sampleBlogAfter.url).toEqual(helper.postData.url)
    expect(sampleBlogAfter.likes).toEqual(helper.postData.likes)

  })

  test('it can update only one field at a time e.g. likes', async () => {

    const blogsOnDBStart = await helper.savedBlog()

    const sampleBlogStart = blogsOnDBStart[4]

    const responseStart = await request(app).patch(`/api/blogs/${sampleBlogStart.id}`).send({ likes: 4 })

    expect(responseStart.status).toBe(200)
    expect(responseStart.type).toBe('application/json')
    expect(sampleBlogStart.likes).not.toEqual(4)

    const blogsOnDBFinal = await helper.savedBlog()

    const sampleBlogFinal = blogsOnDBFinal[4]

    const responseFinal = await request(app).get(`/api/blogs/${sampleBlogFinal.id}`).set('Accept', 'application/json')

    expect(responseFinal.status).toBe(200)
    expect(responseFinal.type).toBe('application/json')
    expect(sampleBlogStart.id).toEqual(sampleBlogFinal.id)
    expect(sampleBlogFinal.likes).toEqual(4)

  })

  test('it returns HTTP 404 for using a non-existent id', async () => {
    const randomId = await helper.generateObjectID()

    const response = await request(app).patch(`/api/blogs/${randomId}`)

    expect(response.status).toBe(404)

  })

  test('it returns HTTP 400 for using an invalid id', async () => {
    const inavalidID = '1051z795733562265a936fa3'

    const response = await request(app).patch(`/api/blogs/${inavalidID}`)

    expect(response.status).toBe(400)

  })

})

afterAll( async () => {
  await mongoose.connection.dropDatabase()
  await mongoose.connection.close()
})