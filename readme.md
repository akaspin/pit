# pit

Simple drop-in test runner for [node.js](http://nodejs.org/).

Test matters. But use of big testing frameworks leads developer to loss of 
control. *node.js* is asynchronous thing, and lots of errors may dissappear 
in the bowels of next big test system.

*pit* is one small (about 10k) `js` file. No installations, no dependencies, no 
loss of control.

## Basic usage

As mentioned earlier, each test is simple node.js application. *pit* just 
collects tests and runs they. If app throws exception - test fails. That's all.

Simply put `run.js` wherever you want and and pit it on your tests. For example,
we have the following directory structure:

    + app
        - test-feature.js   <- Put some to STDOUT
        - test-report.js    <- This test must fail and brings some to STDOUT
        - test-simple.js    <- Simple. Must pass
        - test-unstable.js  <- This test must fail
        - run.js            <- Yes, its me!
        - index.js
        
... and we in app directory...

    $node test/run.js
    
... and ...

    PASS feature
    * output:
        Just bring something
    FAIL report
    * output:
        Just some output
    * errors:
        node.js:50
                throw e; // process.nextTick error, or 'error' ...
                ^
            AssertionError: true == false
            ...
    FAIL unstable
    * errors:
        node.js:50
                throw e; // process.nextTick error, or 'error' ...
                ^
            AssertionError: true == false
            ...

    2/3
    
Fast clean and effective. *pit* collect all `test-*.js` files from current 
directory and run each as separate process. If test throws exception - it fails.
Passed tests that that not print not appear in the log by default, but will be 
counted in the total result.

## Advanced usage

You can control many things with parameters. *pit* takes two types of 
parameters: options and directories.

    node run.js [--option ...] [directory ...]

All parameters separates by space. Options are preceded by double dash (`--`).
Directories... just write it. Order of options and directories is not 
important.

### Directories, prefixes, extensions and host interpreter

Current dir is cool. But *pit* can collect the tests of those directories that 
you specify. Note that *pit* is not looking in the directories recursively.

    node run.js ../../other-dir tests tests/basic tests/advanced
    
By default *pit* searches for files with names `test-*.js` and runs they with
`node`. This behavior can be changed using options `prefix`, `ext` and `host`.

    node run.js --prefix=bench- --ext=.pl --host=perl
    
This may seem redundant, but may prove to be useful.

### Concurrency

As stated above, *pit* runs each test in separate process one after another.
You can increase the number of concurrent tests by option `conc`.

    node run.js --conc=4
    
### Customising output

By default, *pit* following the next rules:

* If test *passed* and nothing is printed, it will not appear in the log but 
  will be counted in the total result.
* If test *passed* but prints some in `STDOUT`, 
  it will appear in the log with output.
* If test failed, it will appear in the log with 
  it's `STDERR` and `STDOUT` (if exists).
* Regardless any options, all tests will be counted in the total result.

You can change it with next secret weapons: `noout`, `noerr`, `passed` and 
`nofail`.

`noout` and `noerr` disables test's `STDOUT` and `STDERR` respectively. With 
`noout` option *pit* logs only failed tests. With `noerr` option *disables*
tests `STDOUT` but failed tests will be appeared in log. 

     $node test/run.js --noout --noerr
     
     FAIL report
     FAIL unstable
     
     2/3
     
To disable log completelly and get only total results you need add `nofail` 
option to `noerr` and `noout`.

    $node test/run.js --noout --noerr --nofail
    2/3
     
`passed` option forces *pit* to log passed tests regardless their `STDOUT`.

    $node test/run.js --noout --noerr --passed
    
    PASS feature
    FAIL report
    PASS simple
    FAIL unstable

    2/3

### Timing 

*Pit* also has very basic benchmarking ability. It can be done with `times`
option. 

    $node test/run.js --noout --noerr --passed --times

    PASS feature (0.069s)
    FAIL report (0.088s)
    PASS simple (0.072s)
    FAIL unstable (0.087s)

    2/3 (0.178s)

*Pit* measures duration of each test in seconds - from start to end. Also *pit*
measures total duration. Of course, total duration depends from `conc` option.

## Helpers

*Pit* written to run tests. But it has three convenient tool for creating them.
These tools are `expect`, `mark` and `hook`.

### expect and mark

`expect` function give you the ability to determine - what is expected from 
the test. `mark` help meet its needs.

For example, running this test...

    var pit = require('./run.js');

    pit.expect(5);              // Set five expected "common" marks
    pit.expect("be-exp", 1);    // Set one expected "be-exp" mark 
    pit.mark("not-exp");        // Put "not-exp" mark
    pit.mark("be-exp");         // Put "be-exp" mark

... will give the following result

    FAIL marks
    * errors
        assert.js:80
          throw new assert.AssertionError({
                ^
        AssertionError: Marks do not meet expectations:
        - common: 0/5           <- Expected but not satisfied
        + be-exp: 1/1           <- Satisfied
        - not-exp: 1/undefined  <- Unexpected mark
            ...
        
`expect` sets expected number of marks. It takes two arguments: mark label and
expected number. Invoking `expect` with one argument causing set number of 
"common" mark.

Marks can be increased by `mark` function. Being called with single parameter - 
the mark's label, it increases mark's value. Without any parameters `mark` 
increases value of "common" mark.

### hook

When invoked at least once `expect` and `mark` causes hanging a handler to
`process->exit` event. If you want to add yours, use `hook`. Small example:

    var pit = require('./run.js');
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

... and output:

    FAIL chain
    * output
        Hook one    <- hook one
        Hook two    <- hook two
    * errors
        /home/dev/pit/test-chain.js:9  <- Ohh!
            throw "ARRR!";
            ^
        ARRR!

*Hooks* are executed in stacked (FILO) order. The default handler runs at last.
Exceptions interrupts execution.

`hook` takes one parameter - hook function. Which in turn takes two parameters:
collected marks and expects. Which have the following structure:

    {
        <mark label>: <{int}number of marks>,
        ...
    }

## Need help?

Call *pit* with `help` option:

    node run.js --help

You can also look at examples in "test" directory and run all by `make`.
