const jwt = require('jsonwebtoken');
const authConfig = require('../config/auth');
const { User } = require('../models');

module.exports = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const [, token] = authHeader.split(' ');

  try {
    const decoded = jwt.verify(token, authConfig.secret);
    const user = await User.findByPk(decoded.id);

    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    req.userId = decoded.id;
    req.userProfile = decoded.profile;
    return next();
  } catch (err) {
    return res.status(401).json({ error: 'Token invalid' });
  }
};