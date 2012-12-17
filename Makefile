#===================================================================
#--------------------------- VARIABLES -----------------------------
#===================================================================
coffee = node_modules/.bin/coffee
requirejsBuild = node_modules/.bin/r.js

define coffee-compile
	$(coffee) $2 -o build/ -b -c $1 
endef


#===================================================================
#­--------------------------- TARGETS ------------------------------
#===================================================================
.PHONY : clean

all: build/require.js build/cell.js build/cell-builder-plugin.js build/__.js


#-------------------------------------------------------------------
# BUILD
#------------------------------------------------------------------- 
build/cell.js: deps lib/cell.coffee
	mkdir -p build/
	$(call coffee-compile,lib/cell.coffee)

build/cell-builder-plugin.js: deps lib/cell-builder-plugin.coffee
	mkdir -p build/
	$(call coffee-compile,lib/cell-builder-plugin.coffee)

build/__.js: deps lib/__.coffee
	mkdir -p build/
	$(call coffee-compile,lib/__.coffee)

build/require.js: deps
	mkdir -p build/
	cp lib/require.js build/

#-------------------------------------------------------------------
# Dependencies 
#------------------------------------------------------------------- 
deps: 
	npm install

lodash:
	node_modules/.bin/lodash backbone plus=isElement,isArray,debounce,range -o support/lodash.custom.js
	rm ./lodash.*js

#-------------------------------------------------------------------
# TEST
#------------------------------------------------------------------- 

# Build test/fixtures/cell-builder-plugin/
# 	- Tests cell can be properly used by requirejs optimizer build script
spec-cell-builder-plugin: build/cell.js build/cell-builder-plugin.js
	node_modules/.bin/r.js -o specs/fixtures/cell-builder-plugin/build.js
	cat specs/fixtures/cell-builder-plugin/config.js >> specs/fixtures/cell-builder-plugin/all.js

define MAKE_ALL_TESTS_COFFEE
specs = process.argv[4..].map (e)-> "spec!#{/(.*?\.spec)\.js/.exec(e)[1]}"
console.log "define(#{JSON.stringify specs},function(){return Array.prototype.slice.call(arguments)});"
endef
export MAKE_ALL_TESTS_COFFEE

specs: deps spec-cell-builder-plugin
	find specs/ -name '*.coffee' | xargs $(coffee) -c -b
	cd specs/; find . -name "*.spec.js" -type f | xargs ../node_modules/.bin/coffee -e "$$MAKE_ALL_TESTS_COFFEE" > GENERATED_all-specs.js

clean: 
	@@rm -rf build

