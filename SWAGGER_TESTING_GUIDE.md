# 📚 API Testing Guide - Using Swagger UI

## 🚀 Quick Start

### 1. Start the Backend Server

```bash
cd backend
npm run dev
```

You should see:
```
🚀 Server running on port 5000
📊 Health check: http://localhost:5000/health
📚 API Documentation (Swagger): http://localhost:5000/docs
🏠 API Index: http://localhost:5000/
```

### 2. Access Swagger UI

Open your browser and navigate to:

**🔗 http://localhost:5000/docs**

You'll see the interactive Swagger UI with all API endpoints documented.

---

## 🔐 Authentication Setup

Before testing subscription plans endpoints, you need to authenticate:

### Step 1: Create Admin User (if not exists)

You can create an admin user using Prisma Studio or directly in the database.

**Using Prisma Studio:**
```bash
npx prisma studio
```

Then create a user with:
- email: `admin@gym.com`
- password: (hashed with bcrypt)
- roleId: (admin role ID from Rolemaster table)

**Or use the seed script** (if available):
```bash
npm run prisma:seed
```

### Step 2: Login via Swagger

1. **Expand the `Authentication` section** in Swagger UI
2. **Click on `POST /api/auth/login`**
3. **Click "Try it out"**
4. **Enter the request body:**

```json
{
  "email": "admin@gym.com",
  "password": "your_password"
}
```

