'use strict';

/**
 * Module dependencies.
 */

var objects = require('./objects');

// Object Serialization Stream Protocol:
// http://docs.oracle.com/javase/6/docs/platform/serialization/spec/protocol.html

exports.InputObjectStream = require('./input');
exports.OutputObjectStream = require('./output');

exports.addObject = function (classname, convertor) {
  // convertor must impl `readObject(io, obj, withType)` or `writeObject(io, obj, withType)`
  if (typeof convertor.readObject !== 'function' && typeof convertor.writeObject !== 'function') {
    throw new Error('Convertor must implement readObject() or writeObject()');
  }
  objects[classname] = convertor;
}

exports.normalize = require('./normalize');

exports.constants = require('./constants');
