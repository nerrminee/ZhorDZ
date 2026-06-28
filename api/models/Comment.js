import mongoose from 'mongoose'

const commentSchema = new mongoose.Schema(
  {
    clientId: {
      type: String,
      required: true,
      trim: true,
    },
    clientName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    isApproved: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
)

commentSchema.index({ createdAt: -1 })
commentSchema.index({ email: 1 })

commentSchema.virtual('id').get(function () {
  return this._id.toHexString()
})

commentSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    delete ret._id
    delete ret.__v
    return ret
  },
})

const Comment = mongoose.models.Comment || mongoose.model('Comment', commentSchema, 'comments')

export default Comment
