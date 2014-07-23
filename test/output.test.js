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
      var map_int = { '$':
       { '0':
          { '$': { value: 0 },
            '$class':
             { name: 'java.lang.Integer',
               serialVersionUID: '1360826667806852920',
               flags: 2,
               fields: [ { type: 'I', name: 'value' } ],
               superClass:
                { name: 'java.lang.Number',
                  serialVersionUID: '-8742448824652078965',
                  flags: 2,
                  fields: [],
                  superClass: null } },
            '$fields': [ { type: 'I', name: 'value' } ] },
         '1':
          { '$': { value: 1 },
            '$class':
             { name: 'java.lang.Integer',
               serialVersionUID: '1360826667806852920',
               flags: 2,
               fields: [ { type: 'I', name: 'value' } ],
               superClass:
                { name: 'java.lang.Number',
                  serialVersionUID: '-8742448824652078965',
                  flags: 2,
                  fields: [],
                  superClass: null } },
            '$fields': [ { type: 'I', name: 'value' } ] },
         '2':
          { '$': { value: 2 },
            '$class':
             { name: 'java.lang.Integer',
               serialVersionUID: '1360826667806852920',
               flags: 2,
               fields: [ { type: 'I', name: 'value' } ],
               superClass:
                { name: 'java.lang.Number',
                  serialVersionUID: '-8742448824652078965',
                  flags: 2,
                  fields: [],
                  superClass: null } },
            '$fields': [ { type: 'I', name: 'value' } ] } },
      '$class':
       { name: 'java.util.HashMap',
         serialVersionUID: '362498820763181265',
         flags: 3,
         fields:
          [ { type: 'F', name: 'loadFactor' },
            { type: 'I', name: 'threshold' } ],
         superClass: null },
      '$fields':
       [ { type: 'F', name: 'loadFactor' },
         { type: 'I', name: 'threshold' } ] }
    })
  });

  describe('Primitive Value', function () {

    it.only('write int', function(){
      var byte_0xff = {
        '$': { value: -1 },
        '$class': {
          name: 'java.lang.Byte',
          serialVersionUID: '-7183698231559129828',
          flags: 2,
          fields: [ { type: 'B', name: 'value' } ],
          superClass: {
            name: 'java.lang.Number',
            serialVersionUID: '-8742448824652078965',
            flags: 2,
            fields: [],
            superClass: null
          }
        },
        '$fields': [ { type: 'B', name: 'value' } ]
      }
      OutputStream.write(byte_0xff).should.eql(utils.bytes('byte/0xff'));
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
