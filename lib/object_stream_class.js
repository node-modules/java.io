/**!
 * java.io - lib/object_stream_class.js
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
var Bits = require('./bits');
var types = require('./types');
var ObjectStreamConstants = require('./object_stream_constants');
var ObjectStreamField = require('./object_stream_field');

function ObjectStreamClass(obj) {
  this.name = obj.constructor.$class || obj.$class;
  if (!this.name) {
    if (typeof obj === 'string') {
      this.name = 'java.lang.String';
    } else if (Array.isArray(obj)) {
      // Object[] params, let it be java.lang.Object
      this.name = '[Ljava.lang.Object;';
    } else {
      throw new Error('obj constructor must contains $class');
    }
  }
  this.obj = obj;
  this.externalizable = false;
  this.serializable = true;
  // this.deserializeEx = null;
  // this.cons = 'java.lang.Object';
  this.hasWriteObjectData = false;
  this.isProxy = false;
  this.isEnum = false;
  this.superDesc = null;
  /** reflector for setting/getting serializable field values */
  this.fieldRefl = null;
  // this.localDesc = this;
  this.fields = [];
  /** aggregate marshalled size of primitive fields */
  this.primDataSize = 0;
  /** number of non-primitive fields */
  this.numObjFields = 0;
  this.numPrimFields = 0;
  if (!Array.isArray(obj) && !(obj instanceof types.JavaObjectArray)) {
    for (var k in obj) {
      if (!utility.has(obj, k) || k === '$class') {
        continue;
      }
      var f = new ObjectStreamField(k, obj[k]);
      this.fields.push(f);
    }
  }

  this.computeFieldOffsets();
}

ObjectStreamClass.lookup = function (obj, _, classname) {
  return new ObjectStreamClass(obj, classname);
};

var proto = ObjectStreamClass.prototype;

proto.getSerialVersionUID = function () {
  return this.obj.constructor.serialVersionUID;
};

proto.getSuperDesc = function () {
  return this.superDesc;
};

proto.getPrimDataSize = function () {
  return this.primDataSize;
};

proto.getNumObjFields = function () {
  return this.numObjFields;
};

proto.getFields = function (copy) {
  return this.fields;
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

/**
 * Calculates and sets serializable field offsets, as well as primitive
 * data size and object field count totals.  Throws InvalidClassException
 * if fields are illegally ordered.
 */
proto.computeFieldOffsets = function () {
  this.primDataSize = 0;
  this.numObjFields = 0;
  var firstObjIndex = -1;

  // primitive type must first order
  for (var i = 0; i < this.fields.length; i++) {
    var f = this.fields[i];
    switch (f.getTypeCode()) {
      case 'Z':
      case 'B':
        f.setOffset(this.primDataSize++);
        break;
      case 'C':
      case 'S':
        f.setOffset(this.primDataSize);
        this.primDataSize += 2;
        break;
      case 'I':
      case 'F':
        f.setOffset(this.primDataSize);
        this.primDataSize += 4;
        break;
      case 'J':
      case 'D':
        f.setOffset(this.primDataSize);
        this.primDataSize += 8;
        break;
      case '[':
      case 'L':
        f.setOffset(this.numObjFields++);
        if (firstObjIndex === -1) {
          firstObjIndex = i;
        }
        break;
      default:
        throw new Error('InternalError');
    }
  }
  this.numPrimFields = this.fields.length - this.numObjFields;
  if (firstObjIndex !== -1
      && firstObjIndex + this.numObjFields !== this.fields.length) {
    console.log(this.numObjFields, this.fields.length, firstObjIndex, this.numPrimFields);
    throw new Error('InvalidClassException: ' + this.name +
      ' illegal field order, primitive type must first order');
  }
};

/**
 * Constructs FieldReflector capable of setting/getting values from the
 * subset of fields whose ObjectStreamFields contain non-null
 * reflective Field objects.  ObjectStreamFields with null Fields are
 * treated as filler, for which get operations return default values
 * and set operations discard given values.
 */
// function FieldReflector(fields) {
//   this.fields = fields;
//   var nfields = fields.length;
//   // 12, 16, 20, 24
//   this.readKeys = new Array(nfields);
//   this.writeKeys = new Array(nfields);
//   // 0, 0, 1, 2
//   this.offsets = new Array(nfields);
//   // [class java.lang.String, class java.lang.String, class [Ljava.lang.Object;]
//   this.typeCodes = new Array(nfields);
//   this.types = [];
//   // var usedKeys = {};
//   var INVALID_FIELD_OFFSET = -1;
//
//   var startKey = 12;
//   for (var i = 0; i < nfields; i++) {
//     var f = fields[i];
//     // Field rf = f.getField();
//     var key = startKey + (i * 4);
//     // long key = (rf != null) ?
//       // unsafe.objectFieldOffset(rf) : Unsafe.INVALID_FIELD_OFFSET;
//     this.readKeys[i] = key;
//     this.writeKeys[i] = key;
//     // usedKeys.add(key) ?
//     //               key : Unsafe.INVALID_FIELD_OFFSET;
//     this.offsets[i] = f.getOffset();
//     this.typeCodes[i] = f.getTypeCode();
//     if (!f.isPrimitive()) {
//       this.types.push(f);
//       // typeList.add((rf != null) ? rf.getType() : null);
//     }
//   }
//
//     // types = (Class[]) typeList.toArray(new Class[typeList.size()]);
//   this.numPrimFields = nfields - this.types.length;
// }

/**
 * Fetches the serializable primitive field values of object obj and
 * marshals them into byte array buf starting at offset 0.  It is the
 * responsibility of the caller to ensure that obj is of the proper type if
 * non-null.
 */
proto.getPrimFieldValues = function (obj, buf) {
  if (obj === null || obj === undefined) {
    throw new Error('NullPointerException');
  }
  /* assuming checkDefaultSerialize() has been called on the class
   * descriptor this FieldReflector was obtained from, no field keys
   * in array should be equal to Unsafe.INVALID_FIELD_OFFSET.
   */
  for (var i = 0; i < this.fields.length; i++) {
    // var key = this.readKeys[i];
    // var off = this.offsets[i];
    var f = this.fields[i];
    if (!f.isPrimitive()) {
      continue;
    }

    var off = f.offset;
    var val = obj[f.name];
    switch (f.getTypeCode()) {
      case 'Z':
        // Bits.putBoolean(buf, off, unsafe.getBoolean(obj, key));
        Bits.putBoolean(buf, off, val);
        break;
      case 'B':
        buf[off] = val;
        // buf[off] = unsafe.getByte(obj, key);
        break;
      case 'C':
        Bits.putChar(buf, off, val);
        // Bits.putChar(buf, off, unsafe.getChar(obj, key));
        break;
      case 'S':
        Bits.putShort(buf, off, val);
        // Bits.putShort(buf, off, unsafe.getShort(obj, key));
        break;
      case 'I':
        Bits.putInt(buf, off, val);
        // Bits.putInt(buf, off, unsafe.getInt(obj, key));
        break;
      case 'F':
        Bits.putFloat(buf, off, val);
        // Bits.putFloat(buf, off, unsafe.getFloat(obj, key));
        break;
      case 'J':
        Bits.putLong(buf, off, val);
        // Bits.putLong(buf, off, unsafe.getLong(obj, key));
        break;
      case 'D':
        Bits.putDouble(buf, off, val);
        // Bits.putDouble(buf, off, unsafe.getDouble(obj, key));
        break;
      default:
        throw new Error('InternalError');
    }
  }
  return buf;
};

module.exports = ObjectStreamClass;
