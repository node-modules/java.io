'use strict';

var debug = require('debug')('java.io:objects:tree_set');

exports.readObject = function(io, obj) {
  debug('>> tree_map readObject');
  io.defaultReadObject(obj);
  io.readBlockHeader();

  var size = io.in.getInt();

  debug('<< readObject | size = %d', size);

  var map = {};
  var key, val;
  for (var i = 0; i < size; ++i) {
    key = io._readContent();
    val = io._readContent();
    map[key] = val;
  }
  obj._$ = map;
  return obj;
};

exports.writeObject = function(io, obj) {
  io.defaultWriteObject(obj);
  io.writeBlockHeader(4);

  var keys = Object.keys(obj._$);
  var size = keys.length;
  io.out.putInt(size);

  for (var i = 0; i < size; ++i) {
    io._writeObject(keys[i]);
    io._writeObject(obj._$[keys[i]]);
  }
};
