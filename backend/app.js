const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');
const globalErrorHandler = require('./middlewares/errorMiddleware');
const AppError = require('./utils/AppError');

// Route imports
const authRoutes = require('./routes/auth.routes');
const productRoutes = require('./routes/product.routes');
const cartRoutes = require('./routes/cart.routes');
const orderRoutes = require('./routes/order.routes');
const wishlistRoutes = require('./routes/wishlist.routes');
const suggestionRoutes = require('./routes/suggestion.routes');

const app = express();

// ── CORS ──────────────────────────────────────────
// Allow any origin in dev; lock to CLIENT_URL in production
const allowedOrigin = process.env.CLIENT_URL || true; // true = reflect request origin
app.use(cors({
  origin: allowedOrigin,
  credentials: true,
}));

// ── Body parsers ──────────────────────────────────
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

// ── Static: admin-uploaded files via multer ───────
// These are REAL files on disk — served directly
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/api/uploads', express.static(path.join(__dirname, 'uploads')));

// ── Static: optional local image overrides ────────
// If admin places a file at public/images/filename.jpg, it will be served.
// Otherwise the image URL in the DB is an absolute https:// placehold.co URL
// and the browser loads it directly — no backend redirect needed.
const publicImages = path.join(__dirname, 'public', 'images');
app.use('/images', express.static(publicImages));

// ── API Routes ────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/suggestions', suggestionRoutes);

// ── 404 fallback ──────────────────────────────────
app.all('*', (req, res, next) => {
  next(new AppError(`Cannot find ${req.originalUrl} on this server`, 404));
});

// ── Global error handler ──────────────────────────
app.use(globalErrorHandler);

module.exports = app;
