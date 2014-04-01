/**!
 * outputstream - test/block_data_output_stream.test.js
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
var BlockDataOutputStream = require('../').BlockDataOutputStream;

describe('block_data_output_stream.test.js', function () {
  describe('getUTFLength()', function () {
    it('should get string utf length', function () {
      var bs = new BlockDataOutputStream();
      bs.getUTFLength('foo').should.equal(3);
      bs.getUTFLength('中文好长好长好长好长好长abcfengmk2').should.equal(46);
      Buffer.byteLength('foo').should.equal(3);
      Buffer.byteLength('中文好长好长好长好长好长abcfengmk2').should.equal(46);
    });
  });
});
