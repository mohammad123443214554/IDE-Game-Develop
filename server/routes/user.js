const router = require('express').Router();
const User = require('../../models/User');
const Game = require('../../models/Game');
const Withdrawal = require('../../models/Withdrawal');
const auth = require('../middleware/auth');

// Get user stats
router.get('/stats', auth, async (req, res) => {
  try {
    const gamesCount = await Game.countDocuments({ creator: req.user._id });
    res.json({
      earnings: req.user.totalEarnings,
      plays: req.user.totalPlays,
      games: gamesCount,
      balance: req.user.availableBalance,
    });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Get public profile
router.get('/profile/:username', async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username.toLowerCase() });
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ user: { username: user.username, fullName: user.fullName, bio: user.bio, createdAt: user.createdAt } });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Update profile
router.put('/profile', auth, async (req, res) => {
  try {
    const { fullName, bio } = req.body;
    req.user.fullName = fullName || req.user.fullName;
    req.user.bio = bio !== undefined ? bio : req.user.bio;
    await req.user.save();
    res.json({ user: req.user.toSafeObject() });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Change password
router.put('/password', auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!(await req.user.comparePassword(currentPassword))) return res.status(401).json({ message: 'Current password incorrect' });
    if (newPassword.length < 8 || !/[A-Z]/.test(newPassword) || !/[0-9]/.test(newPassword))
      return res.status(400).json({ message: 'Password too weak' });
    req.user.password = newPassword;
    await req.user.save();
    res.json({ message: 'Password changed' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Withdraw
router.post('/withdraw', auth, async (req, res) => {
  try {
    const { method, details, amount } = req.body;
    if (amount < 5) return res.status(400).json({ message: 'Minimum $5' });
    if (amount > 10) return res.status(400).json({ message: 'Maximum $10 per request' });
    if (req.user.availableBalance < amount) return res.status(400).json({ message: 'Insufficient balance' });
    const withdrawal = new Withdrawal({ user: req.user._id, amount, method, details });
    await withdrawal.save();
    req.user.availableBalance -= amount;
    await req.user.save();
    res.json({ message: 'Withdrawal requested', withdrawal });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Delete account
router.delete('/account', auth, async (req, res) => {
  try {
    const { otp } = req.body;
    if (req.user.otp !== otp || req.user.otpType !== 'delete' || req.user.otpExpires < new Date())
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    await Game.deleteMany({ creator: req.user._id });
    await User.findByIdAndDelete(req.user._id);
    res.json({ message: 'Account deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
