import Promise from 'bluebird';
import mongoose from 'mongoose';
import httpStatus from 'http-status';
import APIError from '../helpers/APIError';

const _ = require('lodash');

/**
 * User Schema
 */
const TorrentSchema = new mongoose.Schema({
  url: {
    type: String,
    required: true,
    unique: true
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
 * Pre-save hook 
 */
// TorrentSchema.pre('save', function (next) {
//   return next();
// });

/**
 * Methods
 */
TorrentSchema.method({
  /**
   * Strips sensitive fields from the object
   * before returning json response
   *
   * @returns {Object}
   */
  safeModel() {
    // const { __v, password,  ...safeUser} = this.toObject();
    return _.omit(this.toObject(), ['__v']);
  }
});

/**
 * Statics
 */
TorrentSchema.statics = {
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
      const err = new APIError('No such torrent exists!', httpStatus.NOT_FOUND, true);
      return Promise.reject(err);
    });
  },
  
  /**
   * List users in descending order of 'createdAt' timestamp.
   *
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
 * @typedef Torrent
 */
export default mongoose.model('Torrent', TorrentSchema);
