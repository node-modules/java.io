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

var InputObjectStream = require('./input');
var OutputObjectStream = require('./output');

// Object Serialization Stream Protocol:
// http://docs.oracle.com/javase/6/docs/platform/serialization/spec/protocol.html
//
// ObjectStreamConstants.PROTOCOL_VERSION_2
//
// ```
// Indicates the new external data format.
// Primitive data is written in block data mode and is terminated with TC_ENDBLOCKDATA.
// Block data boundaries have been standardized.
// Primitive data written in block data mode is normalized to not exceed 1024 byte chunks.
// The benefit of this change was to tighten the specification of serialized data format within the stream.
// This change is fully backward and forward compatible.
// ```

exports.InputObjectStream = InputObjectStream;

exports.decode = exports.read = exports.readObject = function (buf, withType) {
  return InputObjectStream.readObject(buf, withType);
};

exports.encode = exports.write = exports.writeObject = function (obj) {
  return OutputObjectStream.writeObject(obj);
};

exports.addObject = InputObjectStream.addObject;
