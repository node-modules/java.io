'use strict';

var debug = require('debug')('java.io:objects:hash_set');

exports.readObject = function(io, obj) {
  debug('>> hash_set readObject');
  io.defaultReadObject(obj);
  io.readBlockHeader();

  var capacity = io.in.getInt();
  if (capacity < 0) {
    throw new Error('Illegal capacity: ' + capacity);
  }

  var loadFactor = io.in.getFloat();
  if (loadFactor <= 0 || isNaN(loadFactor)) {
    throw new Error('Illegal load factor: ' + loadFactor);
  }

  var size = io.in.getInt();
  if (size < 0) {
    throw new Error('Illegal size: ' + size);
  }

  debug('<< readObject | capacity = %d, loadFactor = %s, size = %d', capacity, loadFactor, size);

  var array = [];
  for (var i = 0; i < size; ++i) {
    array.push(io._readContent());
  }
  obj._$ = array;
  return obj;
};

exports.writeObject = function(io, obj) {
  io.defaultWriteObject(obj);
  io.writeBlockHeader(12);

  var size = obj._$.length;
  var capacity = 16;
  var loadFactor = 0.75;
  while (capacity * 3 / 4 < size) {
    capacity = capacity * 2;
  }

  io.out.putInt(capacity);
  io.out.putFloat(loadFactor);
  io.out.putInt(size);

  for (var i = 0; i < size; ++i) {
    io._writeObject(obj._$[i]);
  }
};
