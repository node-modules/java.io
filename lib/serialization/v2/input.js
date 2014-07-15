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
var assert = require('assert');
var ByteBuffer = require('byte');
var utility = require('utility');
var objects = require('./objects');
var cons = require('../../object_stream_constants');
var insp = function(v){console.log(require('util').inspect(v, {depth: null}))};

module.exports = InputStream;

function InputStream(buf, withType) {
  this.withType = !!withType;
  this.in = ByteBuffer.wrap(buf);
  this._refs = [];
  this._readHeader();
}

InputStream.addObject = function (classname, convertor) {
  // convertor must impl `readObject(io, obj, withType)` or `writeObject(io, obj, withType)`
  if (typeof convertor.readObject !== 'function' && typeof convertor.writeObject !== 'function') {
    throw new Error('convertor must implement readObject() or writeObject()');
  }
  objects[classname] = convertor;
};

InputStream.decode = InputStream.read = InputStream.readObject = function (buf, withType) {
  return new InputStream(buf, withType)._readContent();
};

var proto = InputStream.prototype;

proto.read = proto._readContent = function () {
  // contents:
  //   content
  //   contents content
  //
  // content:
  //   object
  //   blockdata

  var type = this.in.get(this.in.position());

  if (type === undefined) {
    return undefined;
  }

  if (type === cons.TC_BLOCKDATA) {
    return this._readBlockDataShort();
  }

  if (type === cons.TC_BLOCKDATALONG) {
    return this._readBlockDataLong();
  }

  return this._readObject();
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
  var type = this.in.get();

  if (type === cons.TC_OBJECT) {
    debug('got TC_OBJECT');
    return this._readNewObject();
  } else if (type === cons.TC_CLASS) {
    debug('got TC_CLASS');
    return this._readNewClass();
  } else if (type === cons.TC_ARRAY) {
    debug('got TC_ARRAY');
    return this._readNewArray();
  } else if (type === cons.TC_STRING) {
    debug('got TC_STRING');
    return this._readNewString();
  } else if (type === cons.TC_LONGSTRING) {
    debug('got TC_LONGSTRING');
    return this._readNewLongString();
  } else if (type === cons.TC_ENUM) {
    debug('got TC_ENUM');
    return this._readNewEnum();
  } else if (type === cons.TC_CLASSDESC) {
    debug('got TC_CLASSDESC');
    return this._readClassDesc();
  } else if (type === cons.TC_REFERENCE) {
    debug('got TC_REFERENCE');
    var obj = this._readPrevObject();
    // TODO 需要做这个判定？
    return this.withType || obj.$ === undefined ? obj : obj.$;
  } else if (type === cons.TC_NULL) {
    debug('got TC_NULL');
    return null;
  } else if (type === cons.TC_EXCEPTION) {
    debug('got TC_EXCEPTION');
    return this._readException();
  } else if (type === cons.TC_RESET) {
    debug('got TC_RESET');
    return this._readReset();
  } else {
    throw new Error('unkow type: 0x' + type.toString(16));
  }
};

proto._readNewObject = function () {
  debug('[newObject] ----- start -----');
  // newObject:
  //   TC_OBJECT classDesc newHandle classdata[]  // data for each class
  var obj = {
    $class: {},
    $fields: [],
    $serialVersionUID: '',
    $: {}
  };

  // classDesc
  var classDesc = this._readClassDesc();
  debug('[newObject] got class: %j', classDesc.name);

  obj.$class = classDesc;
  obj.$fields = concatFields(classDesc);

  // newHandle
  this._newHandle(obj);

  this._readClassData(obj);

  debug('[newObject] ---- end ----\n got %j, %d fields', classDesc.name, obj.$fields.length);
  var isPrimitive = !!(classDesc.name.indexOf('java.lang.') === 0
    && obj.$fields.length === 1
    && obj.$fields[0].name === 'value')

  return this.withType ? obj : (isPrimitive ? obj.$.value : obj.$);
};

proto._readNewClass = function() {
  // newClass:
  //   TC_CLASS classDesc newHandle
  throw new Error('Not implement _readNewClass()');
};

proto._readNewArray = function () {
  // newArray:
  //   TC_ARRAY classDesc newHandle (int)<size> values[size]
  var obj = {
    $class: null,
    $serialVersionUID: '',
    $: []
  };

  // classDesc
  obj.$class = this._readClassDesc();

  this._newHandle(obj);

  // (int)<size> values[size]
  this._readArrayItems(obj);

  return this.withType ? obj : obj.$;
};

proto._readNewString = function () {
  // newString:
  //   TC_STRING newHandle (utf)
  //   TC_LONGSTRING newHandle (long-utf)
  var str = this._readUTFString();
  this._newHandle(str);
  return str;
};

