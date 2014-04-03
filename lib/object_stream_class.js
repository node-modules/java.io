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

var debug = require('debug')('java.io:object_stream_class');
var utility = require('utility');
var Bits = require('./bits');
var types = require('./types');
var ObjectStreamConstants = require('./object_stream_constants');
var ObjectStreamField = require('./object_stream_field');

function ObjectStreamClass(obj) {
  if (!obj) {
    return;
  }

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
 * Reads non-proxy class descriptor information from given input stream.
 * The resulting class descriptor is not fully functional; it can only be
 * used as input to the ObjectInputStream.resolveClass() and
 * ObjectStreamClass.initNonProxy() methods.
 */
proto.readNonProxy = function (ois) {
  // java.util.ArrayList
  this.name = ois.readUTF();
  // 8683452581122892189
  this.suid = ois.readLong();
  this.isProxy = false;

  var flags = ois.readByte();
  this.hasWriteObjectData =
    ((flags & ObjectStreamConstants.SC_WRITE_METHOD) !== 0);
  this.hasBlockExternalData =
    ((flags & ObjectStreamConstants.SC_BLOCK_DATA) !== 0);
  this.externalizable =
    ((flags & ObjectStreamConstants.SC_EXTERNALIZABLE) !== 0);
  var sflag =
    ((flags & ObjectStreamConstants.SC_SERIALIZABLE) !== 0);
  // if (this.externalizable && sflag) {
  //   throw new InvalidClassException(
  //     name, "serializable and externalizable flags conflict");
  // }
  this.serializable = this.externalizable || sflag;
  this.isEnum = ((flags & ObjectStreamConstants.SC_ENUM) !== 0);
  // if (isEnum && suid.longValue() != 0) {
  //   throw new InvalidClassException(name,
  // "enum descriptor has non-zero serialVersionUID: " + suid);
  // }

  var numFields = ois.readShort();
  // if (this.isEnum && numFields != 0) {
  //   throw new InvalidClassException(name,
  // "enum descriptor has non-zero field count: " + numFields);
  // }
  this.fields = [];
  // (numFields > 0) ?
    // new ObjectStreamField[numFields] : NO_FIELDS;
  for (var i = 0; i < numFields; i++) {
    var tcode = String.fromCharCode(ois.readByte());
    var fname = ois.readUTF();
    var signature = (tcode === 'L' || tcode === '[')
      ? ois.readTypeString() : tcode;
    this.fields[i] = new ObjectStreamField(fname, signature, false);
  }
  this.computeFieldOffsets();
};

/**
 * Initializes class descriptor representing a non-proxy class.
 */
// (ObjectStreamClass model,
//       Class cl,
//       ClassNotFoundException resolveEx,
//       ObjectStreamClass superDesc)
proto.initNonProxy = function (model, cl, resolveEx, superDesc) {
  this.cl = cl;
  this.resolveEx = resolveEx;
  this.superDesc = superDesc;
  this.name = model.name;
  this.suid = model.getSerialVersionUID();
  this.isProxy = false;
  this.isEnum = model.isEnum;
  this.serializable = model.serializable;
  this.externalizable = model.externalizable;
  this.hasBlockExternalData = model.hasBlockExternalData;
  this.hasWriteObjectData = model.hasWriteObjectData;
  this.fields = model.fields;
  this.primDataSize = model.primDataSize;
  this.numObjFields = model.numObjFields;

  // if (cl) {
    // this.localDesc = this.lookup(cl, true);
    // if (this.localDesc.isProxy) {
    // throw new InvalidClassException(
    //   "cannot bind non-proxy descriptor to a proxy class");
    // }
    // if (isEnum != localDesc.isEnum) {
    // throw new InvalidClassException(isEnum ?
    //   "cannot bind enum descriptor to a non-enum class" :
    //   "cannot bind non-enum descriptor to an enum class");
    // }

  // if (serializable == localDesc.serializable &&
  // !cl.isArray() &&
  // suid.longValue() != localDesc.getSerialVersionUID())
  // {
  // throw new InvalidClassException(localDesc.name,
  //   "local class incompatible: " +
  //   "stream classdesc serialVersionUID = " + suid +
  //   ", local class serialVersionUID = " +
  //   localDesc.getSerialVersionUID());
  // }

  // if (!classNamesEqual(name, localDesc.name)) {
  // throw new InvalidClassException(localDesc.name,
  //   "local class name incompatible with stream class " +
  //   "name \"" + name + "\"");
  // }

  // if (!isEnum) {
  // if ((serializable == localDesc.serializable) &&
  //   (externalizable != localDesc.externalizable))
  // {
  //   throw new InvalidClassException(localDesc.name,
  // "Serializable incompatible with Externalizable");
  // }
  //
  // if ((serializable != localDesc.serializable) ||
  //   (externalizable != localDesc.externalizable) ||
  //   !(serializable || externalizable))
  // {
  //   deserializeEx = new InvalidClassException(localDesc.name,
  // "class invalid for deserialization");
  // }
  // }

  // cons = localDesc.cons;
  // writeObjectMethod = localDesc.writeObjectMethod;
  // readObjectMethod = localDesc.readObjectMethod;
  // readObjectNoDataMethod = localDesc.readObjectNoDataMethod;
  // writeReplaceMethod = localDesc.writeReplaceMethod;
  // readResolveMethod = localDesc.readResolveMethod;
  // if (deserializeEx == null) {
  // deserializeEx = localDesc.deserializeEx;
  // }
  // }
  // fieldRefl = getReflector(fields, localDesc);
  // reassign to matched fields so as to reflect local unshared settings
  // fields = fieldRefl.getFields();
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

proto.setPrimFieldValues = function (obj, buf) {
  for (var i = 0; i < this.fields.length; i++) {
    var f = this.fields[i];
    if (!f.isPrimitive()) {
      continue;
    }

    var off = f.offset;
    var val;
    switch (f.getTypeCode()) {
      case 'Z':
        val = Bits.getBoolean(buf, off);
        break;
      case 'B':
        val = buf[off];
        break;
      case 'C':
        val = Bits.getChar(buf, off);
        break;
      case 'S':
        val = Bits.getShort(buf, off);
        break;
      case 'I':
        val = Bits.getInt(buf, off);
        debug('setPrimFieldValues() read field %s got Int %j', f.name, val);
        break;
      case 'F':
        val = Bits.getFloat(buf, off);
        break;
      case 'J':
        val = Bits.getLong(buf, off);
        break;
      case 'D':
        val = Bits.getDouble(buf, off);
        break;
      default:
        throw new Error('InternalError');
    }
    obj[f.name] = val;
  }
};

module.exports = ObjectStreamClass;
