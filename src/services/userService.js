const { User } = require('../models');

class UserService {
  async createUser(userData) {
    return await User.create(userData);
  }

  async findUserByEmail(email) {
    return await User.findOne({ where: { email } });
  }

  async listAllUsers() {
    return await User.findAll({ attributes: { exclude: ['password'] } });
  }
}

module.exports = new UserService();