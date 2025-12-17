import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import mockDB from '../mockDB.js';

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'change-this-secret';

router.post('/signup', async (req, res) => {
  const { name, email, password } = req.body;
  if (!email || !password || !name) return res.status(400).json({ error: 'Missing fields' });
  try {
    const useMock = req.app.get('useMock');
    if (useMock) {
      const exists = await mockDB.findUserByEmail(email);
      if (exists) return res.status(400).json({ error: 'Email already registered' });
      const hash = await bcrypt.hash(password, 10);
      const user = await mockDB.createUser({ name, email, passwordHash: hash });
      const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '7d' });
      return res.json({ token, user: { id: user.id, name: user.name, email: user.email, theme: user.theme } });
    }

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ error: 'Email already registered' });
    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, passwordHash: hash });
    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user._id, name: user.name, email: user.email, theme: user.theme } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Missing fields' });
  try {
    const useMock = req.app.get('useMock');
    if (useMock) {
      const user = await mockDB.findUserByEmail(email);
      if (!user) return res.status(400).json({ error: 'Invalid credentials' });
      const ok = await bcrypt.compare(password, user.passwordHash);
      if (!ok) return res.status(400).json({ error: 'Invalid credentials' });
      const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '7d' });
      return res.json({ token, user: { id: user.id, name: user.name, email: user.email, theme: user.theme } });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: 'Invalid credentials' });
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(400).json({ error: 'Invalid credentials' });
    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user._id, name: user.name, email: user.email, theme: user.theme } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
