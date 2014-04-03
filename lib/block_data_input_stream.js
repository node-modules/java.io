/**!
 * java.io - lib/block_data_input_stream.js
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

var debug = require('debug')('java.io:block_data_input_stream');
var util = require('util');
var Bits = require('./bits');
var cons = require('./object_stream_constants');
var InputStream = require('./input_stream');
var PeekInputStream = require('./peek_input_stream');
var DataInputStream = require('./data_input_stream');

/** maximum data block length */
var MAX_BLOCK_SIZE = 1024;
/** maximum data block header length */
var MAX_HEADER_SIZE = 5;
/** (tunable) length of char buffer (for reading strings) */
var CHAR_BUF_SIZE = 256;
/** readBlockHeader() return value indicating header read may block */
var HEADER_BLOCKED = -2;

function BlockDataInputStream(is) {
  InputStream.call(this);

  /** underlying stream (wrapped in peekable filter stream) */
  this.in = new PeekInputStream(is);
  /** loopback stream (for data reads that span data blocks) */
  this.din = new DataInputStream(this);
  this.blkmode = false;
  this.pos = 0;
  /** end offset of valid data in buf, or -1 if no more block data */
  this.end = 0;
  /** number of bytes in current block yet to be read from stream */
  this.unread = 0;
  /** flag set when at end of field value block with no TC_ENDBLOCKDATA */
  this.defaultDataEnd = false;

  /** buffer for reading general/block data */
  this.buf = new Buffer(MAX_BLOCK_SIZE);
  /** buffer for reading block data headers */
  this.hbuf = new Buffer(MAX_HEADER_SIZE);
  /** char buffer for fast string reads */
  this.cbuf = new Buffer(CHAR_BUF_SIZE);
}

util.inherits(BlockDataInputStream, InputStream);

var proto = BlockDataInputStream.prototype;

proto.setBlockDataMode = function (newmode) {
  if (this.blkmode === newmode) {
    return this.blkmode;
  }
  if (newmode) {
    this.pos = 0;
    this.end = 0;
    this.unread = 0;
  } else if (this.pos < this.end) {
    throw new Error("IllegalStateException: unread block data");
  }
  this.blkmode = newmode;
  return !this.blkmode;
};

proto.skipBlockData = function () {
  if (!this.blkmode) {
    throw new Error("IllegalStateException: not in block data mode");
  }
  while (this.end >= 0) {
    this.refill();
  }
};

proto.readBlockHeader = function (canBlock) {
  if (this.defaultDataEnd) {
    return -1;
  }

  for (;;) {
    var avail = canBlock ? Number.MAX_VALUE : this.in.available();
    if (avail === 0) {
      return HEADER_BLOCKED;
    }

    var tc = this.in.peek();
    switch (tc) {
    case cons.TC_BLOCKDATA:
      if (avail < 2) {
        return HEADER_BLOCKED;
      }
      this.in.readFully(this.hbuf, 0, 2);
      return this.hbuf[1];
    case cons.TC_BLOCKDATALONG:
      if (avail < 5) {
        return HEADER_BLOCKED;
      }
      this.in.readFully(this.hbuf, 0, 5);
      var len = Bits.getInt(this.hbuf, 1);
      if (len < 0) {
        throw new Error(
          "StreamCorruptedException: illegal block data header length: " + len);
      }
      return len;
    /**
     * TC_RESETs may occur in between data blocks.
     * Unfortunately, this case must be parsed at a lower
     * level than other typecodes, since primitive data
     * reads may span data blocks separated by a TC_RESET.
     */
    case cons.TC_RESET:
      this.in.read();
      this.handleReset();
      break;
    default:
      if (tc >= 0 && (tc < cons.TC_BASE || tc > cons.TC_MAX)) {
        throw new Error("StreamCorruptedException: invalid type code: x%s" + tc.toString(16));
      }
      return -1;
    }
  }
};

/**
 * Refills internal buffer buf with block data.  Any data in buf at the
 * time of the call is considered consumed.  Sets the pos, end, and
 * unread fields to reflect the new amount of available block data; if
 * the next element in the stream is not a data block, sets pos and
 * unread to 0 and end to -1.
 */
proto.refill = function () {
  try {
    do {
      this.pos = 0;
      if (this.unread > 0) {
        var n = this.in.read(this.buf, 0, Math.min(this.unread, MAX_BLOCK_SIZE));
        if (n >= 0) {
          this.end = n;
          this.unread -= n;
        } else {
          throw new Error("StreamCorruptedException: unexpected EOF in middle of data block");
        }
      } else {
        var n = this.readBlockHeader(true);
        if (n >= 0) {
          this.end = 0;
          this.unread = n;
        } else {
          this.end = -1;
          this.unread = 0;
        }
      }
    } while (this.pos === this.end);
  } catch (ex) {
    this.pos = 0;
    this.end = -1;
    this.unread = 0;
    throw ex;
  }
};

