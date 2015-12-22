#
# Makefile for cy-bunsen
# Copyright (c) 2015 Ciena Corporation. All rights reserved.
#

GITHUB_HOST := github.com
REPO := cyaninc/bunsen
WEBDRIVERIO_SERVER :=
COVERALLS_ENDPOINT :=
TESTING_FRAMEWORK := mocha

-include node_modules/beaker/make/common.mk
-include node_modules/beaker/make/gh-pages.mk
-include node_modules/beaker/make/karma-targets.mk
-include node_modules/beaker/make/e2e-targets.mk

.PHONY: install clean test coverage report-coverage release ghp-update

lint:
	find . -name "*.tsx" | xargs node_modules/.bin/tslint

# NOTE: install target will not have loaded the include above
# from beaker, so you don't have the ENV or SHELL variables set
# The karma-jasmine-jquery package doesn't do postinstall properly when a peer dep,
# So we do its postinstall step again at the end
install:
	$(HIDE)npm install

clean:
	$(HIDE)rm -rf coverage demo/bundle

test: karma-test remote-e2e-test

coverage: karma-coverage

export COVERALLS_ENDPOINT
report-coverage:
	$(ENV)cat coverage/lcov.info | coveralls

release:
	$(HIDE)echo "Publishing version $(VERSION)"
	$(HIDE)npm publish .

ghp-update: build-mock ghp-clean ghp-checkout ghp-copy-webpack ghp-publish
