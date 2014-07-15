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
  this._writeHeader();
}


// TODO is this method required ?
OutputStream.addObject = function (classname, convertor) {
  // convertor must impl `readObject(io, obj, withType)` or `writeObject(io, obj, withType)`
  if (typeof convertor.readObject !== 'function' && typeof convertor.writeObject !== 'function') {
    throw new Error('convertor must implement readObject() or writeObject()');
  }
  objects[classname] = convertor;
};


OutputStream.encode = OutputStream.write = OutputStream.writeObject = function (o) {
  return new OutputStream()._writeContent(o);
};


var proto = OutputStream.prototype;


proto.write = proto._writeContent = function(o) {
  var out = this.out;
  out.position(4);

  if (o === null) {
    this._writeNullReference(o);

  } else {
    o = this._wrap(o);
    var cls = o.$class;

    if (cls === 'java.lang.String') {
      this._writeNewString(o);
    }
  }

  var ret = new Buffer(out.position());
  this.buf.copy(ret);
  return ret;
};


proto._wrap = function(o) {
  var type = typeof o;
  if (type === 'string') {
    return {
      $class: 'java.lang.String',
      $: o
    }
  } else {
    return o;
  }
};


proto._writeNullReference = function(o) {
  // nullReference:
  //   TC_NULL
  this.out.put(cons.TC_NULL);
};


proto._writeNewString = function(o) {
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
};


proto._writeHeader = function() {
  this.out.putUInt16(cons.STREAM_MAGIC);
  this.out.putUInt16(cons.STREAM_VERSION);
};







