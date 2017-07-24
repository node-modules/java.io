'use strict';



var debug = require('debug')('java.io:objects:array_list');

exports.readObject = function (io, obj) {

    debug('>> readObject');

    io.defaultReadObject(obj);
    io.readBlockHeader();

    if (obj.$class.serialVersionUID == '0') {
        
        obj.$.dstSavings = 60 * 60 * 1000;
        obj.$.endMode = 2;               // DOWN_IN_MONTH_MODE
        obj.$.startMode = 2;            // DOW_IN_MONTH_MODE
        obj.$.startTimeMode = 0;        // WALL_TIME
        obj.$.endTimeMode = 0;          // WALL_TIME
        obj.$.serialVersionOnStream = 2;
    } else {
        let length = io.readInt();

        let bytes = []

        for(let i = 0; i< length; i++) {
            bytes.push(io.readByte());
        }
        obj.$.startDay = bytes[0];
        obj.$.startDayOfWeek = bytes[1];
        obj.$.endDay = bytes[2];
        obj.$.endDayOfWeek = bytes[3];
    }
    
    return obj;
};