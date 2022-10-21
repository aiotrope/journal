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

  if (!title) {
    throw Error('title cannot be blank!')
  } else if (!url) {
    throw Error('url cannot be empty!')
  } else {
    const newBlog = await Blog.create(blog)
    res.status(201).json(newBlog)
  }
})

router.get('/', async (req, res) => {
  const blogs = await Blog.find({}, 'title author url likes')

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
  } else if(!blog) {
    throw Error('there were no blog found!')
  }
})

router.delete('/:id', async (req, res) => {
  const id = req.params.id

  const blog = await Blog.findByIdAndDelete(id)

  if (blog) {
    res.status(200).json({ message: `${id} deleted!` })
  } else if(!blog){
    throw Error('cannot delete unknown blog!')
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

  const updatedBlog = await Blog.findOne({ _id: req.params.id }, 'title author url likes')

  if(updatedBlog) {
    res.status(200).json(updatedBlog)
  }


})

module.exports = router
