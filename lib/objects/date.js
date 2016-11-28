'use strict';

var debug = require('debug')('java.io:objects:date');

exports.readObject = function(io, obj) {
  debug('>> date readObject');
  io.defaultReadObject(obj);
  io.readBlockHeader();

  var fastTime = io.readLong().toNumber();
  debug('<< readObject | fastTime = %s', fastTime);

  obj._$ = new Date(fastTime);
  return obj;
};

exports.writeObject = function(io, obj) {
  io.defaultWriteObject(obj);
  io.writeBlockHeader(8);

  io.writeLong(obj._$.getTime());
};
