
#===================================================================
#--------------------------- Variables -----------------------------
#===================================================================
coffee = node_modules/.bin/coffee
express = node_modules/express/package.json

#-------------------------------------------------------------------
# BUILD
#------------------------------------------------------------------- 
ifneq (,$(findstring CYGWIN,$(shell uname -s)))
	requirejsBuild = ./support/requirejs/build/build.bat
else
	requirejsBuild = ./support/requirejs/build/build.sh
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


#===================================================================
#­--------------------------- TARGETS ------------------------------
#===================================================================
.PHONY : clean test

all: build/require-cell.js build/require-cell.min.js build/cell-pluginBuilder.js

#-------------------------------------------------------------------
# DEV 
#------------------------------------------------------------------- 
dev: lib/cell.coffee $(coffee)
	mkdir -p build/
	$(coffee) --watch -o build/ -c lib/cell.coffee lib/cell-pluginBuilder.coffee

dev-test-server: $(coffee) $(express)
	$(coffee) test/util/test-server.coffee

dev-test: $(coffee)
	find test/ -name '*.coffee' | xargs $(coffee) --watch -c


#-------------------------------------------------------------------
# BUILD
#------------------------------------------------------------------- 
build/cell.js: lib/cell.coffee $(coffee)
	mkdir -p build/
	$(coffee) -o build/ -c lib/cell.coffee

build/cell-pluginBuilder.js: lib/cell-pluginBuilder.coffee $(coffee)
	mkdir -p build/
	$(coffee) -o build/ -c lib/cell-pluginBuilder.coffee

build/require-cell.js: build/cell.js
	$(requirejsBuild) name=cell out=build/require-cell.js baseUrl=build/ includeRequire=true optimize=none

build/require-cell.min.js: build/cell.js
	$(requirejsBuild) name=cell out=build/require-cell.min.js baseUrl=build/ includeRequire=true

#-------------------------------------------------------------------
# Dependencies 
#------------------------------------------------------------------- 
$(coffee):
	npm install coffee-script

$(express):
	npm install express

#-------------------------------------------------------------------
# TEST
#------------------------------------------------------------------- 

# Build test/at/runs-with-requirejs-optimizer
# 	- Tests cell can be properly used by requirejs build script
test-runs-with-requirejs-optimizer: build/cell.js build/cell-pluginBuilder.js
	cp build/cell.js build/cell-pluginBuilder.js test/at/runs-with-requirejs-optimizer
	$(requirejsBuild) includeRequire=true name="cell!Mock" out=test/at/runs-with-requirejs-optimizer/all.js baseUrl=test/at/runs-with-requirejs-optimizer/
	rm test/at/runs-with-requirejs-optimizer/cell.js test/at/runs-with-requirejs-optimizer/cell-pluginBuilder.js

test: $(coffee)
	cd test/at; ls */test.js | xargs coffee -e 'console.log "define({tests:#{JSON.stringify process.argv[4..].map (e)->/(.*?)\/test.js/.exec(e)[1]}});"' > _alltests.js

clean: 
	@@rm -rf build

