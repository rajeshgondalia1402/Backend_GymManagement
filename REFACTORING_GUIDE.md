# 🚀 Backend Refactoring Implementation Guide

## Overview

This guide will help you refactor your existing Node.js backend into a production-grade TypeScript SaaS architecture while maintaining 100% backward compatibility.

## ⚠️ IMPORTANT: Before You Start

1. **Backup your current code**
   ```bash
   git add .
   git commit -m "Backup before refactoring"
   git branch backup-before-refactoring
   ```

2. **Ensure all tests pass**
   ```bash
   npm test
   ```

3. **Document current API behavior**
   - Test all endpoints
   - Save Postman collection
   - Export Swagger documentation

## 📋 Step-by-Step Implementation

### Step 1: Install Dependencies (5 minutes)

```bash
cd backend

# Install TypeScript and types
npm install --save-dev typescript @types/node @types/express @types/cors
npm install --save-dev @types/jsonwebtoken @types/bcryptjs @types/swagger-jsdoc
npm install --save-dev @types/swagger-ui-express

# Install development tools
npm install --save-dev ts-node ts-node-dev nodemon
npm install --save-dev @typescript-eslint/eslint-plugin @typescript-eslint/parser
npm install --save-dev eslint eslint-config-prettier eslint-plugin-prettier prettier

# Install production dependencies
npm install winston  # For logging
```

### Step 2: Create TypeScript Configuration (2 minutes)

Create `tsconfig.json`:
```bash
# Already created in the repository
```

Create `.eslintrc.js`:
```bash
# Already created in the repository
```

Create `.prettierrc`:
```bash
# Already created in the repository
```

### Step 3: Create New Folder Structure (10 minutes)

```bash
# Create main directories
mkdir -p src-new/config
mkdir -p src-new/api/v1/{admin,auth,gym-owner,member}
mkdir -p src-new/api/v1/admin/{subscription-plans,gyms,users}
mkdir -p src-new/api/v1/gym-owner/{trainers,members,diet-plans,exercise-plans}
mkdir -p src-new/api/v1/member/{profile,trainer,plans}
mkdir -p src-new/common/{middleware,utils,constants,exceptions,types}
mkdir -p src-new/database
mkdir -p src-new/jobs/{cron,queues}
mkdir -p src-new/tests/{unit,integration}
```

### Step 4: Migrate Configuration Files (15 minutes)

#### 4.1 Create `src-new/config/env.ts`
```typescript
// See REFACTORING_ARCHITECTURE.md for full implementation
```

#### 4.2 Create `src-new/config/database.ts`
```typescript
import { PrismaClient } from '@prisma/client';
import config from './env';

class Database {
  private static instance: PrismaClient;

  private constructor() {}

  public static getInstance(): PrismaClient {
    if (!Database.instance) {
      Database.instance = new PrismaClient({
        log: config.isDevelopment ? ['query', 'error', 'warn'] : ['error'],
      });
    }
    return Database.instance;
  }

  public static async connect(): Promise<void> {
    try {
      await Database.getInstance().$connect();
      console.log('✅ Database connected successfully');
    } catch (error) {
      console.error('❌ Database connection failed:', error);
      process.exit(1);
    }
  }

  public static async disconnect(): Promise<void> {
    await Database.getInstance().$disconnect();
    console.log('👋 Database disconnected');
  }
}

export const prisma = Database.getInstance();
export default Database;
```

#### 4.3 Create `src-new/config/jwt.ts`
```typescript
import jwt from 'jsonwebtoken';
import config from './env';

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
}

export const generateAccessToken = (payload: JWTPayload): string => {
  return jwt.sign(payload, config.env.JWT_SECRET, {
    expiresIn: config.env.JWT_EXPIRATION,
  });
};

export const generateRefreshToken = (payload: JWTPayload): string => {
  return jwt.sign(payload, config.env.JWT_REFRESH_SECRET, {
    expiresIn: config.env.JWT_REFRESH_EXPIRATION,
  });
};

export const verifyAccessToken = (token: string): JWTPayload => {
  return jwt.verify(token, config.env.JWT_SECRET) as JWTPayload;
};

export const verifyRefreshToken = (token: string): JWTPayload => {
  return jwt.verify(token, config.env.JWT_REFRESH_SECRET) as JWTPayload;
};
```

### Step 5: Create Common Utilities (20 minutes)

