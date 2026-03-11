const router = require('express').Router();
const User = require('../../models/User');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT) || 587,
  secure: false,
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
});

const sendOTP = async (email, otp, subject) => {
  try {
    await transporter.sendMail({
      from: '"IDE Game Develop" <no-reply@idegame.dev>',
      to: email, subject,
      html: `<div style="background:#050a10;color:#e0f4ff;font-family:monospace;padding:40px;border-radius:12px;"><h2 style="color:#00d4ff;">IDE Game Develop</h2><p>Your verification code:</p><div style="font-size:36px;font-weight:bold;color:#00d4ff;letter-spacing:12px;margin:20px 0;">${otp}</div><p style="color:#7ab8d4;">Expires in 10 minutes.</p></div>`
    });
  } catch (e) { console.log('[DEV] OTP for', email, ':', otp); }
};

router.post('/signup', async (req, res) => {
  try {
    const { fullName, username, email, password } = req.body;
    if (!fullName || !username || !email || !password) return res.status(400).json({ message: 'All fields required' });
    if (!/[A-Z]/.test(password) || !/[0-9]/.test(password) || password.length < 8)
      return res.status(400).json({ message: 'Password must have 8+ chars, 1 uppercase, 1 number' });
    if (await User.findOne({ username: username.toLowerCase() }))
      return res.status(400).json({ message: 'Username is not available.' });
    if (await User.findOne({ email: email.toLowerCase() }))
      return res.status(400).json({ message: 'Email already registered.' });
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const user = new User({
      fullName, username: username.toLowerCase(), email: email.toLowerCase(),
      password, otp, otpExpires: new Date(Date.now() + 10 * 60 * 1000), otpType: 'signup'
    });
    await user.save();
    await sendOTP(email, otp, 'Verify your IDE Game Develop account');
    res.json({ message: 'OTP sent to email' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp, type } = req.body;
    const user = await User.findOne({ email: email.toLowerCase(), otp, otpType: type });
    if (!user || user.otpExpires < new Date()) return res.status(400).json({ message: 'Invalid or expired OTP' });
    user.isVerified = true; user.otp = undefined; user.otpExpires = undefined;
    await user.save();
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });
    res.json({ token, user: user.toSafeObject() });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email?.toLowerCase() });
    if (!user || !(await user.comparePassword(password))) return res.status(401).json({ message: 'Invalid email or password' });
    if (!user.isVerified) return res.status(401).json({ message: 'Please verify your email first' });
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });
    res.json({ token, user: user.toSafeObject() });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.get('/me', require('../middleware/auth'), (req, res) => res.json({ user: req.user.toSafeObject() }));

router.post('/request-delete-otp', require('../middleware/auth'), async (req, res) => {
  try {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    req.user.otp = otp; req.user.otpExpires = new Date(Date.now() + 10 * 60 * 1000); req.user.otpType = 'delete';
    await req.user.save();
    await sendOTP(req.user.email, otp, 'Account deletion verification - IDE Game Develop');
    res.json({ message: 'OTP sent' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
