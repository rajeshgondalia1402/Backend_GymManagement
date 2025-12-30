# Production-Grade SaaS Architecture Refactoring

This document outlines the complete refactoring from the current structure to a scalable, maintainable production architecture.

## 🎯 Architecture Overview

### Current Structure (Before)
```
backend/
├── src/
│   ├── app.js
│   ├── config/
│   ├── controllers/
│   ├── middlewares/
│   ├── routes/
│   ├── services/
│   └── utils/
```

### New Structure (After)
```
backend/
├── src/
│   ├── server.ts                 # Entry point
│   ├── app.ts                    # Express app setup
│   │
│   ├── config/                   # Configuration
│   │   ├── env.ts               # Environment variables
│   │   ├── database.ts          # Database connection
│   │   ├── jwt.ts               # JWT configuration
│   │   ├── swagger.ts           # Swagger setup
│   │   └── index.ts             # Export all configs
│   │
│   ├── api/                      # API versioning
│   │   ├── v1/
│   │   │   ├── admin/           # Admin module
│   │   │   │   ├── subscription-plans/
│   │   │   │   │   ├── subscription.controller.ts
│   │   │   │   │   ├── subscription.service.ts
│   │   │   │   │   ├── subscription.repository.ts
│   │   │   │   │   ├── subscription.routes.ts
│   │   │   │   │   ├── subscription.schema.ts
│   │   │   │   │   └── subscription.types.ts
│   │   │   │   ├── gyms/
│   │   │   │   ├── users/
│   │   │   │   └── index.ts
│   │   │   │
│   │   │   ├── auth/             # Authentication
│   │   │   │   ├── auth.controller.ts
│   │   │   │   ├── auth.service.ts
│   │   │   │   ├── auth.routes.ts
│   │   │   │   ├── auth.schema.ts
│   │   │   │   └── auth.types.ts
│   │   │   │
│   │   │   ├── gym-owner/        # Gym Owner module
│   │   │   │   ├── trainers/
│   │   │   │   ├── members/
│   │   │   │   ├── diet-plans/
│   │   │   │   └── exercise-plans/
│   │   │   │
│   │   │   ├── member/           # Member module
│   │   │   │   ├── profile/
│   │   │   │   ├── trainer/
│   │   │   │   └── plans/
│   │   │   │
│   │   │   └── index.ts          # V1 routes aggregator
│   │   │
│   │   └── index.ts              # API version router
│   │
│   ├── common/                   # Shared utilities
│   │   ├── middleware/
│   │   │   ├── auth.middleware.ts
│   │   │   ├── role.middleware.ts
│   │   │   ├── error.middleware.ts
│   │   │   ├── validate.middleware.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── utils/
│   │   │   ├── response.util.ts
│   │   │   ├── logger.util.ts
│   │   │   ├── pagination.util.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── constants/
│   │   │   ├── roles.constant.ts
│   │   │   ├── status.constant.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── exceptions/
│   │   │   ├── base.exception.ts
│   │   │   ├── http.exception.ts
│   │   │   └── index.ts
│   │   │
│   │   └── types/
│   │       ├── api.types.ts
│   │       ├── auth.types.ts
│   │       └── index.ts
│   │
│   ├── database/
│   │   ├── prisma.ts            # Prisma client instance
│   │   ├── base.repository.ts   # Base repository pattern
│   │   └── index.ts
│   │
│   ├── jobs/                     # Background jobs
│   │   ├── cron/
│   │   └── queues/
│   │
│   └── tests/                    # Tests
│       ├── unit/
│       └── integration/
```

## 🔄 Migration Strategy

### Phase 1: Setup (Day 1)
1. Install TypeScript dependencies
2. Create tsconfig.json
3. Create folder structure
4. Setup linting and formatting

### Phase 2: Core Infrastructure (Day 1-2)
1. Create configuration layer
2. Setup error handling
3. Create response utilities
4. Setup logging
5. Create base types

### Phase 3: Database Layer (Day 2)
1. Create repository pattern
2. Setup Prisma client
3. Create base repository

### Phase 4: API Refactoring (Day 2-3)
1. Refactor Subscription Plans (Reference Module)
2. Refactor Auth module
3. Refactor Admin module
4. Refactor Gym Owner module
5. Refactor Member module

### Phase 5: Testing & Documentation (Day 3)
1. Test all endpoints
2. Update Swagger documentation
3. Create architecture README
4. Update deployment guides

## 📝 File-by-File Migration

### Subscription Plans Module (Reference Implementation)

#### 1. Types (`subscription.types.ts`)
```typescript
export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  priceCurrency: string;
  price: number;
  durationDays: number;
  features: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateSubscriptionPlanDTO {
  name: string;
  description: string;
  priceCurrency: string;
  price: number;
  durationDays: number;
  features: string;
  isActive?: boolean;
}

export interface UpdateSubscriptionPlanDTO extends Partial<CreateSubscriptionPlanDTO> {}

export interface ListSubscriptionPlansQuery {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
```

