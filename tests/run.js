var path = require("path"),
    Suite = require(path.join(__dirname, '..', 'test.js'));

Suite.run(require(path.join(__dirname, 'suite.js')), 'test');
