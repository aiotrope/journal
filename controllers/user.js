const express = require('express')
const bcrypt = require('bcrypt')
const User = require('../models/user')
const logger = require('../utils/logger')

const router = express.Router()

router.post('/', async (req, res) => {
  const { username, name, password } = req.body

  if (password === undefined || password.length < 3) {
    throw Error('password was not valid!')
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

module.exports = router
