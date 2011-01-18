
#===================================================================
#--------------------------- Variables -----------------------------
#===================================================================
src_files = $(shell find src -type f -name "*.coffee")
dist_files = build/cell-core.js \
				 build/cell.js \
				 build/cell-core-nomin.js \
				 build/cell-nomin.js

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
	cp build/cell*.js dist/

#-------------------------------------------------------------------
# BUILD
#------------------------------------------------------------------- 
all: $(dist_files)

build/cell-core-nomin.js: $(src_files) deps/lib/requirejs/require.js
	$(compile_coffee)
	$(call build_requirejs_module,cell/bootstrap-core,build/cell-core-nomin.js,optimize=none)

build/cell-nomin.js: build/cell-core-nomin.js
	$(call build_requirejs_module,cell/bootstrap,build/cell.js.tmp,optimize=none)
	cat deps/lib/less.js/less.js deps/lib/mustache.js/mustache.js build/cell.js.tmp > build/cell-nomin.js
	rm build/cell.js.tmp

build/cell-core.js: build/cell-core-nomin.js
	$(call minify,build/cell-core-nomin.js,build/cell-core.js)

build/cell.js: build/cell-nomin.js
	$(call minify,build/cell-nomin.js,build/cell.js)

deps/lib/requirejs/require.js:
	git submodule init
	git submodule update

#-------------------------------------------------------------------
# TEST
#------------------------------------------------------------------- 
test-at: $(dist_files)
	coffee test/test-at.coffee $(TEST_DEBUG_) -b $(TEST_BROWSER) $(TESTS)

test-unit:
	coffee test/test-unit.coffee $(TEST_DEBUG_) -b $(TEST_BROWSER) $(TESTS)


clean: 
	@@rm -rf build

