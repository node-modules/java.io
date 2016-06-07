'use strict';

/**
 * Module dependencies.
 */

var debug = require('debug')('java.io:objects:linked_list');

/**
 * Reconstitute the <tt>LinkedList</tt> instance from a stream (that is,
 * deserialize it).
 */
exports.readObject = function (io, obj) {
  // Read in any hidden serialization magic
	// s.defaultReadObject();
  //
  // // Read in size
  // int size = s.readInt();
  //
  // // Initialize header
  // header = new Entry<E>(null, null, null);
  // header.next = header.previous = header;
  //
  // // Read in all elements in the proper order.
  // for (int i=0; i<size; i++)
  //   addBefore((E)s.readObject(), header);

  debug('>> readObject');
  io.defaultReadObject(obj);

  io.readBlockHeader();

  var size = io.readInt();

  var items = [];

  for (var i = 0; i < size; i++) {
    items.push(io.readObject());
  }

  obj.$ = items;
  return obj;
};
