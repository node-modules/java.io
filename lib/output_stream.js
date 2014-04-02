/**!
 * outputstream - lib/output_stream.js
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

function OutputStream() {

}

var proto = OutputStream.prototype;

proto._writeByte = function (b) {
  // sub class must impl this
};

proto._writeBytes = function (buf) {
  // sub class must impl this
};

// write(100)
// write(new Buffer('foo'))
// write(new Buffer('foobar'), 0, 3);
proto.write = function (b, off, len) {
  if (arguments.length === 1) {
    if (typeof b === 'number') {
      return this._writeByte(b);
    }
    // else b is Buffer
    off = 0;
    len = b.length;
  }
  return this._writeBytes(b.slice(off, len));
};

proto.flush = function () {

};

proto.close = function () {

};

module.exports = OutputStream;
