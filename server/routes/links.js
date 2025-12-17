import express from 'express';
import Link from '../models/Link.js';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import mockDB from '../mockDB.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'change-this-secret';

function authMiddleware(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: 'Unauthorized' });
  const token = auth.split(' ')[1];
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.userId = payload.id;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

router.get('/', async (req, res) => {
  // Public: return sample profile links or query userId
  const userId = req.query.userId;
  try {
    const useMock = req.app.get('useMock');
    if (useMock) {
      if (userId) {
        const links = await mockDB.findLinksByUserId(userId);
        return res.json({ links });
      }
      const sample = await mockDB.findLinksByUserId('1');
      return res.json({ links: sample });
    }

    if (userId) {
      const links = await Link.find({ userId }).sort({ order: 1 });
      return res.json({ links });
    }
    // return public sample links
    const sample = [
      { title: 'Portfolio', url: 'https://example.com', order: 0 },
      { title: 'GitHub', url: 'https://github.com', order: 1 }
    ];
    res.json({ links: sample });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/', authMiddleware, async (req, res) => {
  try {
    const { title, url } = req.body;
    const useMock = req.app.get('useMock');
    if (useMock) {
      const link = await mockDB.createLink({ userId: req.userId, title, url });
      return res.json({ link });
    }
    const link = await Link.create({ userId: req.userId, title, url });
    res.json({ link });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const useMock = req.app.get('useMock');
    if (useMock) {
      await mockDB.deleteLinkById(req.params.id);
      return res.json({ ok: true });
    }
    const link = await Link.findById(req.params.id);
    if (!link) return res.status(404).json({ error: 'Not found' });
    if (String(link.userId) !== String(req.userId)) return res.status(403).json({ error: 'Forbidden' });
    await link.remove();
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