proto._readNewLongString = function() {
  // newString:
  //   TC_STRING newHandle (utf)
  //   TC_LONGSTRING newHandle (long-utf)
  var str = this._readUTFString(true);
  this._newHandle(str);
  return str;
}

proto._readNewEnum = function () {
  // newEnum:
  //   TC_ENUM classDesc newHandle enumConstantName
  var classDesc = this._readClassDesc();
  var obj = {
    $class: classDesc,
    $: {}
  };
  this._newHandle(obj);

  // enumConstantName:
  //   (String)object
  obj.$.name = this._readContent();
  return this.withType ? obj : obj.$;
};

proto._readNewClassDesc = function () {
  debug('[newClassDesc] --- start ---');
  // newClassDesc:
  //   TC_CLASSDESC className serialVersionUID newHandle classDescInfo
  //   TC_PROXYCLASSDESC newHandle proxyClassDescInfo
  //console.log('-----> pos1:', this.in.position())
  var name = this._readUTFString(false)
  //console.log('-----> pos2:', this.in.position())
  var svuid = this.readLong().toString()
  //console.log('-----> pos3:', this.in.position())

  var desc = {
    name: name, // className
    serialVersionUID: svuid, // serialVersionUID
    flags: 0, //this.readByte(), // classDescFlags
    fields: [],
    superClass: null,
  };
  // newHandle:       // The next number in sequence is assigned
  //                // to the object being serialized or deserialized
  this._newHandle(desc);

  debug('[newClassDesc] --- %s ---', desc.name);

  // classDescInfo
  this._readClassDescInfo(desc);

  debug('[newClassDesc] --- end --- got class: %j', desc);
  return desc;
};

proto._readPrevObject = function () {
  // prevObject
  //   TC_REFERENCE (int)handle
  var ref = this.readInt() - cons.baseWireHandle;
  var obj = this._refs[ref];
  if (obj.$isPrimitive) {
    obj = obj.$.value;
  }
  debug('_readRrevObject() ref:%d, %j', ref, obj);
  return obj;
};

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
  //   (ClassDesc)prevObject      // an object required to be of type
  //                              // ClassDesc
  var type = this.in.get();

  var classDesc;
  if (type === cons.TC_CLASSDESC) {
    debug('_readClassDesc() got TC_CLASSDESC ==> newClassDesc ------------');
    classDesc = this._readNewClassDesc();
  } else if (type === cons.TC_REFERENCE) {
    debug('_readClassDesc() got TC_REFERENCE ==> prevObject ------------');
    classDesc = this._readPrevObject();
  } else if (type === cons.TC_NULL) {
    debug('_readClassDesc() got null');
    classDesc = null;
  } else {
    throw new Error('unknow type on _readClassDesc: ' + type);
  }
  return classDesc;
};

proto._readArrayItems = function (obj) {
  // (int)<size> values[size]
  var size = this.readInt();
  obj.$size = size;
  debug('_readArrayItems() got size: %d', size);

  // values:          // The size and types are described by the
  //                // classDesc for the current object
  var type = obj.$class.name[1];
  // [I
  for (var i = 0; i < size; i++) {
    obj.$.push(this._readFieldValue({type: type}));
  }
  return obj;
};

function concatFields(classDesc) {
  if (!classDesc.superClass) {
    return classDesc.fields;
  } else {
    return concatFields(classDesc.superClass).concat(classDesc.fields);
  }
}

proto.defaultReadObject = function (obj, withType) {
  for (var i = 0; i < obj.$fields.length; i++) {
    var field = obj.$fields[i];
    var val = this._readFieldValue(field, withType);
    debug('defaultReadObject() => _readFieldValue() got field [%s: %j]', field.name, val);
    obj.$[field.name] = val;
  }
  // try to detect TC_BLOCKDATA
  var type = this.in.get(this.in.position());
  if (type === cons.TC_BLOCKDATA) {
    this.in.skip(1);
    var size = this.in.get();
    debug('defaultReadObject() => TC_BLOCKDATA start, size %d bytes', size);
  }
};

proto._readNowrclass = function (obj) {
  debug('[nowrclass] --- start ---, %d fields', obj.$fields.length);
  // nowrclass:
  //   values                    // fields in order of class descriptor
  this.defaultReadObject(obj);
  debug('[nowrclass] --- end ---');
};

proto._readObjectAnnotation = function (obj) {
  debug('[objectAnnotation] --- start ---');
  // objectAnnotation: like ArrayList, HashMap
  //   endBlockData
  //   contents endBlockData     // contents written by writeObject
  //                             // or writeExternal PROTOCOL_VERSION_2.
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
    debug('TC_BLOCKDATA start, size %d bytes', size);
  }

  var name = obj.$class.name;
  objects[name].readObject(this, obj);

  // TC_ENDBLOCKDATA
  assert.equal(this.in.get(), cons.TC_ENDBLOCKDATA,
    'SC_WRITE_METHOD object should end with TC_ENDBLOCKDATA');
  debug('[objectAnnotation] end with TC_ENDBLOCKDATA');
};

proto._readClassData = function (obj) {
  debug('[classdata] --- start ---');
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

  if (debug.enabled) {
    debug('%s classDescFlag: 0x%s', classname, flags.toString(16));
    debug('SC_SERIALIZABLE: %s', flags & cons.SC_SERIALIZABLE);
    debug('SC_EXTERNALIZABLE: %s', flags & cons.SC_EXTERNALIZABLE);
    debug('SC_WRITE_METHOD: %s', flags & cons.SC_WRITE_METHOD);
    debug('SC_BLOCKDATA: %s', flags & cons.SC_BLOCKDATA);
    debug('SC_ENUM: %s', flags & cons.SC_ENUM);
  }

  if (flags & cons.SC_SERIALIZABLE) {
    if (obj.$class.flags & cons.SC_WRITE_METHOD) {
      debug('[classdata] => wrclass objectAnnotation, SC_WRITE_METHOD');
      // wrclass objectAnnotation

      // wrclass
      // this._readWrclass(obj);
      // objectAnnotation
      this._readObjectAnnotation(obj);
    } else {
      // nowrclass
      this._readNowrclass(obj);
    }
  }

  debug('[classdata] --- end ---');
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
  debug('_readFieldValue %j', field);
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
    return this._readContent(withType);
  case '[':
    var obj = {
      $class: {
        name: field.classname,
      },
      $serialVersionUID: '',
      $: []
    };
    return this._readArrayItems(obj, withType);
  default:
    throw new Error('unknow type of field: ' + JSON.stringify(field));
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
  var fields = [];
  var count = this.readShort();
  debug('_readFields() start read %d fields', count);
  for (var i = 0; i < count; i++) {
    var field = this._readFieldDesc();
    fields.push(field);
  }
  return fields;
};

proto._readClassAnnotation = function () {
  // classAnnotation:
  //   endBlockData
  //   contents endBlockData      // contents written by annotateClass
  var type = this.in.get();
  // if (type === cons.TC_CLASSDESC) {
  //   // read superClassDesc
  //   debug('_readClassAnnotation() start to read superClass');
  //   desc.superClass = this._readClassDesc();
  // } else
  if (type === cons.TC_ENDBLOCKDATA) {
    debug('[classAnnotation] hit TC_ENDBLOCKDATA');
    // desc.superClass = this._readContent();
  } else {
    throw new Error('unkow type: 0x' + type.toString(16));
  }
};

proto._readSuperClassDesc = function () {
  // superClassDesc:
  //   classDesc
  debug('[superClass] --- start ---');
  var superClass = this._readClassDesc();
  debug('[superClass] --- end ---, got %j', superClass);
  return superClass;
};

proto._readClassDescInfo = function (desc) {
  // classDescInfo:
  //   classDescFlags fields classAnnotation superClassDesc

  // classDescFlags
  desc.flags = this._readClassDescFlags();

  // fields
  desc.fields = this._readFields();

  // classAnnotation
  this._readClassAnnotation();

  // superClassDesc
  desc.superClass = this._readSuperClassDesc();
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

  if (field.type === '[' || field.type === 'L') {
    field.classname = this._readContent();
  }

  debug('_readFieldDesc() got field: %j', field);
  return field;
};

proto._readUTFString = function (isLong) {
  // Note that the symbol (utf) is used to designate a string written using 2-byte length information,
  // and (long-utf) is used to designate a string written using 8-byte length information.

  var len = isLong ? this.in.getLong().toNumber() : this.in.getUInt16();
  //console.log('stringlen:', len.toString(16), this.in.position())
  var str = this.in.read(len).toString();
  debug('_readUTFString(%s) got %d bytes string', isLong, len);
  return str;
};

proto._newHandle = function (o) {
  debug('_newHandle() %d: %j', this._refs.length, o);
  this._refs.push(o);
};

proto._readHeader = function () {
  // magic version contents
  var magic = this.readShort();
  var version = this.readShort();
  if (magic !== cons.STREAM_MAGIC || version !== cons.STREAM_VERSION) {
    var err = new Error('invaild stream header: 0x'
      + magic.toString(16) + ' 0x' + version.toString(16));
    err.name = 'InvaildStreamHeaderError';
    throw err;
  }
};

// readXXX

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
