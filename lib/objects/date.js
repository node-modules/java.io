/**!
 * java.io - lib/serialization/v2/objects/date.js
 *
 * Copyright(c) joeyzhu0422 and other contributors.
 * MIT Licensed
 *
 * Authors:
 *   joeyzhu0422 <joeyzhu0422@gmail.com> (https://github.com/joey0422)
 */
'use strict';

var Long = require('long');

exports.readObject = function (io, obj) {

    io.defaultReadObject(obj);
    io.readBlockHeader();

    var highTime = io.readBytes(4);
    var lowTime = io.readBytes(4);

    var time = new Long(byteBE2Int(lowTime), byteBE2Int(highTime));

//    console.log(time.toString());

    obj.$.time = parseInt(time.toString());

    return obj;
}

exports.writeObject = function(io, obj) {


    io.defaultWriteObject(obj);
    io.writeBlockHeader(8);

    io.writeLong(obj.$.time);


}


function byteBE2Int(bytes) {
    var addr;
    if (bytes.length == 1) {
        addr = bytes[0] & 0xFF;
    } else {
        addr = bytes[0] & 0xFF;
        addr = (addr << 8) | (bytes[1] & 0xFF);
        addr = (addr << 8) | (bytes[2] & 0xFF);
        addr = (addr << 8) | (bytes[3] & 0xFF);
    }
    return addr;
}