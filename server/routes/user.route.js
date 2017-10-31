import express from 'express';
import validate from 'express-validation';
import Joi from 'joi';
import userCtrl from '../controllers/user.controller';

const router = express.Router(); // eslint-disable-line new-cap
const paramValidation = {
  updateUser: {
    body: {
      email: Joi.string().required(),
      firstName: Joi.string(),
      lastName: Joi.string()
    }
  },
  createUser: {
    body: {
      email: Joi.string().required(),
      firstName: Joi.string(),
      lastName: Joi.string(),
      password: Joi.string().required()
    }
  }
};

router.route('/')
  /** GET /api/users/ - List of Users */
  .get(userCtrl.list)
  /** POST /api/users/ - create new user */
  .post(validate(paramValidation.createUser), userCtrl.create);

/** GET & PUT /api/users/:id - detail routes for specific user */
router.route('/:userId')
  /** GET /api/users/:userId - Get user */
  .get(userCtrl.get)

  /** PUT /api/users/:userId - Update user */
  .put(validate(paramValidation.updateUser), userCtrl.update)

  /** DELETE /api/users/:userId - Delete user */
  .delete(userCtrl.remove);


/** GET /api/users/ profile of currently authenticated user */
router.route('/profile')
  /** GET /api/users/profile - Get profile of logged in user */
  .get(userCtrl.getProfile);

/** Load user when API with userId route parameter is hit */
router.param('userId', userCtrl.load);

export default router;
