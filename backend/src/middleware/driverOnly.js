const driverOnly = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized'
    });
  }

  if (req.user.role !== 'driver') {
    return res.status(403).json({
      success: false,
      message: 'Only drivers can access this feature'
    });
  }

  next();
};

module.exports = driverOnly;