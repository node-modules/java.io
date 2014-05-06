java.io
=======

[![Build Status](https://secure.travis-ci.org/node-modules/java.io.png)](http://travis-ci.org/node-modules/java.io)

[![Dependency Status](https://gemnasium.com/node-modules/java.io.png)](https://gemnasium.com/node-modules/java.io)

[![NPM](https://nodei.co/npm/java.io.png?downloads=true&stars=true)](https://nodei.co/npm/java.io/)

![logo](https://raw.github.com/node-modules/java.io/master/logo.png)

[Object Serialization Stream Protocol](http://docs.oracle.com/javase/6/docs/platform/serialization/spec/protocol.html) javascript implement.

* [Object Serialization Stream Protocol Mind Node](https://www.dropbox.com/s/chqbm91wl5wx2oa/Object%20Serialization%20Stream%20Protocol.pdf)

## Install

```bash
$ npm install java.io
```

## Usage

```js
var io = require('java.io');

var bytes = io.writeObject('foo');

var obj = io.readObject(bytes);
```

## Utility: `Bits` and `types`

### `Bits`

Help to write primitive type to bytes.

TODO

### `types`

Impl some Java Type:

* `types.JavaString` => `java.lang.String`
* `types.JavaObjectArray` => `Object[]`

## TODO

* [x] read(bytes, withType)
* [ ] write(obj, withType)
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
