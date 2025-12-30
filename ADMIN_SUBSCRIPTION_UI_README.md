# Admin Subscription Plans UI - Complete Full Stack Solution

A complete, responsive React + TypeScript admin interface for managing gym subscription plans with backend API integration.

## 🎯 Features

### Frontend Features
- ✅ Full CRUD operations for subscription plans
- ✅ Rich text editor (Quill) for descriptions and features
- ✅ Multi-currency support (INR/USD) with dynamic labels
- ✅ Responsive data table with search, sort, and pagination
- ✅ Mobile-first responsive design (card layout on mobile)
- ✅ Form validation with Zod + React Hook Form
- ✅ Toggle active/inactive status directly from table
- ✅ Clean, modern UI with Tailwind CSS
- ✅ Loading and empty states
- ✅ Real-time validation error messages

### Backend Features
- ✅ RESTful API with Express.js
- ✅ PostgreSQL database with Prisma ORM
- ✅ Pagination, search, and sorting
- ✅ JWT authentication with role-based access control
- ✅ Zod schema validation
- ✅ Error handling middleware
- ✅ Swagger API documentation

## 📁 Project Structure

```
gym-management/
├── backend/
│   ├── prisma/
│   │   └── schema.prisma                    # ✅ UPDATED with priceCurrency
│   ├── src/
│   │   ├── controllers/
│   │   │   └── admin.controller.js          # ✅ UPDATED with toggle & pagination
│   │   ├── services/
│   │   │   └── admin.service.js             # ✅ UPDATED with search, sort, toggle
│   │   ├── routes/
│   │   │   └── admin.routes.js              # ✅ UPDATED with toggle-status route
│   │   └── middlewares/
│   │       └── validate.middleware.js       # ✅ UPDATED with new schema
│   ├── admin-subscription-plans-page.tsx    # ✅ Complete frontend component
│   ├── admin-ui-types.ts                    # ✅ TypeScript types
│   ├── admin-ui-validations.ts              # ✅ Zod schemas
│   └── frontend-package.json                # ✅ All dependencies
└── frontend/ (create this for Next.js app)
```

## 🚀 Quick Start

### 1. Database Migration

The Prisma schema has been updated to include `priceCurrency` field. Run migration:

```bash
cd backend
npx prisma migrate dev --name add_subscription_plan_currency
npx prisma generate
```

### 2. Backend API (Already Running)

The backend API has been updated with all necessary endpoints:

```
GET    /api/admin/subscription-plans?page=1&limit=10&search=&sortBy=createdAt&sortOrder=desc
POST   /api/admin/subscription-plans
PUT    /api/admin/subscription-plans/:id
PATCH  /api/admin/subscription-plans/:id/toggle-status
DELETE /api/admin/subscription-plans/:id
```

Test the API:
```bash
npm run dev
```

### 3. Frontend Setup

#### Option A: Add to Existing Next.js Project

1. Copy the component:
```bash
cp admin-subscription-plans-page.tsx ../frontend/src/app/admin/subscription-plans/page.tsx
```

2. Install dependencies:
```bash
cd ../frontend
npm install react-hook-form @hookform/resolvers zod react-quill quill lucide-react date-fns
npm install @types/quill --save-dev
```

3. Setup Tailwind CSS (if not already):
```bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

4. Configure `tailwind.config.js`:
```js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

5. Add to your global CSS (`app/globals.css` or `styles/globals.css`):
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Quill editor styles */
@import 'quill/dist/quill.snow.css';
```

6. Create `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

7. Run the app:
```bash
npm run dev
```

Visit: `http://localhost:3001/admin/subscription-plans`

#### Option B: Create New Next.js Project

```bash
npx create-next-app@latest gym-admin-frontend --typescript --tailwind --app
cd gym-admin-frontend

# Install dependencies
npm install react-hook-form @hookform/resolvers zod react-quill quill lucide-react date-fns
npm install @types/quill --save-dev

# Copy the component
mkdir -p src/app/admin/subscription-plans
cp ../backend/admin-subscription-plans-page.tsx src/app/admin/subscription-plans/page.tsx

# Add Quill CSS to globals.css
echo "@import 'quill/dist/quill.snow.css';" >> src/app/globals.css

# Create .env.local
echo "NEXT_PUBLIC_API_URL=http://localhost:3000/api" > .env.local

# Run
npm run dev
```

## 🔧 Configuration

### Environment Variables

**Backend** (`.env`):
```env
DATABASE_URL="postgresql://user:password@localhost:5432/gym_management"
JWT_SECRET="your-secret-key"
JWT_REFRESH_SECRET="your-refresh-secret"
PORT=3000
```

