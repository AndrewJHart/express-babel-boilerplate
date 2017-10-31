import express from 'express';
import userRoutes from './user.route';
import authRoutes from './auth.route';
import bookRoutes from './book.route';
import torRoutes from './torrent.route';

const router = express.Router(); // eslint-disable-line new-cap

router.get('');

/** GET /health-check - Check service health */
router.get('/health-check', (req, res) =>
  res.send('OK')
);

// mount auth routes at /auth
router.use('/auth', authRoutes);

// mount user routes at /api/users
router.use('/api/users', userRoutes);

// mount book routes at /api/books
router.use('/api/books', bookRoutes);

// mount torrent routes /api/torrents
router.use('/api/torrents', torRoutes);


export default router;