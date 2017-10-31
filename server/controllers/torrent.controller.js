import Torrent from '../models/torrent.model';
import httpStatus from 'http-status';
import APIError from '../helpers/APIError';
import config from '../config/env';

const WebTorrent = require('webtorrent');
let client = new WebTorrent();


/**
 * Creates the user; requires all properties
 * and attempts to encrypt the password and store
 * the user in the db
 *
 * @returns {Torrent} torrent object
 */
function create(req, res, next) {
  const torrent = new Torrent(req.body);
  
  console.log('torrent create() called');
  console.log(`url in body: ${req.body.url}`);
  console.log(`torrent object: ${torrent}`);
  
  torrent
    .save()
    .then(savedTorrent => {
      setTimeout(() => {
        console.log(`torrent ${savedTorrent.url} started`);
        
        // start torrent here
        client.add(req.body.url, function (_torrent) {
          // Got torrent metadata!
          console.log('Client is downloading:', _torrent.infoHash);
    
          _torrent.files.forEach(function (file) {
            // Display the file by appending it to the DOM. Supports video, audio, images, and
            // more. Specify a container element (CSS selector or reference to DOM node).
            console.log(file);
          })
        })
      }, 20);

      return res.json(savedTorrent);
    })
    .catch(e => next(e));
}

/**
 * Get Torrent
 *
 * @returns {Torrent}
 */
function get(req, res) {
  return res.json(req.torrent);
}

/**
 * Get torrent list.
 *
 * @param {number} req.query.skip - Number of users to be skipped.
 * @param {number} req.query.limit - Limit number of users to be returned.
 * @returns {Torrent[]}
 */
function list(req, res, next) {
  const { limit = 50, skip = 0 } = req.query;
  
  Torrent.list({ limit, skip })
    .then(users => res.json(users))
    .catch(e => next(e));
}

/**
 * Load user and append to req.
 */
function load(req, res, next, id) {
  Torrent
    .get(id)
    .then(torrent => {
      req.torrent = torrent;  // eslint-disable-line no-param-reassign
      return next();
    })
    .catch(e => next(e));
}


export default { load, get, list, create };
