/**!
 * outputstream - test/bits.test.js
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

var should = require('should');
var Bits = require('../').Bits;

describe('bits.test.js', function () {
  describe('putShort()', function () {
    it('should put number to short bytes', function () {
      Bits.putShort(new Buffer(2), 0, 0xaced).should.eql(new Buffer([0xac, 0xed]));
      Bits.putShort(new Buffer(2), 0, 0).should.eql(new Buffer([0, 0]));
      Bits.putShort(new Buffer(2), 0, 1).should.eql(new Buffer([0, 0x01]));
      Bits.putShort(new Buffer(2), 0, 1024).should.eql(new Buffer([0x04, 0]));
    });
  });

  describe('putInt()', function () {
    it('should put number to int bytes', function () {
      Bits.putInt(new Buffer(4), 0, 1024010).should.eql(new Buffer([0x00, 0x0f, 0xa0, 0x0a]));
    });
  });
});