/**
 * If in block data mode, returns the number of unconsumed bytes
 * remaining in the current data block.  If not in block data mode,
 * throws an IllegalStateException.
 */
proto.currentBlockRemaining = function () {
  if (this.blkmode) {
    return (this.end >= 0) ? (this.end - this.pos) + this.unread : 0;
  } else {
    throw new Error('IllegalStateException');
  }
};

/**
 * Peeks at (but does not consume) and returns the next byte value in
 * the stream, or -1 if the end of the stream/block data (if in block
 * data mode) has been reached.
 */
proto.peek = function () {
  debug('peek(), blkmode %s, pos %s, end %s', this.blkmode, this.pos, this.end);
  if (this.blkmode) {
    if (this.pos === this.end) {
      this.refill();
    }
    return (this.end >= 0) ? this.buf[this.pos] : -1;
  } else {
    return this.in.peek();
  }
};

/**
 * Peeks at (but does not consume) and returns the next byte value in
 * the stream, or throws EOFException if end of stream/block data has
 * been reached.
 */
proto.peekByte = function () {
  var val = this.peek();
  if (val < 0) {
    throw new Error('EOFException');
  }
  debug('peekByte byte %s', val);
  return val;
};

/**
 * If recursion depth is 0, clears internal data structures; otherwise,
 * throws a StreamCorruptedException.  This method is called when a
 * TC_RESET typecode is encountered.
 */
proto.handleReset = function () {
  if (this.depth > 0) {
    throw new Error("StreamCorruptedException: unexpected reset; recursion depth: " + this.depth);
  }
  this.clear();
};

/**
 * Clears internal data structures.
 */
proto.clear = function () {
  this.handles.clear();
  // vlist.clear();
};

// Getters

proto.getBlockDataMode = function () {
  return this.blkmode;
};

// Standard InputStream methods
/*
 * The following methods are equivalent to their counterparts in
 * InputStream, except that they interpret data block boundaries and
 * read the requested data from within data blocks when in block data
 * mode.
 */

proto._readByte = function () {
  debug('_readByte(), pos %s, end %s, blkmode %s', this.pos, this.end, this.blkmode);
  var v;
  if (this.blkmode) {
    if (this.pos === this.end) {
      this.refill();
    }
    v = (this.end >= 0) ? this.buf[this.pos++] : -1;
  } else {
    v = this.in.read();
  }
  debug('_readByte() got %s', v);
  return v;
};

proto._readBytes = function (b, off, len) {
  return this._readBytes2(b, off, len, false);
};

proto.skip = function (len) {
  var remain = len;
  while (remain > 0) {
    if (this.blkmode) {
      if (this.pos === this.end) {
        this.refill();
      }
      if (this.end < 0) {
        break;
      }
      var nread = Math.min(remain, this.end - this.pos);
      remain -= nread;
      this.pos += nread;
    } else {
      var nread = Math.min(remain, MAX_BLOCK_SIZE);
      if ((nread = this.in.read(this.buf, 0, nread)) < 0) {
        break;
      }
      remain -= nread;
    }
  }
  return len - remain;
};

proto.available = function () {
  if (this.blkmode) {
    if ((this.pos === this.end) && (this.unread === 0)) {
      var n;
      while ((n = this.readBlockHeader(false)) === 0) {}
      switch (n) {
        case HEADER_BLOCKED:
          break;
        case -1:
          this.pos = 0;
          this.end = -1;
          break;
        default:
          this.pos = 0;
          this.end = 0;
          this.unread = n;
          break;
      }
    }
    // avoid unnecessary call to in.available() if possible
    var unreadAvail = (this.unread > 0) ? Math.min(this.in.available(), this.unread) : 0;
    return (this.end >= 0) ? (this.end - this.pos) + unreadAvail : 0;
  } else {
    return this.in.available();
  }
};

proto.close = function () {
  if (this.blkmode) {
    this.pos = 0;
    this.end = -1;
    this.unread = 0;
  }
  this.in.close();
};

/**
 * Attempts to read len bytes into byte array b at offset off.  Returns
 * the number of bytes read, or -1 if the end of stream/block data has
 * been reached.  If copy is true, reads values into an intermediate
 * buffer before copying them to b (to avoid exposing a reference to
 * b).
 */
