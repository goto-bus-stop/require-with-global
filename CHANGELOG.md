# require-with-global change log

All notable changes to this project will be documented in this file.

This project adheres to [Semantic Versioning](http://semver.org/).

## 2.0.1
* Don't hook builtin modules, fixes a problem where require-with-global would prefer modules installed in node_modules over builtins.

## 2.0.0
* Make `withGlobal()` return a require()-like function that accepts global definitions in its second paramater,
  so it can be reused for different injections.

## 1.0.0
* Initial release.
