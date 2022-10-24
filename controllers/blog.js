const config = require('../utils/config')
const express = require('express')
const Blog = require('../models/blog')
const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')
const logger = require('../utils/logger')

const router = express.Router()

const middleware = require('../utils/middleware')
const userExtractor = middleware.userExtractor
const tokenExtractor = middleware.tokenExtractor

router.post('/', tokenExtractor, userExtractor, async (req, res) => {
  const { title, url, likes } = req.body

  //const decoded = jwt.verify(req.token, config.jwt_key)
  jwt.verify(req.token, config.jwt_key) // request obj from tokenExtractor middleware
  //logger.warn(req.token)

  const user = req.user // request obj from userExtractor middleware

  const blog = new Blog({
    title: title,
    author: req.name, // request obj from userExtractor middleware
    url: url,
    likes: likes,
    user: mongoose.Types.ObjectId(user.id),
  })

  if (!title) {
    throw Error('title cannot be blank!')
  } else if (!url) {
    throw Error('url cannot be empty!')
  } else {
    const newBlog = await Blog.create(blog)

    const currentUser = req.currentUser // request obj from userExtractor middleware

    currentUser.blogs = currentUser.blogs.concat(newBlog._id)

    await currentUser.save()

    res.status(201).json(newBlog)
  }

  logger.warn(user.username)
})

router.get('/', async (req, res) => {
  const blogs = await Blog.find({}, 'title author url likes').populate('user', {
    username: 1,
    name: 1,
  })

  if (blogs) {
    res.status(200).json(blogs)
  } else {
    throw Error('there were no blog(s) found!')
  }
})

router.get('/:id', async (req, res) => {
  const id = req.params.id

  const blog = await Blog.findById(id)

  if (blog) {
    res.status(200).json(blog)
  } else if (!blog) {
    throw Error('there were no blog found!')
  }
})

router.delete('/:id', tokenExtractor, userExtractor, async (req, res) => {
  const blog = await Blog.findById(req.params.id)

  //logger.warn(blog.user.toString())

  jwt.verify(req.token, config.jwt_key)

  //const user = await User.findById(decoded.id)
  //const userBlog = user.id.toString()

  const user = req.user
  logger.warn(user)

  if (!blog) {
    throw Error('cannot delete unknown blog!')
  } else if (blog.user.toString() !== user.id) {
    throw Error('no permission to delete this blog!')
  } else if (blog.user.toString() === user.id) {
    await Blog.findByIdAndDelete(req.params.id)

    res.status(200).json({ message: `${req.params.id} deleted!` })
  }
})

router.patch('/:id', async (req, res) => {
  const id = req.params.id

  const blog = await Blog.findById(id)

  if (!blog) {
    throw Error('no blog found!')
  } else if (!id) {
    throw Error('invalid id!')
  }

  if (req.body.title) {
    blog.title = req.body.title
  }
  if (req.body.author) {
    blog.author = req.body.author
  }
  if (req.body.url) {
    blog.url = req.body.url
  }

  if (req.body.likes) {
    blog.likes = req.body.likes
  }
  await blog.save()

  const updatedBlog = await Blog.findOne(
    { _id: req.params.id },
    'title author url likes'
  )

  if (updatedBlog) {
    return res.status(200).json(updatedBlog)
  }
})

module.exports = router
