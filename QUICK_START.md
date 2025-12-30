# 🚀 Quick Start Guide - Admin Subscription Plans

## Prerequisites
- Node.js 18+ installed
- PostgreSQL database running
- Backend server setup at `backend/`

## 3-Minute Setup

### Step 1: Database Migration (30 seconds)
```bash
cd backend
npx prisma migrate dev --name add_subscription_plan_currency
npx prisma generate
```

### Step 2: Start Backend (10 seconds)
```bash
npm run dev
# Server running at http://localhost:3000
```

### Step 3: Create Frontend Project (2 minutes)
```bash
# Create new Next.js app
npx create-next-app@latest gym-admin --typescript --tailwind --app
cd gym-admin

# Install dependencies
npm install react-hook-form @hookform/resolvers zod react-quill quill lucide-react date-fns @types/quill

# Setup directory
mkdir -p src/app/admin/subscription-plans

# Copy component
cp ../backend/admin-subscription-plans-page.tsx src/app/admin/subscription-plans/page.tsx

# Add Quill CSS to src/app/globals.css
echo -e "\n@import 'quill/dist/quill.snow.css';" >> src/app/globals.css

# Create .env.local
echo "NEXT_PUBLIC_API_URL=http://localhost:3000/api" > .env.local

# Start frontend
npm run dev
# Frontend running at http://localhost:3001
```

### Step 4: Access the Page
Navigate to: **http://localhost:3001/admin/subscription-plans**

## ✅ Done!

You should now see:
- ✅ Create/Update Subscription Plan Form
- ✅ Subscription Plans Table with search, sort, pagination
- ✅ Fully responsive on mobile and desktop

## 🔧 Quick Fixes

### Migration Error?
```bash
npx prisma migrate reset --force
npx prisma migrate dev
npx prisma generate
```

### Frontend Not Loading?
Check that:
1. Backend is running on port 3000
2. `.env.local` has correct API URL
3. Quill CSS is imported in `globals.css`

### TypeScript Errors?
```bash
npm install @types/react @types/react-dom @types/node @types/quill --save-dev
```

### CORS Error?
Update `backend/src/app.js`:
```javascript
app.use(cors({
  origin: 'http://localhost:3001',
  credentials: true
}));
```

## 📝 Test Data

Create a test subscription plan:

```bash
curl -X POST http://localhost:3000/api/admin/subscription-plans \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "name": "Standard / Popular Plans",
    "description": "<p>Full gym access with all equipment and facilities</p>",
    "priceCurrency": "INR",
    "price": 999,
    "durationDays": 30,
    "features": "<ul><li>Access to all gym equipment</li><li>Free trainer consultation</li><li>Diet plan included</li></ul>",
    "isActive": true
  }'
```

## 📚 Full Documentation

For complete details, see:
- `IMPLEMENTATION_COMPLETE.md` - Full implementation details
- `ADMIN_SUBSCRIPTION_UI_README.md` - Complete feature documentation

## 🎯 Features

✅ Create/Update subscription plans
✅ Rich text editor for descriptions and features
✅ Multi-currency support (INR/USD)
✅ Search by plan name or duration
✅ Sort by any column
✅ Pagination
✅ Toggle active/inactive status
✅ Mobile responsive design
✅ Form validation

## 🆘 Need Help?

Check the error messages in:
- Browser console (F12)
- Backend terminal
- Network tab (F12 → Network)

Common issues are documented in `ADMIN_SUBSCRIPTION_UI_README.md` under "Troubleshooting"

---

**That's it! Start managing subscription plans now! 🎉**
