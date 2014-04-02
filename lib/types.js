/**!
 * outputstream - filepath
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

exports.JavaString = function JavaString(val) {
  this.value = val;
};
exports.JavaString.$class = 'java.lang.String';

exports.JavaObjectArray = function JavaObjectArray(vals) {
  this.value = vals;
};
exports.JavaObjectArray.$class = 'java.lang.Object';
