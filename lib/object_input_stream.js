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
var types = require('./types');
var HandleTable = require('./_handle_table');
var InputStream = require('./input_stream');
var BlockDataInputStream = require('./block_data_input_stream');
var ObjectStreamClass = require('./object_stream_class');

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
      debug('readObject0() TC_NULL');
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
      debug('readObject0() TC_STRING, or TC_LONGSTRING');
      return this.checkResolve(this.readString(unshared));
    case cons.TC_ARRAY:
      debug('readObject0() TC_ARRAY');
      return this.checkResolve(this.readArray(unshared));
    // case cons.TC_ENUM:
    //   return this.checkResolve(this.readEnum(unshared));
    case cons.TC_OBJECT:
      debug('readObject0() TC_OBJECT');
      return this.checkResolve(this.readOrdinaryObject(unshared));
    // case cons.TC_EXCEPTION:
    //   var ex = this.readFatalException();
    //   throw new Error("WriteAbortedException: writing aborted " + ex);
    case cons.TC_BLOCKDATA:
    case cons.TC_BLOCKDATALONG:
      debug('readObject0() TC_BLOCKDATA');
      if (oldMode) {
        this.bin.setBlockDataMode(true);
        this.bin.peek();    // force header read
        throw new Error('OptionalDataException: ' + this.bin.currentBlockRemaining());
      } else {
        throw new Error("StreamCorruptedException: unexpected block data");
      }
      break;
    case cons.TC_ENDBLOCKDATA:
      debug('readObject0() TC_ENDBLOCKDATA');
      if (oldMode) {
        throw new Error('OptionalDataException');
      } else {
        throw new Error(
          "StreamCorruptedException: unexpected end of block data");
      }
      break;
    default:
      throw new Error('StreamCorruptedException: invalid type code: x' + tc.toString(16));
    }
  } finally {
    this.depth--;
    this.bin.setBlockDataMode(oldMode);
  }
};

/**
 * Reads and returns "ordinary" (i.e., not a String, Class,
 * ObjectStreamClass, array, or enum constant) object, or null if object's
 * class is unresolvable (in which case a ClassNotFoundException will be
 * associated with object's handle).  Sets passHandle to object's assigned
 * handle.
 */
proto.readOrdinaryObject = function (unshared) {
  if (this.bin.readByte() !== cons.TC_OBJECT) {
    throw new Error('InternalError');
  }

  var desc = this.readClassDesc(false);
  var JavaClass = types.Classes[desc.name];
  // desc.checkDeserialize();

  // Class<?> cl = desc.forClass();
  // if (cl == String.class || cl == Class.class
  //       || cl == ObjectStreamClass.class) {
  //     throw new InvalidClassException("invalid class descriptor");
  // }

  var obj = JavaClass ? new JavaClass() : {};
  // try {
  //   obj = desc.isInstantiable() ? desc.newInstance() : null;
  // } catch (Exception ex) {
  //   throw (IOException) new InvalidClassException(
  // desc.forClass().getName(),
  // "unable to create instance").initCause(ex);
  // }

  this.passHandle = this.handles.assign(unshared ? unsharedMarker : obj);
  // ClassNotFoundException resolveEx = desc.getResolveException();
  // if (resolveEx != null) {
    // handles.markException(passHandle, resolveEx);
  // }

  // if (desc.isExternalizable()) {
    // readExternalData((Externalizable) obj, desc);
  // } else {
  this._readSerialData(obj, desc);
  // }

  // handles.finish(passHandle);

  // if (obj &&
  //   handles.lookupException(passHandle) == null &&
  //   desc.hasReadResolveMethod())
  // {
  //   Object rep = desc.invokeReadResolve(obj);
  //   if (unshared && rep.getClass().isArray()) {
  // rep = cloneArray(rep);
  //   }
  //   if (rep != obj) {
  // handles.setObject(passHandle, obj = rep);
  //   }
  // }

  return JavaClass ? obj.value : obj;
};

