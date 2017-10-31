import express from 'express';
import validate from 'express-validation';
import Joi from 'joi';
import torrentCtrl from '../controllers/torrent.controller';

const router = express.Router(); // eslint-disable-line new-cap
const paramValidation = {
  createTorrent: {
    body: {
      url: Joi.string().required()
    }
  }
};

router.route('/')
  /** GET /api/books - Get list of books */
  .get(torrentCtrl.list)
  
  /** POST /api/books - Create new book */
  .post(torrentCtrl.create);

  
router.route('/:torrentId')
  /** GET /api/books/:bookId - Get book */
  .get(torrentCtrl.get);
  
  /** DELETE /api/books/:bookId - Delete book */
  // .delete(torrentCtrl.remove);

/** Load book when API with bookId route parameter is hit */
router.param('torrentId', torrentCtrl.load);

export default router;
