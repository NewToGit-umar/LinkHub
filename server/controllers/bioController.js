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

    // ensure uniqueness
    let existing = await BioPage.findOne({ slug: finalSlug })
    let suffix = 1
    while (existing) {
      finalSlug = `${finalSlug}-${suffix++}`
      existing = await BioPage.findOne({ slug: finalSlug })
    }

    const page = await BioPage.create({ userId, title, slug: finalSlug, description, links, isPublic })
    return res.status(201).json({ page })
  } catch (err) {
    console.error('createBioPage error', err)
    return res.status(500).json({ message: 'Error creating bio page', error: err.message })
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
    const updates = req.body
    const page = await BioPage.findById(id)
    if (!page) return res.status(404).json({ message: 'Bio page not found' })
    if (String(page.userId) !== String(userId)) return res.status(403).json({ message: 'Forbidden' })

    Object.assign(page, updates)
    await page.save()
    return res.status(200).json({ page })
  } catch (err) {
    console.error('updateBioPage error', err)
    return res.status(500).json({ message: 'Error updating bio page', error: err.message })
  }
}