/**
 * Reads in and returns (possibly null) class descriptor.  Sets passHandle
 * to class descriptor's assigned handle.  If class descriptor cannot be
 * resolved to a class in the local VM, a ClassNotFoundException is
 * associated with the class descriptor's handle.
 */
proto.readClassDesc = function (unshared) {
  var tc = this.bin.peekByte();
  switch (tc) {
    case cons.TC_NULL:
      return this.readNull();
    case cons.TC_REFERENCE:
      return this._readHandle(unshared);
    // case cons.TC_PROXYCLASSDESC:
    //   return this.readProxyDesc(unshared);
    case cons.TC_CLASSDESC:
      debug('readClassDesc() got TC_CLASSDESC => readNonProxyDesc()');
      return this.readNonProxyDesc(unshared);
    default:
      throw new Error('StreamCorruptedException: invalid type code: x' + tc.toString());
  }
};

/**
 * Reads in and returns class descriptor for a class that is not a dynamic
 * proxy class.  Sets passHandle to class descriptor's assigned handle.  If
 * class descriptor cannot be resolved to a class in the local VM, a
 * ClassNotFoundException is associated with the descriptor's handle.
 */
proto.readNonProxyDesc = function (unshared) {
  if (this.bin.readByte() !== cons.TC_CLASSDESC) {
    throw new Error('InternalError');
  }
  // var desc = new ObjectStreamClass();
  var readDesc = this._readClassDescriptor();
  debug('readNonProxyDesc() got readDesc: type %s, fields %j', readDesc.name, readDesc.fields);
  var descHandle = this.handles.assign(unshared ? unsharedMarker : readDesc);
  this.passHandle = NULL_HANDLE;

  var cl = null;
  var resolveEx = null;
  this.bin.setBlockDataMode(true);
  // checksRequired = isCustomSubclass();
  // try {
  // if ((cl = resolveClass(readDesc)) == null) {
  // resolveEx = new ClassNotFoundException("null class");
  //       } else if (checksRequired) {
  //           ReflectUtil.checkPackageAccess(cl);
  // }
  // } catch (ClassNotFoundException ex) {
  // resolveEx = ex;
  // }
  this._skipCustomData();

  // read superClass
  this.readClassDesc(false);
  // desc.initNonProxy(readDesc, cl, resolveEx, this.readClassDesc(false));

  // handles.finish(descHandle);
  this.passHandle = descHandle;
  return readDesc;
};

/**
 * Reads string without allowing it to be replaced in stream.  Called from
 * within ObjectStreamClass.read().
 */
proto.readTypeString = function () {
  var oldHandle = this.passHandle;
  try {
    var tc = this.bin.peekByte();
    switch (tc) {
    case cons.TC_NULL:
      return this.readNull();
    case cons.TC_REFERENCE:
      return this._readHandle(false);
    case cons.TC_STRING:
    case cons.TC_LONGSTRING:
      return this.readString(false);
    default:
      throw new Error('StreamCorruptedException: invalid type code: x' + tc.toString(16));
    }
  } finally {
    this.passHandle = oldHandle;
  }
};

/**
 * Read a class descriptor from the serialization stream.  This method is
 * called when the ObjectInputStream expects a class descriptor as the next
 * item in the serialization stream.  Subclasses of ObjectInputStream may
 * override this method to read in class descriptors that have been written
 * in non-standard formats (by subclasses of ObjectOutputStream which have
 * overridden the <code>writeClassDescriptor</code> method).  By default,
 * this method reads class descriptors according to the format defined in
 * the Object Serialization specification.
 *
 * @return  the class descriptor read
 * @throws  IOException If an I/O error has occurred.
 * @throws  ClassNotFoundException If the Class of a serialized object used
 *     in the class descriptor representation cannot be found
 * @see java.io.ObjectOutputStream#writeClassDescriptor(java.io.ObjectStreamClass)
 * @since 1.3
 */
proto._readClassDescriptor = function () {
  var desc = new ObjectStreamClass();
  desc.readNonProxy(this);
  return desc;
};