#### 5.1 Create `src-new/common/exceptions/base.exception.ts`
```typescript
export class BaseException extends Error {
  constructor(
    public message: string,
    public statusCode: number = 500,
    public isOperational: boolean = true
  ) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this);
  }
}

export class NotFoundException extends BaseException {
  constructor(message: string = 'Resource not found') {
    super(message, 404, true);
  }
}

export class BadRequestException extends BaseException {
  constructor(message: string = 'Bad request') {
    super(message, 400, true);
  }
}

export class UnauthorizedException extends BaseException {
  constructor(message: string = 'Unauthorized') {
    super(message, 401, true);
  }
}

export class ForbiddenException extends BaseException {
  constructor(message: string = 'Forbidden') {
    super(message, 403, true);
  }
}

export class ConflictException extends BaseException {
  constructor(message: string = 'Conflict') {
    super(message, 409, true);
  }
}
```

#### 5.2 Create `src-new/common/utils/response.util.ts`
```typescript
import { Response } from 'express';

export const successResponse = (
  res: Response,
  data: any,
  message: string = 'Success',
  statusCode: number = 200
) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

export const paginatedResponse = (
  res: Response,
  data: any,
  pagination: any,
  message: string = 'Success'
) => {
  return res.status(200).json({
    success: true,
    message,
    data,
    pagination,
  });
};

export const errorResponse = (
  res: Response,
  message: string = 'Error',
  statusCode: number = 400,
  errors: any = null
) => {
  const response: any = {
    success: false,
    message,
  };
  if (errors) {
    response.errors = errors;
  }
  return res.status(statusCode).json(response);
};
```

#### 5.3 Create `src-new/common/utils/logger.util.ts`
```typescript
import winston from 'winston';
import config from '../../config/env';

const logger = winston.createLogger({
  level: config.isDevelopment ? 'debug' : 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
  ],
});

if (config.isDevelopment) {
  logger.add(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    })
  );
}

export default logger;
```

### Step 6: Migrate Middleware (15 minutes)

#### 6.1 Create `src-new/common/middleware/auth.middleware.ts`
```typescript
import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../../config/jwt';
import { UnauthorizedException } from '../exceptions';

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
    role: string;
  };
}

export const authenticate = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('No token provided');
    }

    const token = authHeader.substring(7);
    const decoded = verifyAccessToken(token);
    
    req.user = {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role,
    };
    
    next();
  } catch (error) {
    next(new UnauthorizedException('Invalid or expired token'));
  }
};
```

#### 6.2 Create `src-new/common/middleware/role.middleware.ts`
```typescript
import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth.middleware';
import { ForbiddenException } from '../exceptions';

export const authorize = (...allowedRoles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new ForbiddenException('User not authenticated'));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        new ForbiddenException(
          `Access denied. Required roles: ${allowedRoles.join(', ')}`
        )
      );
    }

    next();
  };
};
```

#### 6.3 Create `src-new/common/middleware/error.middleware.ts`
```typescript
import { Request, Response, NextFunction } from 'express';
import { BaseException } from '../exceptions';
import { errorResponse } from '../utils/response.util';
import logger from '../utils/logger.util';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  logger.error('Error:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
  });

  if (err instanceof BaseException) {
    return errorResponse(res, err.message, err.statusCode);
  }

  // Zod validation errors
  if (err.name === 'ZodError') {
    const errors = (err as any).errors.map((e: any) => ({
      field: e.path.slice(1).join('.'),
      message: e.message,
    }));
    return errorResponse(res, 'Validation failed', 400, errors);
  }

  // Default error
  return errorResponse(res, 'Internal server error', 500);
};
```

### Step 7: Migrate Subscription Plans Module (30 minutes)

Follow the implementation in `REFACTORING_ARCHITECTURE.md` for:
- Types
- Schema
- Repository
- Service
- Controller
- Routes

### Step 8: Create Main Application Files (20 minutes)

#### 8.1 Create `src-new/app.ts`
```typescript
import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './config/swagger';
import config from './config/env';
import { errorHandler } from './common/middleware/error.middleware';
import apiRoutes from './api';

const app: Application = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: config.env.FRONTEND_URL,
  credentials: true,
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: config.env.RATE_LIMIT_WINDOW,
  max: config.env.RATE_LIMIT_MAX,
  message: { error: 'Too many requests, please try again later.' },
});
app.use('/api/', limiter);

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Swagger documentation
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
app.use('/api', apiRoutes);

// Error handling
app.use(errorHandler);

export default app;
```

