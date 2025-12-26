require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const authRoutes = require('./routes/auth.routes');
const adminRoutes = require('./routes/admin.routes');
const gymOwnerRoutes = require('./routes/gymOwner.routes');
const memberRoutes = require('./routes/member.routes');
const { errorHandler } = require('./middlewares/error.middleware');

const app = express();

// Swagger UI
try {
  const swaggerUi = require('swagger-ui-express');
  const swaggerSpec = require('./swagger');
  app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
} catch (err) {
  console.warn('Swagger UI not available — install swagger-ui-express and swagger-jsdoc to enable /docs.');
}

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: { error: 'Too many requests, please try again later.' }
});
app.use('/api/', limiter);

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Simple API index page for browser discovery
app.get('/', (req, res) => {
  const html = `
  <html>
    <head><title>Gym Management API</title></head>
    <body style="font-family:Arial;margin:2rem">
      <h1>Gym Management API</h1>
      <p>Available endpoints (use GET in browser; other methods require a client):</p>
      <ul>
        <li><a href="/health">/health</a></li>
        <li><a href="/api/auth/profile">/api/auth/profile</a> (GET, protected)</li>
        <li><a href="/api/admin/dashboard">/api/admin/dashboard</a> (GET, admin)</li>
        <li><a href="/api/gym-owner/dashboard">/api/gym-owner/dashboard</a> (GET, gym owner)</li>
        <li><a href="/api/member/dashboard">/api/member/dashboard</a> (GET, member)</li>
        <li>/api/auth/login (POST)</li>
        <li>/api/auth/refresh-token (POST)</li>
        <li>/api/auth/logout (POST)</li>
        <li>/api/admin/subscription-plans (GET/POST)</li>
        <li>/api/admin/gyms (GET/POST)</li>
        <li>/api/gym-owner/trainers (GET/POST)</li>
        <li>/api/gym-owner/members (GET/POST)</li>
        <li>/api/gym-owner/diet-plans (GET/POST)</li>
        <li>/api/gym-owner/exercise-plans (GET/POST)</li>
        <li>/api/member/profile (GET)</li>
        <li>/api/member/trainer (GET)</li>
        <li>/api/member/diet-plan (GET)</li>
        <li>/api/member/exercise-plans (GET)</li>
      </ul>
      <p>Protected endpoints require authentication — use a tool like Postman or curl.</p>
    </body>
  </html>
  `;
  res.set('Content-Type', 'text/html').send(html);
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/gym-owner', gymOwnerRoutes);
app.use('/api/member', memberRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Global error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
});

module.exports = app;
