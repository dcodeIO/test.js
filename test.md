## doco

  - [Suite()](#suite)
  - [this.tests](#thistests)
  - [this.name](#thisname)
  - [this.parent](#thisparent)
  - [this.ok](#thisok)
  - [this.failed](#thisfailed)
  - [Suite.summarize(startTime)](#suitesummarizestarttime)
  - [Suite.banner](#suitebanner)
  - [Suite.run(tests, name\*)](#suiteruntests-name)
  - [Suite.run(callback\*)](#suiteruncallback)
  - [prefix](#prefix)
  - [tests](#tests)
  - [fail()](#fail)
  - [Suite.Test()](#suitetest)
  - [Suite.Test.prototype.notOk(value, message\*)](#suitetestprototypenotokvalue-message)
  - [Suite.Test.prototype.log(var_args)](#suitetestprototypelogvar_args)
  - [Test](#test)

### Suite()
Constructs a new Suite.

| Name | Type | Description |
| ---- | ---- | ----------- |
| tests | Object.<string,(function(Suite) &#166; Object.<string,Suite>)> | Tests |
| name\* | string | Subtest name |
| parent\* | Suite | Parent suite |

### this.tests
@type {Object.<string,*>}

### this.name
@type {String}

### this.parent
@type {Suite}

### this.ok
@type {{ name: String, test: function(Test) }}

### this.failed
@type {{ name: String, test: function(Test), error: Error }}

### Suite.summarize(startTime)
Summarized the results.

| Name | Type | Description |
| ---- | ---- | ----------- |
| startTime | number | Start timestamp in milliseconds |
|   |||
| **returns** | string | 

### Suite.banner
Test banner.


### Suite.run(tests, name\*)
Runs a bunch of tests.

| Name | Type | Description |
| ---- | ---- | ----------- |
| tests | Object.<string, (function(Suite) &#166; Object.<string, function(Suite)>)> | Test definitions to run |
| name\* | string | Top-level test suite name, defaults to 'suite' |

### Suite.run(callback\*)
Runs all tests in the Suite.

| Name | Type | Description |
| ---- | ---- | ----------- |
| callback\* | function(Suite) | Completion callback |

### prefix
@type {string}

### tests
@type {Array.<{name: string, test: function(Test)}>}

### fail()
Fails a test.

| Name | Type | Description |
| ---- | ---- | ----------- |
| e | Error | Exception caught |

### Suite.Test()
A Test.


### Suite.Test.prototype.notOk(value, message\*)
Tests if a value evaluates to false.

| Name | Type | Description |
| ---- | ---- | ----------- |
| value | * | Value |
| message\* | string | Message |
|   |||
| **throws** | Error | 

### Suite.Test.prototype.log(var_args)
Logs additional information to console.

| Name | Type | Description |
| ---- | ---- | ----------- |
| var_args | ...[*] |  |

### Test
@private
