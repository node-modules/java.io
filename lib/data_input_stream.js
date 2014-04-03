/**!
 * java.io - lib/data_input_stream.js
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
var Bits = require('./bits');
var FilterInputStream = require('./filter_input_stream');

function DataInputStream(is) {
  FilterInputStream.call(this, is);
  this._buf = new Buffer(8);
}

util.inherits(DataInputStream, FilterInputStream);

var proto = DataInputStream.prototype;

// readFully(b)
// readFully(b, off, len)
proto.readFully = function (b, off, len) {
  if (len < 0) {
    throw new Error('IndexOutOfBoundsException');
  }
  var n = 0;
  while (n < len) {
    var count = this.in.read(b, off + n, len - n);
    if (count < 0) {
      throw new Error('EOFException');
    }
    n += count;
  }
};

proto.skipBytes = function (n) {
  var total = 0;
	var cur = 0;

	while ((total < n) && ((cur = this.in.skip(n - total)) > 0)) {
    total += cur;
	}

	return total;
};

// DataInput Interface

proto.readByte = function () {
  var ch = this.in.read();
  if (ch < 0) {
    throw new Error('EOFException');
  }
  return ch;
};

proto.readUnsignedByte = proto.readByte;

proto.readBoolean = function () {
  return this.readByte() !== 0;
};

proto._readValue = function (method, size) {
  var len = this.in.read(this._buf, 0, size);
  if (len !== size) {
    throw new Error('EOFException');
  }
  return this._buf[method](0);
};

proto.readShort = function () {
  return this._readValue('readUInt16BE', 2);
};

proto.readUnsignedShort = proto.readShort;

proto.readChar = function () {
  return this._readValue('readInt16BE', 2);
};

proto.readInt = function () {
  return this._readValue('readUInt32BE', 4);
};

proto.readLong = function () {
  var len = this.in.read(this._buf, 0, 8);
  if (len !== 8) {
    throw new Error('EOFException');
  }
  return Bits.toLong(this._buf);
};

proto.readFloat = function () {
  return this._readValue('readFloatBE', 4);
};

proto.readDouble = function () {
  return this._readValue('readDoubleBE', 8);
};

proto.readUTF = function () {
  var utflen = this.in.readUnsignedShort();
  var bytearr = new Buffer(utflen);
  this.readFully(bytearr, 0, utflen);
  return bytearr.toString();
};

module.exports = DataInputStream;
