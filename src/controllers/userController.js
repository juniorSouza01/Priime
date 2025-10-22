const userService = require('../services/userService');

class UserController {
  async createUser(req, res) {
    try {
      const { name, email, password, profile } = req.body;
      const user = await userService.createUser({ name, email, password, profile });
      return res.status(201).json({ id: user.id, name: user.name, email: user.email, profile: user.profile });
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  }

  async listUsers(req, res) {
    try {
      const users = await userService.listAllUsers();
      return res.status(200).json(users);
    } catch (error) {
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
}

module.exports = new UserController();