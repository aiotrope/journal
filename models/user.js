const mongoose = require('mongoose')

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    unique: true,
    trim: true,
    required: true,
    minLength: 3,
    validate: {
      validator: (val) => {
        return /^[a-zA-Z0-9$&+,:;=?@#|'<>.^*()%!-{}€"'ÄöäÖØÆ`~_]{3,}$/gm.test(
          val
        )
      },
      message: (props) => `${props.value} is not a valid username!`,
    },
  },
  name: {
    type: String,
    trim: true,
    validate: {
      validator: (val) => {
        return /^[a-zA-Z]{0,}[\s]?[a-zA-Z]{0,}?$/gm.test(val)
      },
      message: (props) => `${props.value} is not a valid name!`,
    },
  },
  passwordHash: { type: String },
  blog: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Blog',
    },
  ],
})

UserSchema.set('toJSON', {
  transform: (document, retObject) => {
    retObject.id = retObject._id.toString()
    delete retObject._id
    delete retObject.__v
    delete retObject.password
  },
})

const User = mongoose.model('User', UserSchema)

module.exports = User
