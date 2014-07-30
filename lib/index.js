/**!
 * java.io - lib/serialization/v2/index.js
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

// Object Serialization Stream Protocol:
// http://docs.oracle.com/javase/6/docs/platform/serialization/spec/protocol.html

exports.InputObjectStream = require('./input');
exports.OutputObjectStream = require('./output');
