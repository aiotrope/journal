const config = require('../utils/config')
const express = require('express')
const Blog = require('../models/blog')
const User = require('../models/user')
const jwt = require('jsonwebtoken')
const logger = require('../utils/logger')
const mongoose = require('mongoose')


const router = express.Router()

router.post('/', async (req, res) => {
  const { title, author, url, likes } = req.body

  //const decoded = jwt.verify(req.token, config.jwt_key)

  jwt.verify(req.token, config.jwt_key)
  //logger.warn(req.token)

  const user = req.user

  const blog = new Blog({
    title: title,
    author: author,
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

    const currentUser = req.currentUser

    currentUser.blogs = currentUser.blogs.concat(newBlog._id)

    await currentUser.save()


    res.status(201).json(newBlog)
  }


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

router.delete('/:id', async (req, res) => {
  const blog = await Blog.findById(req.params.id)

  //logger.warn(blog.user.toString())

  const decoded = jwt.verify(req.token, config.jwt_key)

  const user = await User.findById(decoded.id)
  //const userBlog = user.id.toString()

  if (!blog) {
    throw Error('cannot delete unknown blog!')
  } else if (blog.user.toString() !== user.id.toString()) {
    throw Error('no permission to delete this blog!')
  } else if (blog.user.toString() === user.id.toString()) {
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
