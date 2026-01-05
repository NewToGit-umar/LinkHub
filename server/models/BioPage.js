import mongoose from 'mongoose'
import LinkSchema from './Link.js'

const { Schema } = mongoose

const BioPageSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, default: 'My Links' },
  slug: { type: String, required: true, index: true },
  description: { type: String },
  links: [LinkSchema],
  views: { type: Number, default: 0 },
  isPublic: { type: Boolean, default: true },
  settings: { type: Schema.Types.Mixed }
}, { timestamps: true })

// Common indexes
BioPageSchema.index({ userId: 1 })
BioPageSchema.index({ slug: 1 })

// Helper to register a click for a link (increments link clicks and page views)
BioPageSchema.methods.recordClick = async function(linkId) {
  const link = this.links.id(linkId)
  if (!link) return false
  link.clicks = (link.clicks || 0) + 1
  this.views = (this.views || 0) + 1
  await this.save()
  return true
}

export default mongoose.model('BioPage', BioPageSchema)
