/**!
 * java.io - lib/block_data_output_stream.js
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

var debug = require('debug')('outputstream:block_data_output_stream');
var ByteBuffer = require('byte');
var util = require('util');
var Bits = require('./bits');
var DataOutputStream = require('./data_output_stream');
var OutputStream = require('./output_stream');
var cons = require('./object_stream_constants');

/** maximum data block length */
var MAX_BLOCK_SIZE = 1024;
/** maximum data block header length */
var MAX_HEADER_SIZE = 5;
/** (tunable) length of char buffer (for writing strings) */
var CHAR_BUF_SIZE = 256;

function BlockDataOutputStream(out) {
  OutputStream.call(this);

  /** buffer for writing general/block data */
  // this.buf = new ByteBuffer(this.MAX_BLOCK_SIZE);
  this.buf = new Buffer(MAX_BLOCK_SIZE);
  /** buffer for writing block data headers */
  // this.hbuf = new ByteBuffer(this.MAX_HEADER_SIZE);
  this.hbuf = new Buffer(MAX_HEADER_SIZE);
  /** char buffer for fast string writes */
  // private final char[] cbuf = new char[CHAR_BUF_SIZE];

  /** block data mode */
  this.blkmode = false;
  /** current offset into buf */
  this.pos = 0;

  this.out = out;
  this.dout = new DataOutputStream(this);
}

util.inherits(BlockDataOutputStream, OutputStream);

var proto = BlockDataOutputStream.prototype;

/**
 * Sets block data mode to the given mode (true == on, false == off)
 * and returns the previous mode value.  If the new mode is the same as
 * the old mode, no action is taken.  If the new mode differs from the
 * old mode, any buffered data is flushed before switching to the new
 * mode.
 */
proto.setBlockDataMode = function (mode) {
  debug('setBlockDataMode from %s to %s', this.blkmode, mode);
  if (this.blkmode === mode) {
    return this.blkmode;
  }
  this.drain();
  this.blkmode = mode;
  return !this.blkmode;
};

/**
 * Writes all buffered data from this stream to the underlying stream,
 * but does not flush underlying stream.
 */
proto.drain = function () {
  if (this.pos === 0) {
    return;
  }
  if (this.blkmode) {
    this.writeBlockHeader(this.pos);
  }
  debug('drain %d bytes to output', this.pos);
  this.out.write(this.buf, 0, this.pos);
  this.pos = 0;
};

/**
 * Writes block data header.  Data blocks shorter than 256 bytes are
 * prefixed with a 2-byte header; all others start with a 5-byte
 * header.
 */
proto.writeBlockHeader = function (len) {
  this.hbuf.position(0);
  if (len <= 0xFF) {
    // hbuf[0] = TC_BLOCKDATA;
    // hbuf[1] = (byte) len;
    // out.write(hbuf, 0, 2);
    this.hbuf[0] = cons.TC_BLOCKDATA;
    this.hbuf[0] = len;
    this.out.write(this.hbuf, 0, 2);
  } else {
    // hbuf[0] = cons.TC_BLOCKDATALONG;
    // Bits.putInt(hbuf, 1, len);
    // out.write(hbuf, 0, 5);
    this.hbuf[0] = cons.TC_BLOCKDATALONG;
    Bits.putInt(this.hbuf, 1, len);
    this.out.write(this.hbuf, 0, 5);
  }
};

/* ----------------- primitive data output methods ----------------- */
/*
 * The following methods are equivalent to their counterparts in
 * DataOutputStream, except that they partition written data into data
 * blocks when in block data mode.
 */

proto.writeBoolean = function (v) {
  if (this.pos >= MAX_BLOCK_SIZE) {
    this.drain();
  }
  Bits.putBoolean(this.buf, this.pos++, v);
};

proto.writeByte = function (v) {
  if (this.pos >= MAX_BLOCK_SIZE) {
    this.drain();
  }
  if (typeof v === 'string') {
    v = v.charCodeAt(0);
  }
  this.buf[this.pos++] = v;
};

proto.writeChar = function (v) {
  if (this.pos + 2 <= MAX_BLOCK_SIZE) {
    Bits.putChar(this.buf, this.pos, v);
    this.pos += 2;
  } else {
    this.dout.writeChar(v);
  }
};

proto.writeShort = function (v) {
  if (this.pos + 2 <= MAX_BLOCK_SIZE) {
    Bits.putShort(this.buf, this.pos, v);
    this.pos += 2;
  } else {
    this.dout.writeShort(v);
  }
};

proto.writeInt = function (v) {
  if (this.pos + 4 <= MAX_BLOCK_SIZE) {
    Bits.putInt(this.buf, this.pos, v);
    this.pos += 4;
  } else {
    this.dout.writeInt(v);
  }
};

proto.writeFloat = function (v) {
  if (this.pos + 4 <= MAX_BLOCK_SIZE) {
    Bits.putFloat(this.buf, this.pos, v);
    this.pos += 4;
  } else {
    this.dout.writeFloat(v);
  }
};

proto.writeLong = function (v) {
  if (this.pos + 8 <= MAX_BLOCK_SIZE) {
    Bits.putLong(this.buf, this.pos, v);
    this.pos += 8;
  } else {
    this.dout.writeLong(v);
  }
};

proto.writeDouble = function (v) {
  if (this.pos + 8 <= MAX_BLOCK_SIZE) {
    Bits.putDouble(this.buf, this.pos, v);
    this.pos += 8;
  } else {
    this.dout.writeDouble(v);
  }
};

proto.writeBytes = function (s) {
  if (typeof s === 'string') {
    s = new Buffer(s);
  }

  var end = s.length;
  var off = 0;
  while (off < end) {
    if (this.pos >= MAX_BLOCK_SIZE) {
      this.drain();
    }
    var size = Math.min(end - off, MAX_BLOCK_SIZE - this.pos);
    debug('writeBytes %d bytes', size);
    s.copy(this.buf, this.pos, off, off + size);
    this.pos += size;
    off += size;
  }

  return this;
};

// proto.writeChars = function (s) {
//   var endoff = s.length;
//   for (var off = 0; off < endoff; ) {
//     var csize = Math.min(endoff - off, CHAR_BUF_SIZE);
//     s.getChars(off, off + csize, cbuf, 0);
//     this.writeChars(cbuf, 0, csize);
//     off += csize;
//   }
// };

/* -------------- primitive data array output methods -------------- */
/*
 * The following methods write out spans of primitive data values.
 * Though equivalent to calling the corresponding primitive write
 * methods repeatedly, these methods are optimized for writing groups
 * of primitive data values more efficiently.
 */

  // void writeBooleans(boolean[] v, int off, int len) throws IOException {
  //     int endoff = off + len;
  //     while (off < endoff) {
  //   if (pos >= MAX_BLOCK_SIZE) {
  //       drain();
  //   }
  //   int stop = Math.min(endoff, off + (MAX_BLOCK_SIZE - pos));
  //   while (off < stop) {
  //       Bits.putBoolean(buf, pos++, v[off++]);
  //   }
  //     }
  // }
  //
  // void writeChars(char[] v, int off, int len) throws IOException {
  //     int limit = MAX_BLOCK_SIZE - 2;
  //     int endoff = off + len;
  //     while (off < endoff) {
  //   if (pos <= limit) {
  //       int avail = (MAX_BLOCK_SIZE - pos) >> 1;
  //       int stop = Math.min(endoff, off + avail);
  //       while (off < stop) {
  //     Bits.putChar(buf, pos, v[off++]);
  //     pos += 2;
  //       }
  //   } else {
  //       dout.writeChar(v[off++]);
  //   }
  //     }
  // }
  //
  // void writeShorts(short[] v, int off, int len) throws IOException {
  //     int limit = MAX_BLOCK_SIZE - 2;
  //     int endoff = off + len;
  //     while (off < endoff) {
  //   if (pos <= limit) {
  //       int avail = (MAX_BLOCK_SIZE - pos) >> 1;
  //       int stop = Math.min(endoff, off + avail);
  //       while (off < stop) {
  //     Bits.putShort(buf, pos, v[off++]);
  //     pos += 2;
  //       }
  //   } else {
  //       dout.writeShort(v[off++]);
  //   }
  //     }
  // }

  // void writeInts(int[] v, int off, int len) throws IOException {
  //     int limit = MAX_BLOCK_SIZE - 4;
  //     int endoff = off + len;
  //     while (off < endoff) {
  //   if (pos <= limit) {
  //       int avail = (MAX_BLOCK_SIZE - pos) >> 2;
  //       int stop = Math.min(endoff, off + avail);
  //       while (off < stop) {
  //     Bits.putInt(buf, pos, v[off++]);
  //     pos += 4;
  //       }
  //   } else {
  //       dout.writeInt(v[off++]);
  //   }
  //     }
  // }
  //
  // void writeFloats(float[] v, int off, int len) throws IOException {
  //     int limit = MAX_BLOCK_SIZE - 4;
  //     int endoff = off + len;
  //     while (off < endoff) {
  //   if (pos <= limit) {
  //       int avail = (MAX_BLOCK_SIZE - pos) >> 2;
  //       int chunklen = Math.min(endoff - off, avail);
  //       floatsToBytes(v, off, buf, pos, chunklen);
  //       off += chunklen;
  //       pos += chunklen << 2;
  //   } else {
  //       dout.writeFloat(v[off++]);
  //   }
  //     }
  // }
  //
  // void writeLongs(long[] v, int off, int len) throws IOException {
  //     int limit = MAX_BLOCK_SIZE - 8;
  //     int endoff = off + len;
  //     while (off < endoff) {
  //   if (pos <= limit) {
  //       int avail = (MAX_BLOCK_SIZE - pos) >> 3;
  //       int stop = Math.min(endoff, off + avail);
  //       while (off < stop) {
  //     Bits.putLong(buf, pos, v[off++]);
  //     pos += 8;
  //       }
  //   } else {
  //       dout.writeLong(v[off++]);
  //   }
  //     }
  // }
  //
  // void writeDoubles(double[] v, int off, int len) throws IOException {
  //     int limit = MAX_BLOCK_SIZE - 8;
  //     int endoff = off + len;
  //     while (off < endoff) {
  //   if (pos <= limit) {
  //       int avail = (MAX_BLOCK_SIZE - pos) >> 3;
  //       int chunklen = Math.min(endoff - off, avail);
  //       doublesToBytes(v, off, buf, pos, chunklen);
  //       off += chunklen;
  //       pos += chunklen << 3;
  //   } else {
  //       dout.writeDouble(v[off++]);
  //   }
  //     }
  // }
  //

/**
 * Returns the length in bytes of the UTF encoding of the given string.
 */
proto.getUTFLength = function (s) {
  return Buffer.byteLength(s);
};

/**
 * Writes the given string in UTF format.  This method is used in
 * situations where the UTF encoding length of the string is already
 * known; specifying it explicitly avoids a prescan of the string to
 * determine its UTF length.
 */
proto.writeUTF = function (s, utflen) {
  var strLength = s.length;
  utflen = utflen || this.getUTFLength(s);
  if (utflen > 0xFFFF) {
    throw new Error('UTFDataFormatException');
  }
  this.writeShort(utflen);
  this.writeBytes(s);
  // if (utflen === s.length) {
  //   this.writeBytes(s);
  // } else {
  //   this.writeUTFBody(s);
  // }
  return this;
};

/**
 * Writes given string in "long" UTF format, where the UTF encoding
 * length of the string is already known.
 */
proto.writeLongUTF = function (s, utflen) {
  utflen = utflen || Buffer.byteLength(utflen);
  this.writeLong(utflen);
  this.writeBytes(s);
};

/* ----------------- generic output stream methods ----------------- */
/*
 * The following methods are equivalent to their counterparts in
 * OutputStream, except that they partition written data into data
 * blocks when in block data mode.
 */

proto._writeByte = function (b) {
  if (this.pos >= MAX_BLOCK_SIZE) {
    this.drain();
  }
  // buf[pos++] = (byte) b;
  this.buf.put(b);
};

proto._writeBytes = function (buf) {
  // write(b, 0, b.length, false);
  this._write(buf, 0, buf.length, false);
};

proto.flush = function () {
  this.drain();
  this.out.flush();
};

proto.close = function () {
  this.flush();
  this.out.close();
};

/**
 * Writes specified span of byte values from given array.  If copy is
 * true, copies the values to an intermediate buffer before writing
 * them to underlying stream (to avoid exposing a reference to the
 * original byte array).
 */
// (byte[] b, int off, int len, boolean copy)
proto._write = function (b, off, len, copy) {
  if (!(copy || this.blkmode)) { // write directly
    this.drain();
    this.out.write(b, off, len);
    return;
  }

  while (len > 0) {
    if (this.pos >= MAX_BLOCK_SIZE) {
      this.drain();
    }
    if (len >= MAX_BLOCK_SIZE && !copy && this.pos === 0) {
      // avoid unnecessary copy
      this.writeBlockHeader(MAX_BLOCK_SIZE);
      this.out.write(b, off, MAX_BLOCK_SIZE);
      off += this.MAX_BLOCK_SIZE;
      len -= this.MAX_BLOCK_SIZE;
    } else {
      var wlen = Math.min(len, MAX_BLOCK_SIZE - this.pos);
      b.copy(this.buf, this.pos, off, wlen);
      // System.arraycopy(b, off, this.buf, pos, wlen);
      this.pos += wlen;
      off += wlen;
      len -= wlen;
    }
  }
};

module.exports = BlockDataOutputStream;
