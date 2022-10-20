const Blog = require('../models/blog')

const testblogs = [
  {
    title: 'React patterns',
    author: 'Michael Chan',
    url: 'https://reactpatterns.com/',
    likes: 7
  },
  {
    title: 'Go To Statement Considered Harmful',
    author: 'Edsger W. Dijkstra',
    url: 'http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html',
    likes: 5
  },
  {
    title: 'Canonical string reduction',
    author: 'Edsger W. Dijkstra',
    url: 'http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html',
    likes: 12
  },
  {
    title: 'First class tests',
    author: 'Robert C. Martin',
    url: 'http://blog.cleancoder.com/uncle-bob/2017/05/05/TestDefinitions.htmll',
    likes: 10
  },
  {
    title: 'TDD harms architecture',
    author: 'Robert C. Martin',
    url: 'http://blog.cleancoder.com/uncle-bob/2017/03/03/TDD-Harms-Architecture.html',
    likes: 0
  },
  {
    title: 'Type wars',
    author: 'Robert C. Martin',
    url: 'http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html',
    likes: 2
  },
]

const postData = {
  title:
    'Two heads are better than one: What second brains say about how developers work',
  author: 'Eira May',
  url: 'https://stackoverflow.blog/2022/10/03/two-heads-are-better-than-one-what-second-brains-say-about-how-developers-work/',
  likes: 10,
}

const postDataNoLikesProp = {
  title:
    'Two heads are better than one: What second brains say about how developers work',
  author: 'Eira May',
  url: 'https://stackoverflow.blog/2022/10/03/two-heads-are-better-than-one-what-second-brains-say-about-how-developers-work/'
}

const zeroLikesData = {
  title:
    'Two heads are better than one: What second brains say about how developers work',
  author: 'Eira May',
  url: 'https://stackoverflow.blog/2022/10/03/two-heads-are-better-than-one-what-second-brains-say-about-how-developers-work/',
  likes: 0
}

const blankTitle = {
  title: '',
  author: 'Eira May',
  url: 'https://stackoverflow.blog/2022/10/03/two-heads-are-better-than-one-what-second-brains-say-about-how-developers-work/',
  likes: 0
}

const blankUrl = {
  title:
    'Two heads are better than one: What second brains say about how developers work',
  author: 'Eira May',
  url: '',
  likes: 0
}

const savedBlog = async () => {
  const blogs = await Blog.find({})
  return blogs.map(b => b.toJSON())
}



module.exports = {
  testblogs,
  postData,
  postDataNoLikesProp,
  savedBlog,
  zeroLikesData,
  blankTitle,
  blankUrl
}