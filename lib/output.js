'use strict';

/**
 * Module dependencies.
 */

var debug = require('debug')('java.io:output');
var ByteBuffer = require('byte');
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

proto.writeInt = function (val) {
  this.out.putUInt(val);
  return this;
};

proto.writeBoolean = function (val) {
  this.out.put(val ? 1 : 0);
  return this;
};

proto.writeLong = function (val) {
  this.out.putLong(val);
  return this;
};

proto._writeObject = function(obj) {
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

  if (obj === null || obj === undefined) {
    this._writeNull();
  } else if ((handle = this._lookupHandle(obj)) !== -1) {
    this._writeHandle(handle);
  // } else if (obj instanceof Class) {
    // writeClass((Class) obj);
  // } else if (obj instanceof ObjectStreamClass) {
    // writeClassDesc((ObjectStreamClass) obj);
  } else if (typeof obj === 'string') {
    this._writeString(obj);
  } else if (isEnum(obj)) {
    this._writeEnum(obj);
  } else if (isArray(obj)) {
    this._writeArray(obj);
  } else {
    this._writeOrdinaryObject(obj);
  }
}


proto._writeOrdinaryObject = function(obj) {
  // newObject:
  //   TC_OBJECT classDesc newHandle classdata[]  // data for each class

  var out = this.out;
  out.put(cons.TC_OBJECT);
  this._writeClassDesc(obj.$class);
  this._newHandle(obj);
  this._writeSerialData(obj);
}


proto._writeClassDesc = function(desc) {
  // classDesc:
  //   newClassDesc
  //   nullReference
  //   (ClassDesc)prevObject  // an object required to be of type
                              // ClassDesc
  var handle;

  if (!desc) {
    this._writeNull();
  } else if ((handle = this._lookupHandle(desc)) !== -1) {
    this._writeHandle(handle);
  // } else if (desc.isProxy()) {
  //   writeProxyDesc(desc);
  } else {
    this._writeNonProxyDesc(desc);
  }
}


proto._writeProxyDesc = function (desc) {
  // newClassDesc:
  //   TC_PROXYCLASSDESC newHandle proxyClassDescInfo
  throw new Error('Not implement _writeProxyDesc()');
}


proto._writeNonProxyDesc = function (desc) {
  // newClassDesc:
  //   TC_CLASSDESC className serialVersionUID newHandle classDescInfo

  var out = this.out
  out.put(cons.TC_CLASSDESC);
  this._newHandle(desc);
  this._writeUTF(desc.name);
  out.putLong(desc.serialVersionUID);
  this._writeClassDescInfo(desc);
}


proto._writeClassDescInfo = function(desc) {
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
  this._writeClassDesc(desc.superClass);
}


proto._writeTypeString = function(str) {
  var handle;
  if (!str) {
       this._writeNull();
  } else if ((handle = this._lookupHandle(str)) !== -1) {
       this._writeHandle(handle);
  } else {
       this._writeString(str);
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
  var flags = obj.$class.flags;
  var className = obj.$class.name;
  var superClass = obj.$class.superClass;

  // try to detect class have writeObject or not, (its own method or inherited from superClass)
  while (superClass) {
    flags |= superClass.flags;
    superClass = superClass.superClass;
  }
  debug('_writeSerialData() %s flags: %s, SC_SERIALIZABLE: %s, SC_WRITE_METHOD: %s',
    className, flags, flags & cons.SC_SERIALIZABLE, flags & cons.SC_WRITE_METHOD);

  if (flags & cons.SC_SERIALIZABLE) {
    var customObject = objects[className];
    var hasWriteObjectMethod = customObject && customObject.writeObject;
    if (flags & cons.SC_WRITE_METHOD) {
      if (hasWriteObjectMethod) {
        customObject.writeObject(this, obj);
        out.put(cons.TC_ENDBLOCKDATA);
      } else {
        throw new Error('Class "'+ className + '" dose not be added in or not implement writeObject()');
      }
    } else {
      if (hasWriteObjectMethod) {
        customObject.writeObject(this, obj);
        out.put(cons.TC_ENDBLOCKDATA);
      } else {
        this._defaultWriteFields(obj);
      }
    }

  } else if (flags & cons.SC_EXTERNALIZABLE) {
    if (flags & cons.SC_BLOCK_DATA) {
      throw new Error('Not implement writeObjectAnnotation()');

    } else {
      throw new Error('Not implement writeExternalContents()');
    }
  } else {
    throw new Error('Illegal flags: ' + flags);
  }

}


proto._defaultWriteFields = function(obj) {
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


proto.defaultWriteObject = function(obj) {
  this._defaultWriteFields(obj);
}

// Writes block data header.
// http://docs.oracle.com/javase/6/docs/platform/serialization/spec/protocol.html#10258
// blockdata:
//   blockdatashort
//   blockdatalong
//
// blockdatashort:
//   TC_BLOCKDATA (unsigned byte)<size> (byte)[size]
// blockdatalong:
//   TC_BLOCKDATALONG (int)<size> (byte)[size]
proto.writeBlockHeader = function(len) {
  if (len <= 0xFF) {
    // Data blocks shorter than 256 bytes are prefixed with a 2-byte header;
    this.out.put(new Buffer([cons.TC_BLOCKDATA, len]));
  } else {
    // All others start with a 5-byte header.
    // TC_BLOCKDATALONG
    this.out.put(new Buffer([cons.TC_BLOCKDATALONG]));
    this.out.putInt(len);
  }
}

proto._writeEnum = function(obj) {
  // newEnum:
  //   TC_ENUM classDesc newHandle enumConstantName
  var out = this.out;
  out.put(cons.TC_ENUM);

  var desc = obj.$class;
  var sdesc = desc.superClass;
  this._writeClassDesc(sdesc.name === 'java.lang.Enum' ? desc : sdesc, false);
  this._newHandle(obj);
  this._writeString(obj.$.name);
}


proto._writeArray = function(obj) {
  // newArray:
  //   TC_ARRAY classDesc newHandle (int)<size> values[size]
  var that = this;
  var out = this.out;
  out.put(cons.TC_ARRAY);
  this._writeClassDesc(obj.$class);
  this._newHandle(obj);

  var values = obj.$;
  out.putInt(values.length);
  if (isElementPrimitive(obj)) {
    values.forEach(function(el) {
      that._writePrimitive(obj.$class.name[1], el);
    })
  } else {
    values.forEach(function(el) {
      that._writeObject(el);
    });
  }
}


proto._writeNull = function() {
  // nullReference:
  //   TC_NULL
  this.out.put(cons.TC_NULL);
}


proto._writeString = function(str) {
  // newString:
  //   TC_STRING newHandle (utf)
  //   TC_LONGSTRING newHandle (long-utf)

  var out = this.out;
  var bf = new Buffer(str);
  var len = bf.length;

  this._newHandle(str);

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
    if (desc.name === 'java.lang.Enum') { return true; }
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
