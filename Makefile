#===================================================================
#--------------------------- VARIABLES -----------------------------
#===================================================================
coffee = node_modules/.bin/coffee
requirejsBuild = node_modules/.bin/r.js


#===================================================================
#­--------------------------- TARGETS ------------------------------
#===================================================================
.PHONY : clean test

all: build/require.js test

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

build/require.js: deps
	mkdir -p build/
	cp node_modules/requirejs/require.js build/

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
	$(requirejsBuild) -o paths.requireLib=../../../node_modules/requirejs/require include=requireLib name="cell!Mock" out=test/fixtures/cell-builder-plugin/all.js baseUrl=test/fixtures/cell-builder-plugin/
	rm test/fixtures/cell-builder-plugin/cell.js test/fixtures/cell-builder-plugin/cell-builder-plugin.js

define MAKE_ALL_TESTS_COFFEE
tests = process.argv[4..].map (e)-> "test!#{/(.*?\.test)\.js/.exec(e)[1]}"
console.log "define(#{JSON.stringify tests});"
endef
export MAKE_ALL_TESTS_COFFEE

test: deps test-cell-builder-plugin
	find test/ -name '*.coffee' | xargs $(coffee) -c
	cd test/; find . -name "*.test.js" -type f | xargs coffee -e "$$MAKE_ALL_TESTS_COFFEE" > GENERATED_ALLTESTS.js

clean: 
	@@rm -rf build

