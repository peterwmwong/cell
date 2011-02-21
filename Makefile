
#===================================================================
#--------------------------- Variables -----------------------------
#===================================================================
src_files = $(shell find src -type f -name "*.coffee")
dist_files = build/cell.js \
				 build/cell-min.js

#-------------------------------------------------------------------
# BUILD
#------------------------------------------------------------------- 
ifneq (,$(findstring CYGWIN,$(shell uname -s)))
	requirejsBuild = ./deps/lib/requirejs/build/build.bat
else
	requirejsBuild = ./deps/lib/requirejs/build/build.sh
endif

#-------------------------------------------------------------------
# TEST
#------------------------------------------------------------------- 
ifndef TEST_BROWSER
	TEST_BROWSER := google-chrome
endif

ifndef TESTS
	TESTS := "**"
endif

ifdef TEST_DEBUG
	TEST_DEBUG_ = -d
endif


#===================================================================
#----------------------------- MACROS ------------------------------
#===================================================================

#-------------------------------------------------------------------
# BUILD
#------------------------------------------------------------------- 
define compile_coffee
	mkdir -p build/js
	coffee -b -o build/js/ -c src/
endef

define build_requirejs_module
	$(requirejsBuild) name=$1 out=$2 baseUrl=build/js includeRequire=true $3
endef

define minify
	java -jar deps/build/google-closure-compiler/compiler.jar --js $1 --js_output_file $2
endef


#===================================================================
#­--------------------------- TARGETS ------------------------------
#===================================================================
.PHONY : test-unit clean

#-------------------------------------------------------------------
# DIST
#------------------------------------------------------------------- 
dist: $(dist_files)
	rm -rf dist/*
	cp $(dist_files) dist/

#-------------------------------------------------------------------
# DEV 
#------------------------------------------------------------------- 
dev: $(src_files)
	mkdir -p build/
	coffee --watch -o build/ -c src/Cell.coffee

#-------------------------------------------------------------------
# BUILD
#------------------------------------------------------------------- 
all: $(dist_files)

build/cell.js: $(src_files)
	$(compile_coffee)
	cp build/js/Cell.js build/cell.js

build/cell-min.js: build/cell.js
	$(call minify,build/cell.js,build/cell-min.js)

deps/test/requirejs/require.js:
	git submodule init
	git submodule update

#-------------------------------------------------------------------
# TEST
#------------------------------------------------------------------- 
test-at: $(dist_files) deps/test/express/index.js deps/test/express/support/connect/index.js
	coffee test/test-at.coffee $(TEST_DEBUG_) -b $(TEST_BROWSER) $(TESTS)

test-unit: deps/test/express/index.js deps/test/express/support/connect/index.js
	coffee test/test-unit.coffee $(TEST_DEBUG_) -b $(TEST_BROWSER) $(TESTS)

deps/test/express/index.js:
	git submodule init
	git submodule update

# test server depends on express, express depends on connect
deps/test/express/support/connect/index.js:
	cd deps/test/express; git submodule init; git submodule update

clean: 
	@@rm -rf build

