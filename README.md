outputstream
=======

[![Build Status](https://secure.travis-ci.org/node-modules/java.io.png)](http://travis-ci.org/node-modules/java.io) [![Dependency Status](https://gemnasium.com/node-modules/java.io.png)](https://gemnasium.com/node-modules/java.io)

[![NPM](https://nodei.co/npm/java.io.png?downloads=true&stars=true)](https://nodei.co/npm/java.io/)

![logo](https://raw.github.com/node-modules/java.io/master/logo.png)

[java.io.*](http://docs.oracle.com/javase/7/docs/api/java/io/package-summary.html) javascript implement.

## Install

```bash
$ npm install java.io
```

## Usage

```js
var io = require('java.io');

var byteStream = new io.ByteArrayOutputStream();
var oos = new io.ObjectOutputStream(byteStream);
oos.writeObject('foo');

var bytes = byteStream.toByteArray();
```

## Class: `OutputStream`

Any `OutputStream` subclass must impl `_writeByte(byte)` and `_writeBytes(bytes)`.

### Function: `write(b, off, len)`

```js
// write(100)
// write(new Buffer('foo'))
// write(new Buffer('foobar'), 0, 3);
proto.write = function (b, off, len);
```

### Class: `ObjectOutputStream`

TODO

### Class: `ByteArrayOutputStream`

TODO

### Class: `DataOutputStream`

TODO

## Class: `InputStream`

TODO

### Class: `ObjectInputStream`

TODO

### Class: `ByteArrayInputStream`

TODO

### Class: `DataInputStream`

TODO

## Utility: `Bits` and `types`

### `Bits`

Help to write primitive type to bytes.

TODO

### `types`

Impl some Java Type:

* `types.JavaString` => `java.lang.String`
* `types.JavaObjectArray` => `Object[]`

## TODO

* [ ] OutputStream
  * [√] ObjectOutputStream
  * [√] DataOutputStream
  * [√] BlockDataOutputStream
  * [√] ByteArrayOutputStream
* [ ] InputStream
  * [ ] ObjectInputStream
  * [ ] DataInputStream
  * [ ] BlockDataInputStream
  * [ ] ByteArrayInputStream
* [ ] Utility
  * [ ] Bits
  * [ ] types
    * [√] JavaString
    * [√] JavaObjectArray

## License

(The MIT License)

Copyright (c) 2014 fengmk2 &lt;fengmk2@gmail.com&gt; and other contributors

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
