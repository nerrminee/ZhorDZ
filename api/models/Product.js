import mongoose from 'mongoose'

const imageSchema = new mongoose.Schema({
  url: { type: String, required: true },
  path: { type: String, default: null },
  publicId: { type: String, default: null },
  provider: { type: String, default: null },
})

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    detailDescription: {
      type: String,
      trim: true,
      default: '',
    },
    category: {
      type: String,
      trim: true,
      default: '',
    },
    productCategory: {
      type: String,
      trim: true,
      default: '',
    },
    sku: {
      type: String,
      trim: true,
      default: '',
    },
    fabric: {
      type: String,
      trim: true,
      default: '',
    },
    care: {
      type: String,
      trim: true,
      default: '',
    },
    price: {
      type: Number,
      required: true,
      default: 0,
    },
    isSale: {
      type: Boolean,
      default: false,
    },
    oldPrice: {
      type: Number,
      default: 0,
    },
    sizes: {
      type: [String],
      default: [],
    },
    colors: {
      type: [String],
      default: [],
    },
    availability: {
      type: String,
      default: 'in-stock',
    },
    isInStock: {
      type: Boolean,
      default: true,
    },
    images: {
      type: [imageSchema],
      default: [],
    },
    image_url: {
      type: String,
      default: null,
    },
    imageUrl: {
      type: String,
      default: null,
    },
    imagePath: {
      type: String,
      default: null,
    },
    isPublished: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
)

// Ensure virtual id is mapped
productSchema.virtual('id').get(function () {
  return this._id.toHexString()
})

productSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    delete ret._id
    delete ret.__v
    return ret
  },
})

const Product = mongoose.models.Product || mongoose.model('Product', productSchema, 'products')

export default Product