proto._readBytes2 = function (b, off, len, copy) {
  if (len === 0) {
    return 0;
  }
  if (this.blkmode) {
    if (this.pos === this.end) {
      this.refill();
    }
    if (this.end < 0) {
      return -1;
    }
    var nread = Math.min(len, this.end - this.pos);
    var startPos = this.pos;
    this.pos += nread;
    // System.arraycopy(buf, pos, b, off, nread);
    this.buf.copy(b, off, startPos, this.pos);
    return nread;
  } else if (copy) {
    var nread = this.in.read(this.buf, 0, Math.min(len, MAX_BLOCK_SIZE));
    if (nread > 0) {
      // System.arraycopy(buf, 0, b, off, nread);
      this.buf.copy(b, 0, off, off + nread);
    }
    return nread;
  } else {
    return this.in.read(b, off, len);
  }
};

/* ----------------- primitive data input methods ------------------ */
/**
 * The following methods are equivalent to their counterparts in
 * DataInputStream, except that they interpret data block boundaries
 * and read the requested data from within data blocks when in block
 * data mode.
 */

proto.readFully = function (b, off, len, copy) {
  off = off || 0;
  len = len || 0;
  while (len > 0) {
    var n = this.read(b, off, len, copy);
    if (n < 0) {
      throw new Error('EOFException');
    }
    off += n;
    len -= n;
  }
};

proto.skipBytes = function (n) {
  return this.din.skipBytes(n);
};

proto.readByte = function () {
  var v = this.read();
  if (v < 0) {
    throw new Error('EOFException');
  }
  return v;
};

proto.readUnsignedByte = proto.readByte;

proto.readBoolean = function () {
  return this.readByte() !== 0;
};

proto._readValue = function (typename, size) {
  if (!this.blkmode) {
    this.pos = 0;
    this.in.readFully(this.buf, 0, size);
  } else if (this.end - this.pos < size) {
    return this.din['read' + typename]();
  }

  var v = Bits['get' + typename](this.buf, this.pos);
  this.pos += size;
  return v;
};

proto.readChar = function () {
  return this._readValue('Char', 2);
};

proto.readShort = function () {
  return this._readValue('Short', 2);
};

proto.readUnsignedShort = proto.readShort;

proto.readInt = function () {
  return this._readValue('Int', 4);
};

proto.readFloat = function () {
  return this._readValue('Float', 4);
};

proto.readLong = function () {
  return this._readValue('Long', 8);
};

proto.readDouble = function () {
  return this._readValue('Double', 8);
};

proto.readUTF = function () {
  var utflen = this.readUnsignedShort();
  debug('readUTF() %d length', utflen);
  return this._readUTFBody(utflen);
};

/* -------------- primitive data array input methods --------------- */
/*
 * The following methods read in spans of primitive data values.
 * Though equivalent to calling the corresponding primitive read
 * methods repeatedly, these methods are optimized for reading groups
 * of primitive data values more efficiently.
 */

