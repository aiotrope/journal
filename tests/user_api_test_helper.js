const User = require('../models/user')

const savedUsers = async () => {
  const users = await User.find({})
  return users.map(user => user.toJSON())
}

module.exports = {
  savedUsers
}