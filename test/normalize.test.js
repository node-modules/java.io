/**!
 * java.io - test/serialization/v2/input.test.js
 *
 * Copyright(c) Alibaba Group Holding Limited.
 * MIT Licensed
 *
 * Authors:
 *   fool2fish <fool2fish@gmail.com> (http://fool2fish.github.com)
 */

'use strict';

/**
 * Module dependencies.
 */

var fs = require('fs');
var path = require('path');
var should = require('should');
var utils = require('./utils');
var InputStream = require('../lib/input');
var OutputStream = require('../lib/output');
var normalize = OutputStream.normalize;

describe('normalize.test.js', function () {

  describe('Array', function () {
    it('write Primitive value list', function () {
      OutputStream.write(normalize([0, 1, 2, 3], 'int')).should.eql(utils.bytes('array/[int'));
      OutputStream.write(normalize([0, 1, 2, 3], 'byte')).should.eql(utils.bytes('array/[byte'));
      OutputStream.write(normalize([97, 98, 99, 100], 'char')).should.eql(utils.bytes('array/[char'));
      OutputStream.write(normalize([1, 2, 3], 'short')).should.eql(utils.bytes('array/[short'));
      OutputStream.write(normalize([1, 2, 3], 'long')).should.eql(utils.bytes('array/[long'));
      OutputStream.write(normalize([0, 1.100000023841858, 2.200000047683716, 3.3333001136779785], 'float')).should.eql(utils.bytes('array/[float'));
      OutputStream.write(normalize([0, 1.1, 2.2, 3.3333], 'double')).should.eql(utils.bytes('array/[double'));
      OutputStream.write(normalize(["a", "bbb", "cccc", "ddd中文"], 'string')).should.eql(utils.bytes('array/[String'));
      OutputStream.write(normalize([true, false, false, false], 'boolean')).should.eql(utils.bytes('array/[boolean'));
    });
  });

  describe('Map', function () {
    it('write map', function() {
      // NOTE:
      // cannot compare the output buffer with bin file directly
      // because map cannot guarantee the order that the entries be written in
      //   when some key is number
      var obj = normalize({ '0': 0, '1': 1, '2': 2 }, 'int');
      var outBuf = OutputStream.write(obj);
      var inputStream = new InputStream(outBuf, true);
      var readObj = inputStream.readObject();
      obj.should.eql(readObj);

      //OutputStream.write(normalize({ 'true': true, 'false': false }, 'boolean')).should.eql(utils.bytes('map/boolean'));

      var kvs = 'abcdefghijklmnopqrstuvwxyz';
      var map0 = {};
      for (var i = 0; i < 26; i++) {
        var t = kvs[i];
        map0[t] = t;
      }
      var normalizedMap0 = normalize(map0, 'string');
      var map0Buf = OutputStream.write(normalizedMap0);
      var map0InputStream = new InputStream(map0Buf, true);
      var readMap0Obj = map0InputStream.read();
      normalizedMap0.should.eql(readMap0Obj);
    })
  });

  describe('Primitive Value', function () {

    it('write byte', function(){
      OutputStream.write(normalize(0xff, 'byte')).should.eql(utils.bytes('byte/0xff'));
    });

    it('write char', function() {
      OutputStream.write(normalize(0xff, 'char')).should.eql(utils.bytes('char/0xff'));
    });

    it('write double', function() {
      OutputStream.write(normalize(0, 'double')).should.eql(utils.bytes('double/0'));
    });

    it('write float', function() {
      OutputStream.write(normalize(0, 'float')).should.eql(utils.bytes('float/0'));
    });

    it('write int', function() {
      OutputStream.write(normalize(1024)).should.eql(utils.bytes('int/1024'));
    });

    it('write long', function() {
      OutputStream.write(normalize(-12345678, 'long')).should.eql(utils.bytes('long/-12345678'));
    });

    it('write short', function() {
      OutputStream.write(normalize(0, 'short')).should.eql(utils.bytes('short/0'));
    });

    it('write boolean', function() {
      OutputStream.write(normalize(true)).should.eql(utils.bytes('boolean/true'));
    });

    it('write null', function () {
      OutputStream.write(normalize(null)).should.eql(new Buffer([0xac, 0xed, 0x00, 0x05, 0x70]));
    });

    it('write String', function () {
      OutputStream.write(normalize('')).should.eql(utils.bytes('String/empty'));
      OutputStream.write(normalize('foo')).should.eql(utils.bytes('String/foo'));
      OutputStream.write(normalize('foo 还有中文')).should.eql(utils.bytes('String/nonascii'));

      var large65535 = '';
      for (var i = 0; i < 65535; i++) {
        large65535 += 'a';
      }
      OutputStream.write(normalize(large65535)).should.eql(utils.bytes('String/65535'));

      var large65536 = '';
      for (var i = 0; i < 65536; i++) {
        large65536 += 'a';
      }
      OutputStream.write(normalize(large65536)).should.eql(utils.bytes('String/65536'));

      var large65535 = '';
      for (var i = 0; i < 65535; i++) {
        large65535 += '中';
      }
      OutputStream.write(normalize(large65535)).should.eql(utils.bytes('String/65535_nonascii'));
    });
  });
});
