'use strict';



var debug = require('debug')('java.io:objects:array_list');

exports.readObject = function (io, obj) {

    debug('>> readObject');

    io.defaultReadObject(obj);
    io.readBlockHeader();

    let buckets = io.readInt(); // not used yet...
    let length = io.readInt();
    for(let i=0; i<length; i++) {
        let key = io.readObject();
        let value = io.readObject();
        obj.$[key] = value;
    }
    
    return obj;
};