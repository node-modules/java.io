/**!
 * object_output_stream - lib/byte_array_output_stream.js
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

var debug = require('debug')('outputstream:byte_array_output_stream');
var util = require('util');
var OutputStream = require('./output_stream');

function ByteArrayOutputStream(size) {
  OutputStream.call(this);

  /**
   * Creates a new byte array output stream. The buffer capacity is
   * initially 32 bytes, though its size increases if necessary.
   */
  size = size || 32;

  /**
   * The buffer where data is stored.
   */
  this.buf = new Buffer(size);
  /**
   * The number of valid bytes in the buffer.
   */
  this.count = 0;
}

util.inherits(ByteArrayOutputStream, OutputStream);

var proto = ByteArrayOutputStream.prototype;

/**
 * Writes the specified byte to this byte array output stream.
 *
 * @param   b   the byte to be written.
 */
proto._writeByte = function (b) {
  var newcount = this.count + 1;
  if (newcount > this.buf.length) {
    var newbuf = new Buffer(this.buf.length * 2);
    this.buf.copy(newbuf);
    this.buf = newbuf;
    // buf = Arrays.copyOf(buf, Math.max(buf.length << 1, newcount));
  }
  this.buf[this.count] = b;
  this.count = newcount;
  return this;
};

/**
 * Writes <code>len</code> bytes from the specified byte array
 * starting at offset <code>off</code> to this byte array output stream.
 *
 * @param   b     the data.
 * @param   off   the start offset in the data.
 * @param   len   the number of bytes to write.
 */
// (byte b[], int off, int len)
proto.write = function (b, off, len) {
  if (arguments.length === 1) {
    // write(b)
    return this._writeByte(b);
  }
  if ((off < 0) || (off > b.length) || (len < 0)
    || ((off + len) > b.length) || ((off + len) < 0)) {
    throw new Error('IndexOutOfBoundsException');
  } else if (len === 0) {
    return;
  }
  var newcount = this.count + len;
  debug('write %d bytes', len);
  if (newcount > this.buf.length) {
    var newbuf = new Buffer(Math.max(this.buf.length * 2, newcount));
    this.buf.copy(newbuf);
    this.buf = newbuf;
    debug('write bigger to %d', this.buf.length);
    // buf = Arrays.copyOf(buf, Math.max(buf.length << 1, newcount));
  }
  b.copy(this.buf, this.count, off, off + len);
  // System.arraycopy(b, off, buf, count, len);
  this.count = newcount;
  debug('new position %d', this.count);
  return this;
};

/**
 * Writes the complete contents of this byte array output stream to
 * the specified output stream argument, as if by calling the output
 * stream's write method using <code>out.write(buf, 0, count)</code>.
 *
 * @param      out   the output stream to which to write the data.
 * @exception  IOException  if an I/O error occurs.
 */
proto.writeTo = function (out) {
  out.write(this.buf, 0, this.count);
};

/**
 * Resets the <code>count</code> field of this byte array output
 * stream to zero, so that all currently accumulated output in the
 * output stream is discarded. The output stream can be used again,
 * reusing the already allocated buffer space.
 *
 * @see     java.io.ByteArrayInputStream#count
 */
proto.reset = function () {
  this.count = 0;
};

/**
 * Creates a newly allocated byte array. Its size is the current
 * size of this output stream and the valid contents of the buffer
 * have been copied into it.
 *
 * @return  the current contents of this output stream, as a byte array.
 * @see     java.io.ByteArrayOutputStream#size()
 */
proto.toByteArray = function () {
  return this.buf.slice(0, this.count);
  // return Arrays.copyOf(buf, count);
};

/**
 * Returns the current size of the buffer.
 *
 * @return  the value of the <code>count</code> field, which is the number
 *          of valid bytes in this output stream.
 * @see     java.io.ByteArrayOutputStream#count
 */
proto.size = function () {
  return this.count;
};

module.exports = ByteArrayOutputStream;
