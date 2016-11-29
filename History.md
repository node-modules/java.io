
2.3.0 / 2016-11-29
==================

  * feat: support java.util.TreeMap (#21)

2.2.0 / 2016-11-28
==================

  * feat: support more Builtin class (#20)

2.1.2 / 2016-06-08
==================

  * chore: fix Object Serialization Stream Protocol Mind Node link
  * deps: upgrade all deps
  * chore: remove unuse comments
  * fix: write longer bytes block header

2.1.1 / 2015-10-28
==================

 * chore: replace const to var, to support old version node

2.1.0 / 2015-06-04
==================

 * feat: support read large obj bytes

2.0.1 / 2014-12-02
==================

 * fix(output): support write undefined property

2.0.0 / 2014-12-01
==================

 * feat(input): readObject byte -> Buffer, incompatible feature

1.2.4 / 2014-11-24
==================

 * use npm scripts instead of Makefile
 * fix get superClass bug. Closes #8

1.2.3 / 2014-11-16
==================

 * fix: try to detect class have readObject or not

1.2.2 / 2014-08-19
==================

 * Add java.util.LinkedList.
 * Add more helpers.

1.2.0 / 2014-08-06
==================

 * Tighten the check if an class that has read/write object method has been added in.
 * Update docs on addObject method.
 * Convert input.addObject() and output.addObject() to io.addObject()
 * Give a distinct error message when some class dose not implement its readObject() or writeObject()

1.1.1 / 2014-08-05
==================

 * Fix read field of array type error.
 * Check if field of array type is null first when get fields.

1.1.0 / 2014-08-04
==================

 * Fix jshint errors.
 * Update _writeSerialData()
 * Remove unused param: unshared.
 * Read/writeBlockHeader in class that has its own read/writeObject method.
 * Object overwrite read/writeObject() will call defaultRead/WriteObject() in its methods.
 * fix string
 * update readme code style

1.0.0 / 2014-07-31
==================

 * Impl Object Serialization Stream Protocol v2.0 (@fool2fish)

0.0.1 / 2014-04-04
==================

 * _readHandle() start
 * fix Object[] array
 * readObject as ArrayList<String>
 * readObject as String
 * support Object[] params
 * support Serializable String, Boolean, null, simple object
 * init
