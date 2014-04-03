/**!
 * java.io - lib/input_stream.js
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

var debug = require('debug')('java.io:input_stream');

function InputStream() {

}

var proto = InputStream.prototype;

proto._readByte = function () {
  // subclass must impl this
};

proto._readBytes = function (b, off, len) {
  // subclass must impl this
};

// read()
// read(b)
// read(0, 100)
proto.read = function (b, off, len) {
  if (arguments.length === 0) {
    var v = this._readByte();
    debug('read() got %s', v);
    return v;
  }

  if (!Buffer.isBuffer(b)) {
    throw new TypeError('b must be a Buffer instance');
  }

  if (arguments.length === 1) {
    off = 0;
    len = b.length;
  } else {
    if (off < 0 || len < 0 || len > b.length - off) {
      throw new TypeError('IndexOutOfBoundsException');
    }
  }

  if (len === 0) {
    return 0;
  }

  var readsize = this._readBytes(b, off, len);
  debug('%s.read(b, %s, %s) got %d bytes', this.constructor.name, off, len, readsize);
  return readsize;
};

proto.skip = function (n) {

};

proto.available = function () {

};

proto.close = function () {

};

proto.mark = function (readlimit) {

};

proto.reset = function () {

};

proto.markSupported = function () {
  return false;
};

module.exports = InputStream;
