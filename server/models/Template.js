import mongoose from 'mongoose'

const { Schema } = mongoose

const TemplateSchema = new Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  description: { type: String },
  // Whether this is a system-provided template or user-created
  isSystem: { type: Boolean, default: false },
  // Owner (null for system templates)
  userId: { type: Schema.Types.ObjectId, ref: 'User', default: null },
  // Theme/styling configuration
  styles: {
    backgroundColor: { type: String, default: '#ffffff' },
    textColor: { type: String, default: '#000000' },
    linkColor: { type: String, default: '#3b82f6' },
    linkHoverColor: { type: String, default: '#2563eb' },
    linkBackgroundColor: { type: String, default: '#f3f4f6' },
    linkBorderRadius: { type: String, default: '8px' },
    fontFamily: { type: String, default: 'Inter, sans-serif' },
    avatarBorderRadius: { type: String, default: '50%' },
    buttonStyle: { type: String, enum: ['filled', 'outlined', 'ghost'], default: 'filled' }
  },
  // Layout options
  layout: {
    showAvatar: { type: Boolean, default: true },
    showTitle: { type: Boolean, default: true },
    showDescription: { type: Boolean, default: true },
    linksPerRow: { type: Number, default: 1 },
    padding: { type: String, default: '20px' }
  },
  // Preview image URL
  previewImage: { type: String },
  isActive: { type: Boolean, default: true }
}, { timestamps: true })

// Indexes
TemplateSchema.index({ slug: 1 })
TemplateSchema.index({ userId: 1 })
TemplateSchema.index({ isSystem: 1 })

// Find all system templates
TemplateSchema.statics.findSystemTemplates = function() {
  return this.find({ isSystem: true, isActive: true }).sort({ name: 1 })
}

// Find user templates
TemplateSchema.statics.findUserTemplates = function(userId) {
  return this.find({ userId, isActive: true }).sort({ createdAt: -1 })
}

export default mongoose.model('Template', TemplateSchema)
