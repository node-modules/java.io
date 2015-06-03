'use strict';

/**
 * Module dependencies.
 */

var javaio = require('../../../../lib/');

javaio.addObject('com.test.services.TestLargeData', {
  readObject: function (io, obj) {
    io.readBlockHeader();
    var serialization = io.readByte();
    var size = io.readInt();
    var buf = new Buffer(size);
    // 前面 serialization 和 size 已经读取了5个字节
    io.readFully(buf, size, 5);
    obj.$ = extractNoZip(buf);
  }
});

// NSwizzle
function extractNoZip(/**byte[]*/ bytes) {
  // 反序列化通信层对象
  return javaio.InputObjectStream.readObject(bytes);
}
