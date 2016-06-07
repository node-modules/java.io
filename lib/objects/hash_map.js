'use strict';

/**
 * Module dependencies.
 */

var debug = require('debug')('java.io:objects:hash_map');

/**
 * Save the state of the <tt>HashMap</tt> instance to a stream (i.e.,
 * serialize it).
 *
 * @serialData The <i>capacity</i> of the HashMap (the length of the
 *         bucket array) is emitted (int), followed by the
 *         <i>size</i> (an int, the number of key-value
 *         mappings), followed by the key (Object) and value (Object)
 *         for each key-value mapping.  The key-value mappings are
 *         emitted in no particular order.
 */
// exports.writeObject = function (s) {
// Iterator<Map.Entry<K,V>> i =
//     (size > 0) ? entrySet0().iterator() : null;
//
// // Write out the threshold, loadfactor, and any hidden stuff
// s.defaultWriteObject();
//
// // Write out number of buckets
// s.writeInt(table.length);
//
// // Write out size (number of Mappings)
// s.writeInt(size);
//
//     // Write out keys and values (alternating)
// if (i != null) {
//     while (i.hasNext()) {
//     Map.Entry<K,V> e = i.next();
//     s.writeObject(e.getKey());
//     s.writeObject(e.getValue());
//     }
//     }
// }

/**
 * Reconstitute the <tt>HashMap</tt> instance from a stream (i.e.,
 * deserialize it).
 */
exports.readObject = function (io, obj) {
  // Read in the threshold, loadfactor, and any hidden stuff
  // s.defaultReadObject();

  // Read in number of buckets and allocate the bucket array;
  // int numBuckets = s.readInt();
  // table = new Entry[numBuckets];
  //
  // init();  // Give subclass a chance to do its thing.
  //
  // // Read in size (number of Mappings)
  // int size = s.readInt();
  //
  // // Read the keys and values, and put the mappings in the HashMap
  // for (int i=0; i<size; i++) {
  //     K key = (K) s.readObject();
  //     V value = (V) s.readObject();
  //     putForCreate(key, value);
  // }
  debug('>> hash_map readObject');
  io.defaultReadObject(obj);

  io.readBlockHeader();
  var numBuckets = io.readInt();
  var size = io.readInt();

  var map = {};
  for (var i = 0; i < size; i++) {
    map[io._readContent()] = io._readContent();
  }

  debug('<< readObject | numBuckets = %d, size = %d', numBuckets, size);

  obj._$ = map;
  return obj;
};

exports.writeObject = function(io, obj) {
  io.defaultWriteObject(obj);

  io.writeBlockHeader(8);
  var size = Object.keys(obj._$).length;
  var capacity = 16;
  if (obj.$.threshold && obj.$.loadFactor) {
    capacity = Math.round(obj.$.threshold / obj.$.loadFactor);
  } else {
    while(capacity * 3 / 4 < size) {
      capacity = capacity * 2;
    }
  }
  io.out.putInt(capacity);
  io.out.putInt(size);

  for (var i in obj._$) {
    io.writeObject(i);
    io.writeObject(obj._$[i]);
  }
}
