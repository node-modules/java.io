'use strict';


var debug = require('debug')('java.io:objects:array_list');

exports.readObject = function (io, obj) {

    debug('>> readObject');
    io.defaultReadObject(obj);

    io.readByte();  // ??
    
    return obj;
};