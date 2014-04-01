/**!
 * outputstream - lib/object_stream_class.js
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

var utility = require('utility');
var ObjectStreamConstants = require('./object_stream_constants');
var ObjectStreamField = require('./object_stream_field');

function ObjectStreamClass(obj) {
  this.name = obj.constructor.$class || obj.$class;
  if (!this.name) {
    throw new Error('obj constructor must contains $class');
  }
  this.obj = obj;
  this.externalizable = false;
  this.serializable = true;
  this.hasWriteObjectData = false;
  this.isEnum = false;
  this.fields = [];
  /** number of non-primitive fields */
  this.numObjFields = 0;
  for (var k in obj) {
    if (!utility.has(obj, k) || k === '$class') {
      continue;
    }
    var f = new ObjectStreamField(k, obj[k]);
    this.fields.push(f);
    if (!f.isPrimitive()) {
      this.numObjFields++;
    }
  }
}

ObjectStreamClass.lookup = function (obj) {
  return new ObjectStreamClass(obj);
};

var proto = ObjectStreamClass.prototype;

proto.getSerialVersionUID = function () {
  return this.obj.constructor.serialVersionUID;
};

proto.getSuperDesc = function () {
  return null;
};

proto.writeNonProxy = function (out) {
  out.writeUTF(this.name);
  out.writeLong(this.getSerialVersionUID());

  var flags = 0;
  if (this.externalizable) {
    flags |= ObjectStreamConstants.SC_EXTERNALIZABLE;
    var protocol = out.getProtocolVersion();
    if (protocol !== ObjectStreamConstants.PROTOCOL_VERSION_1) {
      flags |= ObjectStreamConstants.SC_BLOCK_DATA;
    }
  } else if (this.serializable) {
    flags |= ObjectStreamConstants.SC_SERIALIZABLE;
  }
  if (this.hasWriteObjectData) {
    flags |= ObjectStreamConstants.SC_WRITE_METHOD;
  }
  if (this.isEnum) {
    flags |= ObjectStreamConstants.SC_ENUM;
  }
  out.writeByte(flags);

  out.writeShort(this.fields.length);
  for (var i = 0; i < this.fields.length; i++) {
    var f = this.fields[i];
    out.writeByte(f.getTypeCode());
    out.writeUTF(f.getName());
    if (!f.isPrimitive()) {
      out.writeTypeString(f.getTypeString());
    }
  }
};

module.exports = ObjectStreamClass;
