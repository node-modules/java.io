/**!
 * java.io - lib/bits.js
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

var Long = require('long');

/**
 * Convert v to Long.
 *
 * @param {Number|String} v
 * @return {Long}
 */
function toLong(v) {
  if (v instanceof Long) {
    return v;
  }
  if (Buffer.isBuffer(v)) {
    // buffer must be 8 bytes
    return Long.fromBits(v.readInt32BE(4), v.readInt32BE(0));
  }
  if (typeof v === 'string') {
    return Long.fromString(v);
  }
  return Long.fromNumber(v);
}

function toLongBytes(v) {
  var buf = new Buffer(8);
  v = toLong(v);
  buf.writeInt32BE(v.high, 0);
  buf.writeInt32BE(v.low, 4);
  return buf;
}

/**
 * Utility methods for packing/unpacking primitive values in/out of byte arrays
 * using big-endian byte ordering.
 */
var Bits = {
  toLong: toLong,
  toLongBytes: toLongBytes,

  /*
   * Methods for unpacking primitive values from byte arrays starting at
   * given offsets.
   */

  getBoolean: function (b, off) {
    return b[off] !== 0;
  },

  getChar: function (b, off) {
    return b.readUInt16BE(off);
  },

  getShort: function (b, off) {
    return b.readUInt16BE(off);
  },

  getInt: function (b, off) {
    return b.readUInt32BE(off);
  },

  getFloat: function (b, off) {
    return b.readFloatBE(off);
  },

  getLong: function (b, off) {
    return Long.fromBits(b.readInt32BE(off + 4), b.readInt32BE(off));
  },

  getDouble: function (b, off) {
    return b.readDoubleBE(off);
  },

  /**
   * Methods for packing primitive values into byte arrays starting at given
   * offsets.
   */

  putBoolean: function (b, off, val) {
    b[off] = val ? 1 : 0;
    return b;
  },
  //
  //   static void putChar(byte[] b, int off, char val) {
  // b[off + 1] = (byte) (val >>> 0);
  // b[off + 0] = (byte) (val >>> 8);
  //   }
  //
  putShort: function (b, off, val) {
    // b[off + 1] = val >>> 0;
    // b[off + 0] = val >>> 8;
    b.writeUInt16BE(val, off);
    return b;
  },

  putInt: function (b, off, val) {
    // b[off + 3] = (byte) (val >>> 0);
    // b[off + 2] = (byte) (val >>> 8);
    // b[off + 1] = (byte) (val >>> 16);
    // b[off + 0] = (byte) (val >>> 24);
    b.writeUInt32BE(val, off);
    return b;
  },

  putFloat: function (b, off, val) {
    // int i = Float.floatToIntBits(val);
    // b[off + 3] = (byte) (i >>> 0);
    // b[off + 2] = (byte) (i >>> 8);
    // b[off + 1] = (byte) (i >>> 16);
    // b[off + 0] = (byte) (i >>> 24);
    b.writeFloatBE(val, off);
    return b;
  },

  putLong: function (b, off, val) {
    // b[off + 7] = (byte) (val >>> 0);
    // b[off + 6] = (byte) (val >>> 8);
    // b[off + 5] = (byte) (val >>> 16);
    // b[off + 4] = (byte) (val >>> 24);
    // b[off + 3] = (byte) (val >>> 32);
    // b[off + 2] = (byte) (val >>> 40);
    // b[off + 1] = (byte) (val >>> 48);
    // b[off + 0] = (byte) (val >>> 56);
    val = toLong(val);
    b.writeInt32BE(val.high, off);
    b.writeInt32BE(val.low, off + 4);
    return b;
  },

  putDouble: function (b, off, val) {
    // long j = Double.doubleToLongBits(val);
    // b[off + 7] = (byte) (j >>> 0);
    // b[off + 6] = (byte) (j >>> 8);
    // b[off + 5] = (byte) (j >>> 16);
    // b[off + 4] = (byte) (j >>> 24);
    // b[off + 3] = (byte) (j >>> 32);
    // b[off + 2] = (byte) (j >>> 40);
    // b[off + 1] = (byte) (j >>> 48);
    // b[off + 0] = (byte) (j >>> 56);
    b.writeDoubleBE(val, off);
    return b;
  }
};

module.exports = Bits;
