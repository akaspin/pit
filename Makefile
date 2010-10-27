NODE=`which node`
THIS_DIR=$(shell pwd)

default: test

test:
	@$(NODE) run.js test/pit
	@$(NODE) run.js test/simple

.PHONY: test
