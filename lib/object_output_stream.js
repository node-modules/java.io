/**!
 * java.io - lib/object_output_stream.js
 *
 * Copyright(c) 2014 fengmk2 and other contributors.
 * MIT Licensed
 *
 * Authors:
 *   fengmk2 <fengmk2@gmail.com> (http://fengmk2.github.com)
 */

"use strict";

/**
 * Module dependencies.
 */

var ByteBuffer = require('byte');
var HandleTable = require('./_handle_table');
var BlockDataOutputStream = require('./block_data_output_stream');
var ObjectStreamClass = require('./object_stream_class');
var cons = require('./object_stream_constants');
var types = require('./types');

function ObjectOutputStream(out) {
  this.bout = new BlockDataOutputStream(out);
  this.enableOverride = false;
  this.protocol = cons.PROTOCOL_VERSION_2;
  /** buffer for writing primitive field values */
  this.primVals = null;
  /** obj -> wire handle map */
  this.handles = new HandleTable();

  this.writeStreamHeader();
  this.bout.setBlockDataMode(true);
}

var proto = ObjectOutputStream.prototype;

proto.writeStreamHeader = function () {
  this.bout.writeShort(cons.STREAM_MAGIC);
  this.bout.writeShort(cons.STREAM_VERSION);
};

proto.writeObject = function (obj) {
  if (this.enableOverride) {
    this.writeObjectOverride(obj);
    return this;
  }
  this.writeObject0(obj, false);
  return this;
};

/**
 * Underlying writeObject/writeUnshared implementation.
 */
proto.writeObject0 = function (obj, unshared) {
  var oldMode = this.bout.setBlockDataMode(false);
  this.depth++;
  // handle previously written and non-replaceable objects
  // var h;

  if (obj instanceof types.JavaString) {
    obj = obj.value;
  }

  var desc;
  // remaining cases
  // if (obj instanceof String) {
  if (obj === null || obj === undefined) {
    this.writeNull();
  } else if (typeof obj === 'string') {
    this.writeString(obj, unshared);
  // } else if (cl.isArray()) {
  } else if (Array.isArray(obj) || obj instanceof types.JavaObjectArray) {
    desc = ObjectStreamClass.lookup(obj, true);
    var array = obj;
    if (obj instanceof types.JavaObjectArray) {
      array = obj.value;
    }
    this.writeArray(array, desc, unshared);
  // } else if (obj instanceof Enum) {
  //   writeEnum((Enum) obj, desc, unshared);
  // } else if (obj instanceof Serializable) {
  } else if (obj.constructor.serialVersionUID) {
    desc = ObjectStreamClass.lookup(obj, true);
    this.writeOrdinaryObject(obj, desc, unshared);
  } else {
    throw new Error('NotSerializableException');
    // if (extendedDebugInfo) {
    //   throw new NotSerializableException(
    //   cl.getName() + "\n" + debugInfoStack.toString());
    // } else {
    //   throw new NotSerializableException(cl.getName());
    // }
  }
  this.depth--;
  this.bout.setBlockDataMode(oldMode);
  return this;
};

/**
 * Writes representation of a "ordinary" (i.e., not a String, Class,
 * ObjectStreamClass, array, or enum constant) serializable object to the
 * stream.
 */
proto.writeOrdinaryObject = function (obj, desc, unshared) {
  this.bout.writeByte(cons.TC_OBJECT);
  this.writeClassDesc(desc, false);
  this.handles.assign(unshared ? null : obj);
  // if (desc.isExternalizable() && !desc.isProxy()) {
  //   writeExternalData((Externalizable) obj);
  // } else {
  //   writeSerialData(obj, desc);
  // }
  this._writeSerialData(obj, desc);
};

/**
 * Writes representation of given class descriptor to stream.
 */
