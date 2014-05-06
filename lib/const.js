/**!
 * java.io - lib/const.js
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

var CONSTS = {
  STREAM_MAGIC: 0xACED,
  STREAM_VERSION: 0x0005,

  TC_NULL: 0x70,
  TC_CLASSDESC: 0x72,
  TC_OBJECT: 0x73,
  TC_STRING: 0x74,
  TC_ENUM: 0x7E,

  /**
   * Block of optional data. Byte following tag indicates number
   * of bytes in this block data.
   */
  TC_BLOCKDATA: 0x77,
  TC_BLOCKDATALONG: 0x7A,

  /**
   * Last tag value.
   */
  TC_MAX: 0x7E,
  TC_ENDBLOCKDATA: 0x78,

  // classDescFlags
  SC_WRITE_METHOD: 0x01, //if SC_SERIALIZABLE
  SC_BLOCK_DATA: 0x08,    //if SC_EXTERNALIZABLE
  SC_SERIALIZABLE: 0x02,
  SC_EXTERNALIZABLE: 0x04,
  SC_ENUM: 0x10,
};
