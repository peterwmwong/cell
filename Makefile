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
# DEV 
#------------------------------------------------------------------- 
coffee: deps lib/cell.coffee lib/cell-builder-plugin.coffee lib/__.coffee
	mkdir -p build/
	$(call coffee-compile,lib/__.coffee lib/cell.coffee lib/cell-builder-plugin.coffee,--watch)

spec-server: deps
	$(coffee) spec-runner/spec-runner-server.coffee ./

coffee-specs: deps
	find spec-runner/ specs/ -name '*.coffee' | xargs $(coffee) --watch -c


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
	cp build/cell.js build/cell-builder-plugin.js specs/fixtures/cell-builder-plugin
	$(requirejsBuild) -o \
		paths.requireLib=../../../node_modules/requirejs/require \
		paths.cell=../../../build/cell \
		paths.__=../../../build/__ \
		paths.cell-builder-plugin=../../../build/cell-builder-plugin \
		include=requireLib \
		name="cell!Mock" \
		baseUrl=specs/fixtures/cell-builder-plugin/ \
		out=specs/fixtures/cell-builder-plugin/all.js
	rm specs/fixtures/cell-builder-plugin/cell.js specs/fixtures/cell-builder-plugin/cell-builder-plugin.js

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

