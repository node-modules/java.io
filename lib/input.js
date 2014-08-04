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

var debug = require('debug')('java.io:input');
var assert = require('assert');
var ByteBuffer = require('byte');
var utility = require('utility');
var objects = require('./objects');
var cons = require('./constants');

module.exports = InputStream;

function InputStream(buf, withType) {
  this.withType = !!withType;
  this.in = ByteBuffer.wrap(buf);
  this._refs = [];
  this._readHeader();
};

InputStream.addObject = function (classname, convertor) {
  // convertor must impl `readObject(io, obj, withType)` or `writeObject(io, obj, withType)`
  if (typeof convertor.readObject !== 'function' && typeof convertor.writeObject !== 'function') {
    throw new Error('Convertor must implement readObject() or writeObject()');
  }
  objects[classname] = convertor;
};

InputStream.read = InputStream.readObject = function (buf, withType) {
  return new InputStream(buf, withType)._readContent();
};

var proto = InputStream.prototype;

proto.read = proto.readObject = proto._readContent = function () {
  // content:
  //   object
  //   blockdata
  debug('> _readContent');

  var la = this.lookAhead();
  if (la === undefined) return;

  if (la === cons.TC_BLOCKDATA) {
    return this._readBlockDataShort();
  } else if (la === cons.TC_BLOCKDATALONG) {
    return this._readBlockDataLong();
  } else {
    return this._readObject();
  }
};

proto._readBlockDataShort = function() {
  // blockdatashort:
  //   TC_BLOCKDATA (unsigned byte)<size> (byte)[size]
  throw new Error('Not implement _readBlockDataShort()');
};

proto._readBlockDataLong = function() {
  // blockdatalong:
  //   TC_BLOCKDATALONG (int)<size> (byte)[size]
  throw new Error('Not implement _readBlockDataLong()');
};

proto._readObject = function () {
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
  debug('> _readObject');

  var la = this.lookAhead();

  if (la === cons.TC_OBJECT) {
    return this._readNewObject();

  } else if (la === cons.TC_CLASS) {
    return this._readNewClass();

  } else if (la === cons.TC_ARRAY) {
    return this._readNewArray();

  } else if (la === cons.TC_STRING || la === cons.TC_LONGSTRING) {
    return this._readNewString();

  } else if (la === cons.TC_ENUM) {
    return this._readNewEnum();

  } else if (la === cons.TC_CLASSDESC || la === cons.TC_PROXYCLASSDESC) {
    return this._readNewClassDesc();

  } else if (la === cons.TC_REFERENCE) {
    var obj = this._readPrevObject();
    return normalize(obj, this.withType);

  } else if (la === cons.TC_NULL) {
    return this._readNull();

  } else if (la === cons.TC_EXCEPTION) {
    return this._readException();

  } else if (la === cons.TC_RESET) {
    return this._readReset();

  } else {
    throw new Error('Illegal lookahead: 0x' + la.toString(16));
  }
};

proto._readNewObject = function () {
  // newObject:
  //   TC_OBJECT classDesc newHandle classdata[]
  debug('>> _readNewObject');

  this.in.get();

  var obj = { $: {} };
  var $class = obj.$class = this._readClassDesc();
  this._newHandle(obj);
  this._readClassData(obj);

  var ret = normalize(obj, this.withType);
  debug('<< _readNewObject | obj = %j', ret);
  return ret;
};


proto._readNewClass = function() {
  // newClass:
  //   TC_CLASS classDesc newHandle
  throw new Error('Not implement _readNewClass()');
};

proto._readNewArray = function () {
  // newArray:
  //   TC_ARRAY classDesc newHandle (int)<size> values[size]
  debug('>> _readNewArray');

  this.in.get();

  var obj = { $: [] };

  obj.$class = this._readClassDesc();
  this._newHandle(obj);
  this._readArrayItems(obj);

  debug('<< _readNewArray | obj = %j', obj);
  return this.withType ? obj : obj.$;
};

proto._readNewString = function () {
  // newString:
  //   TC_STRING newHandle (utf)
  //   TC_LONGSTRING newHandle (long-utf)
  var type = this.in.get();
  var str = this._readUTFString(type === cons.TC_LONGSTRING);
  this._newHandle(str);
  debug('< _readNewString | str = %s', str);
  return str;
};

proto._readNewEnum = function () {
  // newEnum:
  //   TC_ENUM classDesc newHandle enumConstantName
  this.in.get();

  var obj = { $: {} };
  obj.$class = this._readClassDesc();
  this._newHandle(obj);

  // enumConstantName:
  //   (String)object
  obj.$.name = this._readObject();
  debug('< _readNewEnum | obj = %j', obj);
  return this.withType ? obj : obj.$;
};

proto._readNewClassDesc = function () {
  // newClassDesc:
  //   TC_CLASSDESC className serialVersionUID newHandle classDescInfo
  //   TC_PROXYCLASSDESC newHandle proxyClassDescInfo
  debug('> _readNewClassDesc');

  var la = this.lookAhead();

  if (la === cons.TC_CLASSDESC) {
    return this._readNonProxyDesc();

  } else if (la === cons.TC_PROXYCLASSDESC) {
    throw new Error('Not implement _readNewClassDesc.PROXYCLASSDESC');

  } else {
    throw new Error('Illegal lookahead: 0x' + la.toString(16));
  }
};


