/**!
 * object_output_stream - lib/object_output_stream.js
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
var BlockDataOutputStream = require('./block_data_output_stream');
var ObjectStreamClass = require('./object_stream_class');
var cons = require('./object_stream_constants');

function ObjectOutputStream(out) {
  this.bout = new BlockDataOutputStream(out);
  this.enableOverride = false;
  this.protocol = cons.PROTOCOL_VERSION_2;

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
  var h;
  // if ((obj = subs.lookup(obj)) == null) {
  if (obj === null || obj === undefined) {
    return this.writeNull();
  // } else if (!unshared && (h = handles.lookup(obj)) != -1) {
  // } else if (!unshared && (h = handles.lookup(obj)) != -1) {
// writeHandle(h);
// return;
  // } else if (obj instanceof Class) {
// writeClass((Class) obj, unshared);
// return;
  // } else if (obj instanceof ObjectStreamClass) {
// writeClassDesc((ObjectStreamClass) obj, unshared);
// return;
  }

  // check for replacement object
  // var orig = obj;

  // Class cl = obj.getClass();
  // ObjectStreamClass desc;
  // for (;;) {
  //   // REMIND: skip this check for strings/arrays?
  //   Class repCl;
  //   desc = ObjectStreamClass.lookup(cl, true);
  //   if (!desc.hasWriteReplaceMethod() ||
  //       (obj = desc.invokeWriteReplace(obj)) == null ||
  //       (repCl = obj.getClass()) == cl)
  //   {
  //       break;
  //   }
  //   cl = repCl;
  // }
  // if (this.enableReplace) {
    // Object rep = replaceObject(obj);
    // if (rep != obj && rep != null) {
    //     cl = rep.getClass();
    //     desc = ObjectStreamClass.lookup(cl, true);
    // }
    // obj = rep;
  // }

  // if object replaced, run through original checks a second time
  // if (obj !== orig) {
    // subs.assign(orig, obj);
    // if (obj == null) {
    //     writeNull();
    //     return;
    // } else if (!unshared && (h = handles.lookup(obj)) != -1) {
    //     writeHandle(h);
    //     return;
    // } else if (obj instanceof Class) {
    //     writeClass((Class) obj, unshared);
    //     return;
    // } else if (obj instanceof ObjectStreamClass) {
    //     writeClassDesc((ObjectStreamClass) obj, unshared);
    //     return;
    // }
  // }
  var desc;
  // remaining cases
  // if (obj instanceof String) {
  if (typeof obj === 'string') {
    this.writeString(obj, unshared);
  // } else if (cl.isArray()) {
  } else if (Array.isArray(obj)) {
    desc = ObjectStreamClass.lookup(obj, true);
    this.writeArray(obj, desc, unshared);
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
	  //     cl.getName() + "\n" + debugInfoStack.toString());
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
  // handles.assign(unshared ? null : obj);
  // if (desc.isExternalizable() && !desc.isProxy()) {
  //   writeExternalData((Externalizable) obj);
  // } else {
  //   writeSerialData(obj, desc);
  // }
  this.writeSerialData(obj, desc);
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
  // handles.assign(unshared ? null : desc);

  if (this.protocol === cons.PROTOCOL_VERSION_1) {
    // do not invoke class descriptor write hook with old protocol
    desc.writeNonProxy(this);
  } else {
    this.writeClassDescriptor(desc);
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

proto.writeClassDescriptor = function (desc) {
  desc.writeNonProxy(this);
};

/**
 * Writes instance data for each serializable class of given object, from
 * superclass to subclass.
 */
proto.writeSerialData = function (obj, desc) {
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
}

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
  // handles.assign(unshared ? null : str);
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
  // var handle;
  if (str === null || str === undefined) {
    this.writeNull();
  // } else if ((handle = handles.lookup(str)) != -1) {
  //   writeHandle(handle);
  } else {
    this.writeString(str, false);
  }
};

module.exports = ObjectOutputStream;
