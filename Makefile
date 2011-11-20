#===================================================================
#--------------------------- VARIABLES -----------------------------
#===================================================================
coffee = node_modules/.bin/coffee
express = node_modules/express/package.json
requirejsBuild = ./support/requirejs/r.js


#===================================================================
#­--------------------------- TARGETS ------------------------------
#===================================================================
.PHONY : clean test

all: build/require.js build/require-min.js test

#-------------------------------------------------------------------
# DEV 
#------------------------------------------------------------------- 
dev: deps lib/cell.coffee
	mkdir -p build/
	$(coffee) --watch -o build/ -c lib/cell.coffee lib/cell-builder-plugin.coffee

dev-test-server: deps
	$(coffee) test/util/test-server.coffee ./

dev-test: deps
	find test/ -name '*.coffee' | xargs $(coffee) --watch -c


#-------------------------------------------------------------------
# BUILD
#------------------------------------------------------------------- 
build/cell.js: deps lib/cell.coffee
	mkdir -p build/
	$(coffee) -o build/ -c lib/cell.coffee

build/cell-builder-plugin.js: deps lib/cell-builder-plugin.coffee $(coffee)
	mkdir -p build/
	$(coffee) -o build/ -c lib/cell-builder-plugin.coffee

build/require.js: support/requirejs/require.js
	mkdir -p build/
	cp support/requirejs/require.js build/

build/require-min.js: support/requirejs/require-min.js
	mkdir -p build/
	cp support/requirejs/require-min.js build/

#-------------------------------------------------------------------
# Dependencies 
#------------------------------------------------------------------- 
deps:
	npm install

#-------------------------------------------------------------------
# TEST
#------------------------------------------------------------------- 

# Build test/fixtures/cell-builder-plugin/
# 	- Tests cell can be properly used by requirejs optimizer build script
test-cell-builder-plugin: build/cell.js build/cell-builder-plugin.js
	cp build/cell.js build/cell-builder-plugin.js test/fixtures/cell-builder-plugin
	node $(requirejsBuild) -o paths.requireLib=../../../support/requirejs/require include=requireLib name="cell!Mock" out=test/fixtures/cell-builder-plugin/all.js baseUrl=test/fixtures/cell-builder-plugin/
	rm test/fixtures/cell-builder-plugin/cell.js test/fixtures/cell-builder-plugin/cell-builder-plugin.js

define MAKE_ALL_TESTS_COFFEE
tests = process.argv[4..].map (e)-> "test!#{/(.*?\.test)\.js/.exec(e)[1]}"
console.log "define(#{JSON.stringify tests});"
endef
export MAKE_ALL_TESTS_COFFEE

test: deps test-cell-builder-plugin
	find test/ -name '*.coffee' | xargs $(coffee) -c
	cd test/; find -name "*.test.js" -type f | xargs coffee -e "$$MAKE_ALL_TESTS_COFFEE" > _alltests.js

clean: 
	@@rm -rf build

