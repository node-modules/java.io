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
    return ((b[off + 1] & 0xFF) << 0) + ((b[off + 0]) << 8);
  },

  getShort: function (b, off) {
    return ((b[off + 1] & 0xFF) << 0) + ((b[off + 0]) << 8);
  },

  getInt: function (b, off) {
    return ((b[off + 3] & 0xFF) << 0) +
       ((b[off + 2] & 0xFF) << 8) +
       ((b[off + 1] & 0xFF) << 16) +
       ((b[off + 0]) << 24);
  },

  // getFloat: function (byte[] b, int off) {
  // int i = ((b[off + 3] & 0xFF) << 0) +
  //   ((b[off + 2] & 0xFF) << 8) +
  //   ((b[off + 1] & 0xFF) << 16) +
  //   ((b[off + 0]) << 24);
  // return Float.intBitsToFloat(i);
  //   }
  //
  //   static long getLong(byte[] b, int off) {
  // return ((b[off + 7] & 0xFFL) << 0) +
  //        ((b[off + 6] & 0xFFL) << 8) +
  //        ((b[off + 5] & 0xFFL) << 16) +
  //        ((b[off + 4] & 0xFFL) << 24) +
  //        ((b[off + 3] & 0xFFL) << 32) +
  //        ((b[off + 2] & 0xFFL) << 40) +
  //        ((b[off + 1] & 0xFFL) << 48) +
  //        (((long) b[off + 0]) << 56);
  //   }
  //
  //   static double getDouble(byte[] b, int off) {
  // long j = ((b[off + 7] & 0xFFL) << 0) +
  //    ((b[off + 6] & 0xFFL) << 8) +
  //    ((b[off + 5] & 0xFFL) << 16) +
  //    ((b[off + 4] & 0xFFL) << 24) +
  //    ((b[off + 3] & 0xFFL) << 32) +
  //    ((b[off + 2] & 0xFFL) << 40) +
  //    ((b[off + 1] & 0xFFL) << 48) +
  //    (((long) b[off + 0]) << 56);
  // return Double.longBitsToDouble(j);
  //   }
  //
  //   /*
  //    * Methods for packing primitive values into byte arrays starting at given
  //    * offsets.
  //    */
  //
  putBoolean: function (b, off, val) {
    b[off] = val ? 1 : 0;
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
  //
  //   static void putFloat(byte[] b, int off, float val) {
  // int i = Float.floatToIntBits(val);
  // b[off + 3] = (byte) (i >>> 0);
  // b[off + 2] = (byte) (i >>> 8);
  // b[off + 1] = (byte) (i >>> 16);
  // b[off + 0] = (byte) (i >>> 24);
  //   }
  //
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
  //
  //   static void putDouble(byte[] b, int off, double val) {
  // long j = Double.doubleToLongBits(val);
  // b[off + 7] = (byte) (j >>> 0);
  // b[off + 6] = (byte) (j >>> 8);
  // b[off + 5] = (byte) (j >>> 16);
  // b[off + 4] = (byte) (j >>> 24);
  // b[off + 3] = (byte) (j >>> 32);
  // b[off + 2] = (byte) (j >>> 40);
  // b[off + 1] = (byte) (j >>> 48);
  // b[off + 0] = (byte) (j >>> 56);
  //   }
};

module.exports = Bits;
