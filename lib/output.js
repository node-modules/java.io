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


module.exports = OutputStream;


function OutputStream() {
  this.buf = new Buffer(1 << 20);
  this.out = ByteBuffer.wrap(this.buf);
  this._refs = [];
  this._writeStreamHeader();
}


// TODO is this method required ?
OutputStream.addObject = function (classname, convertor) {
  // convertor must impl `readObject(io, obj, withType)` or `writeObject(io, obj, withType)`
  if (typeof convertor.readObject !== 'function' && typeof convertor.writeObject !== 'function') {
    throw new Error('convertor must implement readObject() or writeObject()');
  }
  objects[classname] = convertor;
}


OutputStream.encode = OutputStream.write = OutputStream.writeObject = function (obj) {
  return new OutputStream().writeObject(obj);
}


var proto = OutputStream.prototype;


proto.writeObject = proto._writeObject = function(obj, unshared) {
  var out = this.out;
  out.position(4);

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

  // newObject
  this._writeOrdinaryObject(obj, unshared);

  var ret = new Buffer(out.position());
  this.buf.copy(ret);
  return ret;
}


proto._writeOrdinaryObject = function(obj) {
  // newObject:
  //   TC_OBJECT classDesc newHandle classdata[]  // data for each class

  var out = this.out;
  out.put(cons.TC_OBJECT);
  this._writeClassDesc(obj.$class, false);
  // handles.assign(unshared ? null : obj);
  this._writeSerialData(obj);
}


proto._writeClassDesc = function(desc, unshared) {
  // classDesc:
  //   newClassDesc
  //   nullReference
  //   (ClassDesc)prevObject  // an object required to be of type
                              // ClassDesc

  if (!desc) {
    this._writeNull();
  // } else if (!unshared && (handle = handles.lookup(desc)) != -1) {
  //   writeHandle(handle);
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
  // handles.assign(unshared ? null : desc);
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
    if (!that._isPrimitive(f.type)) {
      // out.writeTypeString(f.getTypeString());
      throw new Error('TODO');
    }
  });

  this._writeClassAnnotation(desc);
  this._writeClassDesc(desc.superClass, false);
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


var putMethodMap = {
  B: 'put',
  C: 'putUInt16',
  D: 'putDouble',
  F: 'putFloat',
  I: 'putInt',
  J: 'putLong',
  S: 'putShort',
  Z: 'putBoolean'
}
proto.defaultWriteFields = function(obj) {
  var that = this;
  var out = this.out;
  var fieldsDesc = getFieldsDesc(obj.$class);
  fieldsDesc.forEach(function(fd) {
    var type = fd.type;
    var name = fd.name;
    out[putMethodMap[type]](obj.$[name])
  });
}


proto._writeNull = function() {
  // nullReference:
  //   TC_NULL
  this.out.put(cons.TC_NULL);
}


proto._writeUTF = function(o) {
  // newString:
  //   TC_STRING newHandle (utf)
  //   TC_LONGSTRING newHandle (long-utf)

  var out = this.out;
  var bf = new Buffer(o.$);
  var len = bf.length;

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


proto._writeStreamHeader = function() {
  var out = this.out
  out.putUInt16(cons.STREAM_MAGIC);
  out.putUInt16(cons.STREAM_VERSION);
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


proto._isPrimitive = function(type) {
  return (type !== 'L') && (type !== '[');
}


function getFieldsDesc(desc) {
  if (!desc.superClass) {
    return desc.fields;
  } else {
    return getFieldsDesc(desc.superClass).concat(desc.fields);
  }
}








