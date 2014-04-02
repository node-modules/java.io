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
    return this._readByte();
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

  return this._readBytes(b, off, len);
};
