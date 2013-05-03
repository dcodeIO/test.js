module.exports = {
    'equal': function(test) {
        test.equal(true, true);
        test.done();
    },
    
    'notEqual': function(test) {
        test.notEqual(true, false);
        test.done();
    },
    
    'deepEqual': function(test) {
        test.deepEqual({a: {b: 'c'}}, {a: {b: 'c'}});
        test.done();
    },
    
    'notDeepEqual': function(test) {
        test.notDeepEqual({a: {b: 'c'}}, {a: {b: 'd'}});
        test.done();
    },
    
    'strictEqual': function(test) {
        test.strictEqual(true, true);
        test.done();
    },
    
    'notStrictEqual': function(test) {
        test.notStrictEqual(true, false);
        test.done();
    },
    
    'throws': function(test) {
        var MyError = function(msg) {
            Error.call(this, msg);
        };
        test.throws(function() {
            throw(new MyError("Hello world!"));
        }, MyError);
        test.done();
    },
    
    'doesNotThrow': function(test) {
        test.doesNotThrow(function() {
        });
        test.done();
    },
    
    'ifError': function(test) {
        test.ifError(false);
        test.done();
    },
    
    "nested": {
        "ok": function(test) {
            test.ok(true);
            test.done();
        },
        
        "notOk": function(test) {
            test.notOk(false);
            test.done();
        }
    },
    
    "async": function(test) {
        test.ok(true);
        process.nextTick(function() {
            test.ok(true);
            test.done();
        });
    },

    /* "asyncError": function(test) {
        process.nextTick(function() {
            test.strictEqual(true, false);
            test.done();
        });
    }, */
    
    "log": function(test) {
        test.log("Hello world!");
        test.done();
    }
};
