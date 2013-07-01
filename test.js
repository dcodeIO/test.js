/*
 Copyright 2013 Daniel Wirtz <dcode@dcode.io>

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 */

/**
 * @license test.js (c) 2013 Daniel Wirtz <dcode@dcode.io>
 * Released under the Apache License, Version 2.0
 * see: https://github.com/dcodeIO/test.js for details
 */

/** @expose */
module.exports = (function() {
    
    // core
    var path = require("path"),
        assert = require("assert"),
        ascli = require("ascli").app("test"),
        ok = ascli.ok,
        fail = ascli.fail,

    // dojo
        pkg = require(path.join(__dirname, "package.json"));

    var domain = null; try { domain = require("domain"); } catch (e) {}

    /**
     * Parses a stack trace.
     * @param {string} stack
     * @returns {string}
     * @private
     */
    function parseStack(stack) {
        var lines = stack.split('\n');
        var res = [];
        var head = lines[0], p;
        if ((p = head.indexOf(":")) >= 0) {
            head = head.substring(0, p).red.bold+head.substring(p).white.bold;
        }
        res.push("   "+head);
        for (var i=2; i<lines.length; i++) { // skip head and wrapper
            var line = " "+lines[i];
            if (/node_modules[\\/]test[\\/]test\.js|Function\.Module\.runMain \(module\.js:/.test(line)) {
                break;
            }
            res.push(line.replace(/(Object\.module\.exports\.)|(\[as test\] )/g, ''));
        }
        return res.join('\n');
    }

    /**
     * Pads a string to the given length.
     * @param {*} s
     * @param {number} len
     * @returns {string}
     * @private
     */
    function pad(s, len) {
        s = s+"";
        while (s.length < len) {
            s = " "+s;
        }
        return s;
    }

    /**
     * Gets the reference time in microseconds.
     * @returns {number} Microseconds (1 μs = 10^6 s)
     */
    function hrtime() {
        var hr = process.hrtime();
        return Math.round(hr[0]*1000000 + hr[1]/1000);
    }

    /**
     * Constructs a new Suite.
     * @class Test suite used in dojo, the node.js application server.
     * @param {Object.<string,(function(Suite)|Object.<string,Suite>)>} tests Tests
     * @param {string=} name Subtest name
     * @param {Suite=} parent Parent suite
     * @constructor
     */
    var Suite = function(tests, name, parent) {
        /** @type {Object.<string,*>} */
        this.tests = tests;
        /** @type {String} */
        this.name = typeof name != 'undefined' ? name : "suite";
        /** @type {Suite} */
        this.parent = parent instanceof Suite ? parent : null;
        /** @type {{ name: String, test: function(Test) }} */
        this.ok = [];
        /** @type {{ name: String, test: function(Test), error: Error }} */
        this.failed = [];
        /** @type {number} */
        this.assertions = 0;
        /** @type {boolean} */
        this.silent = false;
    };

    /**
     * Summarized the results.
     * @param {number} startTime Start timestamp in milliseconds
     * @returns {string}
     * @expose
     */
    Suite.prototype.summarize = function(startTime) {
        var total = this.ok.length + this.failed.length,
            taken = hrtime() - startTime;
        if (this.failed.length > 0) {
            return this.failed.length+" of "+total+" failed ("+(taken/1000).toFixed(3)+" ms "+this.assertions+" assertions)";
        } else {
            return total+" tests ("+(taken/1000).toFixed(3)+" ms, "+this.assertions+" assertions)";
        }
    };

    /**
     * Prints the test banner. Wrapped in a function in case --nocolors has been used.
     * @expose
     */
    Suite.banner = function() {
        ascli.banner("test".green.bold, "js".green.bold+" »".white.bold+"                                                          "+("v"+pkg['version']).grey.bold);
    };

    /**
     * Runs a bunch of tests.
     * @param {Object.<string, (function(Suite)|Object.<string, function(Suite)>)>} tests Test definitions to run
     * @param {(string|boolean)=} name Top-level test suite name, defaults to 'suite'
     * @param {boolean=} silent Whether to run the tests silently or not. Defaults to `false`.
     * @expose
     */
    Suite.run = function(tests, name, silent) {
        if (typeof silent == 'undefined') {
            if (typeof name == 'boolean') {
                silent = name;
                name = null;
            }
        }
        name = typeof name != 'undefined' ? ""+name : "main";
        var suite = new Suite(tests, name);
        if (!silent) Suite.banner();
        // TODO: Not super important but Cygwin fails to report anything below but the final message?
        var startTime = hrtime();
        suite.run(silent, function() {
            if (suite.failed.length > 0) {
                !silent ? fail(suite.summarize(startTime), 'test', suite.failed.length) : process.exit(suite.failed.length);
            } else {
                !silent ? ok(suite.summarize(startTime), 'test') : process.exit(0);
            }
        });
    };

    /**
     * Runs all tests in the Suite.
     * @param {(boolean|function(Suite))=} silent Whether to run the tests silently or not. Defaults ot `false`.
     * @param {function(Suite)=} callback Completion callback
     * @expose
     */
    Suite.prototype.run = function(silent, callback) {
        if (typeof silent == 'function') {
            callback = silent;
            silent = false;
        }
        this.assertions = 0;
        this.silent = !!silent;
        
        // Wrap native assert
        for (var i in assert) {
            if (assert.hasOwnProperty(i) && !(i in this)) this[i] = assert[i];
        }

        // Generate a prefix based on nesting
        /** @type {string} */
        var prefix = "";
        var ptr = this.parent;
        while (ptr !== null) {
            prefix = ptr.name+' - '+prefix;
            ptr = ptr.parent;
        }

        /** @type {Array.<{name: string, test: function(Test)}>} */
        var tests = [];
        // Self reference for inner functions
        var suite = this;

        /**
         * Lines up all tests.
         * @param {string} k Key
         * @param {Object.<string,*>|function(Test)} v Value
         * @private
         */
        function lineUp(k, v) {
            if (typeof v == 'function') {
                tests.push({'name': k, 'test': v});
            } else {
                if (v) { // Might be set to null
                    var ks = Object.keys(v);
                    for (var i=0; i<ks.length; i++) {
                        lineUp(k+'.'+ks[i], v[ks[i]]);
                    }
                }
            }
        }
        lineUp(this.name, this.tests);

        /**
         * Generates some right-aligned stats.
         * @param {Test} test
         * @param {number} taken Microseconds
         * @returns {string}
         * @private
         */
        function stats(test, taken) {
            var space = " ";
            for (var i=3+test.testName.length; i<46; i++) {
                space += " ";
            }
            return space+pad((taken/1000).toFixed(3), 10)+" ms "+pad(test.count, 6)+" assertions ";
        }

        /**
         * Runs a single test.
         * @param {{name: string, test: function(Test)}} test
         * @private
         */
        function run(test) {
            var space = " ";
            for (var i=3+test['name'].length; i<50; i++) {
                space += " ";
            }

            process.on("exit", function() {
                fail(new Error("test.done() has not been called"));
            });
            
            /**
             * Called when a test is done. May be asynchronous.
             * @private
             */
            function done() {
                suite.assertions += inst.count;
                if (!suite.silent)  console.log("+".green+" "+test['name'].replace(/\./g, ".".grey.bold)+stats(this, hrtime()-inst.start));
                suite.ok.push(test);
                process.removeAllListeners("exit");
                typeof setImmediate === 'function' ? setImmediate(next) : setTimeout(next, 0);
            }

            /**
             * Fails a test.
             * @param {Error} e Exception caught
             */
            function fail(e) {
                suite.assertions += inst.count;
                if (!suite.silent) {
                    console.log("x".red.bold+" "+test['name'].white.bold+stats(inst, hrtime()-inst.start));
                    console.log('\n'+parseStack(e.stack)+"\n");
                }
                test['error'] = e;
                suite.failed.push(test);
                process.removeAllListeners("exit");
                typeof setImmediate === 'function' ? setImmediate(next) : setTimeout(next, 0);
            }

            var inst = new Test(suite, test['name']);
            inst.done = done;
            inst.start = hrtime();
            try {
                if (domain) {
                    var d = domain.create();
                    d.on("error", function(e) {
                        fail(e);
                    });
                    d.run(function() {
                        test['test'](inst);
                    });
                } else {
                    test['test'](inst);
                }
            } catch (e) {
                fail(e);
            }
        }

        /**
         * Runs the next test.
         * @private
         */
        function next() {
            var t = tests.shift();
            if (t) {
                run(t);
            } else {
                if (callback) callback(suite);
            }
        }

        // Start with the first
        next();
    };

    /**
     * A Test.
     * @constructor
     * @extends assert
     */
    Suite.Test = function(suite, name) {
        this.suite = suite;
        this.testName = name;
        this.count = 0;
        this.start = -1;
    };

    // Actually wraps assert
    for (var i in assert) {
        if (assert.hasOwnProperty(i)) {
            Suite.Test.prototype[i] = function(func) {
                return function() {
                    this.count++;
                    func.apply(this, arguments);
                }
            }(assert[i]);
        }
    }
    
    /**
     * Tests if a value evaluates to false.
     * @param {*} value Value
     * @param {string=} message Message
     * @throws {Error}
     * @expose
     */
    Suite.Test.prototype.notOk = function(value, message) {
        this.count++;
        if (!!value) assert.fail(value, true, message, '!=', assert.ok);
    };

    /**
     * Logs additional information to console.
     * @param {...[*]} var_args
     * @expose
     */
    Suite.Test.prototype.log = function(var_args) {
        if (this.suite.silent) return;
        var args = ['i '.cyan+this.testName+" >".cyan];
        args.push.apply(args, arguments);
        console.log.apply(console, args);
    };
    
    /** @private */
    var Test = Suite.Test;
    
    // Expose ascli
    Suite.ascli = ascli;

    return Suite;
    
})();
