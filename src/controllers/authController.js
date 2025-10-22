const authService = require('../services/authService');

class AuthController {
  async login(req, res) {
    try {
      const { email, password } = req.body;
      const ipAddress = req.ip;
      const { user, token } = await authService.login(email, password, ipAddress);
      return res.status(200).json({ user, token });
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  }
}

module.exports = new AuthController();