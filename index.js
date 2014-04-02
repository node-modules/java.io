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

// OutputStream
exports.BlockDataOutputStream = require('./lib/block_data_output_stream');
exports.ByteArrayOutputStream = require('./lib/byte_array_output_stream');
exports.ObjectOutputStream = require('./lib/object_output_stream');
exports.DataOutputStream = require('./lib/data_output_stream');
exports.OutputStream = require('./lib/output_stream');

// InputStream
exports.ByteArrayInputStream = require('./lib/byte_array_input_stream');
exports.ObjectInputStream = require('./lib/object_input_stream');
// exports.DataInputStream = require('./lib/data_input_stream');
exports.InputStream = require('./lib/input_stream');

// Utility
exports.Bits = require('./lib/bits');
exports.types = require('./lib/types');
