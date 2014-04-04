/**!
 * java.io - lib/types.js
 *
 * Copyright(c) fengmk2 and other contributors.
 * MIT Licensed
 *
 * Authors:
 *   fengmk2 <fengmk2@gmail.com> (http://fengmk2.github.com)
 */

'use strict';

/**
 * Module dependencies.
 */

var Long = require('long');

exports.Long = Long;

exports.JavaString = function JavaString(val) {
  this.value = val ? String(val) : null;
};
exports.JavaString.$class = 'java.lang.String';

exports.JavaObjectArray = function JavaObjectArray(vals) {
  this.value = vals;
};
exports.JavaObjectArray.$class = '[Ljava.lang.Object;';
exports.JavaObjectArray.$signature = '[Ljava/lang/Object;';
exports.JavaObjectArray.serialVersionUID = Long.fromString('-8012369246846506644');

function JavaArrayList() {
  this.value = [];
  this.size = 0;
}

JavaArrayList.$class = '[Ljava.util.ArrayList;';

/**
 * Reconstitute the <tt>ArrayList</tt> instance from a stream (that is,
 * deserialize it).
 */
JavaArrayList.prototype.readObject = function (desc, s) {
  // Read in size, and any hidden stuff
	s.defaultReadObject(this, desc);
  // Read in array length and allocate array
  var arrayLength = s.readInt();
  // console.log(arrayLength)
  // var a = elementData = new Object[arrayLength];

	// Read in all elements in the proper order.
	for (var i = 0; i < this.size; i++) {
    this.value.push(s.readObject());
  }
};

JavaArrayList.prototype.writeObject = function () {

};

exports.JavaArrayList = JavaArrayList;

exports.Classes = {
  'java.util.ArrayList': JavaArrayList,
};
