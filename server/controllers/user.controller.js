import User from '../models/user.model';
import httpStatus from 'http-status';
import APIError from '../helpers/APIError';
import config from '../config/env';

/**
 * Get user
 * 
 * @returns {User}
 */
function get(req, res) {
  return res.json(req.user.safeModel());
}


/**
 * Creates the user; requires all properties
 * and attempts to encrypt the password and store
 * the user in the db
 *
 * @returns {User} user object
 */
function create(req, res, next) {
  let user = new User(req.body);
  
  User.findOne({email: req.body.email})
    .exec()
    .then(foundUser => {
      if (foundUser) {
        return next(Promise.reject(new APIError('Email must be unique', httpStatus.CONFLICT)));
      }
      
      return user.save();
    })
    .then(savedUser => {
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

/**
 * Update existing user
 * 
 * @param {string} req.body.email - The email of user.
 * @param {string} req.body.firstName - The firstName of user.
 * @param {string} req.body.lastName - The lastName of user.
 * @returns {User}
 */
function update(req, res, next) {
  let user = req.user;
  
  user.email = req.body.email;
  user.firstName = req.body.firstName || user.firstName;
  user.lastName = req.body.lastName || user.lastName;

  user.save()
    .then(savedUser => res.json(savedUser.safeModel()))
    .catch(e => next(e));
}

/**
 * Get user list.
 * 
 * @param {number} req.query.skip - Number of users to be skipped.
 * @param {number} req.query.limit - Limit number of users to be returned.
 * @returns {User[]}
 */
function list(req, res, next) {
  const { limit = 50, skip = 0 } = req.query;
  
  User.list({ limit, skip })
    .then(users => res.json(users))
    .catch(e => next(e));
}

/**
 * Delete user.
 * 
 * @returns {User}
 */
function remove(req, res, next) {
  const user = req.user;
  
  user.remove()
    .then(deletedUser => res.json(deletedUser.safeModel()))
    .catch(e => next(e));
}

/**
 * Load user and append to req.
 */
function load(req, res, next, id) {
  User
    .get(id)
    .then((user) => {
      req.user = user; // eslint-disable-line no-param-reassign
      return next();
    })
    .catch(e => next(e));
}

/**
 * Get user profile of logged in user
 *
 * @returns {User}
 */
function getProfile(req, res, next) {
  User
    .get(res.locals.session._id)
    .then(user => res.json(user.safeModel()))
    .catch(e => next(e));
}

export default { load, get, getProfile, update, list, remove, create };
