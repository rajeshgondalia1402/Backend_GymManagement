const { verifyAccessToken } = require('../utils/jwt.utils');
const { errorResponse } = require('../utils/response.utils');
const prisma = require('../config/database');

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return errorResponse(res, 'Access token required', 401);
    }
    
    const token = authHeader.split(' ')[1];
    const decoded = verifyAccessToken(token);
    
    if (!decoded) {
      return errorResponse(res, 'Invalid or expired token', 401);
    }
    
    // Fetch user from database
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        ownedGym: { select: { id: true } },
        memberProfile: { select: { id: true, gymId: true } },
        trainerProfile: { select: { id: true, gymId: true } }
      }
    });
    
    if (!user) {
      return errorResponse(res, 'User not found', 401);
    }
    
    if (!user.isActive) {
      return errorResponse(res, 'Account is deactivated', 403);
    }
    
    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return errorResponse(res, 'Authentication failed', 401);
  }
};

// Role-based authorization
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return errorResponse(res, 'Authentication required', 401);
    }
    
    if (!allowedRoles.includes(req.user.role)) {
      return errorResponse(res, 'Access denied. Insufficient permissions.', 403);
    }
    
    next();
  };
};

// Check if gym owner owns the gym being accessed
const authorizeGymAccess = async (req, res, next) => {
  try {
    if (req.user.role === 'ADMIN') {
      return next(); // Admin has access to all gyms
    }
    
    if (req.user.role === 'GYM_OWNER') {
      const gymId = req.params.gymId || req.body.gymId;
      
      if (gymId && req.user.ownedGym?.id !== gymId) {
        return errorResponse(res, 'Access denied to this gym', 403);
      }
    }
    
    next();
  } catch (error) {
    console.error('Gym access middleware error:', error);
    return errorResponse(res, 'Authorization failed', 500);
  }
};

module.exports = {
  authenticate,
  authorize,
  authorizeGymAccess
};
