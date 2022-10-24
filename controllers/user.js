const express = require('express')
const bcrypt = require('bcrypt')
const User = require('../models/user')
//const logger = require('../utils/logger')

const router = express.Router()

router.post('/', async (req, res) => {
  const { username, name, password } = req.body

  const regex = /^[a-zA-Z0-9$&+,:;=?@#|'<>.^*()%!-{}€"'ÄöäÖØÆ`~_]{3,}$/gm

  const testPassword = regex.test(password)

  if (!testPassword || password === undefined) {
    throw Error('password was not valid!') // returns 400
  } else {
    const saltRounds = 10

    const passwordHash = await bcrypt.hash(password, saltRounds)

    const user = new User({
      username: username,
      name: name,
      passwordHash: passwordHash,
    })

    const newUser = await User.create(user)
    res.status(201).json(newUser)
  }
})

router.get('/', async (req, res) => {
  const user = await User.find({}).populate('blogs', { title: 1, author: 1, slug:1, likes: 1 })

  res.status(200).json(user)

})

module.exports = router
