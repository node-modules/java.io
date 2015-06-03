var ObjectInputStream = require('../lib/input');
var utils = require('./utils');

require('./fixtures/in/object/TestLargeData');

var io3 = new ObjectInputStream(utils.bytes('object/data-1020'));
var obj3 = io3.readObject();
console.info(obj3);
