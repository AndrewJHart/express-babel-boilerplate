import Promise from 'bluebird';
import mongoose from 'mongoose';
import httpStatus from 'http-status';
import bcrypt from 'bcrypt-nodejs';
import APIError from '../helpers/APIError';

const _ = require('lodash');

/**
 * User Schema
 */
const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  firstName: {
    type: String,
    required: false
  },
  lastName: {
    type: String,
    required: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

/**
 * - pre-save hooks
 * - validations
 * - virtual methods
 */

/**
 * Pre-save hook to encrypt passwords before the user is saved;
 * @note This is called automatically during the creation of a User model
 *       so do not manually call `generatePassword()` or it will result in a
 *       double encryption scheme
 */
UserSchema.pre('save', function (next) {
  this.password = bcrypt.hashSync(this.password, bcrypt.genSaltSync(8), null);
  return next();
});

/**
 * Methods
 */
UserSchema.method({
  /**
   * This is to encrypt the password;
   *
   * @note this should only be called when a password is updated because
   *       the User model auto-encrypts new users passwords during save()
   * @param password
   * @returns {*}
   */
  generatePassword(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
  },
  
  /**
   * Encrypts the given password & compares with the stored password
   * for authentication
   *
   * @param password
   * @returns {*}
   */
  validPassword(password) {
    console.log(`comparing password: ${password} with stored password: ${this.password}`);
    console.log(bcrypt.compareSync(password, this.password));
    return bcrypt.compareSync(password, this.password);
  },
  
  /**
   * Strips password fields from the User object
   * before returning json response
   *
   * @returns {Object}
   */
  safeModel() {
    // const { __v, password,  ...safeUser} = this.toObject();
    return _.omit(this.toObject(), ['password', '__v']);
  }
});

/**
 * Statics
 */
UserSchema.statics = {
  /**
   * Get user
   * @param {ObjectId} id - The objectId of user.
   * @returns {Promise<User, APIError>}
   */
  get(id) {
    return this.findById(id)
      .exec()
      .then((user) => {
        if (user) {
          return user;
        }
        const err = new APIError('No such user exists!', httpStatus.NOT_FOUND, true);
        return Promise.reject(err);
      });
  },

  /**
   * Get user by email
   *
   * @param {ObjectId} email - The email of user.
   * @returns {Promise<User, APIError>}
   */
  getByEmail(email) {
    return this.findOne({ email })
      .exec()
      .then((user) => {
        if (user) {
          return user;
        }
        const err = new APIError('No such user exists!', httpStatus.NOT_FOUND, true);
        return Promise.reject(err);
      });
  },

  /**
   * List users in descending order of 'createdAt' timestamp.
   * @param {number} skip - Number of users to be skipped.
   * @param {number} limit - Limit number of users to be returned.
   * @returns {Promise<User[]>}
   */
  list({ skip = 0, limit = 50 } = {}) {
    return this.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .exec();
  }
};

/**
 * @typedef User
 */
export default mongoose.model('User', UserSchema);