/**
 * Reads (or attempts to skip, if obj is null or is tagged with a
 * ClassNotFoundException) instance data for each serializable class of
 * object in stream, from superclass to subclass.  Expects that passHandle
 * is set to obj's handle before this method is called.
 */
proto._readSerialData = function (obj, desc) {
  if (obj.readObject) {
    debug('_readSerialData() got read write class: %s', desc.name);
    this.bin.setBlockDataMode(true);
    obj.readObject(desc, this);
  } else {
    this._defaultReadFields(obj, desc);
  }

  if (obj.writeObject) {
    this._skipCustomData();
  } else {
    this.bin.setBlockDataMode(false);
  }

  // ObjectStreamClass.ClassDataSlot[] slots = desc.getClassDataLayout();
  // for (int i = 0; i < slots.length; i++) {
  //   ObjectStreamClass slotDesc = slots[i].desc;
  //
  //   if (slots[i].hasData) {
  // if (obj != null &&
  //     slotDesc.hasReadObjectMethod() &&
  //     handles.lookupException(passHandle) == null)
  // {
  //     SerialCallbackContext oldContext = curContext;
  //
  //                 try {
  //         curContext = new SerialCallbackContext(obj, slotDesc);

          // bin.setBlockDataMode(true);

    // slotDesc.invokeReadObject(obj, this);
      // } catch (ClassNotFoundException ex) {
          /*
     * In most cases, the handle table has already
     * propagated a CNFException to passHandle at this
     * point; this mark call is included to address cases
     * where the custom readObject method has cons'ed and
     * thrown a new CNFException of its own.
     */
    // handles.markException(passHandle, ex);
      // } finally {
          // curContext.setUsed();
    // curContext = oldContext;
      // }

      /*
       * defaultDataEnd may have been set indirectly by custom
       * readObject() method when calling defaultReadObject() or
       * readFields(); clear it to restore normal read behavior.
       */
      // defaultDataEnd = false;
  // } else {
      // defaultReadFields(obj, slotDesc);
  // }
  // if (slotDesc.hasWriteObjectData()) {
      // skipCustomData();
  // } else {
      // bin.setBlockDataMode(false);
  // }
    // } else {
  // if (obj != null &&
      // slotDesc.hasReadObjectNoDataMethod() &&
      // handles.lookupException(passHandle) == null)
  // {
      // slotDesc.invokeReadObjectNoData(obj);
  // }
    // }
  // }
};

/**
 * Reads in values of serializable fields declared by given class
 * descriptor.  If obj is non-null, sets field values in obj.  Expects that
 * passHandle is set to obj's handle before this method is called.
 */
proto._defaultReadFields = function (obj, desc) {
// Class cl = desc.forClass();
// if (cl != null && obj != null && !cl.isInstance(obj)) {
  // throw new ClassCastException();
// }

  var primDataSize = desc.getPrimDataSize();
  if (!this.primVals || this.primVals.length < primDataSize) {
    this.primVals = new Buffer(primDataSize);
  }
  this.bin.readFully(this.primVals, 0, primDataSize, false);
  debug('_defaultReadFields() got primDataSize: %s', primDataSize);
  if (obj) {
    desc.setPrimFieldValues(obj, this.primVals);
  }

  var objHandle = this.passHandle;
  var fields = desc.getFields(false);
  for (var i = 0; i < fields.length; i++) {
    var f = fields[i];
    if (f.isPrimitive()) {
      continue;
    }
    obj[f.name] = this.readObject0(f.isUnshared());
    // if (f.getField()) {
      // this.handles.markDependency(objHandle, this.passHandle);
    // }
  }
  this.passHandle = objHandle;
};

/**
 * Read the non-static and non-transient fields of the current class from
 * this stream.  This may only be called from the readObject method of the
 * class being deserialized. It will throw the NotActiveException if it is
 * called otherwise.
 *
 * @throws  ClassNotFoundException if the class of a serialized object
 *     could not be found.
 * @throws  IOException if an I/O error occurs.
 * @throws  NotActiveException if the stream is not currently reading
 *     objects.
 */
