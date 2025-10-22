module.exports = (allowedProfiles) => {
  return (req, res, next) => {
    if (!req.userProfile || !allowedProfiles.includes(req.userProfile)) {
      return res.status(403).json({ error: 'Permission denied' });
    }
    next();
  };
};