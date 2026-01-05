import BioPage from '../models/BioPage.js'

function slugify(text) {
  return String(text || '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export async function createBioPage(req, res) {
  try {
    const userId = req.user && req.user.id
    if (!userId) return res.status(401).json({ message: 'Unauthorized' })

    const { title, slug, description, links, isPublic } = req.body
    let finalSlug = slug ? slugify(slug) : slugify(title || userId)

    // Filter out incomplete links
    const filteredLinks = (links && Array.isArray(links)) 
      ? links.filter(link => link.title && link.url) 
      : []

    // ensure uniqueness
    let existing = await BioPage.findOne({ slug: finalSlug })
    let suffix = 1
    while (existing) {
      finalSlug = `${finalSlug}-${suffix++}`
      existing = await BioPage.findOne({ slug: finalSlug })
    }

    const page = await BioPage.create({ userId, title, slug: finalSlug, description, links: filteredLinks, isPublic })
    return res.status(201).json({ page })
  } catch (err) {
    console.error('createBioPage error', err)
    return res.status(500).json({ message: 'Error creating bio page', error: err.message })
  }
}

export async function getUserBioPages(req, res) {
  try {
    const userId = req.user && req.user.id
    if (!userId) return res.status(401).json({ message: 'Unauthorized' })

    const pages = await BioPage.find({ userId }).sort({ createdAt: -1 }).lean()
    return res.status(200).json({ pages })
  } catch (err) {
    console.error('getUserBioPages error', err)
    return res.status(500).json({ message: 'Error fetching bio pages', error: err.message })
  }
}

export async function getBioPage(req, res) {
  try {
    const { slug } = req.params
    const page = await BioPage.findOne({ slug }).lean()
    if (!page) return res.status(404).json({ message: 'Bio page not found' })
    return res.status(200).json({ page })
  } catch (err) {
    console.error('getBioPage error', err)
    return res.status(500).json({ message: 'Error fetching bio page', error: err.message })
  }
}

export async function redirectLink(req, res) {
  try {
    const { slug, linkId } = req.params
    const page = await BioPage.findOne({ slug })
    if (!page) return res.status(404).send('Not found')

    const link = page.links.id(linkId)
    if (!link) return res.status(404).send('Link not found')

    link.clicks = (link.clicks || 0) + 1
    page.views = (page.views || 0) + 1
    await page.save()

    // Redirect to target URL
    return res.redirect(link.url)
  } catch (err) {
    console.error('redirectLink error', err)
    return res.status(500).send('Redirect error')
  }
}

export async function updateBioPage(req, res) {
  try {
    const userId = req.user && req.user.id
    if (!userId) return res.status(401).json({ message: 'Unauthorized' })

    const { id } = req.params
    const updates = { ...req.body }
    
    // Filter out incomplete links (those without both title and url)
    if (updates.links && Array.isArray(updates.links)) {
      updates.links = updates.links
        .filter(link => link.title && link.url)
        .map(link => ({
          title: link.title,
          url: link.url,
          position: link.position || 0,
          openInNewTab: link.openInNewTab !== false,
          clicks: link.clicks || 0
        }))
    }
    
    // Remove _id from updates to avoid immutable field error
    delete updates._id
    
    const page = await BioPage.findById(id)
    if (!page) return res.status(404).json({ message: 'Bio page not found' })
    if (String(page.userId) !== String(userId)) return res.status(403).json({ message: 'Forbidden' })

    // Update fields individually
    if (updates.title !== undefined) page.title = updates.title
    if (updates.slug !== undefined) page.slug = updates.slug
    if (updates.description !== undefined) page.description = updates.description
    if (updates.links !== undefined) page.links = updates.links
    if (updates.isPublic !== undefined) page.isPublic = updates.isPublic
    if (updates.settings !== undefined) page.settings = updates.settings
    
    await page.save()
    return res.status(200).json({ page })
  } catch (err) {
    console.error('updateBioPage error', err.message, err.stack)
    return res.status(500).json({ message: 'Error updating bio page', error: err.message })
  }
}