// void readBooleans(boolean[] v, int off, int len) throws IOException {
//     int stop, endoff = off + len;
//     while (off < endoff) {
//   if (!blkmode) {
//       int span = Math.min(endoff - off, MAX_BLOCK_SIZE);
//       in.readFully(buf, 0, span);
//       stop = off + span;
//       pos = 0;
//   } else if (end - pos < 1) {
//       v[off++] = din.readBoolean();
//       continue;
//   } else {
//       stop = Math.min(endoff, off + end - pos);
//   }
//
//   while (off < stop) {
//       v[off++] = Bits.getBoolean(buf, pos++);
//   }
//     }
// }
//
// void readChars(char[] v, int off, int len) throws IOException {
//     int stop, endoff = off + len;
//     while (off < endoff) {
//   if (!blkmode) {
//       int span = Math.min(endoff - off, MAX_BLOCK_SIZE >> 1);
//       in.readFully(buf, 0, span << 1);
//       stop = off + span;
//       pos = 0;
//   } else if (end - pos < 2) {
//       v[off++] = din.readChar();
//       continue;
//   } else {
//       stop = Math.min(endoff, off + ((end - pos) >> 1));
//   }
//
//   while (off < stop) {
//       v[off++] = Bits.getChar(buf, pos);
//       pos += 2;
//   }
//     }
// }
//
// void readShorts(short[] v, int off, int len) throws IOException {
//     int stop, endoff = off + len;
//     while (off < endoff) {
//   if (!blkmode) {
//       int span = Math.min(endoff - off, MAX_BLOCK_SIZE >> 1);
//       in.readFully(buf, 0, span << 1);
//       stop = off + span;
//       pos = 0;
//   } else if (end - pos < 2) {
//       v[off++] = din.readShort();
//       continue;
//   } else {
//       stop = Math.min(endoff, off + ((end - pos) >> 1));
//   }
//
//   while (off < stop) {
//       v[off++] = Bits.getShort(buf, pos);
//       pos += 2;
//   }
//     }
// }
//
// void readInts(int[] v, int off, int len) throws IOException {
//     int stop, endoff = off + len;
//     while (off < endoff) {
//   if (!blkmode) {
//       int span = Math.min(endoff - off, MAX_BLOCK_SIZE >> 2);
//       in.readFully(buf, 0, span << 2);
//       stop = off + span;
//       pos = 0;
//   } else if (end - pos < 4) {
//       v[off++] = din.readInt();
//       continue;
//   } else {
//       stop = Math.min(endoff, off + ((end - pos) >> 2));
//   }
//
//   while (off < stop) {
//       v[off++] = Bits.getInt(buf, pos);
//       pos += 4;
//   }
//     }
// }
//
// void readFloats(float[] v, int off, int len) throws IOException {
//     int span, endoff = off + len;
//     while (off < endoff) {
//   if (!blkmode) {
//       span = Math.min(endoff - off, MAX_BLOCK_SIZE >> 2);
//       in.readFully(buf, 0, span << 2);
//       pos = 0;
//   } else if (end - pos < 4) {
//       v[off++] = din.readFloat();
//       continue;
//   } else {
//       span = Math.min(endoff - off, ((end - pos) >> 2));
//   }
//
//   bytesToFloats(buf, pos, v, off, span);
//   off += span;
//   pos += span << 2;
//     }
// }
//
// void readLongs(long[] v, int off, int len) throws IOException {
//     int stop, endoff = off + len;
//     while (off < endoff) {
//   if (!blkmode) {
//       int span = Math.min(endoff - off, MAX_BLOCK_SIZE >> 3);
//       in.readFully(buf, 0, span << 3);
//       stop = off + span;
//       pos = 0;
//   } else if (end - pos < 8) {
//       v[off++] = din.readLong();
//       continue;
//   } else {
//       stop = Math.min(endoff, off + ((end - pos) >> 3));
//   }
//
//   while (off < stop) {
//       v[off++] = Bits.getLong(buf, pos);
//       pos += 8;
//   }
//     }
// }
//
// void readDoubles(double[] v, int off, int len) throws IOException {
//     int span, endoff = off + len;
//     while (off < endoff) {
//   if (!blkmode) {
//       span = Math.min(endoff - off, MAX_BLOCK_SIZE >> 3);
//       in.readFully(buf, 0, span << 3);
//       pos = 0;
//   } else if (end - pos < 8) {
//       v[off++] = din.readDouble();
//       continue;
//   } else {
//       span = Math.min(endoff - off, ((end - pos) >> 3));
//   }
//
//   bytesToDoubles(buf, pos, v, off, span);
//   off += span;
//   pos += span << 3;
//     }
// }

/**
 * Reads in string written in "long" UTF format.  "Long" UTF format is
 * identical to standard UTF, except that it uses an 8 byte header
 * (instead of the standard 2 bytes) to convey the UTF encoding length.
 */
proto.readLongUTF = function () {
  return this._readUTFBody(this.readLong());
};

/**
 * Reads in the "body" (i.e., the UTF representation minus the 2-byte
 * or 8-byte length header) of a UTF encoding, which occupies the next
 * utflen bytes.
 */
proto._readUTFBody = function (utflen) {
  var buf = new Buffer(utflen);
  this.in.readFully(buf, 0, utflen);
  return buf.toString();
  // if (!this.blkmode) {
  //   this.end = this.pos = 0;
  // }
  // while (utflen > 0) {
  //   var avail = this.end - this.pos;
  //   if (avail >= 3 || avail === utflen) {
  //     utflen -= this.readUTFSpan(sbuf, utflen);
  //   } else {
  //     if (this.blkmode) {
  //       // near block boundary, read one byte at a time
  //       utflen -= readUTFChar(sbuf, utflen);
  //     } else {
  //       // shift and refill buffer manually
  //       if (avail > 0) {
  //         System.arraycopy(buf, pos, buf, 0, avail);
  //       }
  //       pos = 0;
  //       end = (int) Math.min(MAX_BLOCK_SIZE, utflen);
  //       in.readFully(buf, avail, end - avail);
  //     }
  //   }
  // }
  //
  // return sbuf.toString();
};

/**
 * Reads span of UTF-encoded characters out of internal buffer
 * (starting at offset pos and ending at or before offset end),
 * consuming no more than utflen bytes.  Appends read characters to
 * sbuf.  Returns the number of bytes consumed.
 */
