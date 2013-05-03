![test.js](https://raw.github.com/dcodeIO/test.js/master/test.png)
---------
No fancy crap, just testing like a man. Prints nothing else than the information you actually need and does nothing more
than wrapping node's assert module.

* Small footprint, minimal dependencies
* Non-utf8 and Windows terminal approved
* Allows asynchronous testing
* Allows modular tests by just assembling data structures
* API and Cli (just `testjs` or `test` if you like)
* Available through [npm](https://npmjs.org/package/testjs): `npm -g install testjs`

<p align="center">
    <img src="https://raw.github.com/dcodeIO/test.js/master/example.jpg" alt="example" />
</p>

Usage
-----

#### Cli
Place your test suite in `tests/suite.js`.

```javascript
// package.json
...
{
    "devDependencies": {
        "testjs": "latest"
    },
    "scripts": {
        "test": "testjs"
    }
}
...
```

`npm test`

#### API

```javascript
// tests/run.js
var Suite = require("testjs");

Suite.run({
    "firsttest": function(test) {
        ...
        test.done();
    },
    ...
});
```

```javascript
// package.json
...
{
    "scripts": {
        "test": "node tests/run.js"
    }
}
```

`npm test`

Assertions
----------
All of [node's assert](http://nodejs.org/api/assert.html) (just replace `assert` through `test`) plus `test.notOk(...)`
as a negated `ok`. There is also a `test.log(...)` for logging straight to the test console.

Self-explaining examples
------------------------
* [tests/suite.js](https://github.com/dcodeIO/test.js/blob/master/tests/suite.js) - test suite as a module
* [tests/run.js](https://github.com/dcodeIO/test.js/blob/master/tests/run.js) - runs it through the API

When typing `test` or `testjs` in a terminal, `tests/suite.js` will be run. Also supports running runners:
`test tests/run.js` or custom / other unit tests under the condition that the runner (here: `run.js`) does not export
anything. If it does, whatever it exports will be run.

Command line options
--------------------

| Option                     | Function
| -------------------------- | -----------------------------------------------------------------------------------------
| `--nocolors` or `-nc`      | Disables terminal colors.
| `--name=NAME` or `-n=NAME` | Sets the suite name. Defaults to the name defined in package.json which is looked up
inside of the current working directory or to the base name of the suite file if there is no package.json. The hard
coded default is `suite`.
| `--silent` or `-s`         | Does not produce any output.

Always returns the number of failed tests as the status code.

Example: `testjs --name=MyGame -nc tests/mygame-test.js`

License
-------
Apache License, Version 2.0
