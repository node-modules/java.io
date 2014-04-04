/**!
 * java.io - test/bits.test.js
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
var Long = require('long');
var Bits = require('../').Bits;
var utils = require('./utils');

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

  describe('putLong()', function () {
    it('should put 274742954051697799L', function () {
      var bytes = new Buffer(8);
      Bits.putLong(bytes, 0, Long.fromString('274742954051697799'));
      var javaBytes = utils.bytes('long_274742954051697799');
      for (var i = 0; i < bytes.length; i++) {
        if (bytes[i] !== javaBytes[i]) {
          console.log(i, bytes[i], javaBytes[i], bytes.length, javaBytes.length);
          console.log('js  :', bytes, '\njava:', javaBytes);
          console.log('js  :', bytes.toString(), '\njava:', javaBytes.toString());
          break;
        }
        // bytes[i].should.equal(javaBytes[i]);
      }
      bytes.should.length(javaBytes.length);
      bytes.should.eql(javaBytes);
    });
  });
});
