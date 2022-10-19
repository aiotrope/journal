const request = require('supertest')
const app = require('../app')
const Blog = require('../models/blog')
const helper = require('./blog_api_test_helper')

beforeAll(async () => {
  await Blog.deleteMany({})

  const blogObjs = helper.testblogs
    .map(blog => new Blog(blog))
  const promises = blogObjs.map(b => b.save())
  await Promise.all(promises)
})


describe('TEST /api/blogs endpoint', () => {
  test('returns json-formatted bloglist with correct specified length and status code of 200', async () => {
    await request(app)
      .get('/api/blogs')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200)
      .then((response) => {
        expect(response.type).toEqual('application/json')
        expect(response.statusCode).toEqual(200)
        expect(response.body.length).toBe(6)
        expect(response.body.length).not.toBe(7)
        expect(response.body.length).toEqual(helper.testblogs.length)
      })
  })
  test('verify id instead of _id', async () => {

    const response = await request(app).get('/api/blogs').set('Accept', 'application/json')
    expect(response.type).toEqual('application/json')
    expect(response.statusCode).toEqual(200)
    expect(Array.isArray(response.body)).toBeTruthy()
    expect(response.body[0]._id).toBeUndefined()
    expect(response.body[5].id).toBeDefined()
    expect(response.body[2].id).toBeDefined()
    expect(response.body[3].id).toBeTruthy()
    expect(response.body[4]._id).toBeFalsy()
    expect(response.body[3]).toHaveProperty('id')
    expect(response.body[3]).not.toHaveProperty('_id')
    expect(response.body[1].id).toBeTruthy()
    expect(response.body[4]).toHaveProperty('id')
    expect(response.body[0]._id).toBeFalsy()
    expect(response.body[0]).toHaveProperty('id')
  })
  test('check for sequent POST request and new data is added on the saved blogs', async () => {
    await request(app).post('/api/blogs').send(helper.postData)
      .expect('Content-Type', /json/)
      .expect(201)
      .then(async (res) => {
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

    const latest = await helper.savedBlog()
    expect(latest).toBeTruthy()
    expect(latest.length).toEqual(helper.testblogs.length + 1)
    expect(latest.length).toBe(7)
    expect(latest[6].title).toEqual(helper.postData.title)
    expect(latest[6].url).toEqual(helper.postData.url)

  })
})


afterAll( async () => helper.closeDB())
