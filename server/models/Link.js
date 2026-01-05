import mongoose from 'mongoose'

const { Schema } = mongoose

const LinkSchema = new Schema({
  title: { type: String, default: '' },
  url: { type: String, default: '' },
  position: { type: Number, default: 0 },
  openInNewTab: { type: Boolean, default: true },
  clicks: { type: Number, default: 0 },
  metadata: { type: Schema.Types.Mixed },
  createdAt: { type: Date, default: Date.now }
})

export default LinkSchema