#### 8.2 Create `src-new/server.ts`
```typescript
import app from './app';
import config from './config/env';
import Database from './config/database';
import logger from './common/utils/logger.util';

const PORT = config.env.PORT;

async function startServer() {
  try {
    // Connect to database
    await Database.connect();

    // Start server
    app.listen(PORT, () => {
      console.log('\n' + '='.repeat(70));
      console.log('🚀 GYM MANAGEMENT API - Server Started Successfully!');
      console.log('='.repeat(70));
      console.log(`\n📍 Server running on port: ${PORT}`);
      console.log(`\n🔗 Quick Links:`);
      console.log(`   📊 Health Check:     http://localhost:${PORT}/health`);
      console.log(`   🏠 API Index:        http://localhost:${PORT}/`);
      console.log(`   📚 Swagger UI:       http://localhost:${PORT}/docs`);
      console.log('\n' + '='.repeat(70));
      console.log('💡 TIP: Open Swagger UI to test APIs interactively!');
      console.log('   → Copy & paste: http://localhost:' + PORT + '/docs');
      console.log('='.repeat(70) + '\n');
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Handle shutdown gracefully
process.on('SIGTERM', async () => {
  logger.info('SIGTERM signal received: closing HTTP server');
  await Database.disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT signal received: closing HTTP server');
  await Database.disconnect();
  process.exit(0);
});

startServer();
```

### Step 9: Update package.json Scripts (5 minutes)

Replace your current `package.json` with `package-new.json` that was created.

### Step 10: Test Migration (30 minutes)

```bash
# Build TypeScript
npm run build

# Run development server
npm run dev

# Test endpoints
curl http://localhost:5000/health
curl http://localhost:5000/docs

# Test API endpoints
# Use Postman or Swagger UI
```

### Step 11: Final Steps (15 minutes)

1. **Update documentation**
   ```bash
   # Update README.md
   # Update API documentation
   ```

2. **Clean up old files** (after confirming everything works)
   ```bash
   # Move old src to src-old
   mv src src-old
   mv src-new src
   ```

3. **Commit changes**
   ```bash
   git add .
   git commit -m "Refactor to TypeScript production architecture"
   ```

## 🎯 Expected Results

After completing this migration, you should have:

✅ TypeScript-based codebase
✅ Clean architecture with separation of concerns
✅ Repository pattern for database operations
✅ Proper error handling
✅ Logging system
✅ API versioning (v1)
✅ Role-based access control
✅ All existing endpoints working
✅ Swagger documentation working
✅ 100% backward compatibility

## 🐛 Troubleshooting

### Issue: TypeScript compilation errors

**Solution:**
```bash
# Check tsconfig.json
# Ensure all @types packages are installed
# Run: npm install --save-dev @types/node @types/express
```

### Issue: Module resolution errors

**Solution:**
```bash
# Update tsconfig.json paths
# Use absolute imports with path aliases
```

### Issue: Database connection fails

**Solution:**
```bash
# Check .env file
# Verify DATABASE_URL
# Run: npx prisma generate
```

### Issue: Swagger UI not loading

**Solution:**
```bash
# Check swagger configuration
# Ensure swagger-jsdoc and swagger-ui-express are installed
```

## 📚 Additional Resources

- **REFACTORING_ARCHITECTURE.md** - Complete architecture documentation
- **TypeScript Documentation** - https://www.typescriptlang.org/docs/
- **Clean Architecture** - https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html
- **Repository Pattern** - https://martinfowler.com/eaaCatalog/repository.html

## ✅ Success Criteria

- [ ] All TypeScript errors resolved
- [ ] Server starts without errors
- [ ] All existing API endpoints work
- [ ] Swagger UI accessible
- [ ] Authentication works
- [ ] Role-based access control works
- [ ] Database operations successful
- [ ] Error handling works correctly
- [ ] Logging system operational
- [ ] Tests pass (if any)

## 🎉 Congratulations!

Once complete, you'll have a production-grade, scalable, maintainable backend architecture ready for long-term growth!

---

**Need Help?** Check the troubleshooting section or refer to REFACTORING_ARCHITECTURE.md for detailed implementation examples.
