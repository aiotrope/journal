const express = require('express')
const Blog = require('../models/blog')

const router = express.Router()

router.post('/', async (req, res) => {
  const { title, author, url, likes } = req.body

  const blog = new Blog({
    title: title,
    author: author,
    url: url,
    likes: likes,
  })
  const newBlog = await blog.save()
  res.status(201).json(newBlog)

})

router.get('/', async (req, res) => {
  const blogs = await Blog.find({}, 'title author url likes')

  if(blogs) {
    res.status(200).json(blogs)
  } else{
    res.status(404).end()
  }

})

module.exports = router
