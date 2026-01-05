import Template from '../models/Template.js'
import BioPage from '../models/BioPage.js'

// Seed default system templates
const defaultTemplates = [
  {
    name: 'Classic Light',
    slug: 'classic-light',
    description: 'Clean and minimal light theme',
    isSystem: true,
    styles: {
      backgroundColor: '#ffffff',
      textColor: '#1f2937',
      linkColor: '#3b82f6',
      linkHoverColor: '#2563eb',
      linkBackgroundColor: '#f3f4f6',
      linkBorderRadius: '8px',
      fontFamily: 'Inter, sans-serif',
      avatarBorderRadius: '50%',
      buttonStyle: 'filled'
    },
    layout: { showAvatar: true, showTitle: true, showDescription: true, linksPerRow: 1, padding: '20px' }
  },
  {
    name: 'Classic Dark',
    slug: 'classic-dark',
    description: 'Sleek dark mode theme',
    isSystem: true,
    styles: {
      backgroundColor: '#1f2937',
      textColor: '#f9fafb',
      linkColor: '#60a5fa',
      linkHoverColor: '#93c5fd',
      linkBackgroundColor: '#374151',
      linkBorderRadius: '8px',
      fontFamily: 'Inter, sans-serif',
      avatarBorderRadius: '50%',
      buttonStyle: 'filled'
    },
    layout: { showAvatar: true, showTitle: true, showDescription: true, linksPerRow: 1, padding: '20px' }
  },
  {
    name: 'Gradient Purple',
    slug: 'gradient-purple',
    description: 'Vibrant purple gradient background',
    isSystem: true,
    styles: {
      backgroundColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      textColor: '#ffffff',
      linkColor: '#ffffff',
      linkHoverColor: '#e0e7ff',
      linkBackgroundColor: 'rgba(255,255,255,0.2)',
      linkBorderRadius: '24px',
      fontFamily: 'Poppins, sans-serif',
      avatarBorderRadius: '50%',
      buttonStyle: 'outlined'
    },
    layout: { showAvatar: true, showTitle: true, showDescription: true, linksPerRow: 1, padding: '24px' }
  },
  {
    name: 'Neon',
    slug: 'neon',
    description: 'Bold neon accents on dark background',
    isSystem: true,
    styles: {
      backgroundColor: '#0a0a0a',
      textColor: '#00ff88',
      linkColor: '#00ff88',
      linkHoverColor: '#00cc6a',
      linkBackgroundColor: 'transparent',
      linkBorderRadius: '4px',
      fontFamily: 'JetBrains Mono, monospace',
      avatarBorderRadius: '8px',
      buttonStyle: 'outlined'
    },
    layout: { showAvatar: true, showTitle: true, showDescription: false, linksPerRow: 1, padding: '16px' }
  },
  {
    name: 'Minimal',
    slug: 'minimal',
    description: 'Ultra-minimal design',
    isSystem: true,
    styles: {
      backgroundColor: '#fafafa',
      textColor: '#333333',
      linkColor: '#333333',
      linkHoverColor: '#666666',
      linkBackgroundColor: 'transparent',
      linkBorderRadius: '0px',
      fontFamily: 'system-ui, sans-serif',
      avatarBorderRadius: '0%',
      buttonStyle: 'ghost'
    },
    layout: { showAvatar: false, showTitle: true, showDescription: false, linksPerRow: 1, padding: '32px' }
  }
]

export async function seedTemplates() {
  for (const tpl of defaultTemplates) {
    const exists = await Template.findOne({ slug: tpl.slug })
    if (!exists) {
      await Template.create(tpl)
      console.log(`Seeded template: ${tpl.name}`)
    }
  }
}

// List all available templates (system + user's own)
export async function listTemplates(req, res) {
  try {
    const userId = req.user?.id
    const systemTemplates = await Template.findSystemTemplates()
    const userTemplates = userId ? await Template.findUserTemplates(userId) : []
    return res.status(200).json({ system: systemTemplates, user: userTemplates })
  } catch (err) {
    console.error('listTemplates error', err)
    return res.status(500).json({ message: 'Error listing templates', error: err.message })
  }
}

// Get single template by slug
export async function getTemplate(req, res) {
  try {
    const { slug } = req.params
    const template = await Template.findOne({ slug })
    if (!template) return res.status(404).json({ message: 'Template not found' })
    return res.status(200).json({ template })
  } catch (err) {
    console.error('getTemplate error', err)
    return res.status(500).json({ message: 'Error fetching template', error: err.message })
  }
}

// Create custom user template
export async function createTemplate(req, res) {
  try {
    const userId = req.user?.id
    if (!userId) return res.status(401).json({ message: 'Unauthorized' })

    const { name, slug, description, styles, layout } = req.body
    if (!name || !slug) return res.status(400).json({ message: 'Name and slug required' })

    const exists = await Template.findOne({ slug })
    if (exists) return res.status(409).json({ message: 'Template slug already exists' })

    const template = await Template.create({ name, slug, description, styles, layout, userId, isSystem: false })
    return res.status(201).json({ template })
  } catch (err) {
    console.error('createTemplate error', err)
    return res.status(500).json({ message: 'Error creating template', error: err.message })
  }
}

// Apply template to a bio page
export async function applyTemplate(req, res) {
  try {
    const userId = req.user?.id
    if (!userId) return res.status(401).json({ message: 'Unauthorized' })

    const { bioPageId, templateSlug } = req.body
    if (!bioPageId || !templateSlug) return res.status(400).json({ message: 'bioPageId and templateSlug required' })

    const template = await Template.findOne({ slug: templateSlug })
    if (!template) return res.status(404).json({ message: 'Template not found' })

    const page = await BioPage.findById(bioPageId)
    if (!page) return res.status(404).json({ message: 'Bio page not found' })
    if (String(page.userId) !== String(userId)) return res.status(403).json({ message: 'Forbidden' })

    page.settings = { ...page.settings, template: templateSlug, styles: template.styles, layout: template.layout }
    await page.save()

    return res.status(200).json({ message: 'Template applied', page })
  } catch (err) {
    console.error('applyTemplate error', err)
    return res.status(500).json({ message: 'Error applying template', error: err.message })
  }
}
