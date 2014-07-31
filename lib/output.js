/**!
 * java.io - lib/serialization/v2/output.js
 *
 * Copyright(c) Alibaba Group Holding Limited.
 * MIT Licensed
 *
 * Authors:
 *   fool2fish <fool2fish@gmail.com> (http://fool2fish.github.com)
 */

'use strict';

/**
 * Module dependencies.
 */

var debug = require('debug')('java.io:output');
var assert = require('assert');
var ByteBuffer = require('byte');
var utility = require('utility');
var objects = require('./objects');
var cons = require('./constants');
var normalize = require('./normalize');


module.exports = OutputStream;


function OutputStream() {
  this.buf = new Buffer(1 << 20);
  this.out = ByteBuffer.wrap(this.buf);
  this._refs = [];
  this._writeStreamHeader();
}


OutputStream.normalize = normalize;


OutputStream.addObject = function (classname, convertor) {
  // convertor must impl `readObject(io, obj, withType)` or `writeObject(io, obj, withType)`
  if (typeof convertor.readObject !== 'function' && typeof convertor.writeObject !== 'function') {
    throw new Error('convertor must implement readObject() or writeObject()');
  }
  objects[classname] = convertor;
}


OutputStream.write = OutputStream.writeObject = function (obj) {
  return new OutputStream().writeObject(obj);
}


var proto = OutputStream.prototype;


proto.write = proto.writeObject = function(obj) {
  this._writeObject(obj, false);

  var ret = new Buffer(this.out.position());
  this.buf.copy(ret);
  return ret;
}


proto._writeObject = function(obj, unshared) {
  // object:
  //   newObject
  //   newClass
  //   newArray
  //   newString
  //   newEnum
  //   newClassDesc
  //   prevObject
  //   nullReference
  //   exception
  //   TC_RESET

  var handle;

  if (obj === null) {
    this._writeNull();
  } else if (!unshared && (handle = this._lookupHandle(obj)) !== -1) {
    this._writeHandle(handle);
  // } else if (obj instanceof Class) {
    // writeClass((Class) obj, unshared);
  // } else if (obj instanceof ObjectStreamClass) {
    // writeClassDesc((ObjectStreamClass) obj, unshared);
  } else if (typeof obj === 'string') {
    this._writeString(obj);
  } else if (isEnum(obj)) {
    this._writeEnum(obj, unshared);
  } else if (isArray(obj)) {
    this._writeArray(obj, unshared);
  } else {
    this._writeOrdinaryObject(obj, unshared);
  }
}


proto._writeOrdinaryObject = function(obj, unshared) {
  // newObject:
  //   TC_OBJECT classDesc newHandle classdata[]  // data for each class

  var out = this.out;
  out.put(cons.TC_OBJECT);
  this._writeClassDesc(obj.$class, false);
  this._newHandle(unshared ? null : obj);
  this._writeSerialData(obj);
}


proto._writeClassDesc = function(desc, unshared) {
  // classDesc:
  //   newClassDesc
  //   nullReference
  //   (ClassDesc)prevObject  // an object required to be of type
                              // ClassDesc
  var handle;

  if (!desc) {
    this._writeNull();
  } else if (!unshared && (handle = this._lookupHandle(desc)) !== -1) {
    this._writeHandle(handle);
  // } else if (desc.isProxy()) {
  //   writeProxyDesc(desc, unshared);
  } else {
    this._writeNonProxyDesc(desc, unshared);
  }
}


proto._writeProxyDesc = function (desc, unshared) {
  // newClassDesc:
  //   TC_PROXYCLASSDESC newHandle proxyClassDescInfo
  throw new Error('Not implement _writeProxyDesc()');
}


proto._writeNonProxyDesc = function (desc, unshared) {
  // newClassDesc:
  //   TC_CLASSDESC className serialVersionUID newHandle classDescInfo

  var out = this.out
  out.put(cons.TC_CLASSDESC);
  this._newHandle(unshared ? null : desc);
  this._writeUTF(desc.name);
  out.putLong(desc.serialVersionUID);
  this._writeClassDescInfo(desc, unshared);
}


proto._writeClassDescInfo = function(desc, unshared) {
  // classDescInfo:
  //   classDescFlags fields classAnnotation superClassDesc
  var that = this;
  var out = this.out;
  out.put(desc.flags);

  var fields = desc.fields;
  out.putUInt16(fields.length);

  fields.forEach(function(f, i) {
    out.putChar(f.type);
    that._writeUTF(f.name);
    if (!isPrimitive(f.type)) {
      that._writeTypeString(f.classname);
    }
  });

  this._writeClassAnnotation(desc);
  this._writeClassDesc(desc.superClass, false);
}


proto._writeTypeString = function(str) {
  var handle;
  if (!str) {
       this._writeNull();
  } else if ((handle = this._lookupHandle(str)) !== -1) {
       this._writeHandle(handle);
  } else {
       this._writeString(str, false);
  }
}


proto._writeClassAnnotation = function(desc) {
  // classAnnotation:
  //   endBlockData
  //   contents endBlockData  // contents written by annotateClass
  this.out.put(cons.TC_ENDBLOCKDATA);
}


