/**!
 * java.io - lib/object_input_stream.js
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

var debug = require('debug')('java.io:object_input_stream');
var util = require('util');
var cons = require('./object_stream_constants');
var HandleTable = require('./_handle_table');
var InputStream = require('./input_stream');
var BlockDataInputStream = require('./block_data_input_stream');

/** handle value representing null */
var NULL_HANDLE = -1;
var unsharedMarker = {};

function ObjectInputStream(is) {
  InputStream.call(this);
  this.bin = new BlockDataInputStream(is);
  /** buffer for writing primitive field values */
  this.primVals = null;
  /** wire handle -> obj/exception map */
  this.handles = new HandleTable();
  /** scratch field for passing handle values up/down call stack */
  this.passHandle = NULL_HANDLE;
  /** flag set when at end of field value block with no TC_ENDBLOCKDATA */
  this.defaultDataEnd = false;
  /** buffer for reading primitive field values */
  this.primVals = null;

  /** validation callback list */
  // this.vlist
  this.enableOverride = false;
  /** if true, invoke resolveObject() */
  this.enableResolve = false;
  this.depth = 0;
  this.readStreamHeader();
  this.bin.setBlockDataMode(true);
}

util.inherits(ObjectInputStream, InputStream);

var proto = ObjectInputStream.prototype;

proto.readStreamHeader = function () {
  var s0 = this.bin.readShort();
  var s1 = this.bin.readShort();
  if (s0 !== cons.STREAM_MAGIC || s1 !== cons.STREAM_VERSION) {
    var err = new Error(util.format("invalid stream header: x%s x%s",
      s0.toString(16), s1.toString(16)));
    err.name = 'StreamCorruptedException';
    throw err;
  }
};

proto.readObject = function () {
  if (this.enableOverride) {
    return this.readObjectOverride();
  }

  // if nested read, passHandle contains handle of enclosing object
  var outerHandle = this.passHandle;

  try {
    var obj = this.readObject0(false);
    // this.handles.markDependency(outerHandle, passHandle);
    // var ex = handles.lookupException(passHandle);
    // if (ex !== null) {
      // throw ex;
    // }
    // if (this.depth === 0) {
      // vlist.doCallbacks();
    // }
    return obj;
  } finally {
    this.passHandle = outerHandle;
    if (this.closed && this.depth === 0) {
      this.clear();
    }
  }
};

/**
 * Underlying readObject implementation.
 */
proto.readObject0 = function (unshared) {
  var oldMode = this.bin.getBlockDataMode();
  if (oldMode) {
    var remain = this.bin.currentBlockRemaining();
    if (remain > 0) {
      throw new Error('OptionalDataException ' + remain);
    } else if (this.defaultDataEnd) {
      /*
       * Fix for 4360508: stream is currently at the end of a field
       * value block written via default serialization; since there
       * is no terminating TC_ENDBLOCKDATA tag, simulate
       * end-of-custom-data behavior explicitly.
       */
      throw new Error('OptionalDataException ' + true);
    }
    this.bin.setBlockDataMode(false);
  }

  var tc;
  while ((tc = this.bin.peekByte()) === cons.TC_RESET) {
    this.bin.readByte();
    this.handleReset();
  }

  this.depth++;
  try {
    switch (tc) {
    case cons.TC_NULL:
      return this.readNull();
    // case cons.TC_REFERENCE:
    //   return this.readHandle(unshared);
    // case cons.TC_CLASS:
    //   return this.readClass(unshared);
    // case cons.TC_CLASSDESC:
    // case cons.TC_PROXYCLASSDESC:
    //   return this.readClassDesc(unshared);
    case cons.TC_STRING:
    case cons.TC_LONGSTRING:
      return this.checkResolve(this.readString(unshared));
    case cons.TC_ARRAY:
      return this.checkResolve(this.readArray(unshared));
    // case cons.TC_ENUM:
    //   return this.checkResolve(this.readEnum(unshared));
    case cons.TC_OBJECT:
      return this.checkResolve(this.readOrdinaryObject(unshared));
    // case cons.TC_EXCEPTION:
    //   var ex = this.readFatalException();
    //   throw new Error("WriteAbortedException: writing aborted " + ex);
    case cons.TC_BLOCKDATA:
    case cons.TC_BLOCKDATALONG:
      if (oldMode) {
        this.bin.setBlockDataMode(true);
        this.bin.peek();    // force header read
        throw new Error('OptionalDataException: ' + this.bin.currentBlockRemaining());
      } else {
        throw new Error("StreamCorruptedException: unexpected block data");
      }
      break;
    case cons.TC_ENDBLOCKDATA:
      if (oldMode) {
        throw new Error('OptionalDataException');
      } else {
        throw new Error(
          "StreamCorruptedException: unexpected end of block data");
      }
      break;
    default:
      throw new Error('StreamCorruptedException: invalid type code: x%s' + tc.toString(16));
    }
  } finally {
    this.depth--;
    this.bin.setBlockDataMode(oldMode);
  }
};

/**
 * Reads in null code, sets passHandle to NULL_HANDLE and returns null.
 */
proto.readNull = function () {
  if (this.bin.readByte() !== cons.TC_NULL) {
    throw new Error('InternalError');
  }
  this.passHandle = NULL_HANDLE;
  return null;
};

/**
 * If recursion depth is 0, clears internal data structures; otherwise,
 * throws a StreamCorruptedException.  This method is called when a
 * TC_RESET typecode is encountered.
 */
proto.handleReset = function () {
  if (this.depth > 0) {
    throw new Error(
      "StreamCorruptedException: unexpected reset; recursion depth: " + this.depth);
  }
  this.clear();
};

/**
 * Reads in and returns new string.  Sets passHandle to new string's
 * assigned handle.
 */
proto.readString = function (unshared) {
  var str;
  var tc = this.bin.readByte();
  switch (tc) {
    case cons.TC_STRING:
      debug('readString() TC_STRING: %s', tc);
      str = this.bin.readUTF();
      break;
    case cons.TC_LONGSTRING:
      debug('readString() TC_LONGSTRING: %s', tc);
      str = this.bin.readLongUTF();
      break;

    default:
      throw new Error("StreamCorruptedException: invalid type code: x" + tc.toString(16));
  }
  this.passHandle = this.handles.assign(unshared ? unsharedMarker : str);
  // this.handles.finish(this.passHandle);
  debug('readString() got %j', str);
  return str;
};

/**
 * If resolveObject has been enabled and given object does not have an
 * exception associated with it, calls resolveObject to determine
 * replacement for object, and updates handle table accordingly.  Returns
 * replacement object, or echoes provided object if no replacement
 * occurred.  Expects that passHandle is set to given object's handle prior
 * to calling this method.
 */
proto.checkResolve = function (obj) {
  return obj;

  // if (!this.enableResolve || this.handles.lookupException(this.passHandle) !== null) {
  //   return obj;
  // }
  // var rep = this.resolveObject(obj);
  // if (rep !== obj) {
  //   this.handles.setObject(this.passHandle, rep);
  // }
  // return rep;
};

/**
 * Clears internal data structures.
 */
proto.clear = function () {
  this.handles.clear();
  // vlist.clear();
};

module.exports = ObjectInputStream;
