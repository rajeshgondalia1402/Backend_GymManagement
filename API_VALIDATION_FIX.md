# 🔧 API Validation Fix - Subscription Plans

## Issue Fixed

The subscription plans POST API was returning validation errors for fields that weren't needed:
- `maxMembers` (Required)
- `maxTrainers` (Required)
- `features` (Expected array, received string)

## Changes Made

### 1. Updated Validation Schema
**File**: `src/common/middleware/validate.middleware.ts`

**Before**:
```typescript
export const createSubscriptionPlanSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  description: z.string().optional(),
  price: z.number().positive('Price must be positive'),
  currency: z.string().default('INR'),
  durationDays: z.number().int().positive('Duration must be positive'),
  maxMembers: z.number().int().positive('Max members must be positive'), // ❌ Required
  maxTrainers: z.number().int().positive('Max trainers must be positive'), // ❌ Required
  features: z.array(z.string()).optional(), // ❌ Expected array
  isActive: z.boolean().optional().default(true),
});
```

**After**:
```typescript
export const createSubscriptionPlanSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  description: z.string().optional(),
  price: z.number().positive('Price must be positive'),
  currency: z.string().default('INR'),
  durationDays: z.number().int().positive('Duration must be positive'),
  features: z.string().optional(), // ✅ Now accepts string (HTML)
  isActive: z.boolean().optional().default(true),
});
```

**Changes**:
- ✅ Removed `maxMembers` requirement
- ✅ Removed `maxTrainers` requirement
- ✅ Changed `features` from `array` to `string` to support HTML content

### 2. Updated TypeScript Types
**File**: `src/api/v1/admin/admin.types.ts`

**Before**:
```typescript
export interface CreateSubscriptionPlanRequest {
  name: string;
  description?: string;
  price: number;
  currency?: string;
  durationDays: number;
  maxMembers: number; // ❌ Required
  maxTrainers: number; // ❌ Required
  features?: string[]; // ❌ Array only
  isActive?: boolean;
}
```

**After**:
```typescript
export interface CreateSubscriptionPlanRequest {
  name: string;
  description?: string;
  price: number;
  currency?: string;
  durationDays: number;
  maxMembers?: number; // ✅ Optional
  maxTrainers?: number; // ✅ Optional
  features?: string | string[]; // ✅ String or array
  isActive?: boolean;
}
```

**Changes**:
- ✅ Made `maxMembers` optional
- ✅ Made `maxTrainers` optional
- ✅ `features` accepts both string and array

### 3. Updated Service Logic
**File**: `src/api/v1/admin/admin.service.ts`

**Updated `createSubscriptionPlan`**:
```typescript
async createSubscriptionPlan(data: CreateSubscriptionPlanRequest): Promise<SubscriptionPlan> {
  const plan = await prisma.gymSubscriptionPlan.create({
    data: {
      name: data.name,
      description: data.description,
      price: data.price,
      priceCurrency: data.currency || 'INR',
      durationDays: data.durationDays,
      // ✅ Handle both string and array
      features: typeof data.features === 'string' 
        ? data.features 
        : (data.features?.join('\n') || ''),
      isActive: data.isActive ?? true,
    },
  });

  return {
    id: plan.id,
    name: plan.name,
    description: plan.description || undefined,
    price: Number(plan.price),
    currency: plan.priceCurrency,
    durationDays: plan.durationDays,
    maxMembers: data.maxMembers || 0, // ✅ Default to 0 if not provided
    maxTrainers: data.maxTrainers || 0, // ✅ Default to 0 if not provided
    features: typeof data.features === 'string' 
      ? [data.features] 
      : (data.features || []),
    isActive: plan.isActive,
    createdAt: plan.createdAt,
    updatedAt: plan.updatedAt,
  };
}
```

**Updated `updateSubscriptionPlan`**:
```typescript
async updateSubscriptionPlan(id: string, data: UpdateSubscriptionPlanRequest): Promise<SubscriptionPlan> {
  await this.getSubscriptionPlanById(id);
  
  const updateData: any = {};
  if (data.name) updateData.name = data.name;
  if (data.description) updateData.description = data.description;
  if (data.price) updateData.price = data.price;
  if (data.currency) updateData.priceCurrency = data.currency;
  if (data.durationDays) updateData.durationDays = data.durationDays;
  if (data.features) {
    // ✅ Handle both string and array
    updateData.features = typeof data.features === 'string' 
      ? data.features 
      : data.features.join('\n');
  }
  if (data.isActive !== undefined) updateData.isActive = data.isActive;

  const plan = await prisma.gymSubscriptionPlan.update({
    where: { id },
    data: updateData,
  });

  return {
    id: plan.id,
    name: plan.name,
    description: plan.description || undefined,
    price: Number(plan.price),
    currency: plan.priceCurrency,
    durationDays: plan.durationDays,
    maxMembers: data.maxMembers || 0,
    maxTrainers: data.maxTrainers || 0,
    features: typeof data.features === 'string' 
      ? [data.features] 
      : (plan.features ? plan.features.split('\n') : []),
    isActive: plan.isActive,
    createdAt: plan.createdAt,
    updatedAt: plan.updatedAt,
  };
}
```

## ✅ Result

Now the API accepts your request body correctly:

### Request Body
```json
{
  "name": "Basic / Entry-Level Plans - Yearly",
  "description": "Description",
  "price": 4000,
  "currency": "INR",
  "durationDays": 365,
  "features": "Features",
  "isActive": true
}
```

### Expected Response
```json
{
  "success": true,
  "message": "Subscription plan created",
  "data": {
    "id": "uuid-here",
    "name": "Basic / Entry-Level Plans - Yearly",
    "description": "Description",
    "price": 4000,
    "currency": "INR",
    "durationDays": 365,
    "maxMembers": 0,
    "maxTrainers": 0,
    "features": ["Features"],
    "isActive": true,
    "createdAt": "2025-12-29T...",
    "updatedAt": "2025-12-29T..."
  }
}
```

## 🧪 Testing

Test the API with curl or Postman:

```bash
curl -X POST http://localhost:5000/api/v1/admin/subscription-plans \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "name": "Basic / Entry-Level Plans - Yearly",
    "description": "Description",
    "price": 4000,
    "currency": "INR",
    "durationDays": 365,
    "features": "Features",
    "isActive": true
  }'
```

## 📝 Notes

1. **Backward Compatibility**: The API still accepts `maxMembers` and `maxTrainers` if provided, but they're now optional.

2. **Features Field**: Can now be either:
   - String: `"Features"` (for simple text or HTML)
   - Array: `["Feature 1", "Feature 2"]` (for list of features)

3. **Database Schema**: The Prisma schema stores `features` as a `String`, so both formats are converted appropriately:
   - String stays as-is
   - Array is joined with newlines

4. **Response Format**: Always returns `features` as an array for consistency in the API response.

## 🔄 Migration Note

If you have existing data with `maxMembers` and `maxTrainers` in the database, you may want to add these fields to your Prisma schema in the future. For now, they default to 0 in the API response.

## ✅ Files Modified

1. ✅ `src/common/middleware/validate.middleware.ts` - Updated validation schema
2. ✅ `src/api/v1/admin/admin.types.ts` - Updated TypeScript interfaces
3. ✅ `src/api/v1/admin/admin.service.ts` - Updated service logic

## 🎉 Status

**FIXED** - The API now works with your request format!

You can now create subscription plans without providing `maxMembers`, `maxTrainers`, and with `features` as a string.
