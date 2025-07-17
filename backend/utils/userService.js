const User = require('../models/User');
const jwt = require('jsonwebtoken');

class UserService {
  static generateToken(id) {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRE || '7d'
    });
  }

  static async findOrCreateOTPUser(phoneNumber, otplessUserId) {
    let user = await User.findOne({ phoneNumber });
    
    if (!user) {
      user = await User.create({
        firstName: 'User',
        lastName: 'Name',
        phoneNumber,
        authProvider: 'otpless',
        otplessUserId: otplessUserId || phoneNumber,
        isVerified: true,
        roleSelected: false
      });
    } else {
      user.lastLogin = new Date();
      await user.save();
    }

    return user;
  }

  static async findOrCreateGoogleUser(googleUser) {
    let user = await User.findOne({ 
      $or: [
        { googleId: googleUser.id },
        { email: googleUser.email }
      ]
    });

    if (!user) {
      user = await User.create({
        firstName: googleUser.given_name,
        lastName: googleUser.family_name,
        email: googleUser.email,
        profilePicture: googleUser.picture,
        authProvider: 'google',
        googleId: googleUser.id,
        isVerified: googleUser.email_verified || true,
        roleSelected: false
      });
    } else {
      if (!user.googleId) {
        user.googleId = googleUser.id;
      }
      if (!user.profilePicture && googleUser.picture) {
        user.profilePicture = googleUser.picture;
      }
      if (!user.email && googleUser.email) {
        user.email = googleUser.email;
      }
      user.lastLogin = new Date();
      await user.save();
    }

    return user;
  }

  static async updateUserRole(userId, role) {
    if (!['client', 'freelancer'].includes(role)) {
      throw new Error('Invalid role. Must be client or freelancer');
    }

    const user = await User.findByIdAndUpdate(
      userId,
      {
        role,
        roleSelected: true
      },
      {
        new: true,
        runValidators: true
      }
    );

    return user;
  }

  static formatUserResponse(user) {
    const userObj = user.toJSON ? user.toJSON() : user;
    return {
      ...userObj,
      needsRoleSelection: !user.roleSelected || !user.role,
      roleSelected: user.roleSelected || false
    };
  }
}

module.exports = UserService;