var pit = require('../../run.js');

var simpleMessage = "Hook";

pit.hook(function(marks, expects) {
    console.log("%s three. Will not displayed", simpleMessage);
});
pit.hook(function(marks, expects) {
    console.log("%s two", simpleMessage);
    throw "ARRR!";
});
pit.hook(function(marks, expects) {
    console.log("%s one", simpleMessage);
});