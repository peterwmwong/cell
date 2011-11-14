
#===================================================================
#--------------------------- Variables -----------------------------
#===================================================================
coffee = node_modules/.bin/coffee
express = node_modules/express/package.json

#-------------------------------------------------------------------
# BUILD
#------------------------------------------------------------------- 
requirejsBuild = ./support/requirejs/r.js

#-------------------------------------------------------------------
# TEST
#------------------------------------------------------------------- 


#===================================================================
#----------------------------- MACROS ------------------------------
#===================================================================


#===================================================================
#­--------------------------- TARGETS ------------------------------
#===================================================================
.PHONY : clean test

all: build/cell.js build/cell-pluginBuilder.js build/require.js build/require-min.js

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

build/require.js:
	mkdir -p build/
	cp support/requirejs/require.js build/

build/require-min.js:
	mkdir -p build/
	cp support/requirejs/require-min.js build/

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
	node $(requirejsBuild) -o paths.requireLib=../../../support/requirejs/require include=requireLib name="cell!Mock" out=test/at/runs-with-requirejs-optimizer/all.js baseUrl=test/at/runs-with-requirejs-optimizer/
	rm test/at/runs-with-requirejs-optimizer/cell.js test/at/runs-with-requirejs-optimizer/cell-pluginBuilder.js


define MAKE_ALL_TESTS_COFFEE
tests = process.argv[4..].map (e)-> "test!#{/(.*?\.test)\.js/.exec(e)[1]}"
console.log "define(#{JSON.stringify tests});"
endef
export MAKE_ALL_TESTS_COFFEE

test: $(coffee)
	find test/ -name '*.coffee' | xargs $(coffee) -c
	cd test/; find -name "*.test.js" -type f | xargs coffee -e "$$MAKE_ALL_TESTS_COFFEE" > _alltests.js

clean: 
	@@rm -rf build