proto.defaultReadObject = function (curObj, curDesc) {
  // Object curObj = ctx.getObj();
  // curDesc = ctx.getDesc();
  this.bin.setBlockDataMode(false);
  this._defaultReadFields(curObj, curDesc);
  this.bin.setBlockDataMode(true);
  // if (!curDesc.hasWriteObjectData()) {
    /*
     * Fix for 4360508: since stream does not contain terminating
     * TC_ENDBLOCKDATA tag, set flag so that reading code elsewhere
     * knows to simulate end-of-custom-data behavior.
     */
    // this.defaultDataEnd = true;
  // }
  // ClassNotFoundException ex = handles.lookupException(passHandle);
  // if (ex != null) {
  //   throw ex;
  // }
};

/**
 * Skips over all block data and objects until TC_ENDBLOCKDATA is
 * encountered.
 */
proto._skipCustomData = function () {
  var oldHandle = this.passHandle;
  for (;;) {
    if (this.bin.getBlockDataMode()) {
      this.bin.skipBlockData();
      this.bin.setBlockDataMode(false);
    }
    switch (this.bin.peekByte()) {
      case cons.TC_BLOCKDATA:
      case cons.TC_BLOCKDATALONG:
        this.bin.setBlockDataMode(true);
        break;

      case cons.TC_ENDBLOCKDATA:
        this.bin.readByte();
        this.passHandle = oldHandle;
        return;

      default:
        this.readObject0(false);
        break;
    }
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
 * Reads in object handle, sets passHandle to the read handle, and returns
 * object associated with the handle.
 */
proto._readHandle = function (unshared) {
  if (this.bin.readByte() !== cons.TC_REFERENCE) {
    throw new Error('InternalError');
  }
  this.passHandle = this.bin.readInt() - cons.baseWireHandle;
  if (this.passHandle < 0 || this.passHandle >= this.handles.size()) {
    throw new Error('StreamCorruptedException, invalid handle value: ' + this.passHandle);
  //   String.format("invalid handle value: %08X", passHandle +
  //   baseWireHandle));
  }
  if (unshared) {
    throw new Error('InvalidObjectException');
    // REMIND: what type of exception to throw here?
    // throw new InvalidObjectException(
  // "cannot read back reference as unshared");
  }

  var obj = this.handles.lookupObject(this.passHandle);
  if (obj === unsharedMarker) {
    throw new Error('InvalidObjectException');
  //   // REMIND: what type of exception to throw here?
  //   throw new InvalidObjectException(
  // "cannot read back reference to unshared object");
  }
  // console.log(this.passHandle, obj, this.handles.refs)
  return obj;
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

// DataInput methods

proto.readByte = function () {
  return this.bin.readByte();
};

proto.readBoolean = function () {
  return this.bin.readBoolean();
};

proto.readUnsignedByte = function () {
  return this.bin.readUnsignedByte();
};

proto.readChar = function () {
  return this.readChar();
};

proto.readShort = function () {
  return this.bin.readShort();
};

proto.readUnsignedShort = function () {
  return this.bin.readUnsignedShort();
};

proto.readUTF = function () {
  return this.bin.readUTF();
};

proto.readInt = function () {
  return this.bin.readInt();
};

proto.readLong = function () {
  return this.bin.readLong();
};

proto.readFloat = function () {
  return this.bin.readFloat();
};

proto.readDouble = function () {
  return this.bin.readDouble();
};

proto.readFully = function (b, off, len) {
  return this.bin.readFully(b, off, len);
};

proto.skipBytes = function (n) {
  return this.bin.skipBytes(n);
};

// InputStream methods

proto._readByte = function () {
  return this.bin.read();
};

proto._readBytes = function (b, off, len) {
  return this.bin.read(b, off, len);
};

proto.available = function () {
  return this.bin.available();
};

proto.close = function () {
  /*
  * Even if stream already closed, propagate redundant close to
  * underlying stream to stay consistent with previous implementations.
  */
  this.closed = true;
  if (this.depth === 0) {
    this.clear();
  }
  this.bin.close();
};

module.exports = ObjectInputStream;
