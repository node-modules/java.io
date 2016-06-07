'use strict';

/**
 * Module dependencies.
 */

var debug = require('debug')('java.io:objects:array_list');

/**
 * Save the state of the <tt>ArrayList</tt> instance to a stream (that
 * is, serialize it).
 *
 * @serialData The length of the array backing the <tt>ArrayList</tt>
 *             instance is emitted (int), followed by all of its elements
 *             (each an <tt>Object</tt>) in the proper order.
 */
// exports.writeObject = function (out) {
//   // Write out element count, and any hidden stuff
//   int expectedModCount = modCount;
//   s.defaultWriteObject();
//
//       // Write out array length
//       s.writeInt(elementData.length);
//
//   // Write out all elements in the proper order.
//   for (int i=0; i<size; i++)
//           s.writeObject(elementData[i]);
//
//   if (modCount != expectedModCount) {
//           throw new ConcurrentModificationException();
//       }
//
// }

/**
 * Reconstitute the <tt>ArrayList</tt> instance from a stream (that is,
 * deserialize it).
 */
exports.readObject = function (io, obj) {
  // // Read in size, and any hidden stuff
  // io.defaultReadObject();
  //
  // // Read in array length and allocate array
  // int arrayLength = s.readInt();
  // Object[] a = elementData = new Object[arrayLength];
  //
  // // Read in all elements in the proper order.
  // for (int i=0; i<size; i++)
  //   a[i] = s.readObject();
  // }

  debug('>> readObject');
  io.defaultReadObject(obj);

  io.readBlockHeader();
  var items = [];
  var capacity = obj.$.capacity = io.readInt();
  var size = obj.$.size;

  for (var i = 0; i < size; i++) {
    items.push(io._readContent());
  }

  obj._$ = items;
  debug('<< readObject | capacity = %d, size = %d, items = %j', capacity, size, items);
  return obj;
};

exports.writeObject = function(io, obj) {
  io.defaultWriteObject(obj);

  io.writeBlockHeader(4);
  var capacity = obj.$.capacity || obj._$.length
  io.out.putInt(capacity);

  obj._$.forEach(function(el) {
    io.writeObject(el);
  });
}
