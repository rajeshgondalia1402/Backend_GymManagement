# Role-Based Access Control (RBAC) Implementation Guide

## Overview

This document describes the role-based access control system implemented in the Gym Management API. The system supports 4 distinct roles with specific permissions and scoped access.

## Roles

### 1. ADMIN
- **Scope**: Full system access
- **Capabilities**:
  - Manage all gyms (create, update, delete)
  - Manage all gym owners (create, assign to gyms, toggle status)
  - Manage subscription plans
  - View all system data
  - No gymId restriction
- **Routes**: `/api/v1/admin/*`

### 2. GYM_OWNER
- **Scope**: Single gym they own
- **Capabilities**:
  - View dashboard statistics for their gym
  - Manage trainers (CRUD + toggle status)
  - Manage members (CRUD + toggle status)
  - Manage diet plans and exercise plans
  - Assign trainers to members
  - Assign plans to members
- **Routes**: `/api/v1/gym-owner/*`
- **Access Control**: All operations scoped to `req.user.gymId`

### 3. TRAINER
- **Scope**: Gym they belong to + assigned members only
- **Capabilities**:
  - View their own profile
  - View members assigned to them
  - Create/update diet plans and exercise plans for their gym
  - Assign diet/exercise plans to their assigned members
  - View plan assignments for their members
- **Routes**: `/api/v1/trainer/*`
- **Access Control**: 
  - Can only access members via `MemberTrainerAssignment`
  - Plans scoped to their gym

### 4. MEMBER
- **Scope**: Own data only
- **Capabilities**:
  - View their own profile
  - Update limited profile fields
  - View their assigned trainer
  - View their diet plans
  - View their exercise plans
  - View membership details
- **Routes**: `/api/v1/member/*`
- **Access Control**: All operations use `req.user.id`

---

## Authentication Flow

### JWT Token Structure
```json
{
  "userId": "uuid",
  "email": "user@example.com",
  "role": "ADMIN|GYM_OWNER|TRAINER|MEMBER"
}
```

### Enhanced AuthRequest
The `authenticate` middleware populates `req.user` with:
```typescript
interface AuthRequest extends Request {
  user?: {
    id: string;        // User ID
    email: string;     // User email
    role: string;      // Role name
    gymId?: string;    // Resolved from profile (owner/trainer/member)
    trainerId?: string; // Trainer profile ID (if TRAINER)
    memberId?: string;  // Member profile ID (if MEMBER)
  };
}
```

---

## Authorization Middleware

### 1. `authorize(...roles: string[])`
Basic role check. Returns 403 if user doesn't have one of the specified roles.

```typescript
router.use(authenticate, authorize('ADMIN'));
// Only ADMIN can access these routes
```

### 2. `authorizeGymAccess(paramName: string = 'gymId')`
Ensures user can only access their own gym's data. Admin bypasses this check.

```typescript
router.get('/gyms/:gymId/trainers', 
  authenticate, 
  authorize('GYM_OWNER', 'ADMIN'),
  authorizeGymAccess('gymId'),
  controller.getTrainers
);
```

### 3. `authorizeOwnership(resourceType: 'member' | 'trainer')`
Ensures members can only access their own data, and trainers can only access their assigned members.

```typescript
router.get('/members/:id',
  authenticate,
  authorize('MEMBER', 'TRAINER', 'GYM_OWNER', 'ADMIN'),
  authorizeOwnership('member'),
  controller.getMemberDetails
);
```

### 4. `authorizeGymResource(resourceType: 'member' | 'trainer' | 'dietPlan' | 'exercisePlan')`
Validates that the target resource belongs to the user's gym.

```typescript
router.put('/diet-plans/:id',
  authenticate,
  authorize('TRAINER', 'GYM_OWNER'),
  authorizeGymResource('dietPlan'),
  controller.updateDietPlan
);
```

---

## API Endpoints by Role

### Admin Panel (`/api/v1/admin`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /dashboard | Admin dashboard stats |
| GET | /gyms | List all gyms |
| POST | /gyms | Create new gym |
| GET | /gyms/:id | Get gym details |
| PUT | /gyms/:id | Update gym |
| DELETE | /gyms/:id | Delete gym |
| PATCH | /gyms/:id/assign-owner | Assign owner to gym |
| GET | /gym-owners | List all gym owners |
| POST | /gym-owners | Create gym owner |
| GET | /subscription-plans | List subscription plans |
| POST | /subscription-plans | Create subscription plan |
| PUT | /subscription-plans/:id | Update subscription plan |
| DELETE | /subscription-plans/:id | Delete subscription plan |

