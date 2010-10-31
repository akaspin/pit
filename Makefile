NODE=`which node`
THIS_DIR=$(shell pwd)

default: test

test:
	@$(NODE) run.js test/pit test/simple
	@$(NODE) run.js test/simple --help

.PHONY: test