#### 2. Schema (`subscription.schema.ts`)
```typescript
import { z } from 'zod';

export const createSubscriptionPlanSchema = z.object({
  body: z.object({
    name: z.enum([
      'Basic / Entry-Level Plans',
      'Standard / Popular Plans',
      'Premium / Advanced Plans',
      'Duration-Based (Common in India)',
    ]),
    description: z.string().min(10).max(5000),
    priceCurrency: z.enum(['INR', 'USD']),
    price: z.number().positive().max(999999),
    durationDays: z.number().int().positive().max(3650),
    features: z.string().min(10).max(5000),
    isActive: z.boolean().optional().default(true),
  }),
});

export const updateSubscriptionPlanSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
  body: z.object({
    name: z.enum([
      'Basic / Entry-Level Plans',
      'Standard / Popular Plans',
      'Premium / Advanced Plans',
      'Duration-Based (Common in India)',
    ]).optional(),
    description: z.string().min(10).max(5000).optional(),
    priceCurrency: z.enum(['INR', 'USD']).optional(),
    price: z.number().positive().max(999999).optional(),
    durationDays: z.number().int().positive().max(3650).optional(),
    features: z.string().min(10).max(5000).optional(),
    isActive: z.boolean().optional(),
  }),
});

export const listSubscriptionPlansSchema = z.object({
  query: z.object({
    page: z.string().optional().transform(Number),
    limit: z.string().optional().transform(Number),
    search: z.string().optional(),
    sortBy: z.string().optional(),
    sortOrder: z.enum(['asc', 'desc']).optional(),
  }),
});
```

#### 3. Repository (`subscription.repository.ts`)
```typescript
import { PrismaClient } from '@prisma/client';
import { CreateSubscriptionPlanDTO, UpdateSubscriptionPlanDTO } from './subscription.types';

export class SubscriptionPlanRepository {
  constructor(private prisma: PrismaClient) {}

  async create(data: CreateSubscriptionPlanDTO) {
    return this.prisma.gymSubscriptionPlan.create({
      data: {
        name: data.name,
        description: data.description,
        priceCurrency: data.priceCurrency,
        price: data.price,
        durationDays: data.durationDays,
        features: data.features,
        isActive: data.isActive ?? true,
      },
    });
  }

  async findAll(params: {
    skip: number;
    take: number;
    where?: any;
    orderBy?: any;
  }) {
    const [plans, total] = await Promise.all([
      this.prisma.gymSubscriptionPlan.findMany({
        ...params,
        include: {
          _count: { select: { gyms: true } },
        },
      }),
      this.prisma.gymSubscriptionPlan.count({ where: params.where }),
    ]);

    return { plans, total };
  }

  async findById(id: string) {
    return this.prisma.gymSubscriptionPlan.findUnique({
      where: { id },
      include: {
        _count: { select: { gyms: true } },
      },
    });
  }

  async update(id: string, data: UpdateSubscriptionPlanDTO) {
    return this.prisma.gymSubscriptionPlan.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    return this.prisma.gymSubscriptionPlan.delete({
      where: { id },
    });
  }

  async toggleStatus(id: string) {
    const plan = await this.findById(id);
    if (!plan) return null;

    return this.prisma.gymSubscriptionPlan.update({
      where: { id },
      data: { isActive: !plan.isActive },
    });
  }

  async countGymsUsingPlan(id: string): Promise<number> {
    return this.prisma.gym.count({
      where: { subscriptionPlanId: id },
    });
  }
}
```

#### 4. Service (`subscription.service.ts`)
```typescript
import { SubscriptionPlanRepository } from './subscription.repository';
import { CreateSubscriptionPlanDTO, UpdateSubscriptionPlanDTO, ListSubscriptionPlansQuery } from './subscription.types';
import { NotFoundException, BadRequestException } from '../../../common/exceptions';

export class SubscriptionPlanService {
  constructor(private repository: SubscriptionPlanRepository) {}

  async createPlan(data: CreateSubscriptionPlanDTO) {
    return this.repository.create(data);
  }

  async listPlans(query: ListSubscriptionPlansQuery) {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        ...(isNaN(parseInt(query.search)) ? [] : [{ durationDays: parseInt(query.search) }]),
      ];
    }

    const validSortFields = ['name', 'price', 'durationDays', 'createdAt', 'isActive'];
    const sortBy = validSortFields.includes(query.sortBy || '') ? query.sortBy : 'createdAt';
    const sortOrder = query.sortOrder === 'asc' ? 'asc' : 'desc';

    const orderBy = { [sortBy!]: sortOrder };

    const { plans, total } = await this.repository.findAll({
      skip,
      take: limit,
      where,
      orderBy,
    });

    return {
      plans,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getPlanById(id: string) {
    const plan = await this.repository.findById(id);
    if (!plan) {
      throw new NotFoundException('Subscription plan not found');
    }
    return plan;
  }

  async updatePlan(id: string, data: UpdateSubscriptionPlanDTO) {
    await this.getPlanById(id); // Verify exists
    return this.repository.update(id, data);
  }

  async deletePlan(id: string) {
    await this.getPlanById(id); // Verify exists
    
    const gymsUsingPlan = await this.repository.countGymsUsingPlan(id);
    if (gymsUsingPlan > 0) {
      throw new BadRequestException(
        `Cannot delete plan. ${gymsUsingPlan} gym(s) are using this plan.`
      );
    }

    return this.repository.delete(id);
  }

  async togglePlanStatus(id: string) {
    const plan = await this.repository.toggleStatus(id);
    if (!plan) {
      throw new NotFoundException('Subscription plan not found');
    }
    return plan;
  }
}
```