proto._readNonProxyDesc = function() {
  this.in.get();

  var obj = {
    name: this._readUTFString(),
    serialVersionUID: this.readLong().toString()
  };

  this._newHandle(obj);

  var descInfo = this._readClassDescInfo();
  obj.flags = descInfo.flags;
  obj.fields = descInfo.fields;
  obj.superClass = descInfo.superClass;

  debug('< _readNonProxyDesc | obj = %j', obj);
  return obj;
}


proto._readPrevObject = function () {
  // prevObject
  //   TC_REFERENCE (int)handle
  this.in.get();
  var id = this.readInt();
  var obj = this._refs[id - cons.baseWireHandle];
  debug('< _readRrevObject | id = %d, obj = %j', id, obj);
  return obj;
};

proto._readNull = function() {
  this.in.get();
  debug('< _readNull');
  return null
}

proto._readException = function() {
  // exception:
  //   TC_EXCEPTION reset (Throwable)object reset
  throw new Error('Not implement _readException()');
}

proto._readReset = function() {
  throw new Error('Not implement _readReset()');
}

proto._readClassDesc = function () {
  // classDesc:
  //   newClassDesc
  //   nullReference
  //   (ClassDesc)prevObject
  debug('> _readClassDesc')

  var la = this.lookAhead();

  var classDesc;
  if (la === cons.TC_CLASSDESC) {
    return this._readNewClassDesc();

  } else if (la === cons.TC_REFERENCE) {
    return this._readPrevObject();

  } else if (la === cons.TC_NULL) {
    return this._readNull();

  } else {
    throw new Error('Illegal lookahead: 0x' + la.toString(16));
  }
};

proto._newHandle = function (o) {
  debug('> _newHandle | index = %d, obj = %j', this._refs.length, o);
  this._refs.push(o);
};

proto._readClassData = function (obj) {
  // classdata:
  //   nowrclass                 // SC_SERIALIZABLE & classDescFlag &&
  //                             // !(SC_WRITE_METHOD & classDescFlags)
  //   wrclass objectAnnotation  // SC_SERIALIZABLE & classDescFlag &&
  //                             // SC_WRITE_METHOD & classDescFlags
  //   externalContents          // SC_EXTERNALIZABLE & classDescFlag &&
  //                             // !(SC_BLOCKDATA  & classDescFlags
  //   objectAnnotation          // SC_EXTERNALIZABLE & classDescFlag&&
  //                             // SC_BLOCKDATA & classDescFlags

  var classDesc = obj.$class;
  var flags = classDesc.flags;
  var classname = classDesc.name;

  if (flags & cons.SC_SERIALIZABLE) {
    if (flags & cons.SC_WRITE_METHOD) {
      debug('>> _readClassData | production: wrclass objectAnnotation')
      //this._readNowrclass(obj);
      this._readObjectAnnotation(obj);

    } else {
      debug('>> _readClassData | production: nowrclass')
      this._readNowrclass(obj);
    }
  } else if (flags & cons.SC_EXTERNALIZABLE) {
    if (flags & cons.SC_BLOCKDATA) {
      debug('>> _readClassData | production: objectAnnotation')
      this._readObjectAnnotation(obj);

    } else {
      debug('>> _readClassData | production: externalContents')
      this._readExternalContents();
    }
  } else {
    throw new Error('Illegal _readClassData')
  }
};


proto._readNowrclass = function (obj) {
  // nowrclass:
  //   values                    // fields in order of class descriptor
  debug('> _readNowrclass');
  this._defaultReadFields(obj);
};


proto._defaultReadFields = function(obj) {
  debug('> _defaultReadFields');
  var $fields = concatFields(obj.$class);
  for (var i = 0; i < $fields.length; i++) {
    var field = $fields[i];
    var val = this._readFieldValue(field);
    obj.$[field.name] = val;
  }

  // try to detect TC_BLOCKDATA
  var type = this.in.get(this.in.position());
  if (type === cons.TC_BLOCKDATA) {
    this.in.skip(1);
    var size = this.in.get();
  }
};


proto.defaultReadObject = function(obj) {
  this._defaultReadFields(obj);
};


proto._readObjectAnnotation = function (obj) {
  // objectAnnotation:
  //   endBlockData
  //   contents endBlockData     // contents written by writeObject
  //                             // or writeExternal PROTOCOL_VERSION_2.
  debug('> _readObjectAnnotation');
  var type = this.in.get(this.in.position());
  if (type === cons.TC_BLOCKDATA) {
    // TC_BLOCKDATA
    this.in.skip(1);

    // blockdata:
    //   blockdatashort
    //   blockdatalong
    //  blockdatashort:
    //   TC_BLOCKDATA (unsigned byte)<size> (byte)[size]
    //  blockdatalong:
    //   TC_BLOCKDATALONG (int)<size> (byte)[size]
    var size = this.in.get();
    debug('TC_BLOCKDATA start, size = %d bytes', size);
  }

  var name = obj.$class.name;
  objects[name].readObject(this, obj);

  // TC_ENDBLOCKDATA
  assert.equal(this.in.get(), cons.TC_ENDBLOCKDATA,
    'SC_WRITE_METHOD object should end with TC_ENDBLOCKDATA');
};

