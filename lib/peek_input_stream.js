/**!
 * java.io - lib/peek_input_stream.js
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

var debug = require('debug')('java.io:peek_input_stream');
var util = require('util');
var InputStream = require('./input_stream');

// Input stream supporting single-byte peek operations.
function PeekInputStream(is) {
  InputStream.call(this);
  this.in = is;
  /** peeked byte */
  this.peekb = -1;
}

util.inherits(PeekInputStream, InputStream);

var proto = PeekInputStream.prototype;

/**
 * Peeks at next byte value in stream.  Similar to read(), except
 * that it does not consume the read value.
 */
proto.peek = function () {
  debug('peek() %s', this.peekb);
  return (this.peekb >= 0) ? this.peekb : (this.peekb = this.in.read());
};

// Standard InputStream methods

proto._readByte = function () {
  var v;
  var peekb = this.peekb;
  if (this.peekb >= 0) {
    v = this.peekb;
    this.peekb = -1;
  } else {
    v = this.in.read();
  }
  debug('_readByte() got %s, peekb %s', v, peekb);
  return v;
};

proto._readBytes = function (b, off, len) {
  if (len === 0) {
    return 0;
  } else if (this.peekb < 0) {
    return this.in.read(b, off, len);
  } else {
    b[off++] = this.peekb;
    len--;
    this.peekb = -1;
    var n = this.in.read(b, off, len);
    return (n >= 0) ? (n + 1) : 1;
  }
};

proto.skip = function (n) {
  if (n <= 0) {
		return 0;
	}
  var skipped = 0;
  if (this.peekb >= 0) {
    this.peekb = -1;
    skipped++;
    n--;
  }
  // dead loop?
  return skipped + this.skip(n);
};

proto.available = function () {
  return this.in.available() + ((this.peekb >= 0) ? 1 : 0);
};

proto.close = function () {
  return this.in.close();
};

proto.readFully = function(b, off, len) {
  var n = 0;
  while (n < len) {
    var count = this.read(b, off + n, len - n);
    if (count < 0) {
      throw new Error('EOFException');
    }
    n += count;
    debug('readFully() read %d bytes, total need %d bytes', count, n);
  }
  return n;
};

module.exports = PeekInputStream;
