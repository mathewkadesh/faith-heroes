require('dotenv').config();
const http    = require('http');
const express = require('express');
const cors    = require('cors');
const helmet  = require('helmet');
const morgan  = require('morgan');
const rateLimit = require('express-rate-limit');

const { initSocket }   = require('./socket');
const { startRealtime } = require('./services/realtime.service');
const errorHandler     = require('./middleware/errorHandler');

const authRoutes       = require('./routes/auth.routes');
const characterRoutes  = require('./routes/characters.routes');
const productRoutes    = require('./routes/products.routes');
const orderRoutes      = require('./routes/orders.routes');
const storyRoutes      = require('./routes/stories.routes');
const uploadRoutes     = require('./routes/upload.routes');
const paymentRoutes    = require('./routes/payments.routes');
const adminRoutes      = require('./routes/admin.routes');
const signatureItemRoutes = require('./routes/signatureItems.routes');
const promotionRoutes = require('./routes/promotions.routes');

const app    = express();
const server = http.createServer(app);

initSocket(server);
startRealtime();

app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(morgan('dev'));

// Stripe webhook needs raw body — mount before json parser
app.use('/api/payments/webhook', express.raw({ type: 'application/json' }));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 200 });
app.use('/api', limiter);

app.use('/api/auth',       authRoutes);
app.use('/api/characters', characterRoutes);
app.use('/api/products',   productRoutes);
app.use('/api/orders',     orderRoutes);
app.use('/api/stories',    storyRoutes);
app.use('/api/upload',     uploadRoutes);
app.use('/api/payments',   paymentRoutes);
app.use('/api/admin',      adminRoutes);
app.use('/api/signature-items', signatureItemRoutes);
app.use('/api/promotions', promotionRoutes);

app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

app.use(errorHandler);

const PORT = process.env.PORT || 5001;
const HOST = process.env.HOST || '127.0.0.1';
server.listen(PORT, HOST, () => console.log(`Server running on http://${HOST}:${PORT}`));