proto.writeClassDesc = function (desc, unshared) {
  // var handle;
  if (!desc) {
    this.writeNull();
    return;
  // } else if (!unshared && (handle = handles.lookup(desc)) != -1) {
  //   this.writeHandle(handle);
  // } else if (desc.isProxy()) {
  //   this.writeProxyDesc(desc, unshared);
  // } else {
  //   this.writeNonProxyDesc(desc, unshared);
  }
  this.writeNonProxyDesc(desc, unshared);
};

/**
 * Writes class descriptor representing a standard (i.e., not a dynamic
 * proxy) class to stream.
 */
proto.writeNonProxyDesc = function (desc, unshared) {
  this.bout.writeByte(cons.TC_CLASSDESC);
  this.handles.assign(unshared ? null : desc);
  if (this.protocol === cons.PROTOCOL_VERSION_1) {
    // do not invoke class descriptor write hook with old protocol
    desc.writeNonProxy(this);
  } else {
    this._writeClassDescriptor(desc);
  }

  // Class cl = desc.forClass();
  this.bout.setBlockDataMode(true);
  // if (isCustomSubclass()) {
    // ReflectUtil.checkPackageAccess(cl);
  // }
  // annotateClass(cl);
  this.bout.setBlockDataMode(false);
  this.bout.writeByte(cons.TC_ENDBLOCKDATA);
  this.writeClassDesc(desc.getSuperDesc(), false);
};

proto._writeClassDescriptor = function (desc) {
  desc.writeNonProxy(this);
};

/**
 * Writes instance data for each serializable class of given object, from
 * superclass to subclass.
 */
proto._writeSerialData = function (obj, desc) {
  // ObjectStreamClass.ClassDataSlot[] slots = desc.getClassDataLayout();
  // for (int i = 0; i < slots.length; i++) {
  //   ObjectStreamClass slotDesc = slots[i].desc;
  //   if (slotDesc.hasWriteObjectMethod()) {
  //     PutFieldImpl oldPut = curPut;
  //     curPut = null;
  //
  //     SerialCallbackContext oldContext = curContext;
  //     try {
  //                 curContext = new SerialCallbackContext(obj, slotDesc);
  //
  //     bout.setBlockDataMode(true);
  //     slotDesc.invokeWriteObject(obj, this);
  //     bout.setBlockDataMode(false);
  //     bout.writeByte(TC_ENDBLOCKDATA);
  //     } finally {
  //                 curContext.setUsed();
  //                 curContext = oldContext;
  //               }
  //
  //   curPut = oldPut;
  //   } else {
  //     defaultWriteFields(obj, slotDesc);
  //   }
  // }
  this._defaultWriteFields(obj, desc);
};

/**
 * Fetches and writes values of serializable fields of given object to
 * stream.  The given class descriptor specifies which field values to
 * write, and in which order they should be written.
 */
proto._defaultWriteFields = function (obj, desc) {
// Class<?> cl = desc.forClass();
// if (cl != null && obj != null && !cl.isInstance(obj)) {
//     throw new ClassCastException();
// }

// desc.checkDefaultSerialize();

  var primDataSize = desc.getPrimDataSize();
  if (this.primVals === null || this.primVals.length < primDataSize) {
    this.primVals = new Buffer(primDataSize);
  }
  desc.getPrimFieldValues(obj, this.primVals);
  this.bout.write(this.primVals, 0, primDataSize, false);
  var fields = desc.getFields(false);
  // var objVals = new Array(desc.getNumObjFields());
  // desc.getObjFieldValues(obj, objVals);
  var objVals = [];
  for (var i = 0; i < fields.length; i++) {
    var f = fields[i];
    if (f.isPrimitive()) {
      continue;
    }
    this.writeObject0(obj[f.name], f.isUnshared());
  }
  //
  // for (var i = 0; i < objVals.length; i++) {
  //   writeObject0(objVals[i], fields[numPrimFields + i].isUnshared());
  // }
};

/**
 * Writes given array object to stream.
 */
