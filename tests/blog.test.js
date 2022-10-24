/* eslint-disable quotes */
/* eslint-disable no-prototype-builtins */
"use strict"
const config = require("../utils/config")
const request = require("supertest")
const app = require("../app")
const mongoose = require("mongoose")
const Blog = require("../models/blog")
const User = require("../models/user")
const helper = require("./helper")
const { flatMap } = require("lodash")
const logger = require("../utils/logger")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")

beforeAll(async () => {
  const keys = Object.keys(mongoose.connection.collections)
  keys.forEach(async (key) => {
    await mongoose.connection.collections[key].deleteMany({})
  })

  const passwordHash = await bcrypt.hash("pass", 10)

  const username1 = "username1"

  const user1 = new User({
    username: username1,
    name: "Juan Dela Cruz",
    passwordHash,
  })

  const user = await User.create(user1)

  const token = jwt.sign(
    { username: user.username, id: user._id },
    config.jwt_key,
    { expiresIn: "1h" }
  )

  const post1 = await request(app)
    .post("/api/blogs")
    .set("Authorization", `Bearer ${token}`)
    .send(helper.testblogs[0])
  const post2 = await request(app)
    .post("/api/blogs")
    .set("Authorization", `Bearer ${token}`)
    .send(helper.testblogs[1])
  const post3 = await request(app)
    .post("/api/blogs")
    .set("Authorization", `Bearer ${token}`)
    .send(helper.testblogs[2])
  const post4 = await request(app)
    .post("/api/blogs")
    .set("Authorization", `Bearer ${token}`)
    .send(helper.testblogs[3])
  const post5 = await request(app)
    .post("/api/blogs")
    .set("Authorization", `Bearer ${token}`)
    .send(helper.testblogs[4])
  const post6 = await request(app)
    .post("/api/blogs")
    .set("Authorization", `Bearer ${token}`)
    .send(helper.testblogs[5])

  await Promise.all([user, post1, post2, post3, post4, post5, post6])
})

describe("GET blogs - unit test for get request @ /api/blogs with five(5) default blogs created by username1", () => {
  test("it returns json-formatted blog list", async () => {
    await request(app)
      .get("/api/blogs")
      .set("Accept", "application/json")
      .expect("Content-Type", /json/)
      .expect(200)
      .then((response) => {
        expect(response.type).toEqual("application/json")
        expect(response.statusCode).toEqual(200)
        expect(response.body.length).toBe(6)
      })
  })

  test("it returns all initialised blogs", async () => {
    const response = await request(app)
      .get("/api/blogs")
      .set("Accept", "application/json")

    expect(response.type).toEqual("application/json")

    expect(response.statusCode).toEqual(200)

    expect(Array.isArray(response.body)).toBeTruthy()

    expect(response.body.length).toEqual(6)

    const titles = response.body.map((res) => res.title)

    const expected = [
      "Canonical string reduction",
      "React patterns",
      "Go To Statement Considered Harmful",
      "First class tests",
      "TDD harms architecture",
      "Type wars",
    ]

    expect(titles).toEqual(expect.arrayContaining(expected))

    const authors = response.body.map((res) => res.author)

    expect(authors).toEqual(
      expect.arrayContaining([
        "Juan Dela Cruz",
        "Juan Dela Cruz",
        "Juan Dela Cruz",
        "Juan Dela Cruz",
        "Juan Dela Cruz",
        "Juan Dela Cruz",
      ])
    )
  })

  test("it retrieves a specified blog from the blog list", async () => {
    const blogsOnDB = await helper.savedBlogs()

    const sampleBlog = blogsOnDB[4]

    const response = await request(app)
      .get(`/api/blogs/${sampleBlog.id}`)
      .set("Accept", "application/json")

    expect(response.type).toEqual("application/json")
    expect(response.status).toEqual(200)
    expect(response.body).toEqual(JSON.parse(JSON.stringify(sampleBlog)))
  })

  test("it returns error for accessing single blog with invalid blog id as param", async () => {
    const inavalidID = "6351z595733562265y936xz4"

    const response = await request(app)
      .get(`/api/blogs/${inavalidID}`)
      .set("Accept", "application/json")

    expect(response.status).toBe(400)
  })

  test("it returns error for accessing single blog with non-existent blog id as param", async () => {
    const randomId = await helper.generateObjectID()

    logger.warn(randomId)

    const response = await request(app)
      .get(`/api/blogs/${randomId}`)
      .set("Accept", "application/json")

    expect(response.status).toBe(404)
  })

  test("it verifies that id property in response body is the unique identifier", async () => {
    const response = await request(app)
      .get("/api/blogs")
      .set("Accept", "application/json")

    expect(response.type).toEqual("application/json")
    expect(response.statusCode).toEqual(200)
    expect(Array.isArray(response.body)).toBeTruthy()

    const blogs = response.body.map((blog) => Object.keys(blog))

    const mapKeys = flatMap(blogs, (key) => {
      return key
    })

    expect(mapKeys).toContain("id")
    expect(mapKeys.includes("_id")).toBeFalsy()
  })

  test("it checks that the saved blogs have a unique identifier known as id rather than _id", async () => {
    const response = await request(app)
      .get("/api/blogs")
      .set("Accept", "application/json")

    expect(response.type).toEqual("application/json")
    expect(response.statusCode).toEqual(200)
    expect(Array.isArray(response.body)).toBeTruthy()

    const blogsOnDB = await helper.savedBlogs()

    const blogs = blogsOnDB.map((blog) => Object.keys(blog))

    const mapKeys = flatMap(blogs, (key) => {
      return key
    })

    expect(mapKeys).toContain("id")
    expect(mapKeys.includes("_id")).toBeFalsy()
  })
})