// private long readUTFSpan(StringBuilder sbuf, long utflen)
//     throws IOException
// {
//     int cpos = 0;
//     int start = pos;
//     int avail = Math.min(end - pos, CHAR_BUF_SIZE);
//     // stop short of last char unless all of utf bytes in buffer
//     int stop = pos + ((utflen > avail) ? avail - 2 : (int) utflen);
//     boolean outOfBounds = false;
//
//     try {
//   while (pos < stop) {
//       int b1, b2, b3;
//       b1 = buf[pos++] & 0xFF;
//       switch (b1 >> 4) {
//     case 0:
//     case 1:
//     case 2:
//     case 3:
//     case 4:
//     case 5:
//     case 6:
//     case 7:    // 1 byte format: 0xxxxxxx
//         cbuf[cpos++] = (char) b1;
//         break;
//
//     case 12:
//     case 13:  // 2 byte format: 110xxxxx 10xxxxxx
//         b2 = buf[pos++];
//         if ((b2 & 0xC0) != 0x80) {
//       throw new UTFDataFormatException();
//         }
//         cbuf[cpos++] = (char) (((b1 & 0x1F) << 6) |
//              ((b2 & 0x3F) << 0));
//         break;
//
//     case 14:  // 3 byte format: 1110xxxx 10xxxxxx 10xxxxxx
//         b3 = buf[pos + 1];
//         b2 = buf[pos + 0];
//         pos += 2;
//         if ((b2 & 0xC0) != 0x80 || (b3 & 0xC0) != 0x80) {
//       throw new UTFDataFormatException();
//         }
//         cbuf[cpos++] = (char) (((b1 & 0x0F) << 12) |
//              ((b2 & 0x3F) << 6) |
//              ((b3 & 0x3F) << 0));
//         break;
//
//     default:  // 10xx xxxx, 1111 xxxx
//         throw new UTFDataFormatException();
//       }
//   }
//     } catch (ArrayIndexOutOfBoundsException ex) {
//   outOfBounds = true;
//     } finally {
//   if (outOfBounds || (pos - start) > utflen) {
//       /*
//        * Fix for 4450867: if a malformed utf char causes the
//        * conversion loop to scan past the expected end of the utf
//        * string, only consume the expected number of utf bytes.
//        */
//       pos = start + (int) utflen;
//       throw new UTFDataFormatException();
//   }
//     }
//
//     sbuf.append(cbuf, 0, cpos);
//     return pos - start;
// }
//
// /**
//  * Reads in single UTF-encoded character one byte at a time, appends
//  * the character to sbuf, and returns the number of bytes consumed.
//  * This method is used when reading in UTF strings written in block
//  * data mode to handle UTF-encoded characters which (potentially)
//  * straddle block-data boundaries.
//  */
// private int readUTFChar(StringBuilder sbuf, long utflen)
//     throws IOException
// {
//     int b1, b2, b3;
//     b1 = readByte() & 0xFF;
//     switch (b1 >> 4) {
//   case 0:
//   case 1:
//   case 2:
//   case 3:
//   case 4:
//   case 5:
//   case 6:
//   case 7:     // 1 byte format: 0xxxxxxx
//       sbuf.append((char) b1);
//       return 1;
//
//   case 12:
//   case 13:    // 2 byte format: 110xxxxx 10xxxxxx
//       if (utflen < 2) {
//     throw new UTFDataFormatException();
//       }
//       b2 = readByte();
//       if ((b2 & 0xC0) != 0x80) {
//     throw new UTFDataFormatException();
//       }
//       sbuf.append((char) (((b1 & 0x1F) << 6) |
//         ((b2 & 0x3F) << 0)));
//       return 2;
//
//   case 14:    // 3 byte format: 1110xxxx 10xxxxxx 10xxxxxx
//       if (utflen < 3) {
//     if (utflen == 2) {
//         readByte();    // consume remaining byte
//     }
//     throw new UTFDataFormatException();
//       }
//       b2 = readByte();
//       b3 = readByte();
//       if ((b2 & 0xC0) != 0x80 || (b3 & 0xC0) != 0x80) {
//     throw new UTFDataFormatException();
//       }
//       sbuf.append((char) (((b1 & 0x0F) << 12) |
//         ((b2 & 0x3F) << 6) |
//         ((b3 & 0x3F) << 0)));
//       return 3;
//
//   default:   // 10xx xxxx, 1111 xxxx
//       throw new UTFDataFormatException();
//     }
// }
//   }

module.exports = BlockDataInputStream;
