import mongoose from 'mongoose'

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
)

// Ensure virtual id is mapped
userSchema.virtual('id').get(function () {
  return this._id.toHexString()
})

userSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    delete ret._id
    delete ret.__v
    delete ret.passwordHash
    return ret
  },
})

const User = mongoose.models.User || mongoose.model('User', userSchema, 'clients')

export default User
