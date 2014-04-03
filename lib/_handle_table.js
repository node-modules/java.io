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
  if (this.refs.indexOf(obj) < 0) {
    this.refs.push(obj);
  }
};

proto.lookup = function (obj) {
  return this.refs.indexOf(obj);
};

proto.clear = function () {
  this.refs = [];
};

module.exports = HandleTable;
