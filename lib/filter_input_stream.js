/**!
 * java.io - lib/filter_input_stream.js
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

var util = require('util');
var InputStream = require('./input_stream');

function FilterInputStream(is) {
  InputStream.call(this);
  this.in = is;
}

util.inherits(FilterInputStream, InputStream);

var proto = FilterInputStream.prototype;

// Standard InputStream methods

proto._readByte = function () {
  return this.in.read();
};

proto._readBytes = function (b, off, len) {
  return this.in.read(b, off, len);
};

proto.skip = function (n) {
  return this.in.skip(n);
};

proto.available = function () {
  return this.in.available();
};

proto.close = function () {
  return this.in.close();
};

proto.mark = function (readlimit) {
  return this.in.mark(readlimit);
};

proto.reset = function () {
  return this.in.reset();
};

proto.markSupported = function () {
  return this.in.markSupported();
};

module.exports = FilterInputStream;
