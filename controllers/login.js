const config = require('../utils/config')
const express = require('express')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const User = require('../models/user')
//const logger = require('../utils/logger')

const router = express.Router()

router.post('/', async (req, res) => {
  const { username, password } = req.body

  const user = await User.findOne({ username })

  const regex = /^[a-zA-Z0-9$&+,:;=?@#|'<>.^*()%!-{}€"'ÄöäÖØÆ`~_]{3,}$/gm

  const testPassword = regex.test(password)

  const testUsername = regex.test(username)

  const passwordVerified = await bcrypt.compare(req.body.password, user.passwordHash)

  if (user === null && !passwordVerified && !testPassword && !testUsername) {

    throw Error('invalid username or password!')
  }else if(!passwordVerified) {
    throw Error('invalid username or password!')
  }else {
    const userToken = {
      username: user.username,
      id: user._id,
    }

    const token = jwt.sign(userToken, config.jwt_key, { expiresIn: '1h' })

    const decode = jwt.decode(token, config.jwt_key)

    const id = decode.id

    res
      .status(200)
      .json({
        message: 'login successful',
        token: token,
        username: user.username,
        name: user.name,
        id: id,
      })

  }


})

module.exports = router
