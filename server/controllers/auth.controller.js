import jwt from 'jsonwebtoken';
import httpStatus from 'http-status';
import APIError from '../helpers/APIError';
import User from '../models/user.model';
import config from '../config/env';


/**
 *  Returns jwt token and user details if valid email and password are provided
 *
 * @param {string} req.body.email - The email of user.
 * @param {string} req.body.password - The password of user.
 * @returns {token, User}
 */
function login(req, res, next) {
  User
    .getByEmail(req.body.email)
    .then((foundUser) => {
      if (!foundUser.validPassword(req.body.password)) {
        const err = new APIError('User email and password combination do not match', httpStatus.UNAUTHORIZED);
        return next(err);
      }
      
      const token = jwt.sign(foundUser.safeModel(), config.jwtSecret, {
        expiresIn: config.jwtExpiresIn
      });
      
      return res.json({
        token,
        user: foundUser.safeModel()
      });
    })
    .catch(err => next(new APIError(err.message, httpStatus.NOT_FOUND)));
}

/**
 * Register a new user
 *
 * @param {string} req.body.email - The email of user.
 * @param {string} req.body.password - The password of user.
 * @param {string} req.body.firstName - The firstName of user.
 * @param {string} req.body.lastName - The lastName of user.
 * @returns {User}
 */
function register(req, res, next) {
  const user = new User(req.body);
  
  console.log('register hit, user is ', user);

  User.findOne({ email: req.body.email })
    .exec()
    .then((foundUser) => {
      if (foundUser) {
        return res.status(httpStatus.CONFLICT).json({'error': 'email address already exists'});
      }
      
      return user.save();
    })
    .then((savedUser) => {
      const token = jwt.sign(savedUser.safeModel(), config.jwtSecret, {
        expiresIn: config.jwtExpiresIn
      });
      
      return res.json({
        token,
        user: savedUser.safeModel()
      });
    })
    .catch(e => next(e));
}

export default { login, register };