describe("POST blogs - unit test for post request @ /api/blogs five(5) default blogs created by username1", () => {
  test("it checks if addition of blog is successful and all of the essential properties are defined", async () => {
    const sampleUser = await User.findOne({ username: "username1" })

    const token = jwt.sign(
      { username: sampleUser.username, id: sampleUser._id },
      config.jwt_key,
      { expiresIn: "1h" }
    )

    await request(app)
      .post("/api/blogs")
      .set("Authorization", `Bearer ${token}`)
      .send(helper.postData)
      .expect("Content-Type", /json/)
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
        expect(res.body).toHaveProperty("id")
        expect(res.body._id).toBeUndefined()
        expect(res.body._id).toBeFalsy()
        expect(res.body).not.toHaveProperty("_id")
        expect(res.body).toHaveProperty("title")
        expect(res.body).toHaveProperty("author")
        expect(res.body).toHaveProperty("url")
        expect(res.body).toHaveProperty("likes")
      })
  })

  test("it checks if the posted blog has been added", async () => {
    const response = await request(app)
      .get("/api/blogs")
      .set("Accept", "application/json")

    expect(response.type).toEqual("application/json")
    expect(response.statusCode).toEqual(200)

    const latest = await helper.savedBlogs()

    expect(latest).toBeTruthy()
    expect(latest.length).toEqual(helper.testblogs.length + 1)
    expect(latest.length).toBe(7)
    expect(latest[6].title).toEqual(helper.postData.title)
    expect(latest[6].url).toEqual(helper.postData.url)
  })

  test("it checks if likes field is null or missing, the like value will set to zero", async () => {
    const blogs = await Blog.find({})
    await blogs[6].remove()

    const sampleUser = await User.findOne({ username: "username1" })

    const token = jwt.sign(
      { username: sampleUser.username, id: sampleUser._id },
      config.jwt_key,
      { expiresIn: "1h" }
    )

    const post = await request(app)
      .post("/api/blogs")
      .set("Authorization", `Bearer ${token}`)
      .send(helper.postDataNoLikesProp)
    expect(post.type).toEqual("application/json")
    expect(post.statusCode).toEqual(201)
    expect(post.body).toMatchObject(helper.postDataNoLikesProp)
    expect(post.body.id).toBeTruthy()
    expect(post.body.id).toBeDefined()
    expect(post.body._id).toBeUndefined()
    expect(post.body).not.toHaveProperty("_id")
    expect(post.body.likes).toBeDefined()
    expect(post.body.likes).toEqual(0)

    const getLatest = await helper.savedBlogs()

    expect(getLatest.length).toBe(7)
    expect(getLatest[6].likes).toEqual(helper.zeroLikesData.likes)
  })

  test("it checks to see if blank title fields will result into error response", async () => {
    const sampleUser = await User.findOne({ username: "username1" })

    const token = jwt.sign(
      { username: sampleUser.username, id: sampleUser._id },
      config.jwt_key,
      { expiresIn: "30m" }
    )
    const blogs = await Blog.find({})
    await blogs[6].remove()

    const post = await request(app)
      .post("/api/blogs")
      .set("Authorization", `Bearer ${token}`)
      .send(helper.blankTitle)

    expect(post.status).toEqual(400)
    expect(post.clientError).toBeTruthy()
  })

  test("it verifies if blank url fields will give error response", async () => {
    const sampleUser = await User.findOne({ username: "username1" })

    const token = jwt.sign(
      { username: sampleUser.username, id: sampleUser._id },
      config.jwt_key,
      { expiresIn: "30m" }
    )

    const post = await request(app)
      .post("/api/blogs")
      .set("Authorization", `Bearer ${token}`)
      .send(helper.blankUrl)

    expect(post.status).toEqual(400)
    expect(post.clientError).toBeTruthy()
  })

  test("it returns error for users attempting to create a blog without token", async () => {
    const response = await request(app)
      .post("/api/blogs")
      .send(helper.testblogs[4])
    expect(response.type).toBe("application/json")
    expect(response.statusCode).toBe(401)
    expect(response.body.error).toBe(
      "unauthorize! token maybe incorrect or missing!"
    )
    expect(response.body.id).toBeFalsy()
  })

  test("it returns error response for using incorrect token", async () => {
    const token = helper.fakeToken

    const response = await request(app)
      .post("/api/blogs")
      .set("Authorization", `Bearer ${token}`)
      .send(helper.testblogs[2])
    expect(response.type).toBe("application/json")
    expect(response.statusCode).toBe(401)
    expect(response.body.error).toBe(
      "unauthorize! token maybe incorrect or missing!"
    )
    expect(response.body).not.toHaveProperty("id")
  })
})

