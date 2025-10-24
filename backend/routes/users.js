const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Get user profile by ID
router.get('/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId)
      .select('-password')
      .populate('followers', 'username fullName profilePicture')
      .populate('following', 'username fullName profilePicture');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update user profile
router.put('/:userId', async (req, res) => {
  try {
    const { fullName, bio, profilePicture } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.params.userId,
      { fullName, bio, profilePicture },
      { new: true, runValidators: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({ message: 'Profile updated successfully', user });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Follow a user
router.post('/:userId/follow', async (req, res) => {
  try {
    const { currentUserId } = req.body;
    
    // Add to following list of current user
    await User.findByIdAndUpdate(currentUserId, {
      $addToSet: { following: req.params.userId }
    });
    
    // Add to followers list of target user
    await User.findByIdAndUpdate(req.params.userId, {
      $addToSet: { followers: currentUserId }
    });
    
    res.json({ message: 'User followed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Unfollow a user
router.post('/:userId/unfollow', async (req, res) => {
  try {
    const { currentUserId } = req.body;
    
    // Remove from following list of current user
    await User.findByIdAndUpdate(currentUserId, {
      $pull: { following: req.params.userId }
    });
    
    // Remove from followers list of target user
    await User.findByIdAndUpdate(req.params.userId, {
      $pull: { followers: currentUserId }
    });
    
    res.json({ message: 'User unfollowed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
