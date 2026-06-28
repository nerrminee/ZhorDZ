import mongoose from 'mongoose'

const orderSchema = new mongoose.Schema(
  {
    customer: {
      type: Object,
      default: {},
    },
    items: {
      type: [Object],
      default: [],
    },
    subtotal: {
      type: Number,
      default: 0,
    },
    deliveryPrice: {
      type: Number,
      default: 0,
    },
    total: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      default: 'new',
      trim: true,
    },
    paymentMethod: {
      type: String,
      default: 'cash_on_delivery',
      trim: true,
    },
    shippingAddress: {
      type: Object,
      default: {},
    },
    notes: {
      type: String,
      default: '',
      trim: true,
    },
  },
  {
    timestamps: true,
  }
)

orderSchema.index({ createdAt: -1 })
orderSchema.index({ status: 1 })

orderSchema.virtual('id').get(function () {
  return this._id.toHexString()
})

orderSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    delete ret._id
    delete ret.__v
    return ret
  },
})

const Order = mongoose.models.Order || mongoose.model('Order', orderSchema, 'orders')

export default Order
