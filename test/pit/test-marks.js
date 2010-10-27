var pit = require('../../run.js');

pit.expect(5);
pit.expect("be-expected", 1);
pit.mark("not-expected");
pit.mark("be-expected");
