const Blog = require('../models/blog')
const User = require('../models/user')
const mongoose = require('mongoose')

const testblogs = [
  {
    title: 'React patterns',
    url: 'https://reactpatterns.com/',
    likes: 7,
  },
  {
    title: 'Go To Statement Considered Harmful',
    url: 'http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html',
    likes: 5,
  },
  {
    title: 'Canonical string reduction',
    url: 'http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html',
    likes: 12,
  },
  {
    title: 'First class tests',
    url: 'http://blog.cleancoder.com/uncle-bob/2017/05/05/TestDefinitions.htmll',
    likes: 10,
  },
  {
    title: 'TDD harms architecture',
    url: 'http://blog.cleancoder.com/uncle-bob/2017/03/03/TDD-Harms-Architecture.html',
    likes: 0,
  },
  {
    title: 'Type wars',
    url: 'http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html',
    likes: 2,
  },
]

const postData = {
  title:
    'Two heads are better than one: What second brains say about how developers work',
  author: 'Eira May',
  url: 'https://stackoverflow.blog/2022/10/03/two-heads-are-better-than-one-what-second-brains-say-about-how-developers-work/',
  likes: 9,
}

const postDataNoLikesProp = {
  title:
    'Two heads are better than one: What second brains say about how developers work',
  author: 'Juan Dela Cruz',
  url: 'https://stackoverflow.blog/2022/10/03/two-heads-are-better-than-one-what-second-brains-say-about-how-developers-work/',
}

const zeroLikesData = {
  title:
    'Two heads are better than one: What second brains say about how developers work',
  author: 'Juan Dela Cruz',
  url: 'https://stackoverflow.blog/2022/10/03/two-heads-are-better-than-one-what-second-brains-say-about-how-developers-work/',
  likes: 0,
}

const blankTitle = {
  title: '',
  author: 'Juan Dela Cruz',
  url: 'https://stackoverflow.blog/2022/10/03/two-heads-are-better-than-one-what-second-brains-say-about-how-developers-work/',
  likes: 0,
}

const blankUrl = {
  title:
    'Two heads are better than one: What second brains say about how developers work',
  author: 'Juan Dela Cruz',
  url: '',
  likes: 0,
}

const generateObjectID = async () => {
  const id = new mongoose.Types.ObjectId()
  return id.toString()
}

const savedUsers = async () => {
  const users = await User.find({})
  return users.map((user) => user.toJSON())
}

const savedBlogs = async () => {
  const blogs = await Blog.find({})
  return blogs.map((b) => b.toJSON())
}

const postBlog1 = {
  title: 'React patterns',
  url: 'https://reactpatterns.com/',
  likes: 7,
}

const postBlog2 = {
  title: 'TDD harms architecture',
  url: 'http://blog.cleancoder.com/uncle-bob/2017/03/03/TDD-Harms-Architecture.html',
  likes: 0,
}

const fakeToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImFybiIsImlkIjoiNjM1NjZmNmM1NTNhMjRmYTIyNDFkMDBiIiwiaWF0IjoxNjY2NjA5MDk3LCJleHAiOjE2NjY2MTI2OTd9.a9joBlly_Sfiv31iYte9JsVFyXPm-NuJRidT3sPCJeA'

module.exports = {
  postBlog1,
  postBlog2,
  savedUsers,
  savedBlogs,
  testblogs,
  postData,
  postDataNoLikesProp,
  zeroLikesData,
  blankTitle,
  blankUrl,
  generateObjectID,
  fakeToken
}
