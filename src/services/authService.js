const jwt = require('jsonwebtoken');
const authConfig = require('../config/auth');
const { User, AccessLog } = require('../models');

class AuthService {
  async login(email, password, ipAddress) {
    const user = await User.findOne({ where: { email } });

    if (!user) {
      throw new Error('User not found');
    }

    if (!(await user.checkPassword(password))) {
      throw new Error('Invalid password');
    }

    const token = jwt.sign({ id: user.id, profile: user.profile }, authConfig.secret, {
      expiresIn: authConfig.expiresIn
    });

    await AccessLog.create({
      userId: user.id,
      ipAddress: ipAddress
    });

    return { user: { id: user.id, name: user.name, email: user.email, profile: user.profile }, token };
  }
}

module.exports = new AuthService();