describe("DELETE blogs/:id - unit test for delete request @ /api/blogs/:id protected route", () => {
  test("it can delete a specified blog, by the authenticated user who created the blog", async () => {
    const sampleUser = await User.findOne({ username: "username1" })

    const token = jwt.sign(
      { username: sampleUser.username, id: sampleUser._id },
      config.jwt_key,
      { expiresIn: "1h" }
    )

    const initialBlogList = await helper.savedBlogs()
    const sampleBlog = initialBlogList[5]

    const response = await request(app)
      .delete(`/api/blogs/${sampleBlog.id}`)
      .set("Authorization", `Bearer ${token}`)
    expect(response.type).toBe("application/json")
    expect(response.statusCode).toBe(200)
    expect(response.body.message).toBe(`${sampleBlog.id} deleted!`)
    expect(typeof response.body).toBe("object")

    const findDeletedBlog = await Blog.findById(sampleBlog.id)
    expect(findDeletedBlog).toBeNull()

    const latestBlogList = await helper.savedBlogs()

    expect(latestBlogList.length).toEqual(helper.testblogs.length - 1)
  })
  test("It should return an error if a user with a token attempts to delete a blog that they do not own", async () => {
    const passwordHash = await bcrypt.hash("pass", 10)
    const username = "username2"
    const newUser = new User({
      username: username,
      name: "Amber Alert",
      passwordHash,
    })

    const user = await User.create(newUser)

    const deleter = await User.findOne({ username: user.username })

    const token = jwt.sign(
      { username: deleter.username, id: deleter._id },
      config.jwt_key,
      { expiresIn: "30m" }
    )

    const initialBlogList = await helper.savedBlogs()
    const sampleBlog = initialBlogList[3]

    const response = await request(app)
      .delete(`/api/blogs/${sampleBlog.id}`)
      .set("Authorization", `Bearer ${token}`)
    expect(response.type).toBe("application/json")
    expect(response.status).toBe(403)
    expect(response.body.error).toBe("no permission to delete this blog!")
    expect(sampleBlog).not.toBeNull()

    const findDeletedBlog = await Blog.findById(sampleBlog.id)
    expect(findDeletedBlog).not.toBeNull()
  })

  test("it returns error for user without token to do a delete request", async () => {
    const initialBlogList = await helper.savedBlogs()
    const sampleBlog = initialBlogList[4]

    const response = await request(app)
      .delete(`/api/blogs/${sampleBlog.id}`)
      .set("Accept", "application/json")
    expect(response.type).toBe("application/json")
    expect(response.statusCode).toBe(401)
    expect(response.body.error).toBe(
      "unauthorize! token maybe incorrect or missing!"
    )
    expect(response.body.id).toBeFalsy()
  })

  test("it returns errors for users using incorrect token", async () => {
    const initialBlogList = await helper.savedBlogs()

    const sampleBlog = initialBlogList[1]

    const token = helper.fakeToken

    const response = await request(app)
      .delete(`/api/blogs/${sampleBlog.id}`)
      .set("Authorization", `Bearer ${token}`)
    expect(response.type).toBe("application/json")
    expect(response.statusCode).toBe(401)
    expect(response.body.error).toBe(
      "unauthorize! token maybe incorrect or missing!"
    )
    expect(response.body).not.toHaveProperty("id")
  })

  test("it returns error for using an invalid blog id as params", async () => {
    const sampleUser = await User.findOne({ username: "username1" })

    const token = jwt.sign(
      { username: sampleUser.username, id: sampleUser._id },
      config.jwt_key,
      { expiresIn: "1h" }
    )

    const inavalidID = "1051z795733562265a936fa3"

    const response = await request(app)
      .delete(`/api/blogs/${inavalidID}`)
      .set("Authorization", `Bearer ${token}`)
    expect(response.status).toBe(400)
  })

  test("it returns error for using a non-existent blog id as param", async () => {
    const sampleUser = await User.findOne({ username: "username1" })

    const token = jwt.sign(
      { username: sampleUser.username, id: sampleUser._id },
      config.jwt_key,
      { expiresIn: "1h" }
    )

    const randomId = await helper.generateObjectID()

    const response = await request(app)
      .delete(`/api/blogs/${randomId}`)
      .set("Authorization", `Bearer ${token}`)
    expect(response.status).toBe(404)
  })
})

describe("PATCH blogs/:id - unit test for patch request @ /api/blogs/:id", () => {
  test("it can update a blog", async () => {
    const blogsOnDBBefore = await helper.savedBlogs()

    const sampleBlogBefore = blogsOnDBBefore[3]

    const responseBefore = await request(app)
      .patch(`/api/blogs/${sampleBlogBefore.id}`)
      .send(helper.postData)

    expect(responseBefore.status).toBe(200)
    expect(responseBefore.type).toBe("application/json")
    expect(sampleBlogBefore.title).not.toEqual(helper.postData.title)
    expect(sampleBlogBefore.author).not.toEqual(helper.postData.author)
    expect(sampleBlogBefore.url).not.toEqual(helper.postData.url)
    expect(sampleBlogBefore.likes).not.toEqual(helper.postData.likes)

    const blogsOnDBAfter = await helper.savedBlogs()

    const sampleBlogAfter = blogsOnDBAfter[3]

    const responseAfter = await request(app)
      .get(`/api/blogs/${sampleBlogAfter.id}`)
      .set("Accept", "application/json")

    expect(responseAfter.status).toBe(200)
    expect(responseAfter.type).toBe("application/json")
    expect(sampleBlogBefore.id).toEqual(sampleBlogAfter.id)
    expect(sampleBlogAfter.title).toEqual(helper.postData.title)
    expect(sampleBlogAfter.author).toEqual(helper.postData.author)
    expect(sampleBlogAfter.url).toEqual(helper.postData.url)
    expect(sampleBlogAfter.likes).toEqual(helper.postData.likes)
  })

  test("it can update only one field at a time e.g. likes", async () => {
    const blogsOnDBStart = await helper.savedBlogs()

    const sampleBlogStart = blogsOnDBStart[4]

    const responseStart = await request(app)
      .patch(`/api/blogs/${sampleBlogStart.id}`)
      .send({ likes: 4 })

    expect(responseStart.status).toBe(200)
    expect(responseStart.type).toBe("application/json")
    expect(sampleBlogStart.likes).not.toEqual(4)

    const blogsOnDBFinal = await helper.savedBlogs()

    const sampleBlogFinal = blogsOnDBFinal[4]

    const responseFinal = await request(app)
      .get(`/api/blogs/${sampleBlogFinal.id}`)
      .set("Accept", "application/json")

    expect(responseFinal.status).toBe(200)
    expect(responseFinal.type).toBe("application/json")
    expect(sampleBlogStart.id).toEqual(sampleBlogFinal.id)
    expect(sampleBlogFinal.likes).toEqual(4)
  })

  test("it returns errors for using a non-existent blog id", async () => {
    const randomId = await helper.generateObjectID()

    const response = await request(app).patch(`/api/blogs/${randomId}`)

    expect(response.status).toBe(404)
  })

  test("it returns error for using an invalid blog id", async () => {
    const inavalidID = "1051z795733562265a936fa3"

    const response = await request(app).patch(`/api/blogs/${inavalidID}`)

    expect(response.status).toBe(400)
  })
})

afterAll(async () => {
  await mongoose.connection.dropDatabase()
  await mongoose.connection.close()
})
