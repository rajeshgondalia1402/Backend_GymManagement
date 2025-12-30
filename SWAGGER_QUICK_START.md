# 🚀 SWAGGER API TESTING - Quick Start

## Open Swagger UI Now!

Your backend has Swagger UI pre-configured and ready to use.

### 🔗 Access Swagger UI

**1. Start the backend server:**
```bash
cd backend
npm run dev
```

**2. Open Swagger in your browser:**

**🌐 http://localhost:5000/docs**

or if PORT is 3000:

**🌐 http://localhost:3000/docs**

---

## ⚡ Quick Test (60 Seconds)

### Step 1: Login (10 seconds)
1. Open Swagger: http://localhost:5000/docs
2. Find **POST /api/auth/login**
3. Click "Try it out"
4. Use these credentials (if you have seed data):
```json
{
  "email": "admin@gym.com",
  "password": "admin123"
}
```
5. Click "Execute"
6. **Copy the token** from response

### Step 2: Authorize (5 seconds)
1. Click the **"Authorize"** button (🔒 icon at top)
2. Paste: `Bearer YOUR_TOKEN_HERE`
3. Click "Authorize" then "Close"

### Step 3: Create a Plan (20 seconds)
1. Find **POST /api/admin/subscription-plans**
2. Click "Try it out"
3. Use this example:
```json
{
  "name": "Standard / Popular Plans",
  "description": "<p>Full gym access</p>",
  "priceCurrency": "INR",
  "price": 999,
  "durationDays": 30,
  "features": "<ul><li>All equipment</li><li>Trainer consultation</li></ul>",
  "isActive": true
}
```
4. Click "Execute"
5. ✅ You should see 201 Created!

### Step 4: List Plans (5 seconds)
1. Find **GET /api/admin/subscription-plans**
2. Click "Try it out"
3. Click "Execute"
4. ✅ See your plan in the list!

### Step 5: Toggle Status (5 seconds)
1. Copy the plan ID from the list
2. Find **PATCH /api/admin/subscription-plans/{id}/toggle-status**
3. Click "Try it out"
4. Paste the plan ID
5. Click "Execute"
6. ✅ Status changed!

---

## 📚 Full Documentation

For complete testing guide, see: **SWAGGER_TESTING_GUIDE.md**

---

## 🎯 What You Can Test

### Subscription Plans API
- ✅ **POST** `/api/admin/subscription-plans` - Create plan
- ✅ **GET** `/api/admin/subscription-plans` - List with pagination, search, sort
- ✅ **PUT** `/api/admin/subscription-plans/{id}` - Update plan
- ✅ **PATCH** `/api/admin/subscription-plans/{id}/toggle-status` - Toggle active
- ✅ **DELETE** `/api/admin/subscription-plans/{id}` - Delete plan

### Query Parameters (GET)
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)
- `search` - Search by name or duration
- `sortBy` - Sort field (name, price, durationDays, createdAt, isActive)
- `sortOrder` - Sort direction (asc, desc)

### Example Queries
```
# Get page 2 with 5 items
GET /api/admin/subscription-plans?page=2&limit=5

# Search for "premium"
GET /api/admin/subscription-plans?search=premium

# Sort by price (lowest first)
GET /api/admin/subscription-plans?sortBy=price&sortOrder=asc

# Search and sort
GET /api/admin/subscription-plans?search=30&sortBy=price&sortOrder=asc
```

---

## 🔧 Common Issues

### Can't Access Swagger
```bash
# Make sure server is running
cd backend
npm run dev

# Check console output for port number
# Then visit http://localhost:{PORT}/docs
```

### "Unauthorized" Error
- Click the "Authorize" button (🔒)
- Login first to get a token
- Paste: `Bearer YOUR_TOKEN_HERE`

### No Admin User
```bash
# Create one manually or use seed
npm run prisma:seed

# Or create via Prisma Studio
npx prisma studio
```

---

## 🎨 Swagger UI Features

### Interactive Testing
- ✅ Execute real API calls
- ✅ See request/response in real-time
- ✅ View all possible responses
- ✅ Pre-filled examples

### Documentation
- ✅ Complete API reference
- ✅ Request/response schemas
- ✅ Field descriptions
- ✅ Validation rules

### Export Options
- ✅ Download OpenAPI spec
- ✅ Import to Postman
- ✅ Share with frontend team

---

## 🌟 Swagger Highlights

### Beautiful UI
- Clean, modern interface
- Dark mode available
- Organized by tags
- Search functionality

### Real-time Testing
- Execute requests instantly
- See actual backend responses
- Test different scenarios
- Debug issues quickly

### Developer-Friendly
- Detailed error messages
- Example values provided
- Schema validation
- Response time shown

---

## 📋 Test Checklist

Quick checklist to verify everything works:

- [ ] Swagger UI loads (http://localhost:5000/docs)
- [ ] Can login and get token
- [ ] Authorization works
- [ ] Create plan succeeds (201)
- [ ] List plans works (200)
- [ ] Search finds results
- [ ] Sorting works
- [ ] Pagination works
- [ ] Update plan succeeds (200)
- [ ] Toggle status works (200)
- [ ] Validation errors show (400)

---

## 🎉 You're Ready!

**Swagger UI URL:**
```
http://localhost:5000/docs
```

**Default credentials (if seeded):**
```
Email: admin@gym.com
Password: admin123
```

**Start testing now!** 🚀

---

## 📖 Need More Help?

- **Full Guide**: SWAGGER_TESTING_GUIDE.md
- **API Integration**: API_INTEGRATION_GUIDE.md
- **Backend Details**: IMPLEMENTATION_COMPLETE.md

---

**Happy Testing! 🎊**