proto._readExternalContents = function() {
  // externalContents:         // externalContent written by
  //   externalContent         // writeExternal in PROTOCOL_VERSION_1.
  //   externalContents externalContent
  throw new Error('Not implement _readExternalContents()');
}

proto._readArrayItems = function (obj) {
  // (int)<size> values[size]
  var size = this.readInt();

  // values:        // The size and types are described by the
  //                // classDesc for the current object
  var type = obj.$class.name[1];
  // [I
  for (var i = 0; i < size; i++) {
    obj.$.push(this._readFieldValue({type: type}));
  }

  debug('< _readArrayItems | size = %d, arr = %j', size, obj.$);
  return obj;
};


proto._readFieldValue = function (field) {
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
  debug('> _readFieldValue | field = %j', field);
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
    return this._readContent();
  case '[':
    var obj = {
      $class: {
        name: field.classname,
      },
      $: []
    };
    return this._readArrayItems(obj);
  default:
    throw new Error('Illegal field type: ' + JSON.stringify(field));
  }
};

proto._readClassDescFlags = function () {
  // classDescFlags:
  //   (byte)                  // Defined in Terminal Symbols and
  //                             // Constants
  return this.readByte();
};

proto._readFields = function () {
  // fields:
  //   (short)<count>  fieldDesc[count]
  var fieldsDesc = [];
  var count = this.readShort();

  for (var i = 0; i < count; i++) {
    fieldsDesc.push(this._readFieldDesc());
  }
  debug('< _readFields | count = %d, fieldsDesc = %j', count, fieldsDesc);
  return fieldsDesc;
};

proto._readClassAnnotation = function () {
  // classAnnotation:
  //   endBlockData
  //   contents endBlockData      // contents written by annotateClass
  var type = this.in.get();
  if (type === cons.TC_ENDBLOCKDATA) {
    debug('< _readClassAnnotation | hint = endBlockData');
  } else {
    throw new Error('Illegal type: 0x' + type.toString(16));
  }
};

proto._readSuperClassDesc = function () {
  // superClassDesc:
  //   classDesc
  var superClass = this._readClassDesc();
  debug('< _readSuperClassDesc | desc  = %j', superClass);
  return superClass;
};

proto._readClassDescInfo = function () {
  // classDescInfo:
  //   classDescFlags fields classAnnotation superClassDesc

  var obj = {};
  obj.flags = this._readClassDescFlags();
  obj.fields = this._readFields();
  this._readClassAnnotation();
  obj.superClass = this._readSuperClassDesc();

  debug('< _readClassDescInfo | obj = %j', obj);
  return obj
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
  var type = this.in.getChar();
  var desc = {
    type: type,
    name: this._readUTFString(),
  };

  if (type === '[' || type === 'L') {
    desc.classname = this._readObject();
  }

  debug('<< _readFieldDesc | desc = %j', desc);
  return desc;
};

proto._readUTFString = function (isLong) {
  // Note that the symbol (utf) is used to designate a string written using 2-byte length information,
  // and (long-utf) is used to designate a string written using 8-byte length information.
  var len = isLong ? this.in.getLong().toNumber() : this.in.getUInt16();
  var str = this.in.read(len).toString();
  debug('< _readUTFString | str = %s', str);
  return str;
};

proto._readHeader = function () {
  // stream:
  //   magic version contents
  var magic = this.readShort();
  var version = this.readShort();
  if (magic !== cons.STREAM_MAGIC || version !== cons.STREAM_VERSION) {
    var err = new Error('invaild stream header: 0x'
      + magic.toString(16) + ' 0x' + version.toString(16));
    err.name = 'InvaildStreamHeaderError';
    throw err;
  }
};

proto.lookAhead = function() {
  return this.in.get(this.in.position());
};

proto.readBytes = function (size) {
  return this.in.read(size);
};

proto.readInt = function () {
  return this.in.getUInt();
};

proto.readByte = function () {
  return this.in.get();
};

proto.readShort = function () {
  return this.in.getUInt16();
};

proto.readLong = function () {
  return this.in.getLong();
};


function concatFields(classDesc) {
  if (!classDesc.superClass) {
    return classDesc.fields;
  } else {
    return concatFields(classDesc.superClass).concat(classDesc.fields);
  }
};


function normalize(obj, withType) {
  if (withType || !obj || obj.$ === undefined) return obj;

  var $class = obj.$class;
  var $fields = concatFields($class);
  var isPrimitive = !!($class.name.indexOf('java.lang.') === 0
    && $fields.length === 1
    && $fields[0].name === 'value');
  return isPrimitive ? obj.$.value : ('_$' in obj ? obj._$ : obj.$);
};