5. **Click "Execute"**
6. **Copy the JWT token** from the response:

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...", 
    "refreshToken": "..."
  }
}
```

### Step 3: Authorize Swagger

1. **Click the "Authorize" button** (🔒 icon at the top right)
2. **Enter:** `Bearer YOUR_TOKEN_HERE`
   - Example: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
3. **Click "Authorize"**
4. **Click "Close"**

✅ You're now authenticated! All subsequent requests will include the JWT token.

---

## 🎯 Testing Subscription Plans API

### Test 1: Create a Subscription Plan

1. **Expand** `Admin - Subscription Plans` section
2. **Click** `POST /api/admin/subscription-plans`
3. **Click** "Try it out"
4. **Use this example request body:**

```json
{
  "name": "Standard / Popular Plans",
  "description": "<p>Full gym access with all equipment and facilities. Perfect for regular gym-goers who want a comprehensive fitness experience.</p>",
  "priceCurrency": "INR",
  "price": 999,
  "durationDays": 30,
  "features": "<ul><li>Access to all gym equipment</li><li>Free trainer consultation (1 session)</li><li>Diet plan included</li><li>Locker facility</li><li>24/7 access</li></ul>",
  "isActive": true
}
```

5. **Click "Execute"**
6. **Check the response** (should return 201 Created):

```json
{
  "success": true,
  "message": "Subscription plan created",
  "data": {
    "id": "uuid-here",
    "name": "Standard / Popular Plans",
    "description": "<p>Full gym access...</p>",
    "priceCurrency": "INR",
    "price": "999.00",
    "durationDays": 30,
    "features": "<ul><li>Access to all gym equipment</li>...</ul>",
    "isActive": true,
    "createdAt": "2025-12-29T08:00:00.000Z",
    "updatedAt": "2025-12-29T08:00:00.000Z"
  }
}
```

7. **Copy the plan ID** from the response for later tests

### Test 2: List All Subscription Plans

1. **Click** `GET /api/admin/subscription-plans`
2. **Click** "Try it out"
3. **Modify query parameters** (optional):
   - `page`: 1
   - `limit`: 10
   - `search`: (leave empty or enter "Standard")
   - `sortBy`: price
   - `sortOrder`: asc

4. **Click "Execute"**
5. **Check the response**:

```json
{
  "success": true,
  "message": "Success",
  "data": [
    {
      "id": "uuid",
      "name": "Standard / Popular Plans",
      "priceCurrency": "INR",
      "price": "999.00",
      "durationDays": 30,
      "isActive": true,
      "createdAt": "2025-12-29T08:00:00.000Z",
      "_count": {
        "gyms": 0
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 1,
    "totalPages": 1
  }
}
```

### Test 3: Update a Subscription Plan

1. **Click** `PUT /api/admin/subscription-plans/{id}`
2. **Click** "Try it out"
3. **Enter the plan ID** in the `id` field (from Test 1)
4. **Update the request body** (you can update any field):

```json
{
  "price": 1099,
  "durationDays": 45,
  "description": "<p>Updated: Full gym access with extended benefits</p>"
}
```

5. **Click "Execute"**
6. **Check the response** (should return 200 OK with updated data)

### Test 4: Toggle Plan Status

1. **Click** `PATCH /api/admin/subscription-plans/{id}/toggle-status`
2. **Click** "Try it out"
3. **Enter the plan ID**
4. **Click "Execute"**
5. **Check the response**:

```json
{
  "success": true,
  "message": "Subscription plan deactivated",
  "data": {
    "id": "uuid",
    "isActive": false,
    ...
  }
}
```

6. **Execute again** to toggle back to active

### Test 5: Search and Filter

1. **Click** `GET /api/admin/subscription-plans`
2. **Click** "Try it out"
3. **Test different scenarios:**

**Search by name:**
```
search: "Standard"
```

**Search by duration:**
```
search: "30"
```

**Sort by price (ascending):**
```
sortBy: "price"
sortOrder: "asc"
```

**Sort by created date (newest first):**
```
sortBy: "createdAt"
sortOrder: "desc"
```

**Pagination:**
```
page: 1
limit: 5
```

### Test 6: Delete a Plan

⚠️ **Note:** You can only delete plans that are not assigned to any gyms.

1. **Click** `DELETE /api/admin/subscription-plans/{id}`
2. **Click** "Try it out"
3. **Enter the plan ID**
4. **Click "Execute"**
5. **Check the response**:

**Success:**
```json
{
  "success": true,
  "message": "Subscription plan deleted"
}
```

**Error (plan in use):**
```json
{
  "success": false,
  "message": "Cannot delete plan. 3 gym(s) are using this plan."
}
```

---

## 🧪 Complete Test Scenarios

### Scenario 1: Create Multiple Plans

Create plans for different tiers:

**Basic Plan:**
```json
{
  "name": "Basic / Entry-Level Plans",
  "description": "<p>Perfect for beginners starting their fitness journey</p>",
  "priceCurrency": "INR",
  "price": 499,
  "durationDays": 30,
  "features": "<ul><li>Access to basic equipment</li><li>Cardio zone access</li><li>Weekday access (Mon-Fri)</li></ul>",
  "isActive": true
}
```

**Premium Plan:**
```json
{
  "name": "Premium / Advanced Plans",
  "description": "<p>Ultimate fitness experience with premium amenities</p>",
  "priceCurrency": "INR",
  "price": 1999,
  "durationDays": 30,
  "features": "<ul><li>All gym equipment access</li><li>Personal trainer (4 sessions/month)</li><li>Nutrition consultation</li><li>Steam & sauna</li><li>Premium locker</li><li>24/7 access</li></ul>",
  "isActive": true
}
```

**Annual Plan:**
```json
{
  "name": "Duration-Based (Common in India)",
  "description": "<p>Best value! Annual membership with maximum savings</p>",
  "priceCurrency": "INR",
  "price": 9999,
  "durationDays": 365,
  "features": "<ul><li>All standard features</li><li>2 months free</li><li>Guest passes (2/month)</li><li>Free merchandise</li></ul>",
  "isActive": true
}
```

### Scenario 2: Multi-Currency Plans

**USD Plan:**
```json
{
  "name": "Standard / Popular Plans",
  "description": "<p>International membership plan</p>",
  "priceCurrency": "USD",
  "price": 12.99,
  "durationDays": 30,
  "features": "<ul><li>Access to all equipment</li><li>Monthly workout plan</li></ul>",
  "isActive": true
}
```

### Scenario 3: Test Validation

Try these to see validation errors:

**Missing required field:**
```json
{
  "name": "Standard / Popular Plans",
  "priceCurrency": "INR"
  // Missing: description, price, durationDays, features
}
```

**Invalid price:**
```json
{
  "name": "Standard / Popular Plans",
  "description": "<p>Test</p>",
  "priceCurrency": "INR",
  "price": -100,  // ❌ Negative price
  "durationDays": 30,
  "features": "<ul><li>Test</li></ul>"
}
```

**Invalid duration:**
```json
{
  ...
  "durationDays": 5000  // ❌ Exceeds max (3650 days)
}
```

**Short description:**
```json
{
  ...
  "description": "<p>Hi</p>"  // ❌ Less than 10 characters
}
```

---

## 📊 Response Codes

| Code | Meaning | When |
|------|---------|------|
| 200 | OK | Successful GET, PUT, PATCH |
| 201 | Created | Successful POST |
| 400 | Bad Request | Validation error |
| 401 | Unauthorized | Missing or invalid token |
| 403 | Forbidden | Not admin role |
| 404 | Not Found | Plan ID doesn't exist |
| 500 | Server Error | Backend error |

---

## 🔧 Troubleshooting

### "Unauthorized" Error

**Problem:** Getting 401 Unauthorized

**Solution:**
1. Make sure you've logged in
2. Check the Authorization button shows a 🔓 (unlocked) icon
3. Verify your token hasn't expired
4. Re-authenticate if needed

### "Validation Failed" Error

**Problem:** Getting 400 with validation errors

**Solution:**
1. Check the error response for specific field errors
2. Ensure all required fields are provided
3. Verify enum values (name, priceCurrency) match exactly
4. Check min/max constraints

### "Plan Not Found" Error

**Problem:** Getting 404 when updating/deleting

**Solution:**
1. Verify the plan ID is correct (UUID format)
2. Check if the plan exists (use GET endpoint)
3. Make sure you're not using a deleted plan's ID

### Server Not Running

**Problem:** Can't access Swagger UI

**Solution:**
```bash
cd backend
npm run dev
# Check console for any errors
```

---

## 💡 Pro Tips

### 1. Use Swagger's "Schemas" Section
- Scroll down to see all schema definitions
- Helps understand request/response structure

### 2. Export API Collection
- Swagger UI has a "Download" button
- Generate OpenAPI spec file
- Import into Postman or Insomnia

### 3. Test in Different Orders
```
1. Create → List → Update → List → Toggle → List → Delete
2. Create multiple → Search → Sort → Filter → Paginate
3. Test validation errors before valid requests
```

### 4. Check Response Times
- Swagger shows execution time
- Helps identify slow endpoints

### 5. Save Example Responses
- Copy successful responses for frontend development
- Use as mock data for testing

---

## 📚 Additional Resources

### Swagger UI Features
- **Try it out**: Execute real API calls
- **Model**: View schema definitions
- **Example Value**: Pre-filled request bodies
- **Responses**: See all possible response codes

### Next Steps
1. ✅ Test all subscription plan endpoints
2. ✅ Create sample data for development
3. ✅ Test with frontend UI
4. ✅ Verify pagination and sorting
5. ✅ Test error scenarios

---

## 🎯 Quick Reference

### Swagger URL
```
http://localhost:5000/docs
```

### Test Flow
```
1. Login (POST /api/auth/login)
2. Copy token
3. Click Authorize
4. Paste: Bearer {token}
5. Test subscription endpoints
```

### Sample Plan IDs (after creation)
```
Save these after creating plans:
- Basic Plan ID: ________________
- Standard Plan ID: ________________
- Premium Plan ID: ________________
```

---

## ✅ Checklist

- [ ] Server is running (`npm run dev`)
- [ ] Swagger UI accessible (http://localhost:5000/docs)
- [ ] Admin user exists in database
- [ ] Successfully logged in
- [ ] JWT token authorized in Swagger
- [ ] Created first subscription plan
- [ ] Listed all plans
- [ ] Updated a plan
- [ ] Toggled plan status
- [ ] Tested search functionality
- [ ] Tested sorting
- [ ] Tested pagination
- [ ] Tested validation errors
- [ ] Ready to integrate with frontend!

---

**🎉 You're now ready to test the Subscription Plans API using Swagger!**

For any issues, check:
- Backend console logs
- Swagger response messages
- Network tab in browser (F12)
