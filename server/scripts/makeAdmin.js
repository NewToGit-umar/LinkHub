/**
 * Script to promote a user to admin role
 * 
 * Usage: node scripts/makeAdmin.js <email>
 * Example: node scripts/makeAdmin.js admin@example.com
 */

import mongoose from 'mongoose'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Load environment variables from parent directory
dotenv.config({ path: join(__dirname, '..', '.env') })

// Import User model
import User from '../models/User.js'

async function makeAdmin(email) {
  if (!email) {
    console.error('❌ Please provide an email address')
    console.log('Usage: node scripts/makeAdmin.js <email>')
    process.exit(1)
  }

  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/linkhub'
    console.log('🔌 Connecting to MongoDB...')
    await mongoose.connect(mongoUri)
    console.log('✅ Connected to MongoDB')

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() })
    
    if (!user) {
      console.error(`❌ User with email "${email}" not found`)
      console.log('\nAvailable users:')
      const users = await User.find().select('email name role').limit(10)
      users.forEach(u => console.log(`  - ${u.email} (${u.name}) [${u.role}]`))
      process.exit(1)
    }

    if (user.role === 'admin') {
      console.log(`ℹ️  User "${user.name}" (${user.email}) is already an admin`)
      process.exit(0)
    }

    // Update user role to admin
    user.role = 'admin'
    await user.save()

    console.log(`\n✅ Successfully promoted user to admin!`)
    console.log(`   Name: ${user.name}`)
    console.log(`   Email: ${user.email}`)
    console.log(`   Role: ${user.role}`)
    console.log('\n🎉 You can now log in with these credentials to access admin features.')

  } catch (error) {
    console.error('❌ Error:', error.message)
    process.exit(1)
  } finally {
    await mongoose.disconnect()
    console.log('\n🔌 Disconnected from MongoDB')
  }
}

// Get email from command line arguments
const email = process.argv[2]
makeAdmin(email)
