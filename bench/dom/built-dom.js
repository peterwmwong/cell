
/** vim: et:ts=4:sw=4:sts=4
 * @license RequireJS 2.1.2 Copyright (c) 2010-2012, The Dojo Foundation All Rights Reserved.
 * Available via the MIT or new BSD license.
 * see: http://github.com/jrburke/requirejs for details
 */
//Not using strict: uneven strict support in browsers, #392, and causes
//problems with requirejs.exec()/transpiler plugins that may not be strict.
/*jslint regexp: true, nomen: true, sloppy: true */
/*global window, navigator, document, importScripts, jQuery, setTimeout, opera */

var requirejs, require, define;
(function (global) {
    var req, s, head, baseElement, dataMain, src,
        interactiveScript, currentlyAddingScript, mainScript, subPath,
        version = '2.1.2',
        commentRegExp = /(\/\*([\s\S]*?)\*\/|([^:]|^)\/\/(.*)$)/mg,
        cjsRequireRegExp = /[^.]\s*require\s*\(\s*["']([^'"\s]+)["']\s*\)/g,
        jsSuffixRegExp = /\.js$/,
        currDirRegExp = /^\.\//,
        op = Object.prototype,
        ostring = op.toString,
        hasOwn = op.hasOwnProperty,
        ap = Array.prototype,
        aps = ap.slice,
        apsp = ap.splice,
        isBrowser = !!(typeof window !== 'undefined' && navigator && document),
        isWebWorker = !isBrowser && typeof importScripts !== 'undefined',
        //PS3 indicates loaded and complete, but need to wait for complete
        //specifically. Sequence is 'loading', 'loaded', execution,
        // then 'complete'. The UA check is unfortunate, but not sure how
        //to feature test w/o causing perf issues.
        readyRegExp = isBrowser && navigator.platform === 'PLAYSTATION 3' ?
                      /^complete$/ : /^(complete|loaded)$/,
        defContextName = '_',
        //Oh the tragedy, detecting opera. See the usage of isOpera for reason.
        isOpera = typeof opera !== 'undefined' && opera.toString() === '[object Opera]',
        contexts = {},
        cfg = {},
        globalDefQueue = [],
        useInteractive = false;

    function isFunction(it) {
        return ostring.call(it) === '[object Function]';
    }

    function isArray(it) {
        return ostring.call(it) === '[object Array]';
    }

    /**
     * Helper function for iterating over an array. If the func returns
     * a true value, it will break out of the loop.
     */
    function each(ary, func) {
        if (ary) {
            var i;
            for (i = 0; i < ary.length; i += 1) {
                if (ary[i] && func(ary[i], i, ary)) {
                    break;
                }
            }
        }
    }

    /**
     * Helper function for iterating over an array backwards. If the func
     * returns a true value, it will break out of the loop.
     */
    function eachReverse(ary, func) {
        if (ary) {
            var i;
            for (i = ary.length - 1; i > -1; i -= 1) {
                if (ary[i] && func(ary[i], i, ary)) {
                    break;
                }
            }
        }
    }

    function hasProp(obj, prop) {
        return hasOwn.call(obj, prop);
    }

    function getOwn(obj, prop) {
        return hasProp(obj, prop) && obj[prop];
    }

    /**
     * Cycles over properties in an object and calls a function for each
     * property value. If the function returns a truthy value, then the
     * iteration is stopped.
     */
    function eachProp(obj, func) {
        var prop;
        for (prop in obj) {
            if (hasProp(obj, prop)) {
                if (func(obj[prop], prop)) {
                    break;
                }
            }
        }
    }

    /**
     * Simple function to mix in properties from source into target,
     * but only if target does not already have a property of the same name.
     */
    function mixin(target, source, force, deepStringMixin) {
        if (source) {
            eachProp(source, function (value, prop) {
                if (force || !hasProp(target, prop)) {
                    if (deepStringMixin && typeof value !== 'string') {
                        if (!target[prop]) {
                            target[prop] = {};
                        }
                        mixin(target[prop], value, force, deepStringMixin);
                    } else {
                        target[prop] = value;
                    }
                }
            });
        }
        return target;
    }

    //Similar to Function.prototype.bind, but the 'this' object is specified
    //first, since it is easier to read/figure out what 'this' will be.
    function bind(obj, fn) {
        return function () {
            return fn.apply(obj, arguments);
        };
    }

    function scripts() {
        return document.getElementsByTagName('script');
    }

    //Allow getting a global that expressed in
    //dot notation, like 'a.b.c'.
    function getGlobal(value) {
        if (!value) {
            return value;
        }
        var g = global;
        each(value.split('.'), function (part) {
            g = g[part];
        });
        return g;
    }

    /**
     * Constructs an error with a pointer to an URL with more information.
     * @param {String} id the error ID that maps to an ID on a web page.
     * @param {String} message human readable error.
     * @param {Error} [err] the original error, if there is one.
     *
     * @returns {Error}
     */
    function makeError(id, msg, err, requireModules) {
        var e = new Error(msg + '\nhttp://requirejs.org/docs/errors.html#' + id);
        e.requireType = id;
        e.requireModules = requireModules;
        if (err) {
            e.originalError = err;
        }
        return e;
    }

    if (typeof define !== 'undefined') {
        //If a define is already in play via another AMD loader,
        //do not overwrite.
        return;
    }

    if (typeof requirejs !== 'undefined') {
        if (isFunction(requirejs)) {
            //Do not overwrite and existing requirejs instance.
            return;
        }
        cfg = requirejs;
        requirejs = undefined;
    }

    //Allow for a require config object
    if (typeof require !== 'undefined' && !isFunction(require)) {
        //assume it is a config object.
        cfg = require;
        require = undefined;
    }

    function newContext(contextName) {
        var inCheckLoaded, Module, context, handlers,
            checkLoadedTimeoutId,
            config = {
                waitSeconds: 7,
                baseUrl: './',
                paths: {},
                pkgs: {},
                shim: {},
                map: {},
                config: {}
            },
            registry = {},
            undefEvents = {},
            defQueue = [],
            defined = {},
            urlFetched = {},
            requireCounter = 1,
            unnormalizedCounter = 1;

        /**
         * Trims the . and .. from an array of path segments.
         * It will keep a leading path segment if a .. will become
         * the first path segment, to help with module name lookups,
         * which act like paths, but can be remapped. But the end result,
         * all paths that use this function should look normalized.
         * NOTE: this method MODIFIES the input array.
         * @param {Array} ary the array of path segments.
         */
        function trimDots(ary) {
            var i, part;
            for (i = 0; ary[i]; i += 1) {
                part = ary[i];
                if (part === '.') {
                    ary.splice(i, 1);
                    i -= 1;
                } else if (part === '..') {
                    if (i === 1 && (ary[2] === '..' || ary[0] === '..')) {
                        //End of the line. Keep at least one non-dot
                        //path segment at the front so it can be mapped
                        //correctly to disk. Otherwise, there is likely
                        //no path mapping for a path starting with '..'.
                        //This can still fail, but catches the most reasonable
                        //uses of ..
                        break;
                    } else if (i > 0) {
                        ary.splice(i - 1, 2);
                        i -= 2;
                    }
                }
            }
        }

        /**
         * Given a relative module name, like ./something, normalize it to
         * a real name that can be mapped to a path.
         * @param {String} name the relative name
         * @param {String} baseName a real name that the name arg is relative
         * to.
         * @param {Boolean} applyMap apply the map config to the value. Should
         * only be done if this normalization is for a dependency ID.
         * @returns {String} normalized name
         */
        function normalize(name, baseName, applyMap) {
            var pkgName, pkgConfig, mapValue, nameParts, i, j, nameSegment,
                foundMap, foundI, foundStarMap, starI,
                baseParts = baseName && baseName.split('/'),
                normalizedBaseParts = baseParts,
                map = config.map,
                starMap = map && map['*'];

            //Adjust any relative paths.
            if (name && name.charAt(0) === '.') {
                //If have a base name, try to normalize against it,
                //otherwise, assume it is a top-level require that will
                //be relative to baseUrl in the end.
                if (baseName) {
                    if (getOwn(config.pkgs, baseName)) {
                        //If the baseName is a package name, then just treat it as one
                        //name to concat the name with.
                        normalizedBaseParts = baseParts = [baseName];
                    } else {
                        //Convert baseName to array, and lop off the last part,
                        //so that . matches that 'directory' and not name of the baseName's
                        //module. For instance, baseName of 'one/two/three', maps to
                        //'one/two/three.js', but we want the directory, 'one/two' for
                        //this normalization.
                        normalizedBaseParts = baseParts.slice(0, baseParts.length - 1);
                    }

                    name = normalizedBaseParts.concat(name.split('/'));
                    trimDots(name);

                    //Some use of packages may use a . path to reference the
                    //'main' module name, so normalize for that.
                    pkgConfig = getOwn(config.pkgs, (pkgName = name[0]));
                    name = name.join('/');
                    if (pkgConfig && name === pkgName + '/' + pkgConfig.main) {
                        name = pkgName;
                    }
                } else if (name.indexOf('./') === 0) {
                    // No baseName, so this is ID is resolved relative
                    // to baseUrl, pull off the leading dot.
                    name = name.substring(2);
                }
            }

            //Apply map config if available.
            if (applyMap && (baseParts || starMap) && map) {
                nameParts = name.split('/');

                for (i = nameParts.length; i > 0; i -= 1) {
                    nameSegment = nameParts.slice(0, i).join('/');

                    if (baseParts) {
                        //Find the longest baseName segment match in the config.
                        //So, do joins on the biggest to smallest lengths of baseParts.
                        for (j = baseParts.length; j > 0; j -= 1) {
                            mapValue = getOwn(map, baseParts.slice(0, j).join('/'));

                            //baseName segment has config, find if it has one for
                            //this name.
                            if (mapValue) {
                                mapValue = getOwn(mapValue, nameSegment);
                                if (mapValue) {
                                    //Match, update name to the new value.
                                    foundMap = mapValue;
                                    foundI = i;
                                    break;
                                }
                            }
                        }
                    }

                    if (foundMap) {
                        break;
                    }

                    //Check for a star map match, but just hold on to it,
                    //if there is a shorter segment match later in a matching
                    //config, then favor over this star map.
                    if (!foundStarMap && starMap && getOwn(starMap, nameSegment)) {
                        foundStarMap = getOwn(starMap, nameSegment);
                        starI = i;
                    }
                }

                if (!foundMap && foundStarMap) {
                    foundMap = foundStarMap;
                    foundI = starI;
                }

                if (foundMap) {
                    nameParts.splice(0, foundI, foundMap);
                    name = nameParts.join('/');
                }
            }

            return name;
        }

        function removeScript(name) {
            if (isBrowser) {
                each(scripts(), function (scriptNode) {
                    if (scriptNode.getAttribute('data-requiremodule') === name &&
                            scriptNode.getAttribute('data-requirecontext') === context.contextName) {
                        scriptNode.parentNode.removeChild(scriptNode);
                        return true;
                    }
                });
            }
        }

        function hasPathFallback(id) {
            var pathConfig = getOwn(config.paths, id);
            if (pathConfig && isArray(pathConfig) && pathConfig.length > 1) {
                removeScript(id);
                //Pop off the first array value, since it failed, and
                //retry
                pathConfig.shift();
                context.require.undef(id);
                context.require([id]);
                return true;
            }
        }

        //Turns a plugin!resource to [plugin, resource]
        //with the plugin being undefined if the name
        //did not have a plugin prefix.
        function splitPrefix(name) {
            var prefix,
                index = name ? name.indexOf('!') : -1;
            if (index > -1) {
                prefix = name.substring(0, index);
                name = name.substring(index + 1, name.length);
            }
            return [prefix, name];
        }

        /**
         * Creates a module mapping that includes plugin prefix, module
         * name, and path. If parentModuleMap is provided it will
         * also normalize the name via require.normalize()
         *
         * @param {String} name the module name
         * @param {String} [parentModuleMap] parent module map
         * for the module name, used to resolve relative names.
         * @param {Boolean} isNormalized: is the ID already normalized.
         * This is true if this call is done for a define() module ID.
         * @param {Boolean} applyMap: apply the map config to the ID.
         * Should only be true if this map is for a dependency.
         *
         * @returns {Object}
         */
        function makeModuleMap(name, parentModuleMap, isNormalized, applyMap) {
            var url, pluginModule, suffix, nameParts,
                prefix = null,
                parentName = parentModuleMap ? parentModuleMap.name : null,
                originalName = name,
                isDefine = true,
                normalizedName = '';

            //If no name, then it means it is a require call, generate an
            //internal name.
            if (!name) {
                isDefine = false;
                name = '_@r' + (requireCounter += 1);
            }

            nameParts = splitPrefix(name);
            prefix = nameParts[0];
            name = nameParts[1];

            if (prefix) {
                prefix = normalize(prefix, parentName, applyMap);
                pluginModule = getOwn(defined, prefix);
                
                // cell patch
                if (!name) {
                    name = parentName;
                }
            }

            //Account for relative paths if there is a base name.
            if (name) {
                if (prefix) {
                    if (pluginModule && pluginModule.normalize) {
                        //Plugin is loaded, use its normalize method.
                        normalizedName = pluginModule.normalize(name, function (name) {
                            return normalize(name, parentName, applyMap);
                        });
                    } else {
                        normalizedName = normalize(name, parentName, applyMap);
                    }
                } else {
                    //A regular module.
                    normalizedName = normalize(name, parentName, applyMap);

                    //Normalized name may be a plugin ID due to map config
                    //application in normalize. The map config values must
                    //already be normalized, so do not need to redo that part.
                    nameParts = splitPrefix(normalizedName);
                    prefix = nameParts[0];
                    normalizedName = nameParts[1];
                    isNormalized = true;

                    url = context.nameToUrl(normalizedName);
                }
            }

            //If the id is a plugin id that cannot be determined if it needs
            //normalization, stamp it with a unique ID so two matching relative
            //ids that may conflict can be separate.
            suffix = prefix && !pluginModule && !isNormalized ?
                     '_unnormalized' + (unnormalizedCounter += 1) :
                     '';

            return {
                prefix: prefix,
                name: normalizedName,
                parentMap: parentModuleMap,
                unnormalized: !!suffix,
                url: url,
                originalName: originalName,
                isDefine: isDefine,
                id: (prefix ?
                        prefix + '!' + normalizedName :
                        normalizedName) + suffix
            };
        }

        function getModule(depMap) {
            var id = depMap.id,
                mod = getOwn(registry, id);

            if (!mod) {
                mod = registry[id] = new context.Module(depMap);
            }

            return mod;
        }

        function on(depMap, name, fn) {
            var id = depMap.id,
                mod = getOwn(registry, id);

            if (hasProp(defined, id) &&
                    (!mod || mod.defineEmitComplete)) {
                if (name === 'defined') {
                    fn(defined[id]);
                }
            } else {
                getModule(depMap).on(name, fn);
            }
        }

        function onError(err, errback) {
            var ids = err.requireModules,
                notified = false;

            if (errback) {
                errback(err);
            } else {
                each(ids, function (id) {
                    var mod = getOwn(registry, id);
                    if (mod) {
                        //Set error on module, so it skips timeout checks.
                        mod.error = err;
                        if (mod.events.error) {
                            notified = true;
                            mod.emit('error', err);
                        }
                    }
                });

                if (!notified) {
                    req.onError(err);
                }
            }
        }

        /**
         * Internal method to transfer globalQueue items to this context's
         * defQueue.
         */
        function takeGlobalQueue() {
            //Push all the globalDefQueue items into the context's defQueue
            if (globalDefQueue.length) {
                //Array splice in the values since the context code has a
                //local var ref to defQueue, so cannot just reassign the one
                //on context.
                apsp.apply(defQueue,
                           [defQueue.length - 1, 0].concat(globalDefQueue));
                globalDefQueue = [];
            }
        }

        handlers = {
            'require': function (mod) {
                if (mod.require) {
                    return mod.require;
                } else {
                    return (mod.require = context.makeRequire(mod.map));
                }
            },
            'exports': function (mod) {
                mod.usingExports = true;
                if (mod.map.isDefine) {
                    if (mod.exports) {
                        return mod.exports;
                    } else {
                        return (mod.exports = defined[mod.map.id] = {});
                    }
                }
            },
            'module': function (mod) {
                if (mod.module) {
                    return mod.module;
                } else {
                    return (mod.module = {
                        id: mod.map.id,
                        uri: mod.map.url,
                        config: function () {
                            return (config.config && getOwn(config.config, mod.map.id)) || {};
                        },
                        exports: defined[mod.map.id]
                    });
                }
            }
        };

        function cleanRegistry(id) {
            //Clean up machinery used for waiting modules.
            delete registry[id];
        }

        function breakCycle(mod, traced, processed) {
            var id = mod.map.id;

            if (mod.error) {
                mod.emit('error', mod.error);
            } else {
                traced[id] = true;
                each(mod.depMaps, function (depMap, i) {
                    var depId = depMap.id,
                        dep = getOwn(registry, depId);

                    //Only force things that have not completed
                    //being defined, so still in the registry,
                    //and only if it has not been matched up
                    //in the module already.
                    if (dep && !mod.depMatched[i] && !processed[depId]) {
                        if (getOwn(traced, depId)) {
                            mod.defineDep(i, defined[depId]);
                            mod.check(); //pass false?
                        } else {
                            breakCycle(dep, traced, processed);
                        }
                    }
                });
                processed[id] = true;
            }
        }

        function checkLoaded() {
            var map, modId, err, usingPathFallback,
                waitInterval = config.waitSeconds * 1000,
                //It is possible to disable the wait interval by using waitSeconds of 0.
                expired = waitInterval && (context.startTime + waitInterval) < new Date().getTime(),
                noLoads = [],
                reqCalls = [],
                stillLoading = false,
                needCycleCheck = true;

            //Do not bother if this call was a result of a cycle break.
            if (inCheckLoaded) {
                return;
            }

            inCheckLoaded = true;

            //Figure out the state of all the modules.
            eachProp(registry, function (mod) {
                map = mod.map;
                modId = map.id;

                //Skip things that are not enabled or in error state.
                if (!mod.enabled) {
                    return;
                }

                if (!map.isDefine) {
                    reqCalls.push(mod);
                }

                if (!mod.error) {
                    //If the module should be executed, and it has not
                    //been inited and time is up, remember it.
                    if (!mod.inited && expired) {
                        if (hasPathFallback(modId)) {
                            usingPathFallback = true;
                            stillLoading = true;
                        } else {
                            noLoads.push(modId);
                            removeScript(modId);
                        }
                    } else if (!mod.inited && mod.fetched && map.isDefine) {
                        stillLoading = true;
                        if (!map.prefix) {
                            //No reason to keep looking for unfinished
                            //loading. If the only stillLoading is a
                            //plugin resource though, keep going,
                            //because it may be that a plugin resource
                            //is waiting on a non-plugin cycle.
                            return (needCycleCheck = false);
                        }
                    }
                }
            });

            if (expired && noLoads.length) {
                //If wait time expired, throw error of unloaded modules.
                err = makeError('timeout', 'Load timeout for modules: ' + noLoads, null, noLoads);
                err.contextName = context.contextName;
                return onError(err);
            }

            //Not expired, check for a cycle.
            if (needCycleCheck) {
                each(reqCalls, function (mod) {
                    breakCycle(mod, {}, {});
                });
            }

            //If still waiting on loads, and the waiting load is something
            //other than a plugin resource, or there are still outstanding
            //scripts, then just try back later.
            if ((!expired || usingPathFallback) && stillLoading) {
                //Something is still waiting to load. Wait for it, but only
                //if a timeout is not already in effect.
                if ((isBrowser || isWebWorker) && !checkLoadedTimeoutId) {
                    checkLoadedTimeoutId = setTimeout(function () {
                        checkLoadedTimeoutId = 0;
                        checkLoaded();
                    }, 50);
                }
            }

            inCheckLoaded = false;
        }

        Module = function (map) {
            this.events = getOwn(undefEvents, map.id) || {};
            this.map = map;
            this.shim = getOwn(config.shim, map.id);
            this.depExports = [];
            this.depMaps = [];
            this.depMatched = [];
            this.pluginMaps = {};
            this.depCount = 0;

            /* this.exports this.factory
               this.depMaps = [],
               this.enabled, this.fetched
            */
        };

        Module.prototype = {
            init: function (depMaps, factory, errback, options) {
                options = options || {};

                //Do not do more inits if already done. Can happen if there
                //are multiple define calls for the same module. That is not
                //a normal, common case, but it is also not unexpected.
                if (this.inited) {
                    return;
                }

                this.factory = factory;

                if (errback) {
                    //Register for errors on this module.
                    this.on('error', errback);
                } else if (this.events.error) {
                    //If no errback already, but there are error listeners
                    //on this module, set up an errback to pass to the deps.
                    errback = bind(this, function (err) {
                        this.emit('error', err);
                    });
                }

                //Do a copy of the dependency array, so that
                //source inputs are not modified. For example
                //"shim" deps are passed in here directly, and
                //doing a direct modification of the depMaps array
                //would affect that config.
                this.depMaps = depMaps && depMaps.slice(0);

                this.errback = errback;

                //Indicate this module has be initialized
                this.inited = true;

                this.ignore = options.ignore;

                //Could have option to init this module in enabled mode,
                //or could have been previously marked as enabled. However,
                //the dependencies are not known until init is called. So
                //if enabled previously, now trigger dependencies as enabled.
                if (options.enabled || this.enabled) {
                    //Enable this module and dependencies.
                    //Will call this.check()
                    this.enable();
                } else {
                    this.check();
                }
            },

            defineDep: function (i, depExports) {
                //Because of cycles, defined callback for a given
                //export can be called more than once.
                if (!this.depMatched[i]) {
                    this.depMatched[i] = true;
                    this.depCount -= 1;
                    this.depExports[i] = depExports;
                }
            },

            fetch: function () {
                if (this.fetched) {
                    return;
                }
                this.fetched = true;

                context.startTime = (new Date()).getTime();

                var map = this.map;

                //If the manager is for a plugin managed resource,
                //ask the plugin to load it now.
                if (this.shim) {
                    context.makeRequire(this.map, {
                        enableBuildCallback: true
                    })(this.shim.deps || [], bind(this, function () {
                        return map.prefix ? this.callPlugin() : this.load();
                    }));
                } else {
                    //Regular dependency.
                    return map.prefix ? this.callPlugin() : this.load();
                }
            },

            load: function () {
                var url = this.map.url;

                //Regular dependency.
                if (!urlFetched[url]) {
                    urlFetched[url] = true;
                    context.load(this.map.id, url);
                }
            },

            /**
             * Checks is the module is ready to define itself, and if so,
             * define it.
             */
            check: function () {
                if (!this.enabled || this.enabling) {
                    return;
                }

                var err, cjsModule,
                    id = this.map.id,
                    depExports = this.depExports,
                    exports = this.exports,
                    factory = this.factory;

                if (!this.inited) {
                    this.fetch();
                } else if (this.error) {
                    this.emit('error', this.error);
                } else if (!this.defining) {
                    //The factory could trigger another require call
                    //that would result in checking this module to
                    //define itself again. If already in the process
                    //of doing that, skip this work.
                    this.defining = true;

                    if (this.depCount < 1 && !this.defined) {
                        if (isFunction(factory)) {
                            //If there is an error listener, favor passing
                            //to that instead of throwing an error.
                            if (this.events.error) {
                                try {
                                    exports = context.execCb(id, factory, depExports, exports);
                                } catch (e) {
                                    err = e;
                                }
                            } else {
                                exports = context.execCb(id, factory, depExports, exports);
                            }

                            if (this.map.isDefine) {
                                //If setting exports via 'module' is in play,
                                //favor that over return value and exports. After that,
                                //favor a non-undefined return value over exports use.
                                cjsModule = this.module;
                                if (cjsModule &&
                                        cjsModule.exports !== undefined &&
                                        //Make sure it is not already the exports value
                                        cjsModule.exports !== this.exports) {
                                    exports = cjsModule.exports;
                                } else if (exports === undefined && this.usingExports) {
                                    //exports already set the defined value.
                                    exports = this.exports;
                                }
                            }

                            if (err) {
                                err.requireMap = this.map;
                                err.requireModules = [this.map.id];
                                err.requireType = 'define';
                                return onError((this.error = err));
                            }

                        } else {
                            //Just a literal value
                            exports = factory;
                        }

                        this.exports = exports;

                        if (this.map.isDefine && !this.ignore) {
                            defined[id] = exports;

                            if (req.onResourceLoad) {
                                req.onResourceLoad(context, this.map, this.depMaps);
                            }
                        }

                        //Clean up
                        delete registry[id];

                        this.defined = true;
                    }

                    //Finished the define stage. Allow calling check again
                    //to allow define notifications below in the case of a
                    //cycle.
                    this.defining = false;

                    if (this.defined && !this.defineEmitted) {
                        this.defineEmitted = true;
                        this.emit('defined', this.exports);
                        this.defineEmitComplete = true;
                    }

                }
            },

            callPlugin: function () {
                var map = this.map,
                    id = map.id,
                    //Map already normalized the prefix.
                    pluginMap = makeModuleMap(map.prefix);

                //Mark this as a dependency for this plugin, so it
                //can be traced for cycles.
                this.depMaps.push(pluginMap);

                on(pluginMap, 'defined', bind(this, function (plugin) {
                    var load, normalizedMap, normalizedMod,
                        name = this.map.name,
                        parentName = this.map.parentMap ? this.map.parentMap.name : null,
                        localRequire = context.makeRequire(map.parentMap, {
                            enableBuildCallback: true,
                            skipMap: true
                        });

                    //If current map is not normalized, wait for that
                    //normalized name to load instead of continuing.
                    if (this.map.unnormalized) {
                        //Normalize the ID if the plugin allows it.
                        if (plugin.normalize) {
                            name = plugin.normalize(name, function (name) {
                                return normalize(name, parentName, true);
                            }) || '';
                        }

                        //prefix and name should already be normalized, no need
                        //for applying map config again either.
                        normalizedMap = makeModuleMap(map.prefix + '!' + name,
                                                      this.map.parentMap);
                        on(normalizedMap,
                            'defined', bind(this, function (value) {
                                this.init([], function () { return value; }, null, {
                                    enabled: true,
                                    ignore: true
                                });
                            }));

                        normalizedMod = getOwn(registry, normalizedMap.id);
                        if (normalizedMod) {
                            //Mark this as a dependency for this plugin, so it
                            //can be traced for cycles.
                            this.depMaps.push(normalizedMap);

                            if (this.events.error) {
                                normalizedMod.on('error', bind(this, function (err) {
                                    this.emit('error', err);
                                }));
                            }
                            normalizedMod.enable();
                        }

                        return;
                    }

                    load = bind(this, function (value) {
                        this.init([], function () { return value; }, null, {
                            enabled: true
                        });
                    });

                    load.error = bind(this, function (err) {
                        this.inited = true;
                        this.error = err;
                        err.requireModules = [id];

                        //Remove temp unnormalized modules for this module,
                        //since they will never be resolved otherwise now.
                        eachProp(registry, function (mod) {
                            if (mod.map.id.indexOf(id + '_unnormalized') === 0) {
                                cleanRegistry(mod.map.id);
                            }
                        });

                        onError(err);
                    });

                    //Allow plugins to load other code without having to know the
                    //context or how to 'complete' the load.
                    load.fromText = bind(this, function (text, textAlt) {
                        /*jslint evil: true */
                        var moduleName = map.name,
                            moduleMap = makeModuleMap(moduleName),
                            hasInteractive = useInteractive;

                        //As of 2.1.0, support just passing the text, to reinforce
                        //fromText only being called once per resource. Still
                        //support old style of passing moduleName but discard
                        //that moduleName in favor of the internal ref.
                        if (textAlt) {
                            text = textAlt;
                        }

                        //Turn off interactive script matching for IE for any define
                        //calls in the text, then turn it back on at the end.
                        if (hasInteractive) {
                            useInteractive = false;
                        }

                        //Prime the system by creating a module instance for
                        //it.
                        getModule(moduleMap);

                        //Transfer any config to this other module.
                        if (hasProp(config.config, id)) {
                            config.config[moduleName] = config.config[id];
                        }

                        try {
                            req.exec(text);
                        } catch (e) {
                            throw new Error('fromText eval for ' + moduleName +
                                            ' failed: ' + e);
                        }

                        if (hasInteractive) {
                            useInteractive = true;
                        }

                        //Mark this as a dependency for the plugin
                        //resource
                        this.depMaps.push(moduleMap);

                        //Support anonymous modules.
                        context.completeLoad(moduleName);

                        //Bind the value of that module to the value for this
                        //resource ID.
                        localRequire([moduleName], load);
                    });

                    //Use parentName here since the plugin's name is not reliable,
                    //could be some weird string with no path that actually wants to
                    //reference the parentName's path.
                    plugin.load(map.name, localRequire, load, config);
                }));

                context.enable(pluginMap, this);
                this.pluginMaps[pluginMap.id] = pluginMap;
            },

            enable: function () {
                this.enabled = true;

                //Set flag mentioning that the module is enabling,
                //so that immediate calls to the defined callbacks
                //for dependencies do not trigger inadvertent load
                //with the depCount still being zero.
                this.enabling = true;

                //Enable each dependency
                each(this.depMaps, bind(this, function (depMap, i) {
                    var id, mod, handler;

                    if (typeof depMap === 'string') {
                        //Dependency needs to be converted to a depMap
                        //and wired up to this module.
                        depMap = makeModuleMap(depMap,
                                               (this.map.isDefine ? this.map : this.map.parentMap),
                                               false,
                                               !this.skipMap);
                        this.depMaps[i] = depMap;

                        handler = getOwn(handlers, depMap.id);

                        if (handler) {
                            this.depExports[i] = handler(this);
                            return;
                        }

                        this.depCount += 1;

                        on(depMap, 'defined', bind(this, function (depExports) {
                            this.defineDep(i, depExports);
                            this.check();
                        }));

                        if (this.errback) {
                            on(depMap, 'error', this.errback);
                        }
                    }

                    id = depMap.id;
                    mod = registry[id];

                    //Skip special modules like 'require', 'exports', 'module'
                    //Also, don't call enable if it is already enabled,
                    //important in circular dependency cases.
                    if (!hasProp(handlers, id) && mod && !mod.enabled) {
                        context.enable(depMap, this);
                    }
                }));

                //Enable each plugin that is used in
                //a dependency
                eachProp(this.pluginMaps, bind(this, function (pluginMap) {
                    var mod = getOwn(registry, pluginMap.id);
                    if (mod && !mod.enabled) {
                        context.enable(pluginMap, this);
                    }
                }));

                this.enabling = false;

                this.check();
            },

            on: function (name, cb) {
                var cbs = this.events[name];
                if (!cbs) {
                    cbs = this.events[name] = [];
                }
                cbs.push(cb);
            },

            emit: function (name, evt) {
                each(this.events[name], function (cb) {
                    cb(evt);
                });
                if (name === 'error') {
                    //Now that the error handler was triggered, remove
                    //the listeners, since this broken Module instance
                    //can stay around for a while in the registry.
                    delete this.events[name];
                }
            }
        };

        function callGetModule(args) {
            //Skip modules already defined.
            if (!hasProp(defined, args[0])) {
                getModule(makeModuleMap(args[0], null, true)).init(args[1], args[2]);
            }
        }

        function removeListener(node, func, name, ieName) {
            //Favor detachEvent because of IE9
            //issue, see attachEvent/addEventListener comment elsewhere
            //in this file.
            if (node.detachEvent && !isOpera) {
                //Probably IE. If not it will throw an error, which will be
                //useful to know.
                if (ieName) {
                    node.detachEvent(ieName, func);
                }
            } else {
                node.removeEventListener(name, func, false);
            }
        }

        /**
         * Given an event from a script node, get the requirejs info from it,
         * and then removes the event listeners on the node.
         * @param {Event} evt
         * @returns {Object}
         */
        function getScriptData(evt) {
            //Using currentTarget instead of target for Firefox 2.0's sake. Not
            //all old browsers will be supported, but this one was easy enough
            //to support and still makes sense.
            var node = evt.currentTarget || evt.srcElement;

            //Remove the listeners once here.
            removeListener(node, context.onScriptLoad, 'load', 'onreadystatechange');
            removeListener(node, context.onScriptError, 'error');

            return {
                node: node,
                id: node && node.getAttribute('data-requiremodule')
            };
        }

        function intakeDefines() {
            var args;

            //Any defined modules in the global queue, intake them now.
            takeGlobalQueue();

            //Make sure any remaining defQueue items get properly processed.
            while (defQueue.length) {
                args = defQueue.shift();
                if (args[0] === null) {
                    return onError(makeError('mismatch', 'Mismatched anonymous define() module: ' + args[args.length - 1]));
                } else {
                    //args are id, deps, factory. Should be normalized by the
                    //define() function.
                    callGetModule(args);
                }
            }
        }

        context = {
            config: config,
            contextName: contextName,
            registry: registry,
            defined: defined,
            urlFetched: urlFetched,
            defQueue: defQueue,
            Module: Module,
            makeModuleMap: makeModuleMap,
            nextTick: req.nextTick,

            /**
             * Set a configuration for the context.
             * @param {Object} cfg config object to integrate.
             */
            configure: function (cfg) {
                //Make sure the baseUrl ends in a slash.
                if (cfg.baseUrl) {
                    if (cfg.baseUrl.charAt(cfg.baseUrl.length - 1) !== '/') {
                        cfg.baseUrl += '/';
                    }
                }

                //Save off the paths and packages since they require special processing,
                //they are additive.
                var pkgs = config.pkgs,
                    shim = config.shim,
                    objs = {
                        paths: true,
                        config: true,
                        map: true
                    };

                eachProp(cfg, function (value, prop) {
                    if (objs[prop]) {
                        if (prop === 'map') {
                            mixin(config[prop], value, true, true);
                        } else {
                            mixin(config[prop], value, true);
                        }
                    } else {
                        config[prop] = value;
                    }
                });

                //Merge shim
                if (cfg.shim) {
                    eachProp(cfg.shim, function (value, id) {
                        //Normalize the structure
                        if (isArray(value)) {
                            value = {
                                deps: value
                            };
                        }
                        if ((value.exports || value.init) && !value.exportsFn) {
                            value.exportsFn = context.makeShimExports(value);
                        }
                        shim[id] = value;
                    });
                    config.shim = shim;
                }

                //Adjust packages if necessary.
                if (cfg.packages) {
                    each(cfg.packages, function (pkgObj) {
                        var location;

                        pkgObj = typeof pkgObj === 'string' ? { name: pkgObj } : pkgObj;
                        location = pkgObj.location;

                        //Create a brand new object on pkgs, since currentPackages can
                        //be passed in again, and config.pkgs is the internal transformed
                        //state for all package configs.
                        pkgs[pkgObj.name] = {
                            name: pkgObj.name,
                            location: location || pkgObj.name,
                            //Remove leading dot in main, so main paths are normalized,
                            //and remove any trailing .js, since different package
                            //envs have different conventions: some use a module name,
                            //some use a file name.
                            main: (pkgObj.main || 'main')
                                  .replace(currDirRegExp, '')
                                  .replace(jsSuffixRegExp, '')
                        };
                    });

                    //Done with modifications, assing packages back to context config
                    config.pkgs = pkgs;
                }

                //If there are any "waiting to execute" modules in the registry,
                //update the maps for them, since their info, like URLs to load,
                //may have changed.
                eachProp(registry, function (mod, id) {
                    //If module already has init called, since it is too
                    //late to modify them, and ignore unnormalized ones
                    //since they are transient.
                    if (!mod.inited && !mod.map.unnormalized) {
                        mod.map = makeModuleMap(id);
                    }
                });

                //If a deps array or a config callback is specified, then call
                //require with those args. This is useful when require is defined as a
                //config object before require.js is loaded.
                if (cfg.deps || cfg.callback) {
                    context.require(cfg.deps || [], cfg.callback);
                }
            },

            makeShimExports: function (value) {
                function fn() {
                    var ret;
                    if (value.init) {
                        ret = value.init.apply(global, arguments);
                    }
                    return ret || (value.exports && getGlobal(value.exports));
                }
                return fn;
            },

            makeRequire: function (relMap, options) {
                options = options || {};

                function localRequire(deps, callback, errback) {
                    var id, map, requireMod;

                    if (options.enableBuildCallback && callback && isFunction(callback)) {
                        callback.__requireJsBuild = true;
                    }

                    if (typeof deps === 'string') {
                        if (isFunction(callback)) {
                            //Invalid call
                            return onError(makeError('requireargs', 'Invalid require call'), errback);
                        }

                        //If require|exports|module are requested, get the
                        //value for them from the special handlers. Caveat:
                        //this only works while module is being defined.
                        if (relMap && hasProp(handlers, deps)) {
                            return handlers[deps](registry[relMap.id]);
                        }

                        //Synchronous access to one module. If require.get is
                        //available (as in the Node adapter), prefer that.
                        if (req.get) {
                            return req.get(context, deps, relMap);
                        }

                        //Normalize module name, if it contains . or ..
                        map = makeModuleMap(deps, relMap, false, true);
                        id = map.id;

                        if (!hasProp(defined, id)) {
                            return onError(makeError('notloaded', 'Module name "' +
                                        id +
                                        '" has not been loaded yet for context: ' +
                                        contextName +
                                        (relMap ? '' : '. Use require([])')));
                        }
                        return defined[id];
                    }

                    //Grab defines waiting in the global queue.
                    intakeDefines();

                    //Mark all the dependencies as needing to be loaded.
                    context.nextTick(function () {
                        //Some defines could have been added since the
                        //require call, collect them.
                        intakeDefines();

                        requireMod = getModule(makeModuleMap(null, relMap));

                        //Store if map config should be applied to this require
                        //call for dependencies.
                        requireMod.skipMap = options.skipMap;

                        requireMod.init(deps, callback, errback, {
                            enabled: true
                        });

                        checkLoaded();
                    });

                    return localRequire;
                }

                mixin(localRequire, {
                    isBrowser: isBrowser,

                    /**
                     * Converts a module name + .extension into an URL path.
                     * *Requires* the use of a module name. It does not support using
                     * plain URLs like nameToUrl.
                     */
                    toUrl: function (moduleNamePlusExt) {
                        var index = moduleNamePlusExt.lastIndexOf('.'),
                            ext = null;

                        if (index !== -1) {
                            ext = moduleNamePlusExt.substring(index, moduleNamePlusExt.length);
                            moduleNamePlusExt = moduleNamePlusExt.substring(0, index);
                        }

                        return context.nameToUrl(normalize(moduleNamePlusExt,
                                                relMap && relMap.id, true), ext);
                    },

                    defined: function (id) {
                        return hasProp(defined, makeModuleMap(id, relMap, false, true).id);
                    },

                    specified: function (id) {
                        id = makeModuleMap(id, relMap, false, true).id;
                        return hasProp(defined, id) || hasProp(registry, id);
                    }
                });

                //Only allow undef on top level require calls
                if (!relMap) {
                    localRequire.undef = function (id) {
                        //Bind any waiting define() calls to this context,
                        //fix for #408
                        takeGlobalQueue();

                        var map = makeModuleMap(id, relMap, true),
                            mod = getOwn(registry, id);

                        delete defined[id];
                        delete urlFetched[map.url];
                        delete undefEvents[id];

                        if (mod) {
                            //Hold on to listeners in case the
                            //module will be attempted to be reloaded
                            //using a different config.
                            if (mod.events.defined) {
                                undefEvents[id] = mod.events;
                            }

                            cleanRegistry(id);
                        }
                    };
                }

                return localRequire;
            },

            /**
             * Called to enable a module if it is still in the registry
             * awaiting enablement. parent module is passed in for context,
             * used by the optimizer.
             */
            enable: function (depMap, parent) {
                var mod = getOwn(registry, depMap.id);
                if (mod) {
                    getModule(depMap).enable();
                }
            },

            /**
             * Internal method used by environment adapters to complete a load event.
             * A load event could be a script load or just a load pass from a synchronous
             * load call.
             * @param {String} moduleName the name of the module to potentially complete.
             */
            completeLoad: function (moduleName) {
                var found, args, mod,
                    shim = getOwn(config.shim, moduleName) || {},
                    shExports = shim.exports;

                takeGlobalQueue();

                while (defQueue.length) {
                    args = defQueue.shift();
                    if (args[0] === null) {
                        args[0] = moduleName;
                        //If already found an anonymous module and bound it
                        //to this name, then this is some other anon module
                        //waiting for its completeLoad to fire.
                        if (found) {
                            break;
                        }
                        found = true;
                    } else if (args[0] === moduleName) {
                        //Found matching define call for this script!
                        found = true;
                    }

                    callGetModule(args);
                }

                //Do this after the cycle of callGetModule in case the result
                //of those calls/init calls changes the registry.
                mod = getOwn(registry, moduleName);

                if (!found && !hasProp(defined, moduleName) && mod && !mod.inited) {
                    if (config.enforceDefine && (!shExports || !getGlobal(shExports))) {
                        if (hasPathFallback(moduleName)) {
                            return;
                        } else {
                            return onError(makeError('nodefine',
                                             'No define call for ' + moduleName,
                                             null,
                                             [moduleName]));
                        }
                    } else {
                        //A script that does not call define(), so just simulate
                        //the call for it.
                        callGetModule([moduleName, (shim.deps || []), shim.exportsFn]);
                    }
                }

                checkLoaded();
            },

            /**
             * Converts a module name to a file path. Supports cases where
             * moduleName may actually be just an URL.
             * Note that it **does not** call normalize on the moduleName,
             * it is assumed to have already been normalized. This is an
             * internal API, not a public one. Use toUrl for the public API.
             */
            nameToUrl: function (moduleName, ext) {
                var paths, pkgs, pkg, pkgPath, syms, i, parentModule, url,
                    parentPath;

                //If a colon is in the URL, it indicates a protocol is used and it is just
                //an URL to a file, or if it starts with a slash, contains a query arg (i.e. ?)
                //or ends with .js, then assume the user meant to use an url and not a module id.
                //The slash is important for protocol-less URLs as well as full paths.
                if (req.jsExtRegExp.test(moduleName)) {
                    //Just a plain path, not module name lookup, so just return it.
                    //Add extension if it is included. This is a bit wonky, only non-.js things pass
                    //an extension, this method probably needs to be reworked.
                    url = moduleName + (ext || '');
                } else {
                    //A module that needs to be converted to a path.
                    paths = config.paths;
                    pkgs = config.pkgs;

                    syms = moduleName.split('/');
                    //For each module name segment, see if there is a path
                    //registered for it. Start with most specific name
                    //and work up from it.
                    for (i = syms.length; i > 0; i -= 1) {
                        parentModule = syms.slice(0, i).join('/');
                        pkg = getOwn(pkgs, parentModule);
                        parentPath = getOwn(paths, parentModule);
                        if (parentPath) {
                            //If an array, it means there are a few choices,
                            //Choose the one that is desired
                            if (isArray(parentPath)) {
                                parentPath = parentPath[0];
                            }
                            syms.splice(0, i, parentPath);
                            break;
                        } else if (pkg) {
                            //If module name is just the package name, then looking
                            //for the main module.
                            if (moduleName === pkg.name) {
                                pkgPath = pkg.location + '/' + pkg.main;
                            } else {
                                pkgPath = pkg.location;
                            }
                            syms.splice(0, i, pkgPath);
                            break;
                        }
                    }

                    //Join the path parts together, then figure out if baseUrl is needed.
                    url = syms.join('/');
                    url += (ext || (/\?/.test(url) ? '' : '.js'));
                    url = (url.charAt(0) === '/' || url.match(/^[\w\+\.\-]+:/) ? '' : config.baseUrl) + url;
                }

                return config.urlArgs ? url +
                                        ((url.indexOf('?') === -1 ? '?' : '&') +
                                         config.urlArgs) : url;
            },

            //Delegates to req.load. Broken out as a separate function to
            //allow overriding in the optimizer.
            load: function (id, url) {
                req.load(context, id, url);
            },

            /**
             * Executes a module callack function. Broken out as a separate function
             * solely to allow the build system to sequence the files in the built
             * layer in the right sequence.
             *
             * @private
             */
            execCb: function (name, callback, args, exports) {
                return callback.apply(exports, args);
            },

            /**
             * callback for script loads, used to check status of loading.
             *
             * @param {Event} evt the event from the browser for the script
             * that was loaded.
             */
            onScriptLoad: function (evt) {
                //Using currentTarget instead of target for Firefox 2.0's sake. Not
                //all old browsers will be supported, but this one was easy enough
                //to support and still makes sense.
                if (evt.type === 'load' ||
                        (readyRegExp.test((evt.currentTarget || evt.srcElement).readyState))) {
                    //Reset interactive script so a script node is not held onto for
                    //to long.
                    interactiveScript = null;

                    //Pull out the name of the module and the context.
                    var data = getScriptData(evt);
                    context.completeLoad(data.id);
                }
            },

            /**
             * Callback for script errors.
             */
            onScriptError: function (evt) {
                var data = getScriptData(evt);
                if (!hasPathFallback(data.id)) {
                    return onError(makeError('scripterror', 'Script error', evt, [data.id]));
                }
            }
        };

        context.require = context.makeRequire();
        return context;
    }

    /**
     * Main entry point.
     *
     * If the only argument to require is a string, then the module that
     * is represented by that string is fetched for the appropriate context.
     *
     * If the first argument is an array, then it will be treated as an array
     * of dependency string names to fetch. An optional function callback can
     * be specified to execute when all of those dependencies are available.
     *
     * Make a local req variable to help Caja compliance (it assumes things
     * on a require that are not standardized), and to give a short
     * name for minification/local scope use.
     */
    req = requirejs = function (deps, callback, errback, optional) {

        //Find the right context, use default
        var context, config,
            contextName = defContextName;

        // Determine if have config object in the call.
        if (!isArray(deps) && typeof deps !== 'string') {
            // deps is a config object
            config = deps;
            if (isArray(callback)) {
                // Adjust args if there are dependencies
                deps = callback;
                callback = errback;
                errback = optional;
            } else {
                deps = [];
            }
        }

        if (config && config.context) {
            contextName = config.context;
        }

        context = getOwn(contexts, contextName);
        if (!context) {
            context = contexts[contextName] = req.s.newContext(contextName);
        }

        if (config) {
            context.configure(config);
        }

        return context.require(deps, callback, errback);
    };

    /**
     * Support require.config() to make it easier to cooperate with other
     * AMD loaders on globally agreed names.
     */
    req.config = function (config) {
        return req(config);
    };

    /**
     * Execute something after the current tick
     * of the event loop. Override for other envs
     * that have a better solution than setTimeout.
     * @param  {Function} fn function to execute later.
     */
    req.nextTick = typeof setTimeout !== 'undefined' ? function (fn) {
        setTimeout(fn, 4);
    } : function (fn) { fn(); };

    /**
     * Export require as a global, but only if it does not already exist.
     */
    if (!require) {
        require = req;
    }

    req.version = version;

    //Used to filter out dependencies that are already paths.
    req.jsExtRegExp = /^\/|:|\?|\.js$/;
    req.isBrowser = isBrowser;
    s = req.s = {
        contexts: contexts,
        newContext: newContext
    };

    //Create default context.
    req({});

    //Exports some context-sensitive methods on global require.
    each([
        'toUrl',
        'undef',
        'defined',
        'specified'
    ], function (prop) {
        //Reference from contexts instead of early binding to default context,
        //so that during builds, the latest instance of the default context
        //with its config gets used.
        req[prop] = function () {
            var ctx = contexts[defContextName];
            return ctx.require[prop].apply(ctx, arguments);
        };
    });

    if (isBrowser) {
        head = s.head = document.getElementsByTagName('head')[0];
        //If BASE tag is in play, using appendChild is a problem for IE6.
        //When that browser dies, this can be removed. Details in this jQuery bug:
        //http://dev.jquery.com/ticket/2709
        baseElement = document.getElementsByTagName('base')[0];
        if (baseElement) {
            head = s.head = baseElement.parentNode;
        }
    }

    /**
     * Any errors that require explicitly generates will be passed to this
     * function. Intercept/override it if you want custom error handling.
     * @param {Error} err the error object.
     */
    req.onError = function (err) {
        throw err;
    };

    /**
     * Does the request to load a module for the browser case.
     * Make this a separate function to allow other environments
     * to override it.
     *
     * @param {Object} context the require context to find state.
     * @param {String} moduleName the name of the module.
     * @param {Object} url the URL to the module.
     */
    req.load = function (context, moduleName, url) {
        var config = (context && context.config) || {},
            node;
        if (isBrowser) {
            //In the browser so use a script tag
            node = config.xhtml ?
                    document.createElementNS('http://www.w3.org/1999/xhtml', 'html:script') :
                    document.createElement('script');
            node.type = config.scriptType || 'text/javascript';
            node.charset = 'utf-8';
            node.async = true;

            node.setAttribute('data-requirecontext', context.contextName);
            node.setAttribute('data-requiremodule', moduleName);

            //Set up load listener. Test attachEvent first because IE9 has
            //a subtle issue in its addEventListener and script onload firings
            //that do not match the behavior of all other browsers with
            //addEventListener support, which fire the onload event for a
            //script right after the script execution. See:
            //https://connect.microsoft.com/IE/feedback/details/648057/script-onload-event-is-not-fired-immediately-after-script-execution
            //UNFORTUNATELY Opera implements attachEvent but does not follow the script
            //script execution mode.
            if (node.attachEvent &&
                    //Check if node.attachEvent is artificially added by custom script or
                    //natively supported by browser
                    //read https://github.com/jrburke/requirejs/issues/187
                    //if we can NOT find [native code] then it must NOT natively supported.
                    //in IE8, node.attachEvent does not have toString()
                    //Note the test for "[native code" with no closing brace, see:
                    //https://github.com/jrburke/requirejs/issues/273
                    !(node.attachEvent.toString && node.attachEvent.toString().indexOf('[native code') < 0) &&
                    !isOpera) {
                //Probably IE. IE (at least 6-8) do not fire
                //script onload right after executing the script, so
                //we cannot tie the anonymous define call to a name.
                //However, IE reports the script as being in 'interactive'
                //readyState at the time of the define call.
                useInteractive = true;

                node.attachEvent('onreadystatechange', context.onScriptLoad);
                //It would be great to add an error handler here to catch
                //404s in IE9+. However, onreadystatechange will fire before
                //the error handler, so that does not help. If addEvenListener
                //is used, then IE will fire error before load, but we cannot
                //use that pathway given the connect.microsoft.com issue
                //mentioned above about not doing the 'script execute,
                //then fire the script load event listener before execute
                //next script' that other browsers do.
                //Best hope: IE10 fixes the issues,
                //and then destroys all installs of IE 6-9.
                //node.attachEvent('onerror', context.onScriptError);
            } else {
                node.addEventListener('load', context.onScriptLoad, false);
                node.addEventListener('error', context.onScriptError, false);
            }
            node.src = url;

            //For some cache cases in IE 6-8, the script executes before the end
            //of the appendChild execution, so to tie an anonymous define
            //call to the module name (which is stored on the node), hold on
            //to a reference to this node, but clear after the DOM insertion.
            currentlyAddingScript = node;
            if (baseElement) {
                head.insertBefore(node, baseElement);
            } else {
                head.appendChild(node);
            }
            currentlyAddingScript = null;

            return node;
        } else if (isWebWorker) {
            //In a web worker, use importScripts. This is not a very
            //efficient use of importScripts, importScripts will block until
            //its script is downloaded and evaluated. However, if web workers
            //are in play, the expectation that a build has been done so that
            //only one script needs to be loaded anyway. This may need to be
            //reevaluated if other use cases become common.
            importScripts(url);

            //Account for anonymous modules
            context.completeLoad(moduleName);
        }
    };

    function getInteractiveScript() {
        if (interactiveScript && interactiveScript.readyState === 'interactive') {
            return interactiveScript;
        }

        eachReverse(scripts(), function (script) {
            if (script.readyState === 'interactive') {
                return (interactiveScript = script);
            }
        });
        return interactiveScript;
    }

    //Look for a data-main script attribute, which could also adjust the baseUrl.
    if (isBrowser) {
        //Figure out baseUrl. Get it from the script tag with require.js in it.
        eachReverse(scripts(), function (script) {
            //Set the 'head' where we can append children by
            //using the script's parent.
            if (!head) {
                head = script.parentNode;
            }

            //Look for a data-main attribute to set main script for the page
            //to load. If it is there, the path to data main becomes the
            //baseUrl, if it is not already set.
            dataMain = script.getAttribute('data-main');
            if (dataMain) {
                //Set final baseUrl if there is not already an explicit one.
                if (!cfg.baseUrl) {
                    //Pull off the directory of data-main for use as the
                    //baseUrl.
                    src = dataMain.split('/');
                    mainScript = src.pop();
                    subPath = src.length ? src.join('/')  + '/' : './';

                    cfg.baseUrl = subPath;
                    dataMain = mainScript;
                }

                //Strip off any trailing .js since dataMain is now
                //like a module name.
                dataMain = dataMain.replace(jsSuffixRegExp, '');

                //Put the data-main script in the files to load.
                cfg.deps = cfg.deps ? cfg.deps.concat(dataMain) : [dataMain];

                return true;
            }
        });
    }

    /**
     * The function that handles definitions of modules. Differs from
     * require() in that a string for the module should be the first argument,
     * and the function to execute after dependencies are loaded should
     * return a value to define the module corresponding to the first argument's
     * name.
     */
    define = function (name, deps, callback) {
        var node, context;

        //Allow for anonymous modules
        if (typeof name !== 'string') {
            //Adjust args appropriately
            callback = deps;
            deps = name;
            name = null;
        }

        //This module may not have dependencies
        if (!isArray(deps)) {
            callback = deps;
            deps = [];
        }

        //If no name, and callback is a function, then figure out if it a
        //CommonJS thing with dependencies.
        if (!deps.length && isFunction(callback)) {
            //Remove comments from the callback string,
            //look for require calls, and pull them into the dependencies,
            //but only if there are function args.
            if (callback.length) {
                callback
                    .toString()
                    .replace(commentRegExp, '')
                    .replace(cjsRequireRegExp, function (match, dep) {
                        deps.push(dep);
                    });

                //May be a CommonJS thing even without require calls, but still
                //could use exports, and module. Avoid doing exports and module
                //work though if it just needs require.
                //REQUIRES the function to expect the CommonJS variables in the
                //order listed below.
                deps = (callback.length === 1 ? ['require'] : ['require', 'exports', 'module']).concat(deps);
            }
        }

        //If in IE 6-8 and hit an anonymous define() call, do the interactive
        //work.
        if (useInteractive) {
            node = currentlyAddingScript || getInteractiveScript();
            if (node) {
                if (!name) {
                    name = node.getAttribute('data-requiremodule');
                }
                context = contexts[node.getAttribute('data-requirecontext')];
            }
        }

        //Always save off evaluating the def call until the script onload handler.
        //This allows multiple modules to be in a file without prematurely
        //tracing dependencies, and allows for anonymous module support,
        //where the module name is not known until the script onload event
        //occurs. If no context, use the global queue, and get it processed
        //in the onscript load callback.
        (context ? context.defQueue : globalDefQueue).push([name, deps, callback]);
    };

    define.amd = {
        jQuery: true
    };


    /**
     * Executes the text. Normally just uses eval, but can be modified
     * to use a better, environment-specific call. Only used for transpiling
     * loader plugins, not for plain JS modules.
     * @param {String} text the text to execute/evaluate.
     */
    req.exec = function (text) {
        /*jslint evil: true */
        return eval(text);
    };

    //Set up with config info.
    req(cfg);
}(this));

define("requireLib", function(){});

/*!
 Lo-Dash 1.0.0-rc.3 (Custom Build) lodash.com/license
 Build: `lodash backbone -o support/lodash.custom.js`
 Underscore.js 1.4.3 underscorejs.org/LICENSE
*/
;(function(e,t){function s(e){if(e&&"object"==typeof e&&e.__wrapped__)return e;if(!(this instanceof s))return new s(e);this.__wrapped__=e}function o(e){var t=e.length,n=20<=t-1;if(n)for(var r={},i=0;++i<t;){var s=e[i]+"";(Y.call(r,s)?r[s]:r[s]=[]).push(e[i])}return function(t){if(n){var i=t+"";return Y.call(r,i)&&-1<H(r[i],t)}return-1<H(e,t,1)}}function u(e){return e.charCodeAt(0)}function a(e,t){var n=e.b,r=t.b,e=e.a,t=t.a;if(e!==t){if(e>t||"undefined"==typeof e)return 1;if(e<t||"undefined"==typeof 
t)return-1}return n<r?-1:1}function f(e,t,n){function i(){var a=arguments,f=o?this:t;return s||(e=t[u]),n.length&&(a=a.length?n.concat(v(a)):n),this instanceof i?(d.prototype=e.prototype,f=new d,d.prototype=r,a=e.apply(f,a),S(a)?a:f):e.apply(f,a)}var s=E(e),o=!n,u=t;return o&&(n=t),s||(t=e),i}function l(e,t,n){return e?"function"!=typeof e?function(t){return t[e]}:"undefined"!=typeof t?n?function(n,r,i,s){return e.call(t,n,r,i,s)}:function(n,r,i){return e.call(t,n,r,i)}:e:I}function c(){for(var e=
{b:"",c:"",e:yt,f:gt,g:"",h:wt,i:xt,j:K,k:"",l:n},t,r=0;t=arguments[r];r++)for(var i in t)e[i]=t[i];t=e.a,e.d=/^[^,]+/.exec(t)[0],r="var i,l="+e.d+",t="+e.d+";if(!"+e.d+")return t;"+e.k+";",e.b?(r+="var m=l.length;i=-1;if(typeof m=='number'){",e.i&&(r+="if(k(l)){l=l.split('')}"),r+="while(++i<m){"+e.b+"}}else {"):e.h&&(r+="var m=l.length;i=-1;if(m&&j(l)){while(++i<m){i+='';"+e.g+"}}else {"),e.e||(r+="var u=typeof l=='function'&&s.call(l,'prototype');");if(e.f&&e.l)r+="var q=-1,r=p[typeof l]?n(l):[],m=r.length;while(++q<m){i=r[q];"
,e.e||(r+="if(!(u&&i=='prototype')){"),r+=e.g+"",e.e||(r+="}");else{r+="for(i in l){";if(!e.e||e.l)r+="if(",e.e||(r+="!(u&&i=='prototype')"),!e.e&&e.l&&(r+="&&"),e.l&&(r+="h.call(l,i)"),r+="){";r+=e.g+";";if(!e.e||e.l)r+="}"}r+="}";if(e.e){r+="var f=l.constructor;";for(i=0;7>i;i++)r+="i='"+e.j[i]+"';if(","constructor"==e.j[i]&&(r+="!(f&&f.prototype===l)&&"),r+="h.call(l,i)){"+e.g+"}"}if(e.b||e.h)r+="}";return r+=e.c+";return t",Function("e,h,j,k,p,n,s","return function("+t+"){"+r+"}")(l,Y,m,x,Lt,
it,et)}function h(e){return Pt[e]}function p(e){return"function"!=typeof e.toString&&"string"==typeof (e+"")}function d(){}function v(e,t,n){t||(t=0),"undefined"==typeof n&&(n=e?e.length:0);for(var r=-1,n=n-t||0,i=Array(0>n?0:n);++r<n;)i[r]=e[t+r];return i}function m(e){return tt.call(e)==at}function g(e){var t=[];return Dt(e,function(e,n){t.push(n)}),t}function y(e,t,n,s,o){if(e==r)return e;n&&(t=i);if(n=S(e)){var u=tt.call(e);if(!Ct[u]||Tt&&p(e))return e;var a=Ht(e)}if(!n||!t)return n?a?v(e):Mt
({},e):e;n=kt[u];switch(u){case lt:case ct:return new n(+e);case ht:case vt:return new n(e);case dt:return n(e.source,V.exec(e))}s||(s=[]),o||(o=[]);for(u=s.length;u--;)if(s[u]==e)return o[u];var f=a?n(e.length):{};return s.push(e),o.push(f),(a?A:Dt)(e,function(e,n){f[n]=y(e,t,r,s,o)}),a&&(Y.call(e,"index")&&(f.index=e.index),Y.call(e,"input")&&(f.input=e.input)),f}function b(e){var t=[];return _t(e,function(e,n){E(e)&&t.push(n)}),t.sort()}function w(e,t,s,o){if(e===t)return 0!==e||1/e==1/t;if(e==
r||t==r)return e===t;var u=tt.call(e),a=tt.call(t);u==at&&(u=pt),a==at&&(a=pt);if(u!=a)return i;switch(u){case lt:case ct:return+e==+t;case ht:return e!=+e?t!=+t:0==e?1/e==1/t:e==+t;case dt:case vt:return e==t+""}a=u==ft;if(!a){if(e.__wrapped__||t.__wrapped__)return w(e.__wrapped__||e,t.__wrapped__||t);if(u!=pt||Tt&&(p(e)||p(t)))return i;var u=!Et&&m(e)?Object:e.constructor,f=!Et&&m(t)?Object:t.constructor;if(u!=f&&(!E(u)||!(u instanceof u&&E(f)&&f instanceof f)))return i}s||(s=[]),o||(o=[]);for(
u=s.length;u--;)if(s[u]==e)return o[u]==t;var l=n,c=0;s.push(e),o.push(t);if(a){c=e.length;if(l=c==t.length)for(;c--&&(l=w(e[c],t[c],s,o)););return l}return _t(e,function(e,n,r){if(Y.call(r,n))return c++,l=Y.call(t,n)&&w(e,t[n],s,o)}),l&&_t(t,function(e,t,n){if(Y.call(n,t))return l=-1<--c}),l}function E(e){return"function"==typeof e}function S(e){return e?Lt[typeof e]:i}function x(e){return"string"==typeof e||tt.call(e)==vt}function T(e){var t=[];return Dt(e,function(e){t.push(e)}),t}function N(e
,t,n){var r=-1,s=e?e.length:0,o=i,n=(0>n?st(0,s+n):n)||0;return"number"==typeof s?o=-1<(x(e)?e.indexOf(t,n):H(e,t,n)):Ot(e,function(e){if(++r>=n)return!(o=e===t)}),o}function C(e,t,r){var i=n,t=l(t,r);if(Ht(e))for(var r=-1,s=e.length;++r<s&&(i=!!t(e[r],r,e)););else Ot(e,function(e,n,r){return i=!!t(e,n,r)});return i}function k(e,t,n){var r=[],t=l(t,n);if(Ht(e))for(var n=-1,i=e.length;++n<i;){var s=e[n];t(s,n,e)&&r.push(s)}else Ot(e,function(e,n,i){t(e,n,i)&&r.push(e)});return r}function L(e,t,n){
var r,t=l(t,n);return A(e,function(e,n,s){if(t(e,n,s))return r=e,i}),r}function A(e,t,n){if(Ht(e)){var r=-1,s=e.length;if(!t||"undefined"!=typeof n)t=l(t,n);for(;++r<s&&t(e[r],r,e)!==i;);}else Ot(e,t,n);return e}function O(e,t,n){var r=-1,i=e?e.length:0,s=Array("number"==typeof i?i:0),t=l(t,n);if(Ht(e))for(;++r<i;)s[r]=t(e[r],r,e);else Ot(e,function(e,n,i){s[++r]=t(e,n,i)});return s}function M(e,t,n,r){var s=3>arguments.length,t=l(t,r,X);if(Ht(e)){var o=-1,u=e.length;for(s&&(n=e[++o]);++o<u;)n=t(
n,e[o],o,e)}else Ot(e,function(e,r,o){n=s?(s=i,e):t(n,e,r,o)});return n}function _(e,t,n,r){var s=e,o=e?e.length:0,u=3>arguments.length;if("number"!=typeof o)var a=Bt(e),o=a.length;else xt&&x(e)&&(s=e.split(""));return t=l(t,r,X),A(e,function(e,r,f){r=a?a[--o]:--o,n=u?(u=i,s[r]):t(n,s[r],r,f)}),n}function D(e,t,n){var r,t=l(t,n);if(Ht(e))for(var n=-1,i=e.length;++n<i&&!(r=t(e[n],n,e)););else Ot(e,function(e,n,i){return!(r=t(e,n,i))});return!!r}function P(e,t,n){if(e){var i=e.length;return t==r||n?
e[0]:v(e,0,ot(st(0,t),i))}}function H(e,t,n){var r=-1,i=e?e.length:0;if("number"==typeof n)r=(0>n?st(0,i+n):n||0)-1;else if(n)return r=j(e,t),e[r]===t?r:-1;for(;++r<i;)if(e[r]===t)return r;return-1}function B(e,t,n){return v(e,t==r||n?1:st(0,t))}function j(e,t,n,r){for(var i=0,s=e?e.length:i,n=n?l(n,r):I,t=n(t);i<s;)r=i+s>>>1,n(e[r])<t?i=r+1:s=r;return i}function F(e,t){return mt||nt&&2<arguments.length?nt.call.apply(nt,arguments):f(e,t,v(arguments,2))}function I(e){return e}function q(e){A(b(e),
function(t){var r=s[t]=e[t];s.prototype[t]=function(){var e=[this.__wrapped__];return Z.apply(e,arguments),e=r.apply(s,e),this.__chain__&&(e=new s(e),e.__chain__=n),e}})}var n=!0,r=null,i=!1,R="object"==typeof exports&&exports,U="object"==typeof global&&global;U.global===U&&(e=U);var z=[],U=new function(){},W=0,X=U,V=/\w*$/,$=RegExp("^"+(U.valueOf+"").replace(/[.*+?^=!:${}()|[\]\/\\]/g,"\\$&").replace(/valueOf|for [^\]]+/g,".+?")+"$"),J=/[&<>"']/g,K="constructor hasOwnProperty isPrototypeOf propertyIsEnumerable toLocaleString toString valueOf"
.split(" "),Q=z.concat,G=Math.floor,Y=U.hasOwnProperty,Z=z.push,et=U.propertyIsEnumerable,tt=U.toString,nt=$.test(nt=v.bind)&&nt,rt=$.test(rt=Array.isArray)&&rt,it=$.test(it=Object.keys)&&it,st=Math.max,ot=Math.min,ut=Math.random,at="[object Arguments]",ft="[object Array]",lt="[object Boolean]",ct="[object Date]",ht="[object Number]",pt="[object Object]",dt="[object RegExp]",vt="[object String]",U=!!e.attachEvent,$=nt&&!/\n|true/.test(nt+U),mt=nt&&!$,gt=it&&(U||$),yt,bt=(bt={0:1,length:1},z.splice
.call(bt,0,1),bt[0]),wt=n;(function(){function e(){this.x=1}var t=[];e.prototype={valueOf:1,y:1};for(var n in new e)t.push(n);for(n in arguments)wt=!n;yt=!/valueOf/.test(t)})(1);var Et=arguments.constructor==Object,St=!m(arguments),xt="xx"!="x"[0]+Object("x")[0];try{var Tt=("[object Object]",tt.call(document)==pt)}catch(Nt){}var Ct={"[object Function]":i};Ct[at]=Ct[ft]=Ct[lt]=Ct[ct]=Ct[ht]=Ct[pt]=Ct[dt]=Ct[vt]=n;var kt={};kt[ft]=Array,kt[lt]=Boolean,kt[ct]=Date,kt[pt]=Object,kt[ht]=Number,kt[dt]=
RegExp,kt[vt]=String;var Lt={"boolean":i,"function":n,object:n,number:i,string:i,"undefined":i},U={a:"o,v,g",k:"for(var a=1,b=typeof g=='number'?2:arguments.length;a<b;a++){if((l=arguments[a])){",g:"t[i]=l[i]",c:"}}"},$={a:"d,c,w",k:"c=c&&typeof w=='undefined'?c:e(c,w)",b:"if(c(l[i],i,d)===false)return t",g:"if(c(l[i],i,d)===false)return t"},At={b:r},Ot=c($),Mt=c(U);St&&(m=function(e){return e?Y.call(e,"callee"):i});var _t=c($,At,{l:i}),Dt=c($,At),Pt={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"
,"'":"&#x27;"},U=c(U,{g:"if(t[i]==null)"+U.g}),Ht=rt||function(e){return Et&&e instanceof Array||tt.call(e)==ft};E(/x/)&&(E=function(e){return e instanceof Function||"[object Function]"==tt.call(e)});var Bt=it?function(e){return"function"==typeof e&&et.call(e,"prototype")?g(e):S(e)?it(e):[]}:g;s.assign=Mt,s.bind=F,s.bindAll=function(e){for(var t=arguments,n=1<t.length?0:(t=b(e),-1),r=t.length;++n<r;){var i=t[n];e[i]=F(e[i],e)}return e},s.countBy=function(e,t,n){var r={},t=l(t,n);return A(e,function(
e,n,i){n=t(e,n,i),Y.call(r,n)?r[n]++:r[n]=1}),r},s.defaults=U,s.filter=k,s.forEach=A,s.forIn=_t,s.forOwn=Dt,s.functions=b,s.groupBy=function(e,t,n){var r={},t=l(t,n);return A(e,function(e,n,i){n=t(e,n,i),(Y.call(r,n)?r[n]:r[n]=[]).push(e)}),r},s.initial=function(e,t,n){if(!e)return[];var i=e.length;return v(e,0,ot(st(0,i-(t==r||n?1:t||0)),i))},s.invoke=function(e,t){var n=v(arguments,2),r="function"==typeof t,i=[];return A(e,function(e){i.push((r?t:e[t]).apply(e,n))}),i},s.keys=Bt,s.map=O,s.max=function(
e,t,n){var r=-Infinity,i=-1,s=e?e.length:0,o=r;if(t||!Ht(e))t=!t&&x(e)?u:l(t,n),Ot(e,function(e,n,i){n=t(e,n,i),n>r&&(r=n,o=e)});else for(;++i<s;)e[i]>o&&(o=e[i]);return o},s.min=function(e,t,n){var r=Infinity,i=-1,s=e?e.length:0,o=r;if(t||!Ht(e))t=!t&&x(e)?u:l(t,n),Ot(e,function(e,n,i){n=t(e,n,i),n<r&&(r=n,o=e)});else for(;++i<s;)e[i]<o&&(o=e[i]);return o},s.once=function(e){var t,s=i;return function(){return s?t:(s=n,t=e.apply(this,arguments),e=r,t)}},s.pick=function(e,t,n){var r={};if("function"!=typeof 
t)for(var i=0,s=Q.apply(z,arguments),o=s.length;++i<o;){var u=s[i];u in e&&(r[u]=e[u])}else t=l(t,n),_t(e,function(e,n,i){t(e,n,i)&&(r[n]=e)});return r},s.reject=function(e,t,n){return t=l(t,n),k(e,function(e,n,r){return!t(e,n,r)})},s.rest=B,s.shuffle=function(e){var t=-1,n=Array(e?e.length:0);return A(e,function(e){var r=G(ut()*(++t+1));n[t]=n[r],n[r]=e}),n},s.sortBy=function(e,t,n){var r=[],t=l(t,n);A(e,function(e,n,i){r.push({a:t(e,n,i),b:n,c:e})}),e=r.length;for(r.sort(a);e--;)r[e]=r[e].c;return r
},s.toArray=function(e){return"number"==typeof (e?e.length:0)?xt&&x(e)?e.split(""):v(e):T(e)},s.values=T,s.without=function(e){for(var t=-1,n=e?e.length:0,r=o(arguments),i=[];++t<n;){var s=e[t];r(s)||i.push(s)}return i},s.collect=O,s.drop=B,s.each=A,s.extend=Mt,s.methods=b,s.select=k,s.tail=B,s.clone=y,s.contains=N,s.escape=function(e){return e==r?"":(e+"").replace(J,h)},s.every=C,s.find=L,s.has=function(e,t){return e?Y.call(e,t):i},s.identity=I,s.indexOf=H,s.isArguments=m,s.isArray=Ht,s.isEmpty=
function(e){var t=n;if(!e)return t;var r=tt.call(e),s=e.length;return r==ft||r==vt||r==at||St&&m(e)||r==pt&&"number"==typeof s&&E(e.splice)?!s:(Dt(e,function(){return t=i}),t)},s.isEqual=w,s.isFunction=E,s.isObject=S,s.isRegExp=function(e){return e instanceof RegExp||tt.call(e)==dt},s.isString=x,s.lastIndexOf=function(e,t,n){var r=e?e.length:0;for("number"==typeof n&&(r=(0>n?st(0,r+n):ot(n,r-1))+1);r--;)if(e[r]===t)return r;return-1},s.mixin=q,s.reduce=M,s.reduceRight=_,s.result=function(e,t){var n=
e?e[t]:r;return E(n)?e[t]():n},s.size=function(e){var t=e?e.length:0;return"number"==typeof t?t:Bt(e).length},s.some=D,s.sortedIndex=j,s.uniqueId=function(e){return(e==r?"":e+"")+ ++W},s.all=C,s.any=D,s.detect=L,s.foldl=M,s.foldr=_,s.include=N,s.inject=M,s.first=P,s.last=function(e,t,n){if(e){var i=e.length;return t==r||n?e[i-1]:v(e,st(0,i-t))}},s.take=P,s.head=P,s.chain=function(e){return e=new s(e),e.__chain__=n,e},s.VERSION="1.0.0-rc.3",q(s),s.prototype.chain=function(){return this.__chain__=n
,this},s.prototype.value=function(){return this.__wrapped__},Ot("pop push reverse shift sort splice unshift".split(" "),function(e){var t=z[e];s.prototype[e]=function(){var e=this.__wrapped__;return t.apply(e,arguments),bt&&e.length===0&&delete e[0],this}}),Ot(["concat","join","slice"],function(e){var t=z[e];s.prototype[e]=function(){var e=t.apply(this.__wrapped__,arguments);return this.__chain__&&(e=new s(e),e.__chain__=n),e}}),typeof define=="function"&&typeof define.amd=="object"&&define.amd?(
e._=s,define('underscore',[],function(){return s})):R?"object"==typeof module&&module&&module.exports==R?(module.exports=s)._=s:R._=s:e._=s})(this);
define('dom',['underscore'], function(_) {
  

  function arrayRemove(array, value) {
    var index = _.indexOf(array, value);
    if(index >= 0) array.splice(index, 1);
    return value;
  }

  function isDefined(value) {
    return typeof value != 'undefined';
  };

  function isWindow(obj) {
    return obj && obj.document && obj.location && obj.alert && obj.setInterval;
  };

  function lowercase(string) {
    return _.isString(string) ? string.toLowerCase() : string;
  };

  function trim(value) {
    return _.isString(value) ? value.replace(/^\s*/, '').replace(/\s*$/, '') : value;
  };

  function uppercase(string) {
    return _.isString(string) ? string.toUpperCase() : string;
  };

  function isUndefined(obj){
    return obj == null;
  };
  var msie = Number((/msie (\d+)/.exec(lowercase(navigator.userAgent)) || [])[1]);

  var domCache = DOM.cache = {},
    domExpandoAttr = DOM.expando = 'dom-' + new Date().getTime(),
    domId = 1,
    addEventListenerFn = (
      (window.document.addEventListener)
        ? function(element, type, fn) { element.addEventListener(type, fn, false); }
        : function(element, type, fn) { element.attachEvent('on' + type, fn); }
    ),
    removeEventListenerFn = (
      (window.document.removeEventListener)
        ? function(element, type, fn) { element.removeEventListener(type, fn, false); }
        : function(element, type, fn) { element.detachEvent('on' + type, fn); }
    );

  function domNextId() {
    return ++domId;
  }

  var SPECIAL_CHARS_REGEXP = /([\:\-\_]+(.))/g;
  var MOZ_HACK_REGEXP = /^moz([A-Z])/;

  /**
   * Converts snake_case to camelCase.
   * Also there is special case for Moz prefix starting with upper case letter.
   * @param name Name to normalize
   */

  function camelCase(name) {
    return name.
      replace(SPECIAL_CHARS_REGEXP, function(_, separator, letter, offset) {
        return offset ? letter.toUpperCase() : letter;}
      ).
      replace(MOZ_HACK_REGEXP, 'Moz$1');
  }


  /////////////////////////////////////////////

  function DOM(element) {
    if(element instanceof DOM) {
      return element;
    }
    if(!(this instanceof DOM)) {
      if(_.isString(element) && element.charAt(0) !== '<') {
        throw Error('selectors not implemented');
      }
      return new DOM(element);
    }

    if(_.isString(element)) {
      var div = document.createElement('div');
      // Read about the NoScope elements here:
      // http://msdn.microsoft.com/en-us/library/ms533897(VS.85).aspx
      div.innerHTML = '<div>&#160;</div>' + element; // IE insanity to make NoScope elements work!
      div.removeChild(div.firstChild); // remove the superfluous div
      DOMAddNodes(this, div.childNodes);
      this.remove(); // detach the elements from the temporary DOM div.
    } else {
      DOMAddNodes(this, element);
    }
  }
  var dom = DOM;

  function DOMClone(element) {
    return element.cloneNode(true);
  }

  function DOMDealoc(element) {
    DOMRemoveData(element);
    for(var i = 0, children = element.childNodes || []; i < children.length; i++) {
      DOMDealoc(children[i]);
    }
  }

  function DOMUnbindAllEvents(element,events){
    for (var type in events) {
      removeEventListenerFn(element, type, events[type]);
      delete events[type];
    };
  }

  function DOMUnbind(element, type, fn) {
    var handle = DOMExpandoStoreGet(element, 'handle'),
        events = DOMExpandoStoreGet(element, 'events');
    if(!handle) return; //no listeners registered
    if(isUndefined(type)) {
      DOMUnbindAllEvents(element,events);
    } else {
      if(isUndefined(fn)) {
        removeEventListenerFn(element, type, events[type]);
        delete events[type];
      } else {
        arrayRemove(events[type], fn);
      }
    }
  }

  function DOMRemoveData(element) {
    var expandoId = element[domExpandoAttr],
        expandoStore = domCache[expandoId];

    if(expandoStore) {
      if(expandoStore.handle) {
        DOMUnbindAllEvents(element,expandoStore.events);
      }
      delete domCache[expandoId];
      element[domExpandoAttr] = undefined; // ie does not allow deletion of attributes on elements.
    }
  }

  // Split DOMExpandoStore into Get/Set for perf (http://jsperf.com/expandostore-getset/2)
  function DOMExpandoStoreSet(element, key, value) {
    var expandoId = element[domExpandoAttr];
    ( (!expandoId)
        ? (element[domExpandoAttr] = expandoId = domNextId(), domCache[expandoId] = {})
        : domCache[expandoId]
    )[key] = value;
  }

  function DOMExpandoStoreGet(element, key) {
    var expandoId = element[domExpandoAttr];
    return expandoId && domCache[expandoId][key];
  }

  function DOMData(element, key, value) {
    var data = DOMExpandoStoreGet(element, 'data'),
      isSetter = isDefined(value),
      keyDefined = !isSetter && isDefined(key),
      isSimpleGetter = keyDefined && !_.isObject(key);

    if(!data && !isSimpleGetter) {
      DOMExpandoStoreSet(element, 'data', data = {});
    }

    if(isSetter) {
      data[key] = value;
    } else {
      if(keyDefined) {
        if(isSimpleGetter) {
          // don't create data in this case.
          return data && data[key];
        } else {
          _.extend(data, key);
        }
      } else {
        return data;
      }
    }
  }

  function DOMHasClass(element, selector) {
    return((" " + element.className + " ").replace(/[\n\t]/g, " ").
    indexOf(" " + selector + " ") > -1);
  }

  function DOMRemoveClass(element, cssClasses) {
    if(cssClasses) {
      _.each(cssClasses.split(' '), function(cssClass) {
        element.className = trim(
        (" " + element.className + " ").replace(/[\n\t]/g, " ").replace(" " + trim(cssClass) + " ", " "));
      });
    }
  }

  function DOMAddClass(element, cssClasses) {
    if(cssClasses) {
      _.each(cssClasses.split(' '), function(cssClass) {
        if(!DOMHasClass(element, cssClass)) {
          element.className = trim(element.className + ' ' + trim(cssClass));
        }
      });
    }
  }

  function DOMAddNodes(root, elements) {
    if(elements) {
      elements = (!elements.nodeName && isDefined(elements.length) && !isWindow(elements)) ? elements : [elements];
      for(var i = 0; i < elements.length; i++) {
        root.push(elements[i]);
      }
    }
  }

  //////////////////////////////////////////
  // Functions which are declared directly.
  //////////////////////////////////////////
  var DOMPrototype = DOM.prototype = {
    camelCase: camelCase,
    eq: function(index) {
      return(index >= 0) ? dom(this[index]) : dom(this[this.length + index]);
    },
    length: 0,
    push: [].push,
    sort: [].sort,
    splice: [].splice
  };

  //////////////////////////////////////////
  // Functions iterating getter/setters.
  // these functions return self on setter and
  // value on get.
  //////////////////////////////////////////
  var BOOLEAN_ATTR = {};
  _.each('multiple,selected,checked,disabled,readOnly,required'.split(','), function(value) {
    BOOLEAN_ATTR[lowercase(value)] = value;
  });
  var BOOLEAN_ELEMENTS = {};
  _.each('input,select,option,textarea,button,form'.split(','), function(value) {
    BOOLEAN_ELEMENTS[uppercase(value)] = true;
  });

  function getBooleanAttrName(element, name) {
    // check dom last since we will most likely fail on name
    var booleanAttr = BOOLEAN_ATTR[name.toLowerCase()];

    // booleanAttr is here twice to minimize DOM access
    return booleanAttr && BOOLEAN_ELEMENTS[element.nodeName] && booleanAttr;
  }

  function createIter(body){
    return new Function('name',
      "for(var i=0; i<this.length; ++i){"+
        body+
      "}"+
      "return this;"
    );
  }

  DOM.prototype.removeAttr = createIter("this[i].removeAttribute(name);");

  function createGetSetIter(desc){
    // get
    DOM.prototype[desc.name] = new Function('name',
      'var val,e=this[0];'+
      desc.get+
      'return val;'
    );

    // getAll
    DOM.prototype[desc.name+'All'] = new Function('ns',
      'var n,name,val,vals={};e=this[0];'+
      'for(var i=0;i<ns.length;++i){'+
        'n=name=ns[i];'+
        desc.get+
        'vals[n]=val;'+
      '}'+
      'return vals;'
    );

    // set
    DOM.prototype[desc.name+'Set'] = new Function('name','value',
      'var e,name=this.camelCase(name);'+
      'for(var i=0;i<this.length;++i){'+
        'e=this[i];'+
        desc.set+
      '}'+
      'return this;'
    );

    // setAll
    DOM.prototype[desc.name+'SetAll'] = new Function('ns',
      'for(var n in ns){'+
        'this.'+desc.name+'Set(n,ns[n]);'+
      '}'+
      'return this;'
    );
  }

  createGetSetIter({
    name: 'css',
    get: (
      "name=this.camelCase(name);"+
      ((msie <= 8)
        ? "val=e.currentStyle&&e.currentStyle[name];"+
          "if(val===''){val='auto;'}"+
          "val=val||e.styl[name];"
        : "val=e.style[name];")+
      ((msie <= 8)
        ? "val=(val==='')?undefined:val;"
        : "")
    ),
    set: (
      "e.style[name]=value;"
    )
  });

  _.each({
    data: DOMData,

    hasClass: DOMHasClass,

    attr: function(element, name, value) {
      var lowercasedName = lowercase(name);
      if(BOOLEAN_ATTR[lowercasedName]) {
        if(isDefined(value)) {
          if( !! value) {
            element[name] = true;
            element.setAttribute(name, lowercasedName);
          } else {
            element[name] = false;
            element.removeAttribute(lowercasedName);
          }
        } else {
          return(element[name] || (element.attributes.getNamedItem(name) ||
          function() {}).specified) ? lowercasedName : undefined;
        }
      } else if(isDefined(value)) {
        element.setAttribute(name, value);
      } else if(element.getAttribute) {
        // the extra argument "2" is to get the right thing for a.href in IE, see jQuery code
        // some elements (e.g. Document) don't have get attribute, so return undefined
        var ret = element.getAttribute(name, 2);
        // normalize non-existing attributes to undefined (as jQuery)
        return ret === null ? undefined : ret;
      }
    },

    prop: function(element, name, value) {
      if(isDefined(value)) {
        element[name] = value;
      } else {
        return element[name];
      }
    },

    text: _.extend(
      ((msie < 9)
        ? function(element, value) {
            if(element.nodeType == 1 /** Element */ ) {
              if(isUndefined(value)) return element.innerText;
              element.innerText = value;
            } else {
              if(isUndefined(value)) return element.nodeValue;
              element.nodeValue = value;
            }
          }
        : function(element, value) {
            if(isUndefined(value)) {
              return element.textContent;
            }
            element.textContent = value;
          }
      ),
      {$dv: ''}
    ),

    val: function(element, value) {
      if(isUndefined(value)) {
        return element.value;
      }
      element.value = value;
    },

    html: function(element, value) {
      if(isUndefined(value)) {
        return element.innerHTML;
      }
      for(var i = 0, childNodes = element.childNodes; i < childNodes.length; i++) {
        DOMDealoc(childNodes[i]);
      }
      element.innerHTML = value;
    }
  }, function(fn, name) {
    /**
     * Properties: writes return selection, reads return first value
     */
    DOM.prototype[name] = function(arg1, arg2) {
      var i, key;

      // DOMHasClass has only two arguments, but is a getter-only fn, so we need to special-case it
      // in a way that survives minification.
      if(((fn.length == 2 && (fn !== DOMHasClass)) ? arg1 : arg2) === undefined) {
        if(_.isObject(arg1)) {

          // we are a write, but the object properties are the key/values
          for(i = 0; i < this.length; i++) {
            if(fn === DOMData) {
              // data() takes the whole object in jQuery
              fn(this[i], arg1);
            } else {
              for(key in arg1) {
                fn(this[i], key, arg1[key]);
              }
            }
          }
          // return self for chaining
          return this;
        } else {
          // we are a read, so read the first child.
          if(this.length) return fn(this[0], arg1, arg2);
        }
      } else {
        // we are a write, so apply to all children
        for(i = 0; i < this.length; i++) {
          fn(this[i], arg1, arg2);
        }
        // return self for chaining
        return this;
      }
      return fn.$dv;
    };
  });

  function createEventHandler(element, events) {
    var eventHandler = function(event, type) {
        if(!event.preventDefault) {
          event.preventDefault = function() {
            event.returnValue = false; //ie
          };
        }

        if(!event.stopPropagation) {
          event.stopPropagation = function() {
            event.cancelBubble = true; //ie
          };
        }

        if(!event.target) {
          event.target = event.srcElement || document;
        }

        if(isUndefined(event.defaultPrevented)) {
          var prevent = event.preventDefault;
          event.preventDefault = function() {
            event.defaultPrevented = true;
            prevent.call(event);
          };
          event.defaultPrevented = false;
        }

        event.isDefaultPrevented = function() {
          return event.defaultPrevented;
        };

        _.each(events[type || event.type], function(fn) {
          fn.call(element, event);
        });

        // Remove monkey-patched methods (IE),
        // as they would cause memory leaks in IE8.
        if(msie <= 8) {
          // IE7/8 does not allow to delete property on native object
          event.preventDefault = null;
          event.stopPropagation = null;
          event.isDefaultPrevented = null;
        } else {
          // It shouldn't affect normal browsers (native methods are defined on prototype).
          delete event.preventDefault;
          delete event.stopPropagation;
          delete event.isDefaultPrevented;
        }
      };
    eventHandler.elem = element;
    return eventHandler;
  }

  //////////////////////////////////////////
  // Functions iterating traversal.
  // These functions chain results into a single
  // selector.
  //////////////////////////////////////////
  _.each({
    removeData: DOMRemoveData,

    dealoc: DOMDealoc,

    bind: function bindFn(element, type, fn) {
      var events = DOMExpandoStoreGet(element, 'events'),
        handle = DOMExpandoStoreGet(element, 'handle');

      if(!events) DOMExpandoStoreSet(element, 'events', events = {});
      if(!handle) DOMExpandoStoreSet(element, 'handle', handle = createEventHandler(element, events));

      _.each(type.split(' '), function(type) {
        var eventFns = events[type];

        if(!eventFns) {
          if(type == 'mouseenter' || type == 'mouseleave') {
            var counter = 0;

            events.mouseenter = [];
            events.mouseleave = [];

            bindFn(element, 'mouseover', function(event) {
              counter++;
              if(counter == 1) {
                handle(event, 'mouseenter');
              }
            });
            bindFn(element, 'mouseout', function(event) {
              counter--;
              if(counter == 0) {
                handle(event, 'mouseleave');
              }
            });
          } else {
            addEventListenerFn(element, type, handle);
            events[type] = [];
          }
          eventFns = events[type]
        }
        eventFns.push(fn);
      });
    },

    unbind: DOMUnbind,

    replaceWith: function(element, replaceNode) {
      var index, parent = element.parentNode;
      DOMDealoc(element);
      _.each(new DOM(replaceNode), function(node) {
        if(index) {
          parent.insertBefore(node, index.nextSibling);
        } else {
          parent.replaceChild(node, element);
        }
        index = node;
      });
    },

    children: function(element) {
      var children = [];
      _.each(element.childNodes, function(element) {
        if(element.nodeName != '#text') children.push(element);
      });
      return children;
    },

    contents: function(element) {
      return element.childNodes;
    },

    append: function(element, node) {
      _.each(new DOM(node), function(child) {
        if(element.nodeType === 1 || element.nodeType === 11) {
          element.appendChild(child);
        }
      });
    },

    prepend: function(element, node) {
      if(element.nodeType === 1) {
        var index = element.firstChild;
        _.each(new DOM(node), function(child) {
          if(index) {
            element.insertBefore(child, index);
          } else {
            element.appendChild(child);
            index = child;
          }
        });
      }
    },

    wrap: function(element, wrapNode) {
      wrapNode = dom(wrapNode)[0];
      var parent = element.parentNode;
      if(parent) {
        parent.replaceChild(wrapNode, element);
      }
      wrapNode.appendChild(element);
    },

    remove: function(element) {
      DOMDealoc(element);
      var parent = element.parentNode;
      if(parent) parent.removeChild(element);
    },

    after: function(element, newElement) {
      var index = element,
        parent = element.parentNode;
      _.each(new DOM(newElement), function(node) {
        parent.insertBefore(node, index.nextSibling);
        index = node;
      });
    },

    addClass: DOMAddClass,
    removeClass: DOMRemoveClass,

    toggleClass: function(element, selector, condition) {
      if(isUndefined(condition)) {
        condition = !DOMHasClass(element, selector);
      }
      (condition ? DOMAddClass : DOMRemoveClass)(element, selector);
    },

    parent: function(element) {
      var parent = element.parentNode;
      return parent && parent.nodeType !== 11 ? parent : null;
    },

    next: function(element) {
      return element.nextSibling;
    },

    find: function(element, selector) {
      return element.getElementsByTagName(selector);
    },

    clone: DOMClone,

    triggerHandler: function(element, eventName) {
      var eventFns = (DOMExpandoStoreGet(element, 'events') || {})[eventName];

      _.each(eventFns, function(fn) {
        fn.call(element, null);
      });
    }
  }, function(fn, name) {
    /**
     * chaining functions
     */
    DOM.prototype[name] = function(arg1, arg2) {
      var value;
      for(var i = 0; i < this.length; i++) {
        if(value == undefined) {
          value = fn(this[i], arg1, arg2);
          if(value !== undefined) {
            // any function which returns a value needs to be wrapped
            value = dom(value);
          }
        } else {
          DOMAddNodes(value, fn(this[i], arg1, arg2));
        }
      }
      return value == undefined ? this : value;
    };
  });

  return DOM;
});