/**!
 * java.io - index.js
 *
 * Copyright(c) fengmk2 and other contributors.
 * MIT Licensed
 *
 * Authors:
 *   fengmk2 <fengmk2@gmail.com> (http://fengmk2.github.com)
 */

'use strict';

/**
 * Module dependencies.
 */

// Utility
exports.Bits = require('./lib/bits');
exports.types = require('./lib/types');

exports.Constants = require('./lib/const');

var serialization = require('./lib/serialization/v2');

exports.writeObject = exports.write = serialization.writeObject;
exports.readObject = exports.read = serialization.readObject;
exports.addObject = serialization.addObject;