**Frontend** (`.env.local`):
```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

### Authentication

The component expects authentication headers. Update the API calls in the component:

```typescript
// In SubscriptionPlanApi methods, add:
headers: {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${yourAuthToken}`,
}
```

Or use a global axios instance with interceptors for automatic token injection.

## 📊 Database Schema Changes

The `GymSubscriptionPlan` model has been updated:

```prisma
model GymSubscriptionPlan {
  id             String   @id @default(uuid())
  name           String   // Plan category name
  description    String?  @db.Text  // ← Changed to Text for HTML
  priceCurrency  String   @default("INR")  // ← NEW FIELD
  price          Decimal  @db.Decimal(10, 2)
  durationDays   Int
  features       String   @db.Text  // ← Changed to Text for HTML
  isActive       Boolean  @default(true)
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
  
  gyms           Gym[]
  
  @@index([isActive])
  @@index([priceCurrency])
}
```

## 🎨 UI Components Breakdown

### 1. SubscriptionPlanForm
- Controlled form with React Hook Form
- Real-time validation with Zod
- Rich text editors for description and features
- Dynamic currency labels (₹ for INR, $ for USD)
- Toggle switch for active status
- Edit mode support

### 2. SubscriptionPlansTable
- Desktop: Full table with sortable columns
- Mobile: Card-based layout
- Search by plan name or duration
- Pagination controls
- Quick toggle active/inactive
- Edit button to load form

### 3. Utility Components
- `ToggleSwitch`: Reusable toggle component
- `Badge`: Active/Inactive status badge
- `LoadingSpinner`: Loading state
- `EmptyState`: No data state
- `RichTextEditor`: Quill wrapper with error handling

## 🔌 API Integration

The component uses a clean API service layer:

```typescript
class SubscriptionPlanApi {
  static async list(params) { /* ... */ }
  static async create(data) { /* ... */ }
  static async update(id, data) { /* ... */ }
  static async toggleActive(id) { /* ... */ }
}
```

### Example API Responses

**List Plans:**
```json
{
  "success": true,
  "data": {
    "plans": [...],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 25,
      "totalPages": 3
    }
  }
}
```

**Single Plan:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Standard / Popular Plans",
    "description": "<p>Full gym access with premium features</p>",
    "priceCurrency": "INR",
    "price": "999.00",
    "durationDays": 30,
    "features": "<ul><li>Access to all equipment</li><li>Free trainer consultation</li></ul>",
    "isActive": true,
    "createdAt": "2025-01-01T00:00:00.000Z",
    "_count": {
      "gyms": 5
    }
  }
}
```

## 📱 Responsive Design

### Desktop (1024px+)
- Side-by-side form and table layout
- Full table with all columns visible
- Hover states and tooltips

### Tablet (768px - 1023px)
- Stacked form and table
- Condensed table columns
- Touch-friendly buttons

### Mobile (<768px)
- Single column layout
- Card-based table view
- Bottom sheet-style form
- Large tap targets

## 🎯 Validation Rules

| Field | Rules |
|-------|-------|
| Plan Name | Required, one of 4 predefined categories |
| Description | Required, 10-5000 characters, HTML allowed |
| Currency | Required, INR or USD |
| Price | Required, positive number, max 999,999 |
| Duration | Required, positive integer, max 3,650 days (10 years) |
| Features | Required, 10-5000 characters, HTML allowed |
| IsActive | Boolean, default true |

## 🔐 Security Considerations

1. **Authentication**: All API endpoints require JWT authentication with ADMIN role
2. **Input Validation**: Backend validates with Zod schemas
3. **XSS Protection**: Sanitize HTML content before rendering (use DOMPurify)
4. **CORS**: Configure CORS for your frontend domain
5. **Rate Limiting**: Already implemented in backend

## 🧪 Testing the Implementation

### 1. Test Backend API

```bash
# Start backend
cd backend
npm run dev

# Test create plan (requires auth token)
curl -X POST http://localhost:3000/api/admin/subscription-plans \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "name": "Standard / Popular Plans",
    "description": "<p>Full gym access</p>",
    "priceCurrency": "INR",
    "price": 999,
    "durationDays": 30,
    "features": "<ul><li>Feature 1</li></ul>",
    "isActive": true
  }'

# Test list plans
curl http://localhost:3000/api/admin/subscription-plans \
  -H "Authorization: Bearer YOUR_TOKEN"

# Test toggle status
curl -X PATCH http://localhost:3000/api/admin/subscription-plans/PLAN_ID/toggle-status \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 2. Test Frontend

1. Navigate to `http://localhost:3001/admin/subscription-plans`
2. Create a new plan
3. Search for plans
4. Sort by different columns
5. Edit a plan
6. Toggle active/inactive status
7. Test on mobile (use Chrome DevTools device emulation)

## 🐛 Troubleshooting

### Quill not loading
- Make sure you're using `dynamic` import with `ssr: false`
- Check that Quill CSS is imported in global CSS

### Database migration errors
```bash
npx prisma migrate reset
npx prisma migrate dev
npx prisma generate
```

### TypeScript errors
```bash
npm install @types/react @types/react-dom @types/node @types/quill --save-dev
```

### API CORS errors
Update backend CORS configuration in `src/app.js`:
```javascript
app.use(cors({
  origin: 'http://localhost:3001',
  credentials: true
}));
```

## 📚 Additional Customization

### Add More Currencies

1. Update Prisma schema:
```prisma
priceCurrency  String   @default("INR")  // INR, USD, EUR, GBP
```

2. Update validation schema:
```typescript
priceCurrency: z.enum(['INR', 'USD', 'EUR', 'GBP'])
```

3. Update currency symbol logic in component

### Add More Plan Categories

Update both validation schemas and TypeScript types:
```typescript
type PlanCategory = 
  | 'Basic / Entry-Level Plans'
  | 'Standard / Popular Plans'
  | 'Premium / Advanced Plans'
  | 'Duration-Based (Common in India)'
  | 'Your Custom Category';
```

### Customize Table Columns

Modify the table component to show/hide columns or add new ones:
- Add gym count
- Show update timestamp
- Add tags or labels

## 📄 License

MIT

## 👨‍💻 Support

For issues or questions, refer to the codebase documentation or create an issue.

---

**Made with ❤️ for Gym Management System**
