const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Not authenticated.' });
    }
    // Admin always has access
    if (req.user.role === 'Admin' || roles.includes(req.user.role)) {
      return next();
    }
    return res.status(403).json({
      success: false,
      message: `Access denied. Required role(s): ${roles.join(', ')}`
    });
  };
};

// Permission matrix for reference
const permissions = {
  'Fleet Manager': ['vehicles:crud', 'maintenance:crud', 'trips:read', 'analytics:read'],
  'Dispatcher': ['trips:crud', 'vehicles:read', 'drivers:read'],
  'Safety Officer': ['drivers:crud', 'drivers:suspend', 'drivers:ban'],
  'Financial Analyst': ['expenses:crud', 'analytics:read', 'export:csv', 'export:pdf'],
  'Admin': ['*']
};

module.exports = { authorize, permissions };
