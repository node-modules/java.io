'use strict';

var debug = require('debug')('java.io:objects:tree_set');

exports.readObject = function(io, obj) {
  debug('>> tree_set readObject');
  io.defaultReadObject(obj);
  var comparator = io._readContent();

  io.readBlockHeader();
  var size = io.in.getInt();

  debug('<< readObject | comparator = %j, size = %d', comparator, size);

  var array = [];
  for (var i = 0; i < size; ++i) {
    array.push(io._readContent());
  }
  obj._$ = array;
  return obj;
};

exports.writeObject = function(io, obj) {
  io.defaultWriteObject(obj);
  io._writeNull();

  io.writeBlockHeader(4);
  var size = obj._$.length;
  io.out.putInt(size);

  for (var i = 0; i < size; ++i) {
    io._writeObject(obj._$[i]);
  }
};
