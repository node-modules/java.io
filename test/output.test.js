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
var should = require('should');
var utils = require('./utils');
var OutputStream = require('../lib/output');

describe('output.test.js', function () {
  describe('Enum', function () {

  });

  describe('Array', function () {

  });

  describe('Map', function () {
    it('write primitive map', function() {
    })
  });

  describe('Primitive Value', function () {

    it('write byte', function(){
      OutputStream.write(utils.obj('byte/0xff')).should.eql(utils.bytes('byte/0xff'));
    });

    it('write char', function() {
      OutputStream.write(utils.obj('char/0xff')).should.eql(utils.bytes('char/0xff'));
    });

    it('write double', function() {
      OutputStream.write(utils.obj('double/0')).should.eql(utils.bytes('double/0'));
    });

    it('write float', function() {
      OutputStream.write(utils.obj('float/0')).should.eql(utils.bytes('float/0'));
    });

    it('write int', function() {
      OutputStream.write(utils.obj('int/1024')).should.eql(utils.bytes('int/1024'));
    });

    it('write long', function() {
      OutputStream.write(utils.obj('long/-12345678')).should.eql(utils.bytes('long/-12345678'));
    });

    it('write short', function() {
      OutputStream.write(utils.obj('short/0')).should.eql(utils.bytes('short/0'));
    });

    it('write boolean', function() {
      OutputStream.write(utils.obj('boolean/true')).should.eql(utils.bytes('boolean/true'));
    });

    it('write null', function () {
      OutputStream.write(null).should.eql(new Buffer([0xac, 0xed, 0x00, 0x05, 0x70]));
    });

    it('write String', function () {
      OutputStream.write('').should.eql(utils.bytes('String/empty'));
      OutputStream.write('foo').should.eql(utils.bytes('String/foo'));
      OutputStream.write('foo 还有中文').should.eql(utils.bytes('String/nonascii'));

      var large65535 = '';
      for (var i = 0; i < 65535; i++) {
        large65535 += 'a';
      }
      OutputStream.write(large65535).should.eql(utils.bytes('String/65535'));

      var large65536 = '';
      for (var i = 0; i < 65536; i++) {
        large65536 += 'a';
      }
      OutputStream.write(large65536).should.eql(utils.bytes('String/65536'));

      var large65535 = '';
      for (var i = 0; i < 65535; i++) {
        large65535 += '中';
      }
      OutputStream.write(large65535).should.eql(utils.bytes('String/65535_nonascii'));
    });
  });

  describe('Simple Object', function () {
  });
});
