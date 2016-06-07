'use strict';

/**
 * Module dependencies.
 */

var io = require('../lib');
var uids = {
  'test.VersionElement': 100,
  'test.SP': 11,
  'test.SE': 121,
  'test.AE': 122
};

io.addObject('test.PP', {
  readObject: function(io, obj) {
    io.defaultReadObject(obj);
    io.readBlockHeader();

    obj.elements = [];

    var count = io.readInt();
    var uid, o;

    for (var i = 0; i < count; i++) {
      uid = io.readInt();
      o = io.readObject();
      obj.elements.push(o);
      if (i < count - 1) {
        io.readBlockHeader();
      }
    }
    return obj;
  },
  writeObject: function(io, obj) {
    io.writeBlockHeader(8);

    var count = obj.elements.length;
    io.writeInt(count);

    for (var i = 0; i < count; i++) {
      io.writeInt(uids[obj.elements[i]['$class'].name]);
      io.writeObject(obj.elements[i]);
      if (i < count - 1) {
        io.writeBlockHeader(4);
      }
    }
  }
});

io.addObject('test.SP', {
  readObject: function(io, obj) {
    io.defaultReadObject(obj);
    io.readBlockHeader();

    obj.elements = [];

    var count = io.readInt();
    var uid, o;

    for (var i = 0; i < count; i++) {
      uid = io.readInt();
      o = io.readObject();
      obj.elements.push(o);
      if (i < count - 1) {
        io.readBlockHeader();
      }
    }
    return obj;
  },
  writeObject: function(io, obj) {
    io.writeBlockHeader(8);

    var count = obj.elements.length;
    io.writeInt(count);

    for (var i = 0; i < count; i++) {
      io.writeInt(uids[obj.elements[i]['$class'].name]);
      io.writeObject(obj.elements[i]);
      if (i < count - 1) {
        io.writeBlockHeader(4);
      }
    }
  }
});

io.addObject('test.AE', {
  readObject: function(io, obj) {
    obj['$'].name = io.readObject();
    obj['$'].value = io.readObject();
    return obj;
  },
  writeObject: function(io, obj) {
    io.writeObject(obj['$'].name);
    io.writeObject(obj['$'].value);
  }
});

io.addObject('java.lang.Throwable', {
  readObject: function(io, obj) {
    io.defaultReadObject(obj);
    return obj;
  },
  writeObject: function(io, obj) {}
});
