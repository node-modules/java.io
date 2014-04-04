/**!
 * java.io - lib/_handle_table.js
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

function HandleTable() {
  this.refs = [];
}

var proto = HandleTable.prototype;

proto.assign = function (obj) {
  this.refs.push(obj);
  return this.refs.length - 1;
};

proto.lookup = function (obj) {
  return this.refs.indexOf(obj);
};

proto.lookupObject = function (handle) {
  return this.refs[handle];
};

proto.clear = function () {
  this.refs = [];
};

proto.size = function () {
  return this.refs.length;
};

module.exports = HandleTable;
