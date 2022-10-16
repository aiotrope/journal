const express = require('express')
const Blog = require('../models/blog')

const router = express.Router()

router.post('/', (req, res, next) => {
  const { title, author, url, likes } = req.body

  const blog = new Blog({
    title: title,
    author: author,
    url: url,
    likes: likes,
  })
  blog
    .save()
    .then((newBlog) => {
      res.status(201).json({ new_blog: newBlog })
    })
    .catch((err) => next(err))
})

router.get('/', (req, res, next) => {
  Blog.find({})
    .then(blogs => {
      res.status(200).json(blogs)
    })
    .catch(err => next(err))
})

module.exports = router
