import mongoose from 'mongoose'

const { Schema } = mongoose

const OAuthStateSchema = new Schema({
  state: { 
    type: String, 
    required: true, 
    unique: true,
    index: true 
  },
  userId: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  provider: { 
    type: String, 
    required: true 
  },
  expiresAt: { 
    type: Date, 
    required: true,
    index: true 
  }
}, { 
  timestamps: true 
})

// TTL index - automatically delete expired states
OAuthStateSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })

export default mongoose.model('OAuthState', OAuthStateSchema)
