/**!
 * java.io - lib/serialization/v2/input.js
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

var debug = require('debug')('java.io:serialization:v2:input');
var ByteBuffer = require('byte');
var utility = require('utility');
var cons = require('../../object_stream_constants');

module.exports = InputStream;

function InputStream(buf) {
  this.in = ByteBuffer.wrap(buf);
  this._refs = [];
  this._readHeader();
}

InputStream.decode = InputStream.read = InputStream.readObject = function (buf, withType) {
  return new InputStream(buf).readObject(withType);
};

var proto = InputStream.prototype;

proto.readObject = function (withType) {
  var type = this.in.get();
  if (type === cons.TC_OBJECT) {
    debug('got TC_OBJECT');
    return this._readNewObject(withType);
  } else if (type === cons.TC_STRING) {
    debug('got TC_STRING');
    return this._readNewString(false);
  } else if (type === cons.TC_LONGSTRING) {
    debug('got TC_LONGSTRING');
    return this._readNewString(true);
  } else if (type === cons.TC_CLASSDESC) {
    debug('got TC_CLASSDESC');
    return this._readClassDesc();
  } else if (type === cons.TC_NULL) {
    debug('got TC_NULL');
    return null;
  } else if (type === cons.TC_REFERENCE) {
    debug('got TC_REFERENCE');
    // classDesc:
    //   newClassDesc
    //   nullReference
    //   (ClassDesc)prevObject      // an object required to be of type
    //                              // ClassDesc
    return this._readReference(withType);
  } else {
    if (debug.enabled) {
      debug('readObject() got unknow type: 0x%s', type.toString(16));
    }
  }
};

function concatFields(classDesc) {
  if (!classDesc.superClass) {
    return classDesc.fields;
  } else {
    return concatFields(classDesc.superClass).concat(classDesc.fields);
  }
}

proto._readReference = function (withType) {
  // prevObject
  // TC_REFERENCE (int)handle
  var ref = this.in.getInt() - cons.baseWireHandle;
  var obj = this._refs[ref];
  debug('_readReference() ref:%d, %j', ref, obj);
  return obj;
};

proto._readNewObject = function (withType) {
  // newObject:
  // TC_OBJECT classDesc newHandle classdata[]  // data for each class
  var obj = {
    $class: {},
    $fields: [],
    $serialVersionUID: '',
    $: {}
  };

  var type = this.in.get();
  var classDesc;
  if (type === cons.TC_CLASSDESC) {
    debug('got TC_CLASSDESC');
    classDesc = this._readClassDesc(obj.$fields);
    obj.$class = classDesc;
    obj.$fields = concatFields(classDesc);
  }

  // newHandle
  this._addRef(obj);

  // read classdata following fields
  // It writes the parent class members first:
  for (var i = 0; i < obj.$fields.length; i++) {
    var field = obj.$fields[i];
    obj.$[field.name] = this._readFieldValue(field, withType);
  }

  debug('_readNewObject() got %j', obj);
  if (obj.$class.name.indexOf('java.lang.') === 0
    && obj.$fields.length === 1
    && obj.$fields[0].name === 'value') {
    return obj.$.value;
  }

  return withType ? obj : obj.$;
};

proto._readFieldValue = function (field, withType) {
  // prim_typecode:
  // `B'	// byte
  // `C'	// char
  // `D'	// double
  // `F'	// float
  // `I'	// integer
  // `J'	// long
  // `S'	// short
  // `Z'	// boolean
  //
  // obj_typecode:
  // `[`	// array
  // `L'	// object
  switch (field.type) {
  case 'B':
    return this.in.getInt8();
  case 'C':
    return this.in.getUInt16();
  case 'I':
    return this.in.getInt();
  case 'D':
    return this.in.getDouble();
  case 'F':
    return this.in.getFloat();
  case 'J':
    return utility.toSafeNumber(this.in.getLong().toString());
  case 'S':
    return this.in.getInt16();
  case 'Z':
    return this.in.get() !== 0;
  case 'L':
    return this.readObject(withType);
  }
};

proto._readClassDesc = function () {
  // newClassDesc:
  // TC_CLASSDESC className serialVersionUID newHandle classDescInfo

  // className:
  // (utf)

  // serialVersionUID:
  // (long)


  // classDescInfo:
  // classDescFlags fields classAnnotation superClassDesc

  var desc = {
    name: this._readUTFString(false), // className
    serialVersionUID: this.in.getLong().toString(), // serialVersionUID
    flags: this.in.get(), // classDescFlags
    fields: [],
    superClass: null,
  };

  // newHandle:       // The next number in sequence is assigned
  //                // to the object being serialized or deserialized
  this._addRef(desc);

  debug('_readClassDesc() --- start: %s ---', desc.name);

  // read fields

  // fields:
  // (short)<count>  fieldDesc[count]

  var fieldsCount = this.in.getUInt16();
  debug('_readClassDesc() start read %d fields', fieldsCount);
  for (var i = 0; i < fieldsCount; i++) {
    var field = this._readFieldDesc();
    desc.fields.push(field);
  }

  // read classAnnotation

  // classAnnotation:
  // endBlockData
  // contents endBlockData      // contents written by annotateClass
  var type = this.in.get();
  if (type === cons.TC_CLASSDESC) {
    // read superClassDesc
    debug('_readClassDesc() start to read superClass');
    desc.superClass = this._readClassDesc();
  } else if (type === cons.TC_ENDBLOCKDATA) {
    desc.superClass = this.readObject(); // should be null
  } else {
    throw new Error('unkow type: 0x' + type.toString(16));
  }

  debug('_readClassDesc() --- end: %s --- got class: %j', desc.name, desc);
  return desc;
};

proto._readFieldDesc = function () {
  // fieldDesc:
  // primitiveDesc
  // objectDesc

  // primitiveDesc:
  // prim_typecode fieldName
  //
  // objectDesc:
  // obj_typecode fieldName className1

  // fieldName:
  // (utf)

  // className1:
  // (String)object             // String containing the field's type,
  //                            // in field descriptor format

  var field = {
    type: this.in.getChar(),
    name: this._readUTFString(false),
  };

  debug('_readFieldDesc() got field: %j', field);

  if (field.type === '[' || field.type === 'L') {
    field.classname = this.readObject();
  }
  return field;
};

// read new string and add referer
proto._readNewString = function (isLong) {
  // newString:
  // TC_STRING newHandle (utf)
  // TC_LONGSTRING newHandle (long-utf)

  var str = this._readUTFString(isLong);
  // newHandle
  this._addRef(str);
  return str;
};

proto._readUTFString = function (isLong) {
  // Note that the symbol (utf) is used to designate a string written using 2-byte length information,
  // and (long-utf) is used to designate a string written using 8-byte length information.

  var len = isLong ? this.in.getLong().toNumber() : this.in.getUInt16();
  var str = this.in.read(len).toString();
  debug('_readUTFString(%s) got %d bytes string: %s', isLong, len, str);
  return str;
};

proto._addRef = function (o) {
  debug('_addRef() %d: %j', this._refs.length, o);
  this._refs.push(o);
};

proto._readHeader = function () {
  // magic version contents
  var magic = this.in.getUInt16();
  var version = this.in.getUInt16();
  if (magic !== cons.STREAM_MAGIC || version !== cons.STREAM_VERSION) {
    var err = new Error('invaild stream header: 0x'
      + magic.toString(16) + ' 0x' + version.toString(16));
    err.name = 'InvaildStreamHeaderError';
    throw err;
  }
};
