'use strict';

var numCls = {
  name : 'java.lang.Number',
  serialVersionUID : '-8742448824652078965',
  flags : 2,
  fields : [],
  superClass : null
}

var primitiveClsDesc = {

  'boolean' : {
    name : 'java.lang.Boolean',
    serialVersionUID : '-3665804199014368530',
    flags : 2,
    fields : [{
      type : 'Z',
      name : 'value'
    }],
    superClass : null
  },

  'char' : {
    name : 'java.lang.Character',
    serialVersionUID : '3786198910865385080',
    flags : 2,
    fields : [{
      type : 'C',
      name : 'value'
    }],
    superClass : null
  },

  'byte' : {
    name : 'java.lang.Byte',
    serialVersionUID : '-7183698231559129828',
    flags : 2,
    fields : [{
      type : 'B',
      name : 'value'
    }],
    superClass : numCls
  },

  'int' : {
    name : 'java.lang.Integer',
    serialVersionUID : '1360826667806852920',
    flags : 2,
    fields : [{
      type : 'I',
      name : 'value'
    }],
    superClass : numCls
  },

  'short' : {
    name : 'java.lang.Short',
    serialVersionUID : '7515723908773894738',
    flags : 2,
    fields : [{
      type : 'S',
      name : 'value'
    }],
    superClass : numCls
  },

  'long' : {
    name : 'java.lang.Long',
    serialVersionUID : '4290774380558885855',
    flags : 2,
    fields : [{
      type : 'J',
      name : 'value'
    }],
    superClass : numCls
  },

  'float' : {
    name : 'java.lang.Float',
    serialVersionUID : '-2671257302660747028',
    flags : 2,
    fields : [{
      type : 'F',
      name : 'value'
    }],
    superClass : numCls
  },

  'double' : {
    name : 'java.lang.Double',
    serialVersionUID : '-9172774392245257468',
    flags : 2,
    fields : [{
      type : 'D',
      name : 'value'
    }],
    superClass : numCls
  }
}

var arrayClsDesc = {

  'boolean' : {
    name: '[Z',
    serialVersionUID: '6309297032502205922',
    flags: 2,
    fields: [],
    superClass: null
  },

  'char' : {
    name : '[C',
    serialVersionUID : '-5753798564021173076',
    flags : 2,
    fields : [],
    superClass : null
  },

  'byte' : {
    name: '[B',
    serialVersionUID: '-5984413125824719648',
    flags: 2,
    fields: [],
    superClass: null
  },

  'int' : {
    name: '[I',
    serialVersionUID: '5600894804908749477',
    flags: 2,
    fields: [],
    superClass: null
  },

  'short' : {
    name: '[S',
    serialVersionUID: '-1188055269542874886',
    flags: 2,
    fields: [],
    superClass: null
  },

  'long' : {
    name: '[J',
    serialVersionUID: '8655923659555304851',
    flags: 2,
    fields: [],
    superClass: null
  },

  'float' : {
    name: '[F',
    serialVersionUID: '836686056779680834',
    flags: 2,
    fields: [],
    superClass: null
  },

  'double' : {
    name: '[D',
    serialVersionUID: '4514449696888150558',
    flags: 2,
    fields: [],
    superClass: null
  },

  'string' : {
    name : '[Ljava.lang.String;',
    serialVersionUID : '-5921575005990323385',
    flags : 2,
    fields : [],
    superClass : null
  }
}

var mapCls = {
  name: 'java.util.HashMap',
  serialVersionUID: '362498820763181265',
  flags: 3,
  fields:
   [ { type: 'F', name: 'loadFactor' },
     { type: 'I', name: 'threshold' } ],
  superClass: null
}


/**
 * @param obj
 * @param [type]
 * @return        standard object with whole info
 */
function normalize(obj, type) {
  var ret = obj;
  if (obj === null || typeof obj === 'string') {
    ret = obj;
  } else if (typeof obj === 'boolean') {
    ret = {
      '$' : { value : obj },
      '$class' : primitiveClsDesc.boolean
    }
  } else if (typeof obj === 'number') {
    var isInt = Math.ceil(obj) === Math.floor(obj);
    if (!isInt && !type) {
      throw new Error('Cannot dicide obj type');
    }
    type = type || 'int';

    if (type in primitiveClsDesc) {
      ret = {
        '$' : { value : obj },
        '$class' : primitiveClsDesc[type]
      }

    } else {
      throw new Error('Illegal obj type');
    }
  } else if (Array.isArray(obj)) {
    if (!type) {
      throw new Error('Argument type is required when pass an array in');
    }

    if (type in arrayClsDesc) {
      ret = {
        '$' : obj,
        '$class' : arrayClsDesc[type]
      }
    } else {
      throw new Error('Cannot handle non-primitive array');
    }
  } else if (obj.toString() === '[object Object]') {
    if (!type) {
      throw new Error('Argument type is required when pass an object in');
    }

    if (type in primitiveClsDesc || type === 'string') {
      var values = {};
      for (var i in obj) {
        values[i] = normalize(obj[i], type);
      }
      ret = {
        '_$' : values,
        '$': { loadFactor: 0.75, threshold: getThreshold(obj)},
        '$class' : mapCls
      }
    } else {
      throw new Error('Cannot handle non-primitive object');
    }
  } else {
    throw new Error('Cannot handle obj');
  }

  return ret;
}


function getThreshold(obj) {
  var len = Object.keys(obj).length;
  var ret = Math.ceil(len / 8) * 6;  //*Math.ceil(amount / 8) * 8 * 0.75*/
  return ret < 12 ? 12 : ret
}

module.exports = normalize;
