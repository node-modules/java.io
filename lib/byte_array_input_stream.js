/**!
 * java.io - lib/byte_array_input_stream.js
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

var debug = require('debug')('java.io:byte_array_input_stream');
var util = require('util');
var InputStream = require('./input_stream');

function ByteArrayInputStream(buf, offset, length) {
  InputStream.call(this);

  offset = offset || 0;
  length = length || buf.length;
  this.buf = buf;
  this.pos = offset;
  this.count = Math.min(offset + length, buf.length);
  this.mark = offset;
}

util.inherits(ByteArrayInputStream, InputStream);

var proto = ByteArrayInputStream.prototype;

proto.skip = function (n) {
  if (this.pos + n > this.count) {
    n = this.count - this.pos;
  }
  if (n < 0) {
    return 0;
  }
  this.pos += n;
  return n;
};

proto.available = function () {
  return this.count - this.pos;
};

proto.markSupported = function () {
  return true;
};

proto.mark = function (readAheadLimit) {
  this.pos = this.mark;
};

// Standard InputStream methods

proto._readByte = function () {
  var v = -1;
  if (this.pos < this.count) {
    v = this.buf[this.pos++];
  }
  debug('_readByte() got %s, pos %s, count: %s', v, this.pos, this.count);
  return v;
};

proto._readBytes = function (b, off, len) {
  if (this.post >= this.count) {
    return -1;
  }
  if (this.pos + len > this.count) {
    len = this.count - this.post;
  }
  if (len <= 0) {
    return 0;
  }
  var startPos = this.pos;
  this.pos += len;
  this.buf.copy(b, off, startPos, this.pos);
  debug('_readBytes() off %s, len %s, current pos %s', off, len, this.pos);
  return len;
};

module.exports = ByteArrayInputStream;