#### 5. Controller (`subscription.controller.ts`)
```typescript
import { Request, Response, NextFunction } from 'express';
import { SubscriptionPlanService } from './subscription.service';
import { successResponse, paginatedResponse } from '../../../common/utils';

export class SubscriptionPlanController {
  constructor(private service: SubscriptionPlanService) {}

  createPlan = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const plan = await this.service.createPlan(req.body);
      return successResponse(res, plan, 'Subscription plan created', 201);
    } catch (error) {
      next(error);
    }
  };

  listPlans = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.service.listPlans(req.query);
      return paginatedResponse(res, result.plans, result.pagination);
    } catch (error) {
      next(error);
    }
  };

  getPlan = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const plan = await this.service.getPlanById(req.params.id);
      return successResponse(res, plan);
    } catch (error) {
      next(error);
    }
  };

  updatePlan = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const plan = await this.service.updatePlan(req.params.id, req.body);
      return successResponse(res, plan, 'Subscription plan updated');
    } catch (error) {
      next(error);
    }
  };

  toggleStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const plan = await this.service.togglePlanStatus(req.params.id);
      return successResponse(
        res,
        plan,
        `Subscription plan ${plan.isActive ? 'activated' : 'deactivated'}`
      );
    } catch (error) {
      next(error);
    }
  };

  deletePlan = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await this.service.deletePlan(req.params.id);
      return successResponse(res, null, 'Subscription plan deleted');
    } catch (error) {
      next(error);
    }
  };
}
```

#### 6. Routes (`subscription.routes.ts`)
```typescript
import { Router } from 'express';
import { SubscriptionPlanController } from './subscription.controller';
import { SubscriptionPlanService } from './subscription.service';
import { SubscriptionPlanRepository } from './subscription.repository';
import { prisma } from '../../../../database';
import { validate } from '../../../../common/middleware';
import {
  createSubscriptionPlanSchema,
  updateSubscriptionPlanSchema,
  listSubscriptionPlansSchema,
} from './subscription.schema';

const router = Router();

// Initialize dependencies
const repository = new SubscriptionPlanRepository(prisma);
const service = new SubscriptionPlanService(repository);
const controller = new SubscriptionPlanController(service);

// Routes
router.post('/', validate(createSubscriptionPlanSchema), controller.createPlan);
router.get('/', validate(listSubscriptionPlansSchema), controller.listPlans);
router.get('/:id', controller.getPlan);
router.put('/:id', validate(updateSubscriptionPlanSchema), controller.updatePlan);
router.patch('/:id/toggle-status', controller.toggleStatus);
router.delete('/:id', controller.deletePlan);

export default router;
```

## 🔐 Backward Compatibility

### Route Mapping
```typescript
// Old routes (maintained for backward compatibility)
/api/admin/subscription-plans → /api/v1/admin/subscription-plans

// Both work!
app.use('/api/admin', adminV1Routes);  // Old
app.use('/api/v1/admin', adminV1Routes);  // New
```

### Response Format (Preserved)
```json
{
  "success": true,
  "message": "Success message",
  "data": {},
  "pagination": {}
}
```

## 🚀 Deployment Steps

### 1. Install Dependencies
```bash
npm install --save-dev typescript @types/node @types/express ts-node-dev
npm install --save-dev @typescript-eslint/eslint-plugin @typescript-eslint/parser
npm install --save-dev eslint eslint-config-prettier eslint-plugin-prettier prettier
npm install winston
```

### 2. Build TypeScript
```bash
npm run build
```

### 3. Run Development
```bash
npm run dev
```

### 4. Run Production
```bash
npm start
```

## ✅ Testing Checklist

- [ ] All existing endpoints work
- [ ] Swagger UI accessible
- [ ] Authentication works
- [ ] Role-based access control works
- [ ] Pagination works
- [ ] Search and filter work
- [ ] Error handling works
- [ ] Response format consistent
- [ ] Database operations work
- [ ] Migration successful

## 📚 Additional Resources

- TypeScript Best Practices
- Repository Pattern Documentation
- Clean Architecture Principles
- API Versioning Strategy
- Error Handling Best Practices

---

**Status**: Ready for implementation
**Estimated Time**: 3 days
**Team**: Backend engineers
**Priority**: High