proto._writeSerialData = function(obj) {
  // classdata:
  //   nowrclass                 // SC_SERIALIZABLE & classDescFlag &&
                                 // !(SC_WRITE_METHOD & classDescFlags)
  //   wrclass objectAnnotation  // SC_SERIALIZABLE & classDescFlag &&
                                 // SC_WRITE_METHOD & classDescFlags
  var out = this.out;
  var className = obj.$class.name;

  if (className in objects) {
    objects[className].writeObject(this, obj);
    out.put(cons.TC_ENDBLOCKDATA);
  } else {
    this.defaultWriteFields(obj);
  }
}


proto.defaultWriteFields = function(obj) {
  var that = this;
  var out = this.out;
  var fieldsDesc = getFieldsDesc(obj.$class);
  fieldsDesc.forEach(function(fd) {
    var type = fd.type;
    var v = obj.$[fd.name];
    if (isPrimitive(type)) {
      that._writePrimitive(fd.type, v);
    } else {
      that._writeObject(v);
    }
  });
}


proto._writeEnum = function(obj, unshared) {
  // newEnum:
  //   TC_ENUM classDesc newHandle enumConstantName
  var out = this.out;
  out.put(cons.TC_ENUM);

  var desc = obj.$class;
  var sdesc = desc.superClass;
  this._writeClassDesc(sdesc.name === 'java.lang.Enum' ? desc : sdesc, false);
  this._newHandle(unshared ? null : obj);
  this._writeString(obj.$.name, false);
}


proto._writeArray = function(obj, unshared) {
  // newArray:
  //   TC_ARRAY classDesc newHandle (int)<size> values[size]
  var that = this;
  var out = this.out;
  out.put(cons.TC_ARRAY);
  this._writeClassDesc(obj.$class, false);
  this._newHandle(unshared ? null : obj);

  var values = obj.$;
  out.putInt(values.length);
  if (isElementPrimitive(obj)) {
    values.forEach(function(el) {
      that._writePrimitive(obj.$class.name[1], el);
    })
  } else {
    values.forEach(function(el) {
      that._writeObject(el, false);
    });
  }
}


proto._writeNull = function() {
  // nullReference:
  //   TC_NULL
  this.out.put(cons.TC_NULL);
}


proto._writeString = function(str, unshared) {
  // newString:
  //   TC_STRING newHandle (utf)
  //   TC_LONGSTRING newHandle (long-utf)

  var out = this.out;
  var bf = new Buffer(str);
  var len = bf.length;

  this._newHandle(unshared ? null : str);

  if (len <= 0xffff) {
    out.put(cons.TC_STRING);
    out.putUInt16(len);
  } else {
    out.put(cons.TC_LONGSTRING);
    out.putInt64(len);
  }

  // out.putString always use long to represent string length
  out.put(bf);
}


proto._writeUTF = function(str) {
  var out = this.out;
  var bf = new Buffer(str);
  var len = bf.length;

  if (len > 0xffff) {
    throw new Error('UTFDataFormatException');
  }

  out.putUInt16(len);
  out.put(bf);
}

proto._writePrimitive = function(type, v) {
  var out = this.out;
  if (type === 'B') {
    out.put(v);
  } else if (type === 'C') {
    out.putUInt16(v);
  } else if (type === 'D') {
    out.putDouble(v);
  } else if (type === 'F') {
    out.putFloat(v);
  } else if (type === 'I') {
    out.putInt(v);
  } else if (type === 'J') {
    out.putLong(v);
  } else if (type === 'S') {
    out.putShort(v);
  } else if (type === 'Z') {
    out.put(v ? 1 : 0);
  } else {
    throw new Error('Illegal primitive type: ' + type);
  }
}


proto._newHandle = function(obj) {
  var refs = this._refs;
  refs[refs.length] = obj;
}

proto._lookupHandle = function(obj) {
  return this._refs.indexOf(obj);
}

proto._writeHandle = function(handle) {
  var out = this.out;
  out.put(cons.TC_REFERENCE);
  out.putInt(cons.baseWireHandle + handle);
}


proto._writeStreamHeader = function() {
  var out = this.out
  out.putUInt16(cons.STREAM_MAGIC);
  out.putUInt16(cons.STREAM_VERSION);
}

/*------------ assistant functions ------------*/

function getFieldsDesc(desc) {
  if (!desc.superClass) {
    return desc.fields;
  } else {
    return getFieldsDesc(desc.superClass).concat(desc.fields);
  }
}

function isEnum(obj) {
  var desc = obj.$class;
  while(desc) {
    if (desc.name === 'java.lang.Enum') return true;
    desc = desc.superClass
  }
  return false;
}

function isArray(obj) {
  var desc = obj.$class;
  return desc.name[0] === '[';
}

function isPrimitive(type) {
  return /[BCDFIJSZ]/.test(type);
}

function isElementPrimitive(obj) {
  var descName = obj.$class.name;
  return isPrimitive(descName[1]);
}