proto.writeArray = function (array, desc, unshared) {
  this.bout.writeByte(cons.TC_ARRAY);
  this.writeClassDesc(desc, false);
  this.handles.assign(unshared ? null : array);
  this.bout.writeInt(array.length);
  for (var i = 0; i < array.length; i++) {
    this.writeObject0(array[i], false);
  }

  // Class ccl = desc.forClass().getComponentType();
  // if (ccl.isPrimitive()) {
    // if (ccl == Integer.TYPE) {
    //   int[] ia = (int[]) array;
    //   bout.writeInt(ia.length);
    //   bout.writeInts(ia, 0, ia.length);
    // } else if (ccl == Byte.TYPE) {
    // byte[] ba = (byte[]) array;
    // bout.writeInt(ba.length);
    // bout.write(ba, 0, ba.length, true);
    //   } else if (ccl == Long.TYPE) {
    // long[] ja = (long[]) array;
    // bout.writeInt(ja.length);
    // bout.writeLongs(ja, 0, ja.length);
    //   } else if (ccl == Float.TYPE) {
    // float[] fa = (float[]) array;
    // bout.writeInt(fa.length);
    // bout.writeFloats(fa, 0, fa.length);
    //   } else if (ccl == Double.TYPE) {
    // double[] da = (double[]) array;
    // bout.writeInt(da.length);
    // bout.writeDoubles(da, 0, da.length);
    //   } else if (ccl == Short.TYPE) {
    // short[] sa = (short[]) array;
    // bout.writeInt(sa.length);
    // bout.writeShorts(sa, 0, sa.length);
    //   } else if (ccl == Character.TYPE) {
    // char[] ca = (char[]) array;
    // bout.writeInt(ca.length);
    // bout.writeChars(ca, 0, ca.length);
    //   } else if (ccl == Boolean.TYPE) {
    // boolean[] za = (boolean[]) array;
    // bout.writeInt(za.length);
    // bout.writeBooleans(za, 0, za.length);
    // } else {
    //   throw new InternalError();
    // }
  // } else {
  //   this.bout.writeInt(array.length);
  //   for (var i = 0; i < array.length; i++) {
  //     this.writeObject0(array[i], false);
  //   }
  // }
};

/**
 * Writes null code to stream.
 */
proto.writeNull = function () {
  this.bout.writeByte(cons.TC_NULL);
  return this;
};

/**
 * Writes given string to stream, using standard or long UTF format
 * depending on string length.
 */
proto.writeString = function (str, unshared) {
  this.handles.assign(unshared ? null : str);
  var utflen = this.bout.getUTFLength(str);
  if (utflen <= 0xFFFF) {
    this.bout.writeByte(cons.TC_STRING);
    this.bout.writeUTF(str, utflen);
  } else {
    this.bout.writeByte(cons.TC_LONGSTRING);
    this.bout.writeLongUTF(str, utflen);
  }
  return this;
};

proto.writeUTF = function (str) {
  this.bout.writeUTF(str);
};

proto.writeLong = function (v) {
  this.bout.writeLong(v);
};

proto.writeByte = function (v) {
  this.bout.writeByte(v);
};

proto.writeShort = function (v) {
  this.bout.writeShort(v);
};

/**
 * Writes string without allowing it to be replaced in stream.  Used by
 * ObjectStreamClass to write class descriptor type strings.
 */
proto.writeTypeString = function (str) {
  var handle;
  if (str === null || str === undefined) {
    this.writeNull();
  } else if ((handle = this.handles.lookup(str)) !== -1) {
    this.writeHandle(handle);
  } else {
    this.writeString(str, false);
  }
};

var baseWireHandle = 0x7e0000;

/**
 * Writes given object handle to stream.
 */
proto.writeHandle = function (handle) {
  this.bout.writeByte(cons.TC_REFERENCE);
  this.bout.writeInt(baseWireHandle + handle);
};

module.exports = ObjectOutputStream;
