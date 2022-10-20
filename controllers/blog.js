const express = require('express')
const Blog = require('../models/blog')
/* const logger = require('../utils/logger')
const createError = require('http-errors') */

const router = express.Router()

router.post('/', async (req, res) => {
  const { title, author, url } = req.body

  const createBlog = {
    title: title,
    author: author,
    url: url
  }

  if(!title) {
    throw Error('title cannot be blank!')
  }else if(!url) {
    throw Error('url cannot be empty!')
  }else {
    const newBlog = await Blog.create(createBlog)
    res.status(201).json(newBlog)
  }
})

router.get('/', async (req, res) => {
  const blogs = await Blog.find({}, 'title author url likes')

  if(blogs) {
    res.status(200).json(blogs)
  } else{
    throw Error('there were no blog(s) found!')
  }

})

router.get('/:id', async (req, res) => {
  const id = req.params.id

  const blog = await Blog.findById(id)

  if(blog) {
    res.status(200).json(blog)
  } else{
    throw Error('there were no blog(s) found!')
  }

})

router.delete('/:id', async (req, res) => {
  const id = req.params.id

  const blog = await Blog.findByIdAndDelete(id)

  if(blog) {
    res.status(200).json({ message: `${id} deleted!` })
  } else{
    throw Error('there were no blog(s) found!')
  }

})


router.put('/:id', async (req, res) => {
  const id = req.params.id

  const { title, author, url, likes } = req.body

  const updateBlog = {
    title: title,
    author: author,
    url: url,
    likes: likes
  }

  const opts = { new: true, upsert: true, setDefaultsOnInsert: true }

  const blogUpdates = await Blog.findOneAndUpdate({ _id: id }, updateBlog, opts)

  if(blogUpdates) {
    res.status(200).json({ updatedBlogList: blogUpdates })
  } else{
    throw Error('there is a problem updating blog!')
  }

})



module.exports = router
