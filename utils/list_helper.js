const _ = require('lodash')

const dummy = (blogs) => {
  const sample = Number(Array.isArray(blogs))
  return sample
}

const totalLikes = (blogs) => {
  const likes = blogs.map((blog) => blog.likes)
  const countOne = Number(likes)
  const sumLikes = likes.reduce((prev, curr) => prev + curr, 0)

  return blogs.length === 1 ? countOne : sumLikes
}

const favoriteBlog = (blogs) => {
  const likes = blogs.map((blog) => blog.likes)
  const maxLikes = Math.max(...likes)
  const isMax = (elem) => elem === maxLikes
  const findIMax = likes.findIndex(isMax)
  const favorite = blogs[findIMax]
  const obj = {
    title: favorite.title,
    author: favorite.author,
    likes: favorite.likes,
  }
  return obj
}

const mostBlogs = (blogs) => {
  const authors = blogs.map((blog) => blog.author)

  const obj = {}

  for (const i of authors) {
    if (obj[i]) {
      obj[i] += 1
    } else {
      obj[i] = 1
    }
  }

  const xx = Object.values(obj)
  let max = Math.max(...xx)

  let author = ''
  for (const x in obj) {
    if (obj[x] === max) {
      author += x
    }
  }

  const frequentBlogger = { author: author, blogs: max }
  return frequentBlogger
}

const mostLikes = (blogs) => {
  const groupObj = _.chain(blogs)
    .groupBy('author')
    .map((blog, id) => ({ author: id, likes: _.sumBy(blog, 'likes') }))
    .value()
  const toArrOfObj = _.map(groupObj)

  const arrOfValues = _.map(toArrOfObj, function (a) {
    const arr = a.likes
    return arr
  })

  const max = _.max(arrOfValues)

  const findMostLikes = _.find(toArrOfObj, function (highest) {
    return highest.likes === max
  })

  return findMostLikes
}

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs,
  mostLikes,
}
