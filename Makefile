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
coffee: deps lib/cell.coffee lib/cell-builder-plugin.coffee
	mkdir -p build/
	$(coffee) --watch -o build/ -c lib/cell.coffee lib/cell-builder-plugin.coffee

spec-server: deps
	$(coffee) spec-runner/spec-runner-server.coffee ./

coffee-specs: deps
	find spec-runner/ specs/ -name '*.coffee' | xargs $(coffee) --watch -c


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
spec-cell-builder-plugin: build/cell.js build/cell-builder-plugin.js
	cp build/cell.js build/cell-builder-plugin.js test/fixtures/cell-builder-plugin
	$(requirejsBuild) -o paths.requireLib=../../../node_modules/requirejs/require include=requireLib name="cell!Mock" out=test/fixtures/cell-builder-plugin/all.js baseUrl=test/fixtures/cell-builder-plugin/
	rm test/fixtures/cell-builder-plugin/cell.js test/fixtures/cell-builder-plugin/cell-builder-plugin.js

define MAKE_ALL_TESTS_COFFEE
specs = process.argv[4..].map (e)-> "spec!#{/(.*?\.spec)\.js/.exec(e)[1]}"
console.log "define(#{JSON.stringify specs},function(){return Array.prototype.slice.call(arguments)});"
endef
export MAKE_ALL_TESTS_COFFEE

specs: deps spec-cell-builder-plugin
	find specs/ -name '*.coffee' | xargs $(coffee) -c
	cd specs/; find . -name "*.spec.js" -type f | xargs coffee -e "$$MAKE_ALL_TESTS_COFFEE" > GENERATED_all-specs.js

clean: 
	@@rm -rf build