### Gym Owner Panel (`/api/v1/gym-owner`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /dashboard | Gym dashboard stats |
| GET | /trainers | List gym's trainers |
| POST | /trainers | Create trainer |
| PUT | /trainers/:id | Update trainer |
| DELETE | /trainers/:id | Delete trainer |
| PATCH | /trainers/:id/toggle-status | Toggle trainer active status |
| GET | /members | List gym's members |
| POST | /members | Create member |
| PUT | /members/:id | Update member |
| DELETE | /members/:id | Delete member |
| PATCH | /members/:id/toggle-status | Toggle member active status |
| GET | /diet-plans | List diet plans |
| POST | /diet-plans | Create diet plan |
| PUT | /diet-plans/:id | Update diet plan |
| GET | /exercise-plans | List exercise plans |
| POST | /exercise-plans | Create exercise plan |
| PUT | /exercise-plans/:id | Update exercise plan |
| POST | /assign-trainer | Assign trainer to member |
| POST | /assign-diet-plan | Assign diet plan to member |
| POST | /assign-exercise-plan | Assign exercise plan to member |

### Trainer Panel (`/api/v1/trainer`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /profile | Get trainer's own profile |
| GET | /members | List assigned members |
| GET | /members/:memberId | Get member details |
| GET | /diet-plans | List gym's diet plans |
| POST | /diet-plans | Create diet plan |
| PUT | /diet-plans/:id | Update diet plan |
| GET | /exercise-plans | List gym's exercise plans |
| POST | /exercise-plans | Create exercise plan |
| PUT | /exercise-plans/:id | Update exercise plan |
| POST | /members/:memberId/diet-plans | Assign diet plan to member |
| POST | /members/:memberId/exercise-plans | Assign exercise plan to member |
| GET | /members/:memberId/diet-assignments | Get member's diet assignments |
| GET | /members/:memberId/exercise-assignments | Get member's exercise assignments |
| DELETE | /diet-assignments/:assignmentId | Remove diet assignment |
| DELETE | /exercise-assignments/:assignmentId | Remove exercise assignment |

### Member Panel (`/api/v1/member`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /dashboard | Member dashboard stats |
| GET | /profile | Get own profile |
| PUT | /profile | Update own profile |
| GET | /trainer | Get assigned trainer |
| GET | /diet-plan | Get active diet plan |
| GET | /exercise-plans | Get active exercise plans |
| GET | /membership | Get membership details |

---

## Security Considerations

### 1. Token Validation
- All protected routes require valid JWT
- Token expiration is enforced
- Refresh token rotation is implemented

### 2. Account Status
- Deactivated accounts (`isActive: false`) cannot authenticate
- Toggle status endpoints allow gym owners to suspend users

### 3. Gym Isolation
- Users cannot access data from other gyms
- Gym ID is resolved from user profile, not from request

### 4. Resource Ownership
- Members can only access their own data
- Trainers can only access their assigned members
- Gym owners can manage all resources within their gym

### 5. Cascading Deactivation
- When a trainer is deactivated, both `Trainer.isActive` and `User.isActive` are set to false
- Prevents login and API access

---

## Database Schema Dependencies

### Key Relations
```
User (1) -> (1) Gym (as owner)
User (1) -> (1) Trainer (profile)
User (1) -> (1) Member (profile)
Trainer (n) -> (n) Member (via MemberTrainerAssignment)
Member (n) -> (n) DietPlan (via MemberDietAssignment)
Member (n) -> (n) ExercisePlan (via MemberExerciseAssignment)
```

### Role Resolution
- Roles stored in `Rolemaster` table
- User linked to role via `User.roleId`
- Role names: `ADMIN`, `GYM_OWNER`, `TRAINER`, `MEMBER`

---

## Best Practices

1. **Always use middleware chain**: `authenticate` -> `authorize` -> `authorizeGymAccess`
2. **Check for gymId in controller**: Throw `BadRequestException` if missing
3. **Use transactions for multi-table updates**: Especially for toggle status operations
4. **Validate resource ownership before operations**: Use service methods to verify access
5. **Return consistent response format**: Use `successResponse` and `paginatedResponse` utilities

---

## Example: Adding a New Protected Endpoint

```typescript
// In routes file
router.post(
  '/some-resource',
  authenticate,                    // 1. Verify JWT
  authorize('TRAINER', 'GYM_OWNER'), // 2. Check role
  authorizeGymAccess('gymId'),     // 3. Verify gym scope (if applicable)
  validate(someSchema),            // 4. Validate request body
  controller.createResource        // 5. Handle request
);

// In controller
async createResource(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    if (!req.user?.gymId) {
      throw new BadRequestException('Gym not found');
    }
    const result = await service.createResource(req.user.gymId, req.body);
    successResponse(res, result, 'Resource created successfully', 201);
  } catch (error) {
    next(error);
  }
}
```

---

## Version History

- **v2.0.0**: Complete RBAC implementation with 4-role system
- Added Trainer module with full CRUD for plans and assignments
- Added toggle status endpoints for gym owners
- Enhanced auth middleware with gym-scoped authorization
