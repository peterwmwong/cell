//
// LESS - Leaner CSS v1.0.36
// http://lesscss.org
// 
// Copyright (c) 2010, Alexis Sellier
// Licensed under the Apache 2.0 License.
//
(function (window, undefined) {
//
// Stub out `require` in the browser
//
function require(arg) {
    return window.less[arg.split('/')[1]];
};


// ecma-5.js
//
// -- kriskowal Kris Kowal Copyright (C) 2009-2010 MIT License
// -- tlrobinson Tom Robinson
// dantman Daniel Friesen

//
// Array
//
if (!Array.isArray) {
    Array.isArray = function(obj) {
        return Object.prototype.toString.call(obj) === "[object Array]" ||
               (obj instanceof Array);
    };
}
if (!Array.prototype.forEach) {
    Array.prototype.forEach =  function(block, thisObject) {
        var len = this.length >>> 0;
        for (var i = 0; i < len; i++) {
            if (i in this) {
                block.call(thisObject, this[i], i, this);
            }
        }
    };
}
if (!Array.prototype.map) {
    Array.prototype.map = function(fun /*, thisp*/) {
        var len = this.length >>> 0;
        var res = new Array(len);
        var thisp = arguments[1];

        for (var i = 0; i < len; i++) {
            if (i in this) {
                res[i] = fun.call(thisp, this[i], i, this);
            }
        }
        return res;
    };
}
if (!Array.prototype.filter) {
    Array.prototype.filter = function (block /*, thisp */) {
        var values = [];
        var thisp = arguments[1];
        for (var i = 0; i < this.length; i++) {
            if (block.call(thisp, this[i])) {
                values.push(this[i]);
            }
        }
        return values;
    };
}
if (!Array.prototype.reduce) {
    Array.prototype.reduce = function(fun /*, initial*/) {
        var len = this.length >>> 0;
        var i = 0;

        // no value to return if no initial value and an empty array
        if (len === 0 && arguments.length === 1) throw new TypeError();

        if (arguments.length >= 2) {
            var rv = arguments[1];
        } else {
            do {
                if (i in this) {
                    rv = this[i++];
                    break;
                }
                // if array contains no values, no initial value to return
                if (++i >= len) throw new TypeError();
            } while (true);
        }
        for (; i < len; i++) {
            if (i in this) {
                rv = fun.call(null, rv, this[i], i, this);
            }
        }
        return rv;
    };
}
if (!Array.prototype.indexOf) {
    Array.prototype.indexOf = function (value /*, fromIndex */ ) {
        var length = this.length;
        var i = arguments[1] || 0;

        if (!length)     return -1;
        if (i >= length) return -1;
        if (i < 0)       i += length;

        for (; i < length; i++) {
            if (!Object.prototype.hasOwnProperty.call(this, i)) { continue }
            if (value === this[i]) return i;
        }
        return -1;
    };
}

//
// Object
//
if (!Object.keys) {
    Object.keys = function (object) {
        var keys = [];
        for (var name in object) {
            if (Object.prototype.hasOwnProperty.call(object, name)) {
                keys.push(name);
            }
        }
        return keys;
    };
}

//
// String
//
if (!String.prototype.trim) {
    String.prototype.trim = function () {
        return String(this).replace(/^\s\s*/, '').replace(/\s\s*$/, '');
    };
}
var less, tree;

if (typeof(window) === 'undefined') {
    less = exports,
    tree = require('less/tree');
} else {
    if (typeof(window.less) === 'undefined') { window.less = {} }
    less = window.less,
    tree = window.less.tree = {};
}
//
// less.js - parser
//
//    A relatively straight-forward predictive parser.
//    There is no tokenization/lexing stage, the input is parsed
//    in one sweep.
//
//    To make the parser fast enough to run in the browser, several
//    optimization had to be made:
//
//    - Matching and slicing on a huge input is often cause of slowdowns.
//      The solution is to chunkify the input into smaller strings.
//      The chunks are stored in the `chunks` var,
//      `j` holds the current chunk index, and `current` holds
//      the index of the current chunk in relation to `input`.
//      This gives us an almost 4x speed-up.
//
//    - In many cases, we don't need to match individual tokens;
//      for example, if a value doesn't hold any variables, operations
//      or dynamic references, the parser can effectively 'skip' it,
//      treating it as a literal.
//      An example would be '1px solid #000' - which evaluates to itself,
//      we don't need to know what the individual components are.
//      The drawback, of course is that you don't get the benefits of
//      syntax-checking on the CSS. This gives us a 50% speed-up in the parser,
//      and a smaller speed-up in the code-gen.
//
//
//    Token matching is done with the `$` function, which either takes
//    a terminal string or regexp, or a non-terminal function to call.
//    It also takes care of moving all the indices forwards.
//
//
less.Parser = function Parser(env) {
    var input,       // LeSS input string
        i,           // current index in `input`
        j,           // current chunk
        temp,        // temporarily holds a chunk's state, for backtracking
        memo,        // temporarily holds `i`, when backtracking
        furthest,    // furthest index the parser has gone to
        chunks,      // chunkified input
        current,     // index of current chunk, in `input`
        parser;

    var that = this;

    // This function is called after all files
    // have been imported through `@import`.
    var finish = function () {};

    var imports = this.imports = {
        paths: env && env.paths || [],  // Search paths, when importing
        queue: [],                      // Files which haven't been imported yet
        files: {},                      // Holds the imported parse trees
        push: function (path, callback) {
            var that = this;
            this.queue.push(path);

            //
            // Import a file asynchronously
            //
            less.Parser.importer(path, this.paths, function (root) {
                that.queue.splice(that.queue.indexOf(path), 1); // Remove the path from the queue
                that.files[path] = root;                        // Store the root

                callback(root);

                if (that.queue.length === 0) { finish() }       // Call `finish` if we're done importing
            });
        }
    };

    function save()    { temp = chunks[j], memo = i, current = i }
    function restore() { chunks[j] = temp, i = memo, current = i }

    function sync() {
        if (i > current) {
            chunks[j] = chunks[j].slice(i - current);
            current = i;
        }
    }
    //
    // Parse from a token, regexp or string, and move forward if match
    //
    function $(tok) {
        var match, args, length, c, index, endIndex, k;

        //
        // Non-terminal
        //
        if (tok instanceof Function) {
            return tok.call(parser.parsers);
        //
        // Terminal
        //
        //     Either match a single character in the input,
        //     or match a regexp in the current chunk (chunk[j]).
        //
        } else if (typeof(tok) === 'string') {
            match = input.charAt(i) === tok ? tok : null;
            length = 1;
            sync ();

        //  1. We move to the next chunk, if necessary.
        //  2. Set the `lastIndex` to be relative
        //     to the current chunk, and try to match in it.
        //  3. Make sure we matched at `index`. Because we use
        //     the /g flag, the match could be anywhere in the
        //     chunk. We have to make sure it's at our previous
        //     index, which we stored in [2].
        //
        } else {
            sync ();

            if (match = tok.exec(chunks[j])) { // 3.
                length = match[0].length;
            } else {
                return null;
            }
        }

        // The match is confirmed, add the match length to `i`,
        // and consume any extra white-space characters (' ' || '\n')
        // which come after that. The reason for this is that LeSS's
        // grammar is mostly white-space insensitive.
        //
        if (match) {
            mem = i += length;
            endIndex = i + chunks[j].length - length;

            while (i < endIndex) {
                c = input.charCodeAt(i);
                if (! (c === 32 || c === 10 || c === 9)) { break }
                i++;
            }
            chunks[j] = chunks[j].slice(length + (i - mem));
            current = i;

            if (chunks[j].length === 0 && j < chunks.length - 1) { j++ }

            if(typeof(match) === 'string') {
                return match;
            } else {
                return match.length === 1 ? match[0] : match;
            }
        }
    }

    // Same as $(), but don't change the state of the parser,
    // just return the match.
    function peek(tok) {
        if (typeof(tok) === 'string') {
            return input.charAt(i) === tok;
        } else {
            if (tok.test(chunks[j])) {
                return true;
            } else {
                return false;
            }
        }
    }

    this.env = env = env || {};

    // The optimization level dictates the thoroughness of the parser,
    // the lower the number, the less nodes it will create in the tree.
    // This could matter for debugging, or if you want to access
    // the individual nodes in the tree.
    this.optimization = ('optimization' in this.env) ? this.env.optimization : 1;

    this.env.filename = this.env.filename || null;

    //
    // The Parser
    //
    return parser = {

        imports: imports,
        //
        // Parse an input string into an abstract syntax tree,
        // call `callback` when done.
        //
        parse: function (str, callback) {
            var root, start, end, zone, line, lines, buff = [], c, error = null;

            i = j = current = furthest = 0;
            chunks = [];
            input = str.replace(/\r\n/g, '\n');

            // Split the input into chunks.
            chunks = (function (chunks) {
                var j = 0,
                    skip = /[^"'`\{\}\/]+/g,
                    comment = /\/\*(?:[^*]|\*+[^\/*])*\*+\/|\/\/.*/g,
                    level = 0,
                    match,
                    chunk = chunks[0],
                    inString;

                for (var i = 0, c, cc; i < input.length; i++) {
                    skip.lastIndex = i;
                    if (match = skip.exec(input)) {
                        if (match.index === i) {
                            i += match[0].length;
                            chunk.push(match[0]);
                        }
                    }
                    c = input.charAt(i);
                    comment.lastIndex = i;

                    if (!inString && c === '/') {
                        cc = input.charAt(i + 1);
                        if (cc === '/' || cc === '*') {
                            if (match = comment.exec(input)) {
                                if (match.index === i) {
                                    i += match[0].length;
                                    chunk.push(match[0]);
                                    c = input.charAt(i);
                                }
                            }
                        }
                    }

                    if        (c === '{' && !inString) { level ++;
                        chunk.push(c);
                    } else if (c === '}' && !inString) { level --;
                        chunk.push(c);
                        chunks[++j] = chunk = [];
                    } else {
                        if (c === '"' || c === "'" || c === '`') {
                            if (! inString) {
                                inString = c;
                            } else {
                                inString = inString === c ? false : inString;
                            }
                        }
                        chunk.push(c);
                    }
                }
                if (level > 0) {
                    throw {
                        type: 'Syntax',
                        message: "Missing closing `}`",
                        filename: env.filename
                    };
                }

                return chunks.map(function (c) { return c.join('') });;
            })([[]]);

            // Start with the primary rule.
            // The whole syntax tree is held under a Ruleset node,
            // with the `root` property set to true, so no `{}` are
            // output. The callback is called when the input is parsed.
            root = new(tree.Ruleset)([], $(this.parsers.primary));
            root.root = true;

            root.toCSS = (function (evaluate) {
                var line, lines, column;

                return function (options, variables) {
                    var frames = [];

                    options = options || {};
                    //
                    // Allows setting variables with a hash, so:
                    //
                    //   `{ color: new(tree.Color)('#f01') }` will become:
                    //
                    //   new(tree.Rule)('@color',
                    //     new(tree.Value)([
                    //       new(tree.Expression)([
                    //         new(tree.Color)('#f01')
                    //       ])
                    //     ])
                    //   )
                    //
                    if (typeof(variables) === 'object' && !Array.isArray(variables)) {
                        variables = Object.keys(variables).map(function (k) {
                            var value = variables[k];

                            if (! (value instanceof tree.Value)) {
                                if (! (value instanceof tree.Expression)) {
                                    value = new(tree.Expression)([value]);
                                }
                                value = new(tree.Value)([value]);
                            }
                            return new(tree.Rule)('@' + k, value, false, 0);
                        });
                        frames = [new(tree.Ruleset)(null, variables)];
                    }

                    try {
                        var css = evaluate.call(this, { frames: frames })
                                          .toCSS([], { compress: options.compress || false });
                    } catch (e) {
                        lines = input.split('\n');
                        line = getLine(e.index);

                        for (var n = e.index, column = -1;
                                 n >= 0 && input.charAt(n) !== '\n';
                                 n--) { column++ }

                        throw {
                            type: e.type,
                            message: e.message,
                            filename: env.filename,
                            index: e.index,
                            line: typeof(line) === 'number' ? line + 1 : null,
                            callLine: e.call && (getLine(e.call) + 1),
                            callExtract: lines[getLine(e.call)],
                            stack: e.stack,
                            column: column,
                            extract: [
                                lines[line - 1],
                                lines[line],
                                lines[line + 1]
                            ]
                        };
                    }
                    if (options.compress) {
                        return css.replace(/(\s)+/g, "$1");
                    } else {
                        return css;
                    }

                    function getLine(index) {
                        return index ? (input.slice(0, index).match(/\n/g) || "").length : null;
                    }
                };
            })(root.eval);

            // If `i` is smaller than the `input.length - 1`,
            // it means the parser wasn't able to parse the whole
            // string, so we've got a parsing error.
            //
            // We try to extract a \n delimited string,
            // showing the line where the parse error occured.
            // We split it up into two parts (the part which parsed,
            // and the part which didn't), so we can color them differently.
            if (i < input.length - 1) {
                i = furthest;
                lines = input.split('\n');
                line = (input.slice(0, i).match(/\n/g) || "").length + 1;

                for (var n = i, column = -1; n >= 0 && input.charAt(n) !== '\n'; n--) { column++ }

                error = {
                    name: "ParseError",
                    message: "Syntax Error on line " + line,
                    filename: env.filename,
                    line: line,
                    column: column,
                    extract: [
                        lines[line - 2],
                        lines[line - 1],
                        lines[line]
                    ]
                };
            }

            if (this.imports.queue.length > 0) {
                finish = function () { callback(error, root) };
            } else {
                callback(error, root);
            }
        },

        //
        // Here in, the parsing rules/functions
        //
        // The basic structure of the syntax tree generated is as follows:
        //
        //   Ruleset ->  Rule -> Value -> Expression -> Entity
        //
        // Here's some LESS code:
        //
        //    .class {
        //      color: #fff;
        //      border: 1px solid #000;
        //      width: @w + 4px;
        //      > .child {...}
        //    }
        //
        // And here's what the parse tree might look like:
        //
        //     Ruleset (Selector '.class', [
        //         Rule ("color",  Value ([Expression [Color #fff]]))
        //         Rule ("border", Value ([Expression [Dimension 1px][Keyword "solid"][Color #000]]))
        //         Rule ("width",  Value ([Expression [Operation "+" [Variable "@w"][Dimension 4px]]]))
        //         Ruleset (Selector [Element '>', '.child'], [...])
        //     ])
        //
        //  In general, most rules will try to parse a token with the `$()` function, and if the return
        //  value is truly, will return a new node, of the relevant type. Sometimes, we need to check
        //  first, before parsing, that's when we use `peek()`.
        //
        parsers: {
            //
            // The `primary` rule is the *entry* and *exit* point of the parser.
            // The rules here can appear at any level of the parse tree.
            //
            // The recursive nature of the grammar is an interplay between the `block`
            // rule, which represents `{ ... }`, the `ruleset` rule, and this `primary` rule,
            // as represented by this simplified grammar:
            //
            //     primary  →  (ruleset | rule)+
            //     ruleset  →  selector+ block
            //     block    →  '{' primary '}'
            //
            // Only at one point is the primary rule not called from the
            // block rule: at the root level.
            //
            primary: function () {
                var node, root = [];

                while ((node = $(this.mixin.definition) || $(this.rule)    ||  $(this.ruleset) ||
                               $(this.mixin.call)       || $(this.comment) ||  $(this.directive))
                               || $(/^[\s\n]+/)) {
                    node && root.push(node);
                }
                return root;
            },

            // We create a Comment node for CSS comments `/* */`,
            // but keep the LeSS comments `//` silent, by just skipping
            // over them.
            comment: function () {
                var comment;

                if (input.charAt(i) !== '/') return;

                if (input.charAt(i + 1) === '/') {
                    return new(tree.Comment)($(/^\/\/.*/), true);
                } else if (comment = $(/^\/\*(?:[^*]|\*+[^\/*])*\*+\/\n?/)) {
                    return new(tree.Comment)(comment);
                }
            },

            //
            // Entities are tokens which can be found inside an Expression
            //
            entities: {
                //
                // A string, which supports escaping " and '
                //
                //     "milky way" 'he\'s the one!'
                //
                quoted: function () {
                    var str;
                    if (input.charAt(i) !== '"' && input.charAt(i) !== "'") return;

                    if (str = $(/^"((?:[^"\\\r\n]|\\.)*)"|'((?:[^'\\\r\n]|\\.)*)'/)) {
                        return new(tree.Quoted)(str[0], str[1] || str[2]);
                    }
                },

                //
                // A catch-all word, such as:
                //
                //     black border-collapse
                //
                keyword: function () {
                    var k;
                    if (k = $(/^[A-Za-z-]+/)) { return new(tree.Keyword)(k) }
                },

                //
                // A function call
                //
                //     rgb(255, 0, 255)
                //
                // We also try to catch IE's `alpha()`, but let the `alpha` parser
                // deal with the details.
                //
                // The arguments are parsed with the `entities.arguments` parser.
                //
                call: function () {
                    var name, args;

                    if (! (name = /^([\w-]+|%)\(/.exec(chunks[j]))) return;

                    name = name[1].toLowerCase();

                    if (name === 'url') { return null }
                    else                { i += name.length + 1 }

                    if (name === 'alpha') { return $(this.alpha) }

                    args = $(this.entities.arguments);

                    if (! $(')')) return;

                    if (name) { return new(tree.Call)(name, args) }
                },
                arguments: function () {
                    var args = [], arg;

                    while (arg = $(this.expression)) {
                        args.push(arg);
                        if (! $(',')) { break }
                    }
                    return args;
                },
                literal: function () {
                    return $(this.entities.dimension) ||
                           $(this.entities.color) ||
                           $(this.entities.quoted);
                },

                //
                // Parse url() tokens
                //
                // We use a specific rule for urls, because they don't really behave like
                // standard function calls. The difference is that the argument doesn't have
                // to be enclosed within a string, so it can't be parsed as an Expression.
                //
                url: function () {
                    var value;

                    if (input.charAt(i) !== 'u' || !$(/^url\(/)) return;
                    value = $(this.entities.quoted) || $(this.entities.variable) || $(/^[-\w%@$\/.&=:;#+?]+/) || "";
                    if (! $(')')) throw new(Error)("missing closing ) for url()");

                    return new(tree.URL)((value.value || value instanceof tree.Variable)
                                        ? value : new(tree.Anonymous)(value), imports.paths);
                },

                //
                // A Variable entity, such as `@fink`, in
                //
                //     width: @fink + 2px
                //
                // We use a different parser for variable definitions,
                // see `parsers.variable`.
                //
                variable: function () {
                    var name, index = i;

                    if (input.charAt(i) === '@' && (name = $(/^@[\w-]+/))) {
                        return new(tree.Variable)(name, index);
                    }
                },

                //
                // A Hexadecimal color
                //
                //     #4F3C2F
                //
                // `rgb` and `hsl` colors are parsed through the `entities.call` parser.
                //
                color: function () {
                    var rgb;

                    if (input.charAt(i) === '#' && (rgb = $(/^#([a-fA-F0-9]{6}|[a-fA-F0-9]{3})/))) {
                        return new(tree.Color)(rgb[1]);
                    }
                },

                //
                // A Dimension, that is, a number and a unit
                //
                //     0.5em 95%
                //
                dimension: function () {
                    var value, c = input.charCodeAt(i);
                    if ((c > 57 || c < 45) || c === 47) return;

                    if (value = $(/^(-?\d*\.?\d+)(px|%|em|pc|ex|in|deg|s|ms|pt|cm|mm|rad|grad|turn)?/)) {
                        return new(tree.Dimension)(value[1], value[2]);
                    }
                },

                //
                // JavaScript code to be evaluated
                //
                //     `window.location.href`
                //
                javascript: function () {
                    var str;

                    if (input.charAt(i) !== '`') { return }

                    if (str = $(/^`([^`]*)`/)) {
                        return new(tree.JavaScript)(str[1], i);
                    }
                }
            },

            //
            // The variable part of a variable definition. Used in the `rule` parser
            //
            //     @fink:
            //
            variable: function () {
                var name;

                if (input.charAt(i) === '@' && (name = $(/^(@[\w-]+)\s*:/))) { return name[1] }
            },

            //
            // A font size/line-height shorthand
            //
            //     small/12px
            //
            // We need to peek first, or we'll match on keywords and dimensions
            //
            shorthand: function () {
                var a, b;

                if (! peek(/^[@\w.%-]+\/[@\w.-]+/)) return;

                if ((a = $(this.entity)) && $('/') && (b = $(this.entity))) {
                    return new(tree.Shorthand)(a, b);
                }
            },

            //
            // Mixins
            //
            mixin: {
                //
                // A Mixin call, with an optional argument list
                //
                //     #mixins > .square(#fff);
                //     .rounded(4px, black);
                //     .button;
                //
                // The `while` loop is there because mixins can be
                // namespaced, but we only support the child and descendant
                // selector for now.
                //
                call: function () {
                    var elements = [], e, c, args, index = i, s = input.charAt(i);

                    if (s !== '.' && s !== '#') { return }

                    while (e = $(/^[#.][\w-]+/)) {
                        elements.push(new(tree.Element)(c, e));
                        c = $('>');
                    }
                    $('(') && (args = $(this.entities.arguments)) && $(')');

                    if (elements.length > 0 && ($(';') || peek('}'))) {
                        return new(tree.mixin.Call)(elements, args, index);
                    }
                },

                //
                // A Mixin definition, with a list of parameters
                //
                //     .rounded (@radius: 2px, @color) {
                //        ...
                //     }
                //
                // Until we have a finer grained state-machine, we have to
                // do a look-ahead, to make sure we don't have a mixin call.
                // See the `rule` function for more information.
                //
                // We start by matching `.rounded (`, and then proceed on to
                // the argument list, which has optional default values.
                // We store the parameters in `params`, with a `value` key,
                // if there is a value, such as in the case of `@radius`.
                //
                // Once we've got our params list, and a closing `)`, we parse
                // the `{...}` block.
                //
                definition: function () {
                    var name, params = [], match, ruleset, param, value;

                    if ((input.charAt(i) !== '.' && input.charAt(i) !== '#') ||
                        peek(/^[^{]*(;|})/)) return;

                    if (match = $(/^([#.][\w-]+)\s*\(/)) {
                        name = match[1];

                        while (param = $(this.entities.variable) || $(this.entities.literal)
                                                                 || $(this.entities.keyword)) {
                            // Variable
                            if (param instanceof tree.Variable) {
                                if ($(':')) {
                                    if (value = $(this.expression)) {
                                        params.push({ name: param.name, value: value });
                                    } else {
                                        throw new(Error)("Expected value");
                                    }
                                } else {
                                    params.push({ name: param.name });
                                }
                            } else {
                                params.push({ value: param });
                            }
                            if (! $(',')) { break }
                        }
                        if (! $(')')) throw new(Error)("Expected )");

                        ruleset = $(this.block);

                        if (ruleset) {
                            return new(tree.mixin.Definition)(name, params, ruleset);
                        }
                    }
                }
            },

            //
            // Entities are the smallest recognized token,
            // and can be found inside a rule's value.
            //
            entity: function () {
                return $(this.entities.literal) || $(this.entities.variable) || $(this.entities.url) ||
                       $(this.entities.call)    || $(this.entities.keyword)  || $(this.entities.javascript);
            },

            //
            // A Rule terminator. Note that we use `peek()` to check for '}',
            // because the `block` rule will be expecting it, but we still need to make sure
            // it's there, if ';' was ommitted.
            //
            end: function () {
                return $(';') || peek('}');
            },

            //
            // IE's alpha function
            //
            //     alpha(opacity=88)
            //
            alpha: function () {
                var value;

                if (! $(/^opacity=/i)) return;
                if (value = $(/^\d+/) || $(this.entities.variable)) {
                    if (! $(')')) throw new(Error)("missing closing ) for alpha()");
                    return new(tree.Alpha)(value);
                }
            },

            //
            // A Selector Element
            //
            //     div
            //     + h1
            //     #socks
            //     input[type="text"]
            //
            // Elements are the building blocks for Selectors,
            // they are made out of a `Combinator` (see combinator rule),
            // and an element name, such as a tag a class, or `*`.
            //
            element: function () {
                var e, t;

                c = $(this.combinator);
                e = $(/^[.#:]?[\w-]+/) || $('*') || $(this.attribute) || $(/^\([^)@]+\)/);

                if (e) { return new(tree.Element)(c, e) }
            },

            //
            // Combinators combine elements together, in a Selector.
            //
            // Because our parser isn't white-space sensitive, special care
            // has to be taken, when parsing the descendant combinator, ` `,
            // as it's an empty space. We have to check the previous character
            // in the input, to see if it's a ` ` character. More info on how
            // we deal with this in *combinator.js*.
            //
            combinator: function () {
                var match, c = input.charAt(i);

                if (c === '>' || c === '&' || c === '+' || c === '~') {
                    i++;
                    while (input.charAt(i) === ' ') { i++ }
                    return new(tree.Combinator)(c);
                } else if (c === ':' && input.charAt(i + 1) === ':') {
                    i += 2;
                    while (input.charAt(i) === ' ') { i++ }
                    return new(tree.Combinator)('::');
                } else if (input.charAt(i - 1) === ' ') {
                    return new(tree.Combinator)(" ");
                } else {
                    return new(tree.Combinator)(null);
                }
            },

            //
            // A CSS Selector
            //
            //     .class > div + h1
            //     li a:hover
            //
            // Selectors are made out of one or more Elements, see above.
            //
            selector: function () {
                var sel, e, elements = [], c, match;

                while (e = $(this.element)) {
                    c = input.charAt(i);
                    elements.push(e)
                    if (c === '{' || c === '}' || c === ';' || c === ',') { break }
                }

                if (elements.length > 0) { return new(tree.Selector)(elements) }
            },
            tag: function () {
                return $(/^[a-zA-Z][a-zA-Z-]*[0-9]?/) || $('*');
            },
            attribute: function () {
                var attr = '', key, val, op;

                if (! $('[')) return;

                if (key = $(/^[a-zA-Z-]+/) || $(this.entities.quoted)) {
                    if ((op = $(/^[|~*$^]?=/)) &&
                        (val = $(this.entities.quoted) || $(/^[\w-]+/))) {
                        attr = [key, op, val.toCSS ? val.toCSS() : val].join('');
                    } else { attr = key }
                }

                if (! $(']')) return;

                if (attr) { return "[" + attr + "]" }
            },

            //
            // The `block` rule is used by `ruleset` and `mixin.definition`.
            // It's a wrapper around the `primary` rule, with added `{}`.
            //
            block: function () {
                var content;

                if ($('{') && (content = $(this.primary)) && $('}')) {
                    return content;
                }
            },

            //
            // div, .class, body > p {...}
            //
            ruleset: function () {
                var selectors = [], s, rules, match;
                save();

                if (match = /^([.#: \w-]+)[\s\n]*\{/.exec(chunks[j])) {
                    i += match[0].length - 1;
                    selectors = [new(tree.Selector)([new(tree.Element)(null, match[1])])];
                } else {
                    while (s = $(this.selector)) {
                        selectors.push(s);
                        if (! $(',')) { break }
                    }
                    if (s) $(this.comment);
                }

                if (selectors.length > 0 && (rules = $(this.block))) {
                    return new(tree.Ruleset)(selectors, rules);
                } else {
                    // Backtrack
                    furthest = i;
                    restore();
                }
            },
            rule: function () {
                var value, c = input.charAt(i), important;
                save();

                if (c === '.' || c === '#' || c === '&') { return }

                if (name = $(this.variable) || $(this.property)) {
                    if ((name.charAt(0) != '@') && (match = /^([^@+\/'"*`(;{}-]*);/.exec(chunks[j]))) {
                        i += match[0].length - 1;
                        value = new(tree.Anonymous)(match[1]);
                    } else if (name === "font") {
                        value = $(this.font);
                    } else {
                        value = $(this.value);
                    }
                    important = $(this.important);

                    if (value && $(this.end)) {
                        return new(tree.Rule)(name, value, important, memo);
                    } else {
                        furthest = i;
                        restore();
                    }
                }
            },

            //
            // An @import directive
            //
            //     @import "lib";
            //
            // Depending on our environemnt, importing is done differently:
            // In the browser, it's an XHR request, in Node, it would be a
            // file-system operation. The function used for importing is
            // stored in `import`, which we pass to the Import constructor.
            //
            "import": function () {
                var path;
                if ($(/^@import\s+/) &&
                    (path = $(this.entities.quoted) || $(this.entities.url)) &&
                    $(';')) {
                    return new(tree.Import)(path, imports);
                }
            },

            //
            // A CSS Directive
            //
            //     @charset "utf-8";
            //
            directive: function () {
                var name, value, rules, types;

                if (input.charAt(i) !== '@') return;

                if (value = $(this['import'])) {
                    return value;
                } else if (name = $(/^@media|@page/)) {
                    types = $(/^[^{]+/).trim();
                    if (rules = $(this.block)) {
                        return new(tree.Directive)(name + " " + types, rules);
                    }
                } else if (name = $(/^@[-a-z]+/)) {
                    if (name === '@font-face') {
                        if (rules = $(this.block)) {
                            return new(tree.Directive)(name, rules);
                        }
                    } else if ((value = $(this.entity)) && $(';')) {
                        return new(tree.Directive)(name, value);
                    }
                }
            },
            font: function () {
                var value = [], expression = [], weight, shorthand, font, e;

                while (e = $(this.shorthand) || $(this.entity)) {
                    expression.push(e);
                }
                value.push(new(tree.Expression)(expression));

                if ($(',')) {
                    while (e = $(this.expression)) {
                        value.push(e);
                        if (! $(',')) { break }
                    }
                }
                return new(tree.Value)(value);
            },

            //
            // A Value is a comma-delimited list of Expressions
            //
            //     font-family: Baskerville, Georgia, serif;
            //
            // In a Rule, a Value represents everything after the `:`,
            // and before the `;`.
            //
            value: function () {
                var e, expressions = [], important;

                while (e = $(this.expression)) {
                    expressions.push(e);
                    if (! $(',')) { break }
                }

                if (expressions.length > 0) {
                    return new(tree.Value)(expressions);
                }
            },
            important: function () {
                if (input.charAt(i) === '!') {
                    return $(/^! *important/);
                }
            },
            sub: function () {
                var e;

                if ($('(') && (e = $(this.expression)) && $(')')) {
                    return e;
                }
            },
            multiplication: function () {
                var m, a, op, operation;
                if (m = $(this.operand)) {
                    while ((op = ($('/') || $('*'))) && (a = $(this.operand))) {
                        operation = new(tree.Operation)(op, [operation || m, a]);
                    }
                    return operation || m;
                }
            },
            addition: function () {
                var m, a, op, operation;
                if (m = $(this.multiplication)) {
                    while ((op = $(/^[-+]\s+/) || (input.charAt(i - 1) != ' ' && ($('+') || $('-')))) &&
                           (a = $(this.multiplication))) {
                        operation = new(tree.Operation)(op, [operation || m, a]);
                    }
                    return operation || m;
                }
            },

            //
            // An operand is anything that can be part of an operation,
            // such as a Color, or a Variable
            //
            operand: function () {
                return $(this.sub) || $(this.entities.dimension) ||
                       $(this.entities.color) || $(this.entities.variable) ||
                       $(this.entities.call);
            },

            //
            // Expressions either represent mathematical operations,
            // or white-space delimited Entities.
            //
            //     1px solid black
            //     @var * 2
            //
            expression: function () {
                var e, delim, entities = [], d;

                while (e = $(this.addition) || $(this.entity)) {
                    entities.push(e);
                }
                if (entities.length > 0) {
                    return new(tree.Expression)(entities);
                }
            },
            property: function () {
                var name;

                if (name = $(/^(\*?-?[-a-z_0-9]+)\s*:/)) {
                    return name[1];
                }
            }
        }
    };
};

if (typeof(window) !== 'undefined') {
    //
    // Used by `@import` directives
    //
    less.Parser.importer = function (path, paths, callback) {
        if (path.charAt(0) !== '/' && paths.length > 0) {
            path = paths[0] + path;
        }
        // We pass `true` as 3rd argument, to force the reload of the import.
        // This is so we can get the syntax tree as opposed to just the CSS output,
        // as we need this to evaluate the current stylesheet.
        loadStyleSheet({ href: path, title: path }, callback, true);
    };
}

(function (tree) {

tree.functions = {
    rgb: function (r, g, b) {
        return this.rgba(r, g, b, 1.0);
    },
    rgba: function (r, g, b, a) {
        var rgb = [r, g, b].map(function (c) { return number(c) }),
            a = number(a);
        return new(tree.Color)(rgb, a);
    },
    hsl: function (h, s, l) {
        return this.hsla(h, s, l, 1.0);
    },
    hsla: function (h, s, l, a) {
        h = (number(h) % 360) / 360;
        s = number(s); l = number(l); a = number(a);

        var m2 = l <= 0.5 ? l * (s + 1) : l + s - l * s;
        var m1 = l * 2 - m2;

        return this.rgba(hue(h + 1/3) * 255,
                         hue(h)       * 255,
                         hue(h - 1/3) * 255,
                         a);

        function hue(h) {
            h = h < 0 ? h + 1 : (h > 1 ? h - 1 : h);
            if      (h * 6 < 1) return m1 + (m2 - m1) * h * 6;
            else if (h * 2 < 1) return m2;
            else if (h * 3 < 2) return m1 + (m2 - m1) * (2/3 - h) * 6;
            else                return m1;
        }
    },
    hue: function (color) {
        return new(tree.Dimension)(Math.round(color.toHSL().h));
    },
    saturation: function (color) {
        return new(tree.Dimension)(Math.round(color.toHSL().s * 100), '%');
    },
    lightness: function (color) {
        return new(tree.Dimension)(Math.round(color.toHSL().l * 100), '%');
    },
    alpha: function (color) {
        return new(tree.Dimension)(color.toHSL().a);
    },
    saturate: function (color, amount) {
        var hsl = color.toHSL();

        hsl.s += amount.value / 100;
        hsl.s = clamp(hsl.s);
        return hsla(hsl);
    },
    desaturate: function (color, amount) {
        var hsl = color.toHSL();

        hsl.s -= amount.value / 100;
        hsl.s = clamp(hsl.s);
        return hsla(hsl);
    },
    lighten: function (color, amount) {
        var hsl = color.toHSL();

        hsl.l += amount.value / 100;
        hsl.l = clamp(hsl.l);
        return hsla(hsl);
    },
    darken: function (color, amount) {
        var hsl = color.toHSL();

        hsl.l -= amount.value / 100;
        hsl.l = clamp(hsl.l);
        return hsla(hsl);
    },
    spin: function (color, amount) {
        var hsl = color.toHSL();
        var hue = (hsl.h + amount.value) % 360;

        hsl.h = hue < 0 ? 360 + hue : hue;

        return hsla(hsl);
    },
    greyscale: function (color) {
        return this.desaturate(color, new(tree.Dimension)(100));
    },
    e: function (str) {
        return new(tree.Anonymous)(str instanceof tree.JavaScript ? str.evaluated : str);
    },
    '%': function (quoted /* arg, arg, ...*/) {
        var args = Array.prototype.slice.call(arguments, 1),
            str = quoted.value;

        for (var i = 0; i < args.length; i++) {
            str = str.replace(/%s/,    args[i].value)
                     .replace(/%[da]/, args[i].toCSS());
        }
        str = str.replace(/%%/g, '%');
        return new(tree.Quoted)('"' + str + '"', str);
    }
};

function hsla(hsla) {
    return tree.functions.hsla(hsla.h, hsla.s, hsla.l, hsla.a);
}

function number(n) {
    if (n instanceof tree.Dimension) {
        return parseFloat(n.unit == '%' ? n.value / 100 : n.value);
    } else if (typeof(n) === 'number') {
        return n;
    } else {
        throw {
            error: "RuntimeError",
            message: "color functions take numbers as parameters"
        };
    }
}

function clamp(val) {
    return Math.min(1, Math.max(0, val));
}

})(require('less/tree'));
(function (tree) {

tree.Alpha = function (val) {
    this.value = val;
};
tree.Alpha.prototype = {
    toCSS: function () {
        return "alpha(opacity=" +
               (this.value.toCSS ? this.value.toCSS() : this.value) + ")";
    },
    eval: function () { return this }
};

})(require('less/tree'));
(function (tree) {

tree.Anonymous = function (string) {
    this.value = string.value || string;
};
tree.Anonymous.prototype = {
    toCSS: function () {
        return this.value;
    },
    eval: function () { return this }
};

})(require('less/tree'));
(function (tree) {

//
// A function call node.
//
tree.Call = function (name, args) {
    this.name = name;
    this.args = args;
};
tree.Call.prototype = {
    //
    // When evaluating a function call,
    // we either find the function in `tree.functions` [1],
    // in which case we call it, passing the  evaluated arguments,
    // or we simply print it out as it appeared originally [2].
    //
    // The *functions.js* file contains the built-in functions.
    //
    // The reason why we evaluate the arguments, is in the case where
    // we try to pass a variable to a function, like: `saturate(@color)`.
    // The function should receive the value, not the variable.
    //
    eval: function (env) {
        var args = this.args.map(function (a) { return a.eval(env) });

        if (this.name in tree.functions) { // 1.
            return tree.functions[this.name].apply(tree.functions, args);
        } else { // 2.
            return new(tree.Anonymous)(this.name +
                   "(" + args.map(function (a) { return a.toCSS() }).join(', ') + ")");
        }
    },

    toCSS: function (env) {
        return this.eval(env).toCSS();
    }
};

})(require('less/tree'));
(function (tree) {
//
// RGB Colors - #ff0014, #eee
//
tree.Color = function (rgb, a) {
    //
    // The end goal here, is to parse the arguments
    // into an integer triplet, such as `128, 255, 0`
    //
    // This facilitates operations and conversions.
    //
    if (Array.isArray(rgb)) {
        this.rgb = rgb;
    } else if (rgb.length == 6) {
        this.rgb = rgb.match(/.{2}/g).map(function (c) {
            return parseInt(c, 16);
        });
    } else {
        this.rgb = rgb.split('').map(function (c) {
            return parseInt(c + c, 16);
        });
    }
    this.alpha = typeof(a) === 'number' ? a : 1;
};
tree.Color.prototype = {
    eval: function () { return this },

    //
    // If we have some transparency, the only way to represent it
    // is via `rgba`. Otherwise, we use the hex representation,
    // which has better compatibility with older browsers.
    // Values are capped between `0` and `255`, rounded and zero-padded.
    //
    toCSS: function () {
        if (this.alpha < 1.0) {
            return "rgba(" + this.rgb.map(function (c) {
                return Math.round(c);
            }).concat(this.alpha).join(', ') + ")";
        } else {
            return '#' + this.rgb.map(function (i) {
                i = Math.round(i);
                i = (i > 255 ? 255 : (i < 0 ? 0 : i)).toString(16);
                return i.length === 1 ? '0' + i : i;
            }).join('');
        }
    },

    //
    // Operations have to be done per-channel, if not,
    // channels will spill onto each other. Once we have
    // our result, in the form of an integer triplet,
    // we create a new Color node to hold the result.
    //
    operate: function (op, other) {
        var result = [];

        if (! (other instanceof tree.Color)) {
            other = other.toColor();
        }

        for (var c = 0; c < 3; c++) {
            result[c] = tree.operate(op, this.rgb[c], other.rgb[c]);
        }
        return new(tree.Color)(result);
    },

    toHSL: function () {
        var r = this.rgb[0] / 255,
            g = this.rgb[1] / 255,
            b = this.rgb[2] / 255,
            a = this.alpha;

        var max = Math.max(r, g, b), min = Math.min(r, g, b);
        var h, s, l = (max + min) / 2, d = max - min;

        if (max === min) {
            h = s = 0;
        } else {
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

            switch (max) {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2;               break;
                case b: h = (r - g) / d + 4;               break;
            }
            h /= 6;
        }
        return { h: h * 360, s: s, l: l, a: a };
    }
};


})(require('less/tree'));
(function (tree) {

tree.Comment = function (value, silent) {
    this.value = value;
    this.silent = !!silent;
};
tree.Comment.prototype = {
    toCSS: function (env) {
        return env.compress ? '' : this.value;
    },
    eval: function () { return this }
};

})(require('less/tree'));
(function (tree) {

//
// A number with a unit
//
tree.Dimension = function (value, unit) {
    this.value = parseFloat(value);
    this.unit = unit || null;
};

tree.Dimension.prototype = {
    eval: function () { return this },
    toColor: function () {
        return new(tree.Color)([this.value, this.value, this.value]);
    },
    toCSS: function () {
        var css = this.value + this.unit;
        return css;
    },

    // In an operation between two Dimensions,
    // we default to the first Dimension's unit,
    // so `1px + 2em` will yield `3px`.
    // In the future, we could implement some unit
    // conversions such that `100cm + 10mm` would yield
    // `101cm`.
    operate: function (op, other) {
        return new(tree.Dimension)
                  (tree.operate(op, this.value, other.value),
                  this.unit || other.unit);
    }
};

})(require('less/tree'));
(function (tree) {

tree.Directive = function (name, value) {
    this.name = name;
    if (Array.isArray(value)) {
        this.ruleset = new(tree.Ruleset)([], value);
    } else {
        this.value = value;
    }
};
tree.Directive.prototype = {
    toCSS: function (ctx, env) {
        if (this.ruleset) {
            this.ruleset.root = true;
            return this.name + (env.compress ? '{' : ' {\n  ') +
                   this.ruleset.toCSS(ctx, env).trim().replace(/\n/g, '\n  ') +
                               (env.compress ? '}': '\n}\n');
        } else {
            return this.name + ' ' + this.value.toCSS() + ';\n';
        }
    },
    eval: function (env) {
        env.frames.unshift(this);
        this.ruleset = this.ruleset && this.ruleset.eval(env);
        env.frames.shift();
        return this;
    },
    variable: function (name) { return tree.Ruleset.prototype.variable.call(this.ruleset, name) },
    find: function () { return tree.Ruleset.prototype.find.apply(this.ruleset, arguments) },
    rulesets: function () { return tree.Ruleset.prototype.rulesets.apply(this.ruleset) }
};

})(require('less/tree'));
(function (tree) {

tree.Element = function (combinator, value) {
    this.combinator = combinator instanceof tree.Combinator ?
                      combinator : new(tree.Combinator)(combinator);
    this.value = value.trim();
};
tree.Element.prototype.toCSS = function (env) {
    return this.combinator.toCSS(env || {}) + this.value;
};

tree.Combinator = function (value) {
    if (value === ' ') {
        this.value = ' ';
    } else {
        this.value = value ? value.trim() : "";
    }
};
tree.Combinator.prototype.toCSS = function (env) {
    return {
        ''  : '',
        ' ' : ' ',
        '&' : '',
        ':' : ' :',
        '::': '::',
        '+' : env.compress ? '+' : ' + ',
        '~' : env.compress ? '~' : ' ~ ',
        '>' : env.compress ? '>' : ' > '
    }[this.value];
};

})(require('less/tree'));
(function (tree) {

tree.Expression = function (value) { this.value = value };
tree.Expression.prototype = {
    eval: function (env) {
        if (this.value.length > 1) {
            return new(tree.Expression)(this.value.map(function (e) {
                return e.eval(env);
            }));
        } else {
            return this.value[0].eval(env);
        }
    },
    toCSS: function (env) {
        return this.value.map(function (e) {
            return e.toCSS(env);
        }).join(' ');
    }
};

})(require('less/tree'));
(function (tree) {
//
// CSS @import node
//
// The general strategy here is that we don't want to wait
// for the parsing to be completed, before we start importing
// the file. That's because in the context of a browser,
// most of the time will be spent waiting for the server to respond.
//
// On creation, we push the import path to our import queue, though
// `import,push`, we also pass it a callback, which it'll call once
// the file has been fetched, and parsed.
//
tree.Import = function (path, imports) {
    var that = this;

    this._path = path;

    // The '.less' extension is optional
    if (path instanceof tree.Quoted) {
        this.path = /\.(le?|c)ss$/.test(path.value) ? path.value : path.value + '.less';
    } else {
        this.path = path.value.value || path.value;
    }

    this.css = /css$/.test(this.path);

    // Only pre-compile .less files
    if (! this.css) {
        imports.push(this.path, function (root) {
            if (! root) {
                throw new(Error)("Error parsing " + that.path);
            }
            that.root = root;
        });
    }
};

//
// The actual import node doesn't return anything, when converted to CSS.
// The reason is that it's used at the evaluation stage, so that the rules
// it imports can be treated like any other rules.
//
// In `eval`, we make sure all Import nodes get evaluated, recursively, so
// we end up with a flat structure, which can easily be imported in the parent
// ruleset.
//
tree.Import.prototype = {
    toCSS: function () {
        if (this.css) {
            return "@import " + this._path.toCSS() + ';\n';
        } else {
            return "";
        }
    },
    eval: function (env) {
        var ruleset;

        if (this.css) {
            return this;
        } else {
            ruleset = new(tree.Ruleset)(null, this.root.rules.slice(0));

            for (var i = 0; i < ruleset.rules.length; i++) {
                if (ruleset.rules[i] instanceof tree.Import) {
                    Array.prototype
                         .splice
                         .apply(ruleset.rules,
                                [i, 1].concat(ruleset.rules[i].eval(env)));
                }
            }
            return ruleset.rules;
        }
    }
};

})(require('less/tree'));
(function (tree) {

tree.JavaScript = function (string, index) {
    this.expression = string;
    this.index = index;
};
tree.JavaScript.prototype = {
    toCSS: function () {
        return JSON.stringify(this.evaluated);
    },
    eval: function (env) {
        var result,
            expression = new(Function)('return (' + this.expression + ')'),
            context = {};

        for (var k in env.frames[0].variables()) {
            context[k.slice(1)] = {
                value: env.frames[0].variables()[k].value,
                toJS: function () {
                    return this.value.eval(env).toCSS();
                }
            };
        }

        try {
            this.evaluated = expression.call(context);
        } catch (e) {
            throw { message: "JavaScript evaluation error: '" + e.name + ': ' + e.message + "'" ,
                    index: this.index };
        }
        return this;
    }
};

})(require('less/tree'));

(function (tree) {

tree.Keyword = function (value) { this.value = value };
tree.Keyword.prototype = {
    eval: function () { return this },
    toCSS: function () { return this.value }
};

})(require('less/tree'));
(function (tree) {

tree.mixin = {};
tree.mixin.Call = function (elements, args, index) {
    this.selector = new(tree.Selector)(elements);
    this.arguments = args;
    this.index = index;
};
tree.mixin.Call.prototype = {
    eval: function (env) {
        var mixins, rules = [], match = false;

        for (var i = 0; i < env.frames.length; i++) {
            if ((mixins = env.frames[i].find(this.selector)).length > 0) {
                for (var m = 0; m < mixins.length; m++) {
                    if (mixins[m].match(this.arguments, env)) {
                        try {
                            Array.prototype.push.apply(
                                  rules, mixins[m].eval(env, this.arguments).rules);
                            match = true;
                        } catch (e) {
                            throw { message: e.message, index: e.index, stack: e.stack, call: this.index };
                        }
                    }
                }
                if (match) {
                    return rules;
                } else {
                    throw { message: 'No matching definition was found for `' +
                                      this.selector.toCSS().trim() + '('      +
                                      this.arguments.map(function (a) {
                                          return a.toCSS();
                                      }).join(', ') + ")`",
                            index:   this.index };
                }
            }
        }
        throw { message: this.selector.toCSS().trim() + " is undefined",
                index: this.index };
    }
};

tree.mixin.Definition = function (name, params, rules) {
    this.name = name;
    this.selectors = [new(tree.Selector)([new(tree.Element)(null, name)])];
    this.params = params;
    this.arity = params.length;
    this.rules = rules;
    this._lookups = {};
    this.required = params.reduce(function (count, p) {
        if (p.name && !p.value) { return count + 1 }
        else                    { return count }
    }, 0);
    this.parent = tree.Ruleset.prototype;
    this.frames = [];
};
tree.mixin.Definition.prototype = {
    toCSS:     function () { return "" },
    variable:  function (name) { return this.parent.variable.call(this, name) },
    variables: function ()     { return this.parent.variables.call(this) },
    find:      function ()     { return this.parent.find.apply(this, arguments) },
    rulesets:  function ()     { return this.parent.rulesets.apply(this) },

    eval: function (env, args) {
        var frame = new(tree.Ruleset)(null, []), context;

        for (var i = 0, val; i < this.params.length; i++) {
            if (this.params[i].name) {
                if (val = (args && args[i]) || this.params[i].value) {
                    frame.rules.unshift(new(tree.Rule)(this.params[i].name, val.eval(env)));
                } else {
                    throw { message: "wrong number of arguments for " + this.name +
                            ' (' + args.length + ' for ' + this.arity + ')' };
                }
            }
        }
        return new(tree.Ruleset)(null, this.rules.slice(0)).eval({
            frames: [this, frame].concat(this.frames, env.frames)
        });
    },
    match: function (args, env) {
        var argsLength = (args && args.length) || 0, len;

        if (argsLength < this.required) { return false }

        len = Math.min(argsLength, this.arity);

        for (var i = 0; i < len; i++) {
            if (!this.params[i].name) {
                if (args[i].eval(env).toCSS() != this.params[i].value.eval(env).toCSS()) {
                    return false;
                }
            }
        }
        return true;
    }
};

})(require('less/tree'));
(function (tree) {

tree.Operation = function (op, operands) {
    this.op = op.trim();
    this.operands = operands;
};
tree.Operation.prototype.eval = function (env) {
    var a = this.operands[0].eval(env),
        b = this.operands[1].eval(env),
        temp;

    if (a instanceof tree.Dimension && b instanceof tree.Color) {
        if (this.op === '*' || this.op === '+') {
            temp = b, b = a, a = temp;
        } else {
            throw { name: "OperationError",
                    message: "Can't substract or divide a color from a number" };
        }
    }
    return a.operate(this.op, b);
};

tree.operate = function (op, a, b) {
    switch (op) {
        case '+': return a + b;
        case '-': return a - b;
        case '*': return a * b;
        case '/': return a / b;
    }
};

})(require('less/tree'));
(function (tree) {

tree.Quoted = function (str, content) {
    this.value = content || '';
    this.quote = str.charAt(0);
};
tree.Quoted.prototype = {
    toCSS: function () {
        return this.quote + this.value + this.quote;
    },
    eval: function () {
        return this;
    }
};

})(require('less/tree'));
(function (tree) {

tree.Rule = function (name, value, important, index) {
    this.name = name;
    this.value = (value instanceof tree.Value) ? value : new(tree.Value)([value]);
    this.important = important ? ' ' + important.trim() : '';
    this.index = index;

    if (name.charAt(0) === '@') {
        this.variable = true;
    } else { this.variable = false }
};
tree.Rule.prototype.toCSS = function (env) {
    if (this.variable) { return "" }
    else {
        return this.name + (env.compress ? ':' : ': ') +
               this.value.toCSS(env) +
               this.important + ";";
    }
};

tree.Rule.prototype.eval = function (context) {
    return new(tree.Rule)(this.name, this.value.eval(context), this.important, this.index);
};

tree.Shorthand = function (a, b) {
    this.a = a;
    this.b = b;
};

tree.Shorthand.prototype = {
    toCSS: function (env) {
        return this.a.toCSS(env) + "/" + this.b.toCSS(env);
    },
    eval: function () { return this }
};

})(require('less/tree'));
(function (tree) {

tree.Ruleset = function (selectors, rules) {
    this.selectors = selectors;
    this.rules = rules;
    this._lookups = {};
};
tree.Ruleset.prototype = {
    eval: function (env) {
        var ruleset = new(tree.Ruleset)(this.selectors, this.rules.slice(0));

        ruleset.root = this.root;

        // push the current ruleset to the frames stack
        env.frames.unshift(ruleset);

        // Evaluate imports
        if (ruleset.root) {
            for (var i = 0; i < ruleset.rules.length; i++) {
                if (ruleset.rules[i] instanceof tree.Import) {
                    Array.prototype.splice
                         .apply(ruleset.rules, [i, 1].concat(ruleset.rules[i].eval(env)));
                }
            }
        }

        // Store the frames around mixin definitions,
        // so they can be evaluated like closures when the time comes.
        for (var i = 0; i < ruleset.rules.length; i++) {
            if (ruleset.rules[i] instanceof tree.mixin.Definition) {
                ruleset.rules[i].frames = env.frames.slice(0);
            }
        }

        // Evaluate mixin calls.
        for (var i = 0; i < ruleset.rules.length; i++) {
            if (ruleset.rules[i] instanceof tree.mixin.Call) {
                Array.prototype.splice
                     .apply(ruleset.rules, [i, 1].concat(ruleset.rules[i].eval(env)));
            }
        }

        // Evaluate everything else
        for (var i = 0, rule; i < ruleset.rules.length; i++) {
            rule = ruleset.rules[i];

            if (! (rule instanceof tree.mixin.Definition)) {
                ruleset.rules[i] = rule.eval ? rule.eval(env) : rule;
            }
        }

        // Pop the stack
        env.frames.shift();

        return ruleset;
    },
    match: function (args) {
        return !args || args.length === 0;
    },
    variables: function () {
        if (this._variables) { return this._variables }
        else {
            return this._variables = this.rules.reduce(function (hash, r) {
                if (r instanceof tree.Rule && r.variable === true) {
                    hash[r.name] = r;
                }
                return hash;
            }, {});
        }
    },
    variable: function (name) {
        return this.variables()[name];
    },
    rulesets: function () {
        if (this._rulesets) { return this._rulesets }
        else {
            return this._rulesets = this.rules.filter(function (r) {
                return (r instanceof tree.Ruleset) || (r instanceof tree.mixin.Definition);
            });
        }
    },
    find: function (selector, self) {
        self = self || this;
        var rules = [], rule, match,
            key = selector.toCSS();

        if (key in this._lookups) { return this._lookups[key] }

        this.rulesets().forEach(function (rule) {
            if (rule !== self) {
                for (var j = 0; j < rule.selectors.length; j++) {
                    if (match = selector.match(rule.selectors[j])) {
                        if (selector.elements.length > 1) {
                            Array.prototype.push.apply(rules, rule.find(
                                new(tree.Selector)(selector.elements.slice(1)), self));
                        } else {
                            rules.push(rule);
                        }
                        break;
                    }
                }
            }
        });
        return this._lookups[key] = rules;
    },
    //
    // Entry point for code generation
    //
    //     `context` holds an array of arrays.
    //
    toCSS: function (context, env) {
        var css = [],      // The CSS output
            rules = [],    // node.Rule instances
            rulesets = [], // node.Ruleset instances
            paths = [],    // Current selectors
            selector,      // The fully rendered selector
            rule;

        if (! this.root) {
            if (context.length === 0) {
                paths = this.selectors.map(function (s) { return [s] });
            } else {
                for (var s = 0; s < this.selectors.length; s++) {
                    for (var c = 0; c < context.length; c++) {
                        paths.push(context[c].concat([this.selectors[s]]));
                    }
                }
            }
        }

        // Compile rules and rulesets
        for (var i = 0; i < this.rules.length; i++) {
            rule = this.rules[i];

            if (rule.rules || (rule instanceof tree.Directive)) {
                rulesets.push(rule.toCSS(paths, env));
            } else if (rule instanceof tree.Comment) {
                if (!rule.silent) {
                    if (this.root) {
                        rulesets.push(rule.toCSS(env));
                    } else {
                        rules.push(rule.toCSS(env));
                    }
                }
            } else {
                if (rule.toCSS && !rule.variable) {
                    rules.push(rule.toCSS(env));
                } else if (rule.value && !rule.variable) {
                    rules.push(rule.value.toString());
                }
            }
        } 

        rulesets = rulesets.join('');

        // If this is the root node, we don't render
        // a selector, or {}.
        // Otherwise, only output if this ruleset has rules.
        if (this.root) {
            css.push(rules.join(env.compress ? '' : '\n'));
        } else {
            if (rules.length > 0) {
                selector = paths.map(function (p) {
                    return p.map(function (s) {
                        return s.toCSS(env);
                    }).join('').trim();
                }).join(env.compress ? ',' : (paths.length > 3 ? ',\n' : ', '));
                css.push(selector,
                        (env.compress ? '{' : ' {\n  ') +
                        rules.join(env.compress ? '' : '\n  ') +
                        (env.compress ? '}' : '\n}\n'));
            }
        }
        css.push(rulesets);

        return css.join('') + (env.compress ? '\n' : '');
    }
};
})(require('less/tree'));
(function (tree) {

tree.Selector = function (elements) {
    this.elements = elements;
    if (this.elements[0].combinator.value === "") {
        this.elements[0].combinator.value = ' ';
    }
};
tree.Selector.prototype.match = function (other) {
    if (this.elements[0].value === other.elements[0].value) {
        return true;
    } else {
        return false;
    }
};
tree.Selector.prototype.toCSS = function (env) {
    if (this._css) { return this._css }

    return this._css = this.elements.map(function (e) {
        if (typeof(e) === 'string') {
            return ' ' + e.trim();
        } else {
            return e.toCSS(env);
        }
    }).join('');
};

})(require('less/tree'));
(function (tree) {

tree.URL = function (val, paths) {
    // Add the base path if the URL is relative and we are in the browser
    if (!/^(?:https?:\/|file:\/)?\//.test(val.value) && paths.length > 0 && typeof(window) !== 'undefined') {
        val.value = paths[0] + (val.value.charAt(0) === '/' ? val.value.slice(1) : val.value);
    }
    this.value = val;
    this.paths = paths;
};
tree.URL.prototype = {
    toCSS: function () {
        return "url(" + this.value.toCSS() + ")";
    },
    eval: function (ctx) {
        return new(tree.URL)(this.value.eval(ctx), this.paths);
    }
};

})(require('less/tree'));
(function (tree) {

tree.Value = function (value) {
    this.value = value;
    this.is = 'value';
};
tree.Value.prototype = {
    eval: function (env) {
        if (this.value.length === 1) {
            return this.value[0].eval(env);
        } else {
            return new(tree.Value)(this.value.map(function (v) {
                return v.eval(env);
            }));
        }
    },
    toCSS: function (env) {
        return this.value.map(function (e) {
            return e.toCSS(env);
        }).join(env.compress ? ',' : ', ');
    }
};

})(require('less/tree'));
(function (tree) {

tree.Variable = function (name, index) { this.name = name, this.index = index };
tree.Variable.prototype = {
    eval: function (env) {
        var variable, v, name = this.name;

        if (variable = tree.find(env.frames, function (frame) {
            if (v = frame.variable(name)) {
                return v.value.eval(env);
            }
        })) { return variable }
        else {
            throw { message: "variable " + this.name + " is undefined",
                    index: this.index };
        }
    }
};

})(require('less/tree'));
require('less/tree').find = function (obj, fun) {
    for (var i = 0, r; i < obj.length; i++) {
        if (r = fun.call(obj, obj[i])) { return r }
    }
    return null;
};
//
// browser.js - client-side engine
//

var isFileProtocol = (location.protocol === 'file:'    ||
                      location.protocol === 'chrome:'  ||
                      location.protocol === 'resource:');

less.env = less.env || (location.hostname == '127.0.0.1' ||
                        location.hostname == '0.0.0.0'   ||
                        location.hostname == 'localhost' ||
                        location.port.length > 0         ||
                        isFileProtocol                   ? 'development'
                                                         : 'production');

// Load styles asynchronously (default: false)
//
// This is set to `false` by default, so that the body
// doesn't start loading before the stylesheets are parsed.
// Setting this to `true` can result in flickering.
//
less.async = false;

// Interval between watch polls
less.poll = less.poll || (isFileProtocol ? 1000 : 1500);

//
// Watch mode
//
less.watch   = function () { return this.watchMode = true };
less.unwatch = function () { return this.watchMode = false };

if (less.env === 'development') {
    less.optimization = 0;

    if (/!watch/.test(location.hash)) {
        less.watch();
    }
    less.watchTimer = setInterval(function () {
        if (less.watchMode) {
            loadStyleSheets(function (root, sheet, env) {
                if (root) {
                    createCSS(root.toCSS(), sheet, env.lastModified);
                }
            });
        }
    }, less.poll);
} else {
    less.optimization = 3;
}

var cache;

try {
    cache = (typeof(window.localStorage) === 'undefined') ? null : window.localStorage;
} catch (_) {
    cache = null;
}

//
// Get all <link> tags with the 'rel' attribute set to "stylesheet/less"
//
var links = document.getElementsByTagName('link');
var typePattern = /^text\/(x-)?less$/;

less.sheets = [];

for (var i = 0; i < links.length; i++) {
    if (links[i].rel === 'stylesheet/less' || (links[i].rel.match(/stylesheet/) &&
       (links[i].type.match(typePattern)))) {
        less.sheets.push(links[i]);
    }
}


less.refresh = function (reload) {
    var startTime = endTime = new(Date);

    loadStyleSheets(function (root, sheet, env) {
        if (env.local) {
            log("loading " + sheet.href + " from cache.");
        } else {
            log("parsed " + sheet.href + " successfully.");
            createCSS(root.toCSS(), sheet, env.lastModified);
        }
        log("css for " + sheet.href + " generated in " + (new(Date) - endTime) + 'ms');
        (env.remaining === 0) && log("css generated in " + (new(Date) - startTime) + 'ms');
        endTime = new(Date);
    }, reload);

    loadStyles();
};
less.refreshStyles = loadStyles;

less.refresh(less.env === 'development');

function loadStyles() {
    var styles = document.getElementsByTagName('style');
    for (var i = 0; i < styles.length; i++) {
        if (styles[i].type.match(typePattern)) {
            new(less.Parser)().parse(styles[i].innerHTML || '', function (e, tree) {
                styles[i].type      = 'text/css';
                styles[i].innerHTML = tree.toCSS();
            });
        }
    }
}

function loadStyleSheets(callback, reload) {
    for (var i = 0; i < less.sheets.length; i++) {
        loadStyleSheet(less.sheets[i], callback, reload, less.sheets.length - (i + 1));
    }
}

function loadStyleSheet(sheet, callback, reload, remaining) {
    var url       = window.location.href;
    var href      = sheet.href.replace(/\?.*$/, '');
    var css       = cache && cache.getItem(href);
    var timestamp = cache && cache.getItem(href + ':timestamp');
    var styles    = { css: css, timestamp: timestamp };

    // Stylesheets in IE don't always return the full path
    if (! /^(https?|file):/.test(href)) {
        href = url.slice(0, url.lastIndexOf('/') + 1) + href;
    }

    xhr(sheet.href, function (data, lastModified) {
        if (!reload && styles &&
           (new(Date)(lastModified).valueOf() ===
            new(Date)(styles.timestamp).valueOf())) {
            // Use local copy
            createCSS(styles.css, sheet);
            callback(null, sheet, { local: true, remaining: remaining });
        } else {
            // Use remote copy (re-parse)
            try {
                new(less.Parser)({
                    optimization: less.optimization,
                    paths: [href.replace(/[\w\.-]+$/, '')]
                }).parse(data, function (e, root) {
                    if (e) { return error(e, href) }
                    try {
                        callback(root, sheet, { local: false, lastModified: lastModified, remaining: remaining });
                        removeNode(document.getElementById('less-error-message:' + extractId(href)));
                    } catch (e) {
                        error(e, href);
                    }
                });
            } catch (e) {
                error(e, href);
            }
        }
    }, function (status, url) {
        throw new(Error)("Couldn't load " + url + " (" + status + ")");
    });
}

function extractId(href) {
    return href.replace(/^[a-z]+:\/\/?[^\/]+/, '' )  // Remove protocol & domain
               .replace(/^\//,                 '' )  // Remove root /
               .replace(/\?.*$/,               '' )  // Remove query
               .replace(/\.[^\.\/]+$/,         '' )  // Remove file extension
               .replace(/[^\.\w-]+/g,          '-')  // Replace illegal characters
               .replace(/\./g,                 ':'); // Replace dots with colons(for valid id)
}

function createCSS(styles, sheet, lastModified) {
    var css;

    // Strip the query-string
    var href = sheet.href ? sheet.href.replace(/\?.*$/, '') : '';

    // If there is no title set, use the filename, minus the extension
    var id = 'less:' + (sheet.title || extractId(href));

    // If the stylesheet doesn't exist, create a new node
    if ((css = document.getElementById(id)) === null) {
        css = document.createElement('style');
        css.type = 'text/css';
        css.media = sheet.media || 'screen';
        css.id = id;
        document.getElementsByTagName('head')[0].appendChild(css);
    }

    if (css.styleSheet) { // IE
        try {
            css.styleSheet.cssText = styles;
        } catch (e) {
            throw new(Error)("Couldn't reassign styleSheet.cssText.");
        }
    } else {
        (function (node) {
            if (css.childNodes.length > 0) {
                if (css.firstChild.nodeValue !== node.nodeValue) {
                    css.replaceChild(node, css.firstChild);
                }
            } else {
                css.appendChild(node);
            }
        })(document.createTextNode(styles));
    }

    // Don't update the local store if the file wasn't modified
    if (lastModified && cache) {
        log('saving ' + href + ' to cache.');
        cache.setItem(href, styles);
        cache.setItem(href + ':timestamp', lastModified);
    }
}

function xhr(url, callback, errback) {
    var xhr = getXMLHttpRequest();
    var async = isFileProtocol ? false : less.async;

    if (typeof(xhr.overrideMimeType) === 'function') {
        xhr.overrideMimeType('text/css');
    }
    xhr.open('GET', url, async);
    xhr.send(null);

    if (isFileProtocol) {
        if (xhr.status === 0) {
            callback(xhr.responseText);
        } else {
            errback(xhr.status, url);
        }
    } else if (async) {
        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4) {
                handleResponse(xhr, callback, errback);
            }
        };
    } else {
        handleResponse(xhr, callback, errback);
    }

    function handleResponse(xhr, callback, errback) {
        if (xhr.status >= 200 && xhr.status < 300) {
            callback(xhr.responseText,
                     xhr.getResponseHeader("Last-Modified"));
        } else if (typeof(errback) === 'function') {
            errback(xhr.status, url);
        }
    }
}

function getXMLHttpRequest() {
    if (window.XMLHttpRequest) {
        return new(XMLHttpRequest);
    } else {
        try {
            return new(ActiveXObject)("MSXML2.XMLHTTP.3.0");
        } catch (e) {
            log("browser doesn't support AJAX.");
            return null;
        }
    }
}

function removeNode(node) {
    return node && node.parentNode.removeChild(node);
}

function log(str) {
    if (less.env == 'development' && typeof(console) !== "undefined") { console.log('less: ' + str) }
}

function error(e, href) {
    var id = 'less-error-message:' + extractId(href);

    var template = ['<ul>',
                        '<li><label>[-1]</label><pre class="ctx">{0}</pre></li>',
                        '<li><label>[0]</label><pre>{current}</pre></li>',
                        '<li><label>[1]</label><pre class="ctx">{2}</pre></li>',
                    '</ul>'].join('\n');

    var elem = document.createElement('div'), timer, content;

    elem.id        = id;
    elem.className = "less-error-message";

    content = '<h3>'  + (e.message || 'There is an error in your .less file') +
              '</h3>' + '<p><a href="' + href   + '">' + href + "</a> ";

    if (e.extract) {
        content += 'on line ' + e.line + ', column ' + (e.column + 1) + ':</p>' +
            template.replace(/\[(-?\d)\]/g, function (_, i) {
                return (parseInt(e.line) + parseInt(i)) || '';
            }).replace(/\{(\d)\}/g, function (_, i) {
                return e.extract[parseInt(i)] || '';
            }).replace(/\{current\}/, e.extract[1].slice(0, e.column) + '<span class="error">' +
                                      e.extract[1].slice(e.column)    + '</span>');
    }
    elem.innerHTML = content;

    // CSS for error messages
    createCSS([
        '.less-error-message ul, .less-error-message li {',
            'list-style-type: none;',
            'margin-right: 15px;',
            'padding: 4px 0;',
            'margin: 0;',
        '}',
        '.less-error-message label {',
            'font-size: 12px;',
            'margin-right: 15px;',
            'padding: 4px 0;',
            'color: #cc7777;',
        '}',
        '.less-error-message pre {',
            'color: #ee4444;',
            'padding: 4px 0;',
            'margin: 0;',
            'display: inline-block;',
        '}',
        '.less-error-message pre.ctx {',
            'color: #dd4444;',
        '}',
        '.less-error-message h3 {',
            'font-size: 20px;',
            'font-weight: bold;',
            'padding: 15px 0 5px 0;',
            'margin: 0;',
        '}',
        '.less-error-message a {',
            'color: #10a',
        '}',
        '.less-error-message .error {',
            'color: red;',
            'font-weight: bold;',
            'padding-bottom: 2px;',
            'border-bottom: 1px dashed red;',
        '}'
    ].join('\n'), { title: 'error-message' });

    elem.style.cssText = [
        "font-family: Arial, sans-serif",
        "border: 1px solid #e00",
        "background-color: #eee",
        "border-radius: 5px",
        "-webkit-border-radius: 5px",
        "-moz-border-radius: 5px",
        "color: #e00",
        "padding: 15px",
        "margin-bottom: 15px"
    ].join(';');

    if (less.env == 'development') {
        timer = setInterval(function () {
            if (document.body) {
                if (document.getElementById(id)) {
                    document.body.replaceChild(elem, document.getElementById(id));
                } else {
                    document.body.insertBefore(elem, document.body.firstChild);
                }
                clearInterval(timer);
            }
        }, 10);
    }
}

})(window);
/*
  mustache.js — Logic-less templates in JavaScript

  See http://mustache.github.com/ for more info.
*/

var Mustache = function() {
  var Renderer = function() {};

  Renderer.prototype = {
    otag: "{{",
    ctag: "}}",
    pragmas: {},
    buffer: [],
    pragmas_implemented: {
      "IMPLICIT-ITERATOR": true
    },
    context: {},

    render: function(template, context, partials, in_recursion) {
      // reset buffer & set context
      if(!in_recursion) {
        this.context = context;
        this.buffer = []; // TODO: make this non-lazy
      }

      // fail fast
      if(!this.includes("", template)) {
        if(in_recursion) {
          return template;
        } else {
          this.send(template);
          return;
        }
      }

      template = this.render_pragmas(template);
      var html = this.render_section(template, context, partials);
      if(in_recursion) {
        return this.render_tags(html, context, partials, in_recursion);
      }

      this.render_tags(html, context, partials, in_recursion);
    },

    /*
      Sends parsed lines
    */
    send: function(line) {
      if(line != "") {
        this.buffer.push(line);
      }
    },

    /*
      Looks for %PRAGMAS
    */
    render_pragmas: function(template) {
      // no pragmas
      if(!this.includes("%", template)) {
        return template;
      }

      var that = this;
      var regex = new RegExp(this.otag + "%([\\w-]+) ?([\\w]+=[\\w]+)?" +
            this.ctag);
      return template.replace(regex, function(match, pragma, options) {
        if(!that.pragmas_implemented[pragma]) {
          throw({message: 
            "This implementation of mustache doesn't understand the '" +
            pragma + "' pragma"});
        }
        that.pragmas[pragma] = {};
        if(options) {
          var opts = options.split("=");
          that.pragmas[pragma][opts[0]] = opts[1];
        }
        return "";
        // ignore unknown pragmas silently
      });
    },

    
    /*
      Tries to find a partial in the curent scope and render it
    */
    /*CELL MODIFIED BEGIN*/
    render_partial: (function(){
      cellNameRegex = /^([A-z]([\/]?[A-z0-9_\-])*)[ ]*([\'"].*)?$/;

      return function(name, context, partials) {
         name = this.trim(name);
         var c = {},
             id = undefined,
             tag = undefined,
             results = (cellNameRegex.exec(name) || name).slice(1);

         name = results[0];
         if(results.length>2 && results[2]){
            var jsonObj = JSON.parse('{'+results[2]+'}');
            
            id = (typeof jsonObj.$id === 'string')
                  ? jsonObj.$id
                  : undefined;
            delete jsonObj.$id;
          
            var datadesc = Object.getOwnPropertyDescriptor(jsonObj,'$data');
            if(datadesc){
               delete jsonObj.$data;
               var val = datadesc.value;
               if(typeof val === 'string'){
                  c = (val === '.')
                        ? context
                        : context[val];
               }
            }else{
               c = jsonObj;
            }

            tag = (typeof jsonObj.$tag === 'string')
                  ? jsonObj.$tag
                  : undefined;
            delete jsonObj.$tag
         }
         
         var p = partials.getPartial(name,c,id,tag);
         if(!p) {
            var msg = "[ERROR] cell: unknown cell '"+name+"'";
            try{throw new Error(msg);}catch(e){} // Allow for easier debugging w/break on error
            return "<!-- "+msg+" -->";
         }
         return this.render(p, c, partials, true);
      };
    })(),
    /*CELL MODIFIED END*/

    /*
      Renders inverted (^) and normal (#) sections
    */
    render_section: function(template, context, partials) {
      if(!this.includes("#", template) && !this.includes("^", template)) {
        return template;
      }

      var that = this;
      // CSW - Added "+?" so it finds the tighest bound, not the widest
      var regex = new RegExp(this.otag + "(\\^|\\#)\\s*(.+)\\s*" + this.ctag +
              "\n*([\\s\\S]+?)" + this.otag + "\\/\\s*\\2\\s*" + this.ctag +
              "\\s*", "mg");

      // for each {{#foo}}{{/foo}} section do...
      return template.replace(regex, function(match, type, name, content) {
        var value = that.find(name, context);
        if(type == "^") { // inverted section
          if(!value || that.is_array(value) && value.length === 0) {
            // false or empty list, render it
            return that.render(content, context, partials, true);
          } else {
            return "";
          }
        } else if(type == "#") { // normal section
          if(that.is_array(value)) { // Enumerable, Let's loop!
            return that.map(value, function(row) {
              return that.render(content, that.create_context(row),
                partials, true);
            }).join("");
          } else if(that.is_object(value)) { // Object, Use it as subcontext!
            return that.render(content, that.create_context(value),
              partials, true);
          } else if(typeof value === "function") {
            // higher order section
            return value.call(context, content, function(text) {
              return that.render(text, context, partials, true);
            });
          } else if(value) { // boolean section
            return that.render(content, context, partials, true);
          } else {
            return "";
          }
        }
      });
    },

    /*
      Replace {{foo}} and friends with values from our view
    */
    render_tags: function(template, context, partials, in_recursion) {
      // tit for tat
      var that = this;

      var new_regex = function() {
        return new RegExp(that.otag + "(=|!|>|\\{|%)?(.+?)\\1?" +
          that.ctag + "+", "g");
      };

      var regex = new_regex();
      var tag_replace_callback = function(match, operator, name) {
        switch(operator) {
        case "!": // ignore comments
          return "";
        case "=": // set new delimiters, rebuild the replace regexp
          that.set_delimiters(name);
          regex = new_regex();
          return "";
        case ">": // render partial
          return that.render_partial(name, context, partials);
        case "{": // the triple mustache is unescaped
          return that.find(name, context);
        default: // escape the value
          return that.escape(that.find(name, context));
        }
      };
      var lines = template.split("\n");
      for(var i = 0; i < lines.length; i++) {
        lines[i] = lines[i].replace(regex, tag_replace_callback, this);
        if(!in_recursion) {
          this.send(lines[i]);
        }
      }

      if(in_recursion) {
        return lines.join("\n");
      }
    },

    set_delimiters: function(delimiters) {
      var dels = delimiters.split(" ");
      this.otag = this.escape_regex(dels[0]);
      this.ctag = this.escape_regex(dels[1]);
    },

    escape_regex: function(text) {
      // thank you Simon Willison
      if(!arguments.callee.sRE) {
        var specials = [
          '/', '.', '*', '+', '?', '|',
          '(', ')', '[', ']', '{', '}', '\\'
        ];
        arguments.callee.sRE = new RegExp(
          '(\\' + specials.join('|\\') + ')', 'g'
        );
      }
      return text.replace(arguments.callee.sRE, '\\$1');
    },

    /*
      find `name` in current `context`. That is find me a value
      from the view object
    */
    find: function(name, context) {
      name = this.trim(name);

      // Checks whether a value is thruthy or false or 0
      function is_kinda_truthy(bool) {
        return bool === false || bool === 0 || bool;
      }

      var value;
      if(is_kinda_truthy(context[name])) {
        value = context[name];
      } else if(is_kinda_truthy(this.context[name])) {
        value = this.context[name];
      }

      if(typeof value === "function") {
        return value.apply(context);
      }
      if(value !== undefined) {
        return value;
      }
      // silently ignore unkown variables
      return "";
    },

    // Utility methods

    /* includes tag */
    includes: function(needle, haystack) {
      return haystack.indexOf(this.otag + needle) != -1;
    },

    /*
      Does away with nasty characters
    */
    escape: function(s) {
      s = String(s === null ? "" : s);
      return s.replace(/&(?!\w+;)|["<>\\]/g, function(s) {
        switch(s) {
        case "&": return "&amp;";
        case "\\": return "\\\\";
        case '"': return '\"';
        case "<": return "&lt;";
        case ">": return "&gt;";
        default: return s;
        }
      });
    },

    // by @langalex, support for arrays of strings
    create_context: function(_context) {
      if(this.is_object(_context)) {
        return _context;
      } else {
        var iterator = ".";
        if(this.pragmas["IMPLICIT-ITERATOR"]) {
          iterator = this.pragmas["IMPLICIT-ITERATOR"].iterator;
        }
        var ctx = {};
        ctx[iterator] = _context;
        return ctx;
      }
    },

    is_object: function(a) {
      return a && typeof a == "object";
    },

    is_array: function(a) {
      return Object.prototype.toString.call(a) === '[object Array]';
    },

    /*
      Gets rid of leading and trailing whitespace
    */
    trim: function(s) {
      return s.replace(/^\s*|\s*$/g, "");
    },

    /*
      Why, why, why? Because IE. Cry, cry cry.
    */
    map: function(array, fn) {
      if (typeof array.map == "function") {
        return array.map(fn);
      } else {
        var r = [];
        var l = array.length;
        for(var i = 0; i < l; i++) {
          r.push(fn(array[i]));
        }
        return r;
      }
    }
  };

  return({
    name: "mustache.js",
    version: "0.3.0-dev",

    /*
      Turns a template and view into HTML
    */
    to_html: function(template, view, partials, send_fun) {
      var renderer = new Renderer();
      if(send_fun) {
        renderer.send = send_fun;
      }
      renderer.render(template, view, partials);
      if(!send_fun) {
        return renderer.buffer.join("\n");
      }
    }
  });
}();
/** vim: et:ts=4:sw=4:sts=4
 * @license RequireJS 0.2.1 Copyright (c) 2010, The Dojo Foundation All Rights Reserved.
 * Available via the MIT or new BSD license.
 * see: http://github.com/jrburke/requirejs for details
 */
/*jslint plusplus: false */
/*global window: false, navigator: false, document: false, importScripts: false,
  jQuery: false, clearInterval: false, setInterval: false, self: false,
  setTimeout: false */


var require, define;
(function () {
    //Change this version number for each release.
    var version = "0.2.1",
        commentRegExp = /(\/\*([\s\S]*?)\*\/|\/\/(.*)$)/mg,
        cjsRequireRegExp = /require\(["']([\w\!\-_\.\/]+)["']\)/g,
        currDirRegExp = /^\.\//,
        ostring = Object.prototype.toString,
        ap = Array.prototype,
        aps = ap.slice,
        apsp = ap.splice,
        isBrowser = !!(typeof window !== "undefined" && navigator && document),
        isWebWorker = !isBrowser && typeof importScripts !== "undefined",
        //PS3 indicates loaded and complete, but need to wait for complete
        //specifically. Sequence is "loading", "loaded", execution,
        // then "complete". The UA check is unfortunate, but not sure how
        //to feature test w/o causing perf issues.
        readyRegExp = isBrowser && navigator.platform === 'PLAYSTATION 3' ?
                      /^complete$/ : /^(complete|loaded)$/,
        defContextName = "_",
        reqWaitIdPrefix = "_r@@",
        empty = {},
        contexts = {},
        globalDefQueue = [],
        interactiveScript = null,
        isDone = false,
        useInteractive = false,
        //Default plugins that have remapped names, if no mapping
        //already exists.
        requirePlugins = {
            "text": "require/text",
            "i18n": "require/i18n",
            "order": "require/order"
        },
        req, cfg = {}, currentlyAddingScript, s, head, baseElement, scripts, script,
        rePkg, src, m, dataMain, i, scrollIntervalId, setReadyState, ctx;

    function isFunction(it) {
        return ostring.call(it) === "[object Function]";
    }

    function isArray(it) {
        return ostring.call(it) === "[object Array]";
    }

    /**
     * Simple function to mix in properties from source into target,
     * but only if target does not already have a property of the same name.
     * This is not robust in IE for transferring methods that match
     * Object.prototype names, but the uses of mixin here seem unlikely to
     * trigger a problem related to that.
     */
    function mixin(target, source, force) {
        for (var prop in source) {
            if (!(prop in empty) && (!(prop in target) || force)) {
                target[prop] = source[prop];
            }
        }
        return req;
    }

    /**
     * Used to set up package paths from a packagePaths or packages config object.
     * @param {Object} packages the object to store the new package config
     * @param {Array} currentPackages an array of packages to configure
     * @param {String} [dir] a prefix dir to use.
     */
    function configurePackageDir(packages, currentPackages, dir) {
        var i, location, pkgObj;
        for (i = 0; (pkgObj = currentPackages[i]); i++) {
            pkgObj = typeof pkgObj === "string" ? { name: pkgObj } : pkgObj;
            location = pkgObj.location;

            //Add dir to the path, but avoid paths that start with a slash
            //or have a colon (indicates a protocol)
            if (dir && (!location || (location.indexOf("/") !== 0 && location.indexOf(":") === -1))) {
                pkgObj.location = dir + "/" + (pkgObj.location || pkgObj.name);
            }

            //Normalize package paths.
            pkgObj.location = pkgObj.location || pkgObj.name;
            pkgObj.lib = pkgObj.lib || "lib";
            //Remove leading dot in main, so main paths are normalized.
            pkgObj.main = (pkgObj.main || "lib/main").replace(currDirRegExp, '');

            packages[pkgObj.name] = pkgObj;
        }
    }

    //Check for an existing version of require. If so, then exit out. Only allow
    //one version of require to be active in a page. However, allow for a require
    //config object, just exit quickly if require is an actual function.
    if (typeof require !== "undefined") {
        if (isFunction(require)) {
            return;
        } else {
            //assume it is a config object.
            cfg = require;
        }
    }

    /**
     * Creates a new context for use in require and define calls.
     * Handle most of the heavy lifting. Do not want to use an object
     * with prototype here to avoid using "this" in require, in case it
     * needs to be used in more super secure envs that do not want this.
     * Also there should not be that many contexts in the page. Usually just
     * one for the default context, but could be extra for multiversion cases
     * or if a package needs a special context for a dependency that conflicts
     * with the standard context.
     */
    function newContext(contextName) {
        var context, resume,
            config = {
                waitSeconds: 7,
                baseUrl: s.baseUrl || "./",
                paths: {},
                packages: {}
            },
            defQueue = [],
            specified = {
                "require": true,
                "exports": true,
                "module": true
            },
            errored = {},
            urlMap = {},
            defined = {},
            loaded = {},
            waiting = {},
            waitAry = [],
            waitIdCounter = 0,
            managerCallbacks = {},
            plugins = {},
            pluginsQueue = {};

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
            for (i = 0; (part = ary[i]); i++) {
                if (part === ".") {
                    ary.splice(i, 1);
                    i -= 1;
                } else if (part === "..") {
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
         * @returns {String} normalized name
         */
        function normalizeName(name, baseName) {
            var pkgName, pkgConfig;

            //Adjust any relative paths.
            if (name.charAt(0) === ".") {
                //If have a base name, try to normalize against it,
                //otherwise, assume it is a top-level require that will
                //be relative to baseUrl in the end.
                if (baseName) {
                    if (config.packages[baseName]) {
                        //If the baseName is a package name, then just treat it as one
                        //name to concat the name with.
                        baseName = [baseName];
                    } else {
                        //Convert baseName to array, and lop off the last part,
                        //so that . matches that "directory" and not name of the baseName's
                        //module. For instance, baseName of "one/two/three", maps to
                        //"one/two/three.js", but we want the directory, "one/two" for
                        //this normalization.
                        baseName = baseName.split("/");
                        baseName = baseName.slice(0, baseName.length - 1);
                    }

                    name = baseName.concat(name.split("/"));
                    trimDots(name);

                    //Some use of packages may use a . path to reference the
                    //"main" module name, so normalize for that.
                    pkgConfig = config.packages[(pkgName = name[0])];
                    name = name.join("/");
                    if (pkgConfig && name === pkgName + '/' + pkgConfig.main) {
                        name = pkgName;
                    }
                }
            }
            return name;
        }

        /**
         * Creates a module mapping that includes plugin prefix, module
         * name, and path. If parentModuleMap is provided it will
         * also normalize the name via require.normalizeName()
         *
         * @param {String} name the module name
         * @param {String} [parentModuleMap] parent module map
         * for the module name, used to resolve relative names.
         *
         * @returns {Object}
         */
        function makeModuleMap(name, parentModuleMap) {
            var index = name ? name.indexOf("!") : -1,
                prefix = null,
                parentName = parentModuleMap ? parentModuleMap.name : null,
                normalizedName, url;

            if (index !== -1) {
                prefix = name.substring(0, index);
                name = name.substring(index + 1, name.length);
            }

            //Account for relative paths if there is a base name.
            if (name) {
                normalizedName = normalizeName(name, parentName);

                url = urlMap[normalizedName];
                if (!url) {
                    //Calculate url for the module, if it has a name.
                    if (req.toModuleUrl) {
                        //Special logic required for a particular engine,
                        //like Node.
                        url = req.toModuleUrl(context, name, parentModuleMap);
                    } else {
                        url = context.nameToUrl(name, null, parentModuleMap);
                    }

                    //Store the URL mapping for later.
                    urlMap[normalizedName] = url;
                }
            }else{
                normalizedName = "";
            }

            if (prefix) {
                prefix = normalizeName(prefix, parentName);
                //Allow simpler mappings for some plugins
                prefix = requirePlugins[prefix] || prefix;
            }

            return {
                prefix: prefix,
                name: normalizedName,
                parentMap: parentModuleMap,
                url: url,
                fullName: prefix ? prefix + "!" + normalizedName : normalizedName
            };
        }

        /**
         * Determine if priority loading is done. If so clear the priorityWait
         */
        function isPriorityDone() {
            var priorityDone = true,
                priorityWait = config.priorityWait,
                priorityName, i;
            if (priorityWait) {
                for (i = 0; (priorityName = priorityWait[i]); i++) {
                    if (!loaded[priorityName]) {
                        priorityDone = false;
                        break;
                    }
                }
                if (priorityDone) {
                    delete config.priorityWait;
                }
            }
            return priorityDone;
        }

        /**
         * Helper function that creates a setExports function for a "module"
         * CommonJS dependency. Do this here to avoid creating a closure that
         * is part of a loop.
         */
        function makeSetExports(moduleObj) {
            return function (exports) {
                moduleObj.exports = exports;
            };
        }

        function makeContextModuleFunc(func, relModuleMap) {
            return function () {
                //A version of a require function that passes a moduleName
                //value for items that may need to
                //look up paths relative to the moduleName
                var args = [].concat(aps.call(arguments, 0));
                args.push(relModuleMap);
                return func.apply(null, args);
            };
        }

        /**
         * Helper function that creates a require function object to give to
         * modules that ask for it as a dependency. It needs to be specific
         * per module because of the implication of path mappings that may
         * need to be relative to the module name.
         */
        function makeRequire(relModuleMap) {
            var modRequire = makeContextModuleFunc(context.require, relModuleMap);
            mixin(modRequire, {
                nameToUrl: makeContextModuleFunc(context.nameToUrl, relModuleMap),
                toUrl: makeContextModuleFunc(context.toUrl, relModuleMap),
                isDefined: makeContextModuleFunc(context.isDefined, relModuleMap),
                ready: req.ready,
                def: function(name, deps, callback){
                    req.def(name, deps, callback, context);
                    context.completeLoad(name);
                },
                isBrowser: req.isBrowser
            });
            //Something used by node.
            if (req.paths) {
                modRequire.paths = req.paths;
            }
            return modRequire;
        }

        /*
         * Queues a dependency for checking after the loader is out of a
         * "paused" state, for example while a script file is being loaded
         * in the browser, where it may have many modules defined in it.
         *
         * depName will be fully qualified, no relative . or .. path.
         */
        function queueDependency(dep) {
            //Make sure to load any plugin and associate the dependency
            //with that plugin.
            var prefix = dep.prefix,
                fullName = dep.fullName;

            //Do not bother if the depName is already in transit
            if (specified[fullName] || fullName in defined) {
                return;
            }

            if (prefix) {
                //Queue up loading of the dependency, track it
                //via context.plugins
                context.plugins[prefix] = undefined;
                queueDependency(makeModuleMap(prefix));
            }

            context.paused.push(dep);
        }

        function execManager(manager) {
            var i, ret, waitingCallbacks,
                cb = manager.callback,
                fullName = manager.fullName,
                args = [],
                ary = manager.depArray;

            if(manager.errors){
                if(typeof manager.errCallback === 'function'){
                    manager.errCallback(manager.deps,manager.errorDeps);
                }
            }else{
                //Call the callback to define the module, if necessary.
                if (cb && isFunction(cb)) {
                    //Pull out the defined dependencies and pass the ordered
                    //values to the callback.
                    if (ary) {
                        for (i = 0; i < ary.length; i++) {
                            args.push(manager.deps[ary[i]]);
                        }
                    }

                    ret = req.execCb(fullName, manager.callback, args);

                    if (fullName) {
                        //If using exports and the function did not return a value,
                        //and the "module" object for this definition function did not
                        //define an exported value, then use the exports object.
                        if (manager.usingExports && ret === undefined && (!manager.cjsModule || !("exports" in manager.cjsModule))) {
                            ret = defined[fullName];
                        } else {
                            if (manager.cjsModule && "exports" in manager.cjsModule) {
                                ret = defined[fullName] = manager.cjsModule.exports;
                            } else {
                                if (fullName in defined && !manager.usingExports) {
                                    return req.onError(new Error(fullName + " has already been defined"));
                                }
                                defined[fullName] = ret;
                            }
                        }
                    }
                } else if (fullName) {
                    //May just be an object definition for the module. Only
                    //worry about defining if have a module name.
                    ret = defined[fullName] = cb;
                }
            }

            if (fullName) {
                //If anything was waiting for this module to be defined,
                //notify them now.
                waitingCallbacks = managerCallbacks[fullName];
                if (waitingCallbacks) {
                    for (i = 0; i < waitingCallbacks.length; i++) {
                        waitingCallbacks[i].onDep(fullName, ret);
                    }
                    delete managerCallbacks[fullName];
                }
            }

            //Clean up waiting.
            if (waiting[manager.waitId]) {
                delete waiting[manager.waitId];
                manager.isDone = true;
                context.waitCount -= 1;
                if (context.waitCount === 0) {
                    //Clear the wait array used for cycles.
                    waitAry = [];
                }
            }

            return undefined;
        }

        function main(inName, depArray, callback, errCallback, relModuleMap) {
            // Normalize errCallback and relModuleMap arguments
            if(relModuleMap === undefined && typeof errCallback === 'string'){
                relModuleMap = errCallback;
                errCallback = undefined;
            }

            var moduleMap = makeModuleMap(inName, relModuleMap),
                name = moduleMap.name,
                fullName = moduleMap.fullName,
                manager = {
                    //Use a wait ID because some entries are anon
                    //async require calls.
                    waitId: name || reqWaitIdPrefix + (waitIdCounter++),
                    depCount: 0,
                    depMax: 0,
                    prefix: moduleMap.prefix,
                    name: name,
                    fullName: fullName,
                    deps: {},
                    errors: false,
                    errorDeps: {},
                    depArray: depArray,
                    callback: callback,
                    errCallback: errCallback,
                    onDep: function (depName, value) {
                        if (!(depName in manager.deps)) {

                            if( depName in errored ){
                                manager.errors = true;
                                manager.errorDeps[depName] = errored[depName];
                            }else{
                                //Module already defined, no need to wait for it.
                                manager.deps[depName] = value;
                            }

                            manager.depCount += 1;
                            if (manager.depCount === manager.depMax) {
                                //All done, execute!
                                execManager(manager);
                            }
                        }
                    }
                },
                i, depArg, depName, cjsMod;

            if (fullName) {
                //If module already defined for context, or already loaded,
                //then leave.
                if (fullName in defined || loaded[fullName] === true) {
                    return;
                }

                //Set specified/loaded here for modules that are also loaded
                //as part of a layer, where onScriptLoad is not fired
                //for those cases. Do this after the inline define and
                //dependency tracing is done.
                //Also check if auto-registry of jQuery needs to be skipped.
                specified[fullName] = true;
                loaded[fullName] = true;
                context.jQueryDef = (fullName === "jquery");
            }

            //Add the dependencies to the deps field, and register for callbacks
            //on the dependencies.
            for (i = 0; i < depArray.length; i++) {
                depArg = depArray[i];
                //There could be cases like in IE, where a trailing comma will
                //introduce a null dependency, so only treat a real dependency
                //value as a dependency.
                if (depArg) {
                    //Split the dependency name into plugin and name parts
                    depArg = makeModuleMap(depArg, (name ? moduleMap : relModuleMap));
                    depName = depArg.fullName;

                    //Fix the name in depArray to be just the name, since
                    //that is how it will be called back later.
                    depArray[i] = depName;

                    //Fast path CommonJS standard dependencies.
                    if (depName === "require") {
                        manager.deps[depName] = makeRequire(moduleMap);
                    } else if (depName === "exports") {
                        //CommonJS module spec 1.1
                        manager.deps[depName] = defined[fullName] = {};
                        manager.usingExports = true;
                    } else if (depName === "module") {
                        //CommonJS module spec 1.1
                        manager.cjsModule = cjsMod = manager.deps[depName] = {
                            id: name,
                            uri: name ? context.nameToUrl(name, null, relModuleMap) : undefined
                        };
                        cjsMod.setExports = makeSetExports(cjsMod);
                    } else if (depName[depName.length-1] === '!') {
                        manager.deps[depName] = callPlugin_loadDefineDependency(depName.slice(0,depName.length-1),inName);
                    } else if (depName in defined && !(depName in waiting)) {

                        if( depName in errored ){
                            manager.errors = true;
                            manager.errorDeps[depName] = errored[depName];
                        }else{
                            //Module already defined, no need to wait for it.
                            manager.deps[depName] = defined[depName];
                        }
                    } else {
                        //A dynamic dependency.
                        manager.depMax += 1;

                        queueDependency(depArg);

                        //Register to get notification when dependency loads.
                        (managerCallbacks[depName] ||
                        (managerCallbacks[depName] = [])).push(manager);
                    }
                }
            }

            //Do not bother tracking the manager if it is all done.
            if (manager.depCount === manager.depMax) {
                //All done, execute!
                execManager(manager);
            } else {
                waiting[manager.waitId] = manager;
                waitAry.push(manager);
                context.waitCount += 1;
            }
        }

        /**
         * Convenience method to call main for a require.def call that was put on
         * hold in the defQueue.
         */
        function callDefMain(args) {
            main.apply(null, args);
            //Mark the module loaded. Must do it here in addition
            //to doing it in require.def in case a script does
            //not call require.def
            loaded[args[0]] = true;
        }

        /**
         * As of jQuery 1.4.3, it supports a readyWait property that will hold off
         * calling jQuery ready callbacks until all scripts are loaded. Be sure
         * to track it if readyWait is available. Also, since jQuery 1.4.3 does
         * not register as a module, need to do some global inference checking.
         * Even if it does register as a module, not guaranteed to be the precise
         * name of the global. If a jQuery is tracked for this context, then go
         * ahead and register it as a module too, if not already in process.
         */
        function jQueryCheck(jqCandidate) {
            if (!context.jQuery) {
                var $ = jqCandidate || (typeof jQuery !== "undefined" ? jQuery : null);
                if ($ && "readyWait" in $) {
                    context.jQuery = $;

                    //Manually create a "jquery" module entry if not one already
                    //or in process.
                    callDefMain(["jquery", [], function () {
                        return jQuery;
                    }]);

                    //Increment jQuery readyWait if ncecessary.
                    if (context.scriptCount) {
                        $.readyWait += 1;
                        context.jQueryIncremented = true;
                    }
                }
            }
        }

        function forceExec(manager, traced) {
            if (manager.isDone) {
                return undefined;
            }

            var fullName = manager.fullName,
                depArray = manager.depArray,
                depName, i;
            if (fullName) {
                if (traced[fullName]) {
                    return defined[fullName];
                }

                traced[fullName] = true;
            }

            //forceExec all of its dependencies.
            for (i = 0; i < depArray.length; i++) {
                //Some array members may be null, like if a trailing comma
                //IE, so do the explicit [i] access and check if it has a value.
                depName = depArray[i];
                if (depName) {
                    if (!manager.deps[depName] && waiting[depName]) {
                        manager.onDep(depName, forceExec(waiting[depName], traced));
                    }
                }
            }

            return fullName ? defined[fullName] : undefined;
        }

        /**
         * Checks if all modules for a context are loaded, and if so, evaluates the
         * new ones in right dependency order.
         *
         * @private
         */
        function checkLoaded() {
            var waitInterval = config.waitSeconds * 1000,
                //It is possible to disable the wait interval by using waitSeconds of 0.
                expired = waitInterval && (context.startTime + waitInterval) < new Date().getTime(),
                noLoads = "", hasLoadedProp = false, stillLoading = false, prop,
                err, manager;

            //Determine if priority loading is done. If so clear the priority. If
            //not, then do not check
            if (config.priorityWait) {
                if (isPriorityDone()) {
                    //Call resume, since it could have
                    //some waiting dependencies to trace.
                    resume();
                } else {
                    return undefined;
                }
            }

            //See if anything is still in flight.
            for (prop in loaded) {
                if (!(prop in empty)) {
                    hasLoadedProp = true;
                    if (!loaded[prop]) {
                        if (expired) {
                            noLoads += prop + " ";
                        } else {
                            stillLoading = true;
                            break;
                        }
                    }
                }
            }

            //Check for exit conditions.
            if (!hasLoadedProp && !context.waitCount) {
                //If the loaded object had no items, then the rest of
                //the work below does not need to be done.
                return undefined;
            }
            if (expired && noLoads) {
                //If wait time expired, throw error of unloaded modules.
                err = new Error("require.js load timeout for modules: " + noLoads);
                err.requireType = "timeout";
                err.requireModules = noLoads;
                return req.onError(err);
            }
            if (stillLoading || context.scriptCount) {
                //Something is still waiting to load. Wait for it.
                if (isBrowser || isWebWorker) {
                    setTimeout(checkLoaded, 50);
                }
                return undefined;
            }

            //If still have items in the waiting cue, but all modules have
            //been loaded, then it means there are some circular dependencies
            //that need to be broken.
            //However, as a waiting thing is fired, then it can add items to
            //the waiting cue, and those items should not be fired yet, so
            //make sure to redo the checkLoaded call after breaking a single
            //cycle, if nothing else loaded then this logic will pick it up
            //again.
            if (context.waitCount) {
                //Cycle through the waitAry, and call items in sequence.
                for (i = 0; (manager = waitAry[i]); i++) {
                    forceExec(manager, {});
                }

                checkLoaded();
                return undefined;
            }

            //Check for DOM ready, and nothing is waiting across contexts.
            req.checkReadyState();

            return undefined;
        }


        function callPlugin_loadDefineDependency(pluginName,definingModuleName){
            var plugin = plugins[pluginName] || (plugins[pluginName] = defined[pluginName]);

            return (plugin)
                ? plugin.loadDefineDependency(definingModuleName)
                : undefined;
        }

        function callPlugin(pluginName, dep) {
            var name = dep.name,
                fullName = dep.fullName;

            //Do not bother if plugin is already defined.
            if (fullName in defined) {
                return;
            }

            if (!plugins[pluginName]) {
                plugins[pluginName] = defined[pluginName];
            }

            //Only set loaded to false for tracking if it has not already been set.
            if (!loaded[fullName]) {
                loaded[fullName] = false;
            }

            //Use parentName here since the plugin's name is not reliable,
            //could be some weird string with no path that actually wants to
            //reference the parentName's path.
            plugins[pluginName].load(name, makeRequire(dep.parentMap), function (ret,error) {
                //Allow the build process to register plugin-loaded dependencies.
                if (require.onPluginLoad) {
                    require.onPluginLoad(context, pluginName, name, ret);
                }
                
                if(error)
                    errored[dep.fullName] = new Error("Couldn't load "+dep.fullName);

                execManager({
                    prefix: dep.prefix,
                    name: dep.name,
                    fullName: dep.fullName,
                    callback: ret
                });
                loaded[fullName] = true;
            }, config);
        }

        function loadPaused(dep) {
            var pluginName = dep.prefix,
                fullName = dep.fullName;

            //Do not bother if the dependency has already been specified.
            if (specified[fullName] || fullName in defined) {
                return;
            } else {
                specified[fullName] = true;
            }

            if (pluginName) {
                //If plugin not loaded, wait for it.
                //set up callback list. if no list, then register
                //managerCallback for that plugin.
                if (defined[pluginName]) {
                    callPlugin(pluginName, dep);
                } else {
                    if (!pluginsQueue[pluginName]) {
                        pluginsQueue[pluginName] = [];
                        (managerCallbacks[pluginName] ||
                        (managerCallbacks[pluginName] = [])).push({
                            onDep: function (name, value) {
                                if (name === pluginName) {
                                    var i, ary = pluginsQueue[pluginName];
                                    for (i = 0; i < ary.length; i++) {
                                        callPlugin(pluginName, ary[i]);
                                    }
                                    delete pluginsQueue[pluginName];
                                }
                            }
                        });
                    }
                    pluginsQueue[pluginName].push(dep);
                }
            } else {
                req.load(context, fullName, dep.url);
            }
        }

        /**
         * Resumes tracing of dependencies and then checks if everything is loaded.
         */
        resume = function () {
            var args, i, p;

            if (context.scriptCount <= 0) {
                //Synchronous envs will push the number below zero with the
                //decrement above, be sure to set it back to zero for good measure.
                //require() calls that also do not end up loading scripts could
                //push the number negative too.
                context.scriptCount = 0;
            }

            //Make sure any remaining defQueue items get properly processed.
            while (defQueue.length) {
                args = defQueue.shift();
                if (args[0] === null) {
                    return req.onError(new Error('Mismatched anonymous require.def modules'));
                } else {
                    callDefMain(args);
                }
            }

            //Skip the resume if current context is in priority wait.
            if (config.priorityWait && !isPriorityDone()) {
                return undefined;
            }

            while (context.paused.length) {
                p = context.paused;
                //Reset paused list
                context.paused = [];

                for (i = 0; (args = p[i]); i++) {
                    loadPaused(args);
                }
                //Move the start time for timeout forward.
                context.startTime = (new Date()).getTime();
            }

            checkLoaded();

            return undefined;
        };

        //Define the context object. Many of these fields are on here
        //just to make debugging easier.
        context = {
            contextName: contextName,
            config: config,
            defQueue: defQueue,
            waiting: waiting,
            waitCount: 0,
            specified: specified,
            loaded: loaded,
            urlMap: urlMap,
            scriptCount: 0,
            urlFetched: {},
            defined: defined,
            errored: errored,
            paused: [],
            plugins: plugins,
            managerCallbacks: managerCallbacks,
            makeModuleMap: makeModuleMap,
            normalizeName: normalizeName,
            /**
             * Set a configuration for the context.
             * @param {Object} cfg config object to integrate.
             */
            configure: function (cfg) {
                var paths, packages, prop, packagePaths, requireWait;

                //Make sure the baseUrl ends in a slash.
                if (cfg.baseUrl) {
                    if (cfg.baseUrl.charAt(cfg.baseUrl.length - 1) !== "/") {
                        cfg.baseUrl += "/";
                    }
                }

                //Save off the paths and packages since they require special processing,
                //they are additive.
                paths = config.paths;
                packages = config.packages;

                //Mix in the config values, favoring the new values over
                //existing ones in context.config.
                mixin(config, cfg, true);

                //Adjust paths if necessary.
                if (cfg.paths) {
                    for (prop in cfg.paths) {
                        if (!(prop in empty)) {
                            paths[prop] = cfg.paths[prop];
                        }
                    }
                    config.paths = paths;
                }

                packagePaths = cfg.packagePaths;
                if (packagePaths || cfg.packages) {
                    //Convert packagePaths into a packages config.
                    if (packagePaths) {
                        for (prop in packagePaths) {
                            if (!(prop in empty)) {
                                configurePackageDir(packages, packagePaths[prop], prop);
                            }
                        }
                    }

                    //Adjust packages if necessary.
                    if (cfg.packages) {
                        configurePackageDir(packages, cfg.packages);
                    }

                    //Done with modifications, assing packages back to context config
                    config.packages = packages;
                }

                //If priority loading is in effect, trigger the loads now
                if (cfg.priority) {
                    //Create a separate config property that can be
                    //easily tested for config priority completion.
                    //Do this instead of wiping out the config.priority
                    //in case it needs to be inspected for debug purposes later.
                    //Hold on to requireWait value, and reset it after done
                    requireWait = context.requireWait;
                    context.requireWait = false;
                    context.require(cfg.priority);
                    context.requireWait = requireWait;
                    config.priorityWait = cfg.priority;
                }

                //If a deps array or a config callback is specified, then call
                //require with those args. This is useful when require is defined as a
                //config object before require.js is loaded.
                if (cfg.deps || cfg.callback) {
                    context.require(cfg.deps || [], cfg.callback);
                }

                //Set up ready callback, if asked. Useful when require is defined as a
                //config object before require.js is loaded.
                if (cfg.ready) {
                    req.ready(cfg.ready);
                }
            },

            isDefined: function (moduleName, relModuleMap) {
                return makeModuleMap(moduleName, relModuleMap).fullName in defined;
            },

            require: function (deps, callback, errCallback, relModuleMap) {
                var moduleName, ret, moduleMap;
                if (typeof deps === "string") {
                    //Synchronous access to one module. If require.get is
                    //available (as in the Node adapter), prefer that.
                    //In this case deps is the moduleName and callback is
                    //the relModuleMap
                    if (req.get) {
                        return req.get(context, deps, callback);
                    }

                    //Just return the module wanted. In this scenario, the
                    //second arg (if passed) is just the relModuleMap.
                    moduleName = deps;
                    relModuleMap = callback;
                    if (moduleName === "require" ||
                        moduleName === "exports" || moduleName === "module") {
                        return req.onError(new Error("Explicit require of " +
                                           moduleName + " is not allowed."));
                    }

                    //Normalize module name, if it contains . or ..
                    moduleMap = makeModuleMap(moduleName, relModuleMap);

                    ret = defined[moduleMap.fullName];
                    if (ret === undefined) {
                        return req.onError(new Error("require: module name '" +
                                    moduleMap.fullName +
                                    "' has not been loaded yet for context: " +
                                    contextName));
                    }
                    return ret;
                }

                main(null, deps, callback, errCallback, relModuleMap);

                //If the require call does not trigger anything new to load,
                //then resume the dependency processing.
                if (!context.requireWait) {
                    while (!context.scriptCount && context.paused.length) {
                        resume();
                    }
                }
                return undefined;
            },

            /**
             * Internal method to transfer globalQueue items to this context's
             * defQueue.
             */
            takeGlobalQueue: function () {
                //Push all the globalDefQueue items into the context's defQueue
                if (globalDefQueue.length) {
                    //Array splice in the values since the context code has a
                    //local var ref to defQueue, so cannot just reassign the one
                    //on context.
                    apsp.apply(context.defQueue,
                               [context.defQueue.length - 1, 0].concat(globalDefQueue));
                    globalDefQueue = [];
                }
            },

            /**
             * Internal method used by environment adapters to complete a load event.
             * A load event could be a script load or just a load pass from a synchronous
             * load call.
             * @param {String} moduleName the name of the module to potentially complete.
             */
            completeLoad: function (moduleName) {
                var args;

                context.takeGlobalQueue();

                while (defQueue.length) {
                    args = defQueue.shift();

                    if (args[0] === null) {
                        args[0] = moduleName;
                        break;
                    } else if (args[0] === moduleName) {
                        //Found matching require.def call for this script!
                        break;
                    } else {
                        //Some other named require.def call, most likely the result
                        //of a build layer that included many require.def calls.
                        callDefMain(args);
                        args = null;
                    }
                }
                if (args) {
                    callDefMain(args);
                } else {
                    //A script that does not call define(), so just simulate
                    //the call for it. Special exception for jQuery dynamic load.
                    callDefMain([moduleName, [],
                                moduleName === "jquery" && typeof jQuery !== "undefined" ?
                                function () {
                                    return jQuery;
                                } : null]);
                }

                //Mark the script as loaded. Note that this can be different from a
                //moduleName that maps to a require.def call. This line is important
                //for traditional browser scripts.
                loaded[moduleName] = true;

                //If a global jQuery is defined, check for it. Need to do it here
                //instead of main() since stock jQuery does not register as
                //a module via define.
                jQueryCheck();

                //Doing this scriptCount decrement branching because sync envs
                //need to decrement after resume, otherwise it looks like
                //loading is complete after the first dependency is fetched.
                //For browsers, it works fine to decrement after, but it means
                //the checkLoaded setTimeout 50 ms cost is taken. To avoid
                //that cost, decrement beforehand.
                if (req.isAsync) {
                    context.scriptCount -= 1;
                }
                resume();
                if (!req.isAsync) {
                    context.scriptCount -= 1;
                }
            },

            /**
             * Converts a module name + .extension into an URL path.
             * *Requires* the use of a module name. It does not support using
             * plain URLs like nameToUrl.
             */
            toUrl: function (moduleNamePlusExt, relModuleMap) {
                var index = moduleNamePlusExt.lastIndexOf("."),
                    ext = null;

                if (index !== -1) {
                    ext = moduleNamePlusExt.substring(index, moduleNamePlusExt.length);
                    moduleNamePlusExt = moduleNamePlusExt.substring(0, index);
                }

                return context.nameToUrl(moduleNamePlusExt, ext, relModuleMap);
            },

            /**
             * Converts a module name to a file path. Supports cases where
             * moduleName may actually be just an URL.
             */
            nameToUrl: function (moduleName, ext, relModuleMap) {

                var paths, packages, pkg, pkgPath, syms, i, parentModule, url,
                    config = context.config;

                if (moduleName.indexOf("./") === 0 || moduleName.indexOf("../") === 0) {
                    //A relative ID, just map it relative to relModuleMap's url
                    syms = relModuleMap && relModuleMap.url ? relModuleMap.url.split('/') : [];
                    //Pop off the file name.
                    if (syms.length) {
                        syms.pop();
                    }
                    syms = syms.concat(moduleName.split('/'));
                    trimDots(syms);
                    url = syms.join('/') +
                          (ext ? ext :
                          (req.jsExtRegExp.test(moduleName) ? "" : ".js"));
                } else {

                    //Normalize module name if have a base relative module name to work from.
                    moduleName = normalizeName(moduleName, relModuleMap);

                    //If a colon is in the URL, it indicates a protocol is used and it is just
                    //an URL to a file, or if it starts with a slash or ends with .js, it is just a plain file.
                    //The slash is important for protocol-less URLs as well as full paths.
                    if (req.jsExtRegExp.test(moduleName)) {
                        //Just a plain path, not module name lookup, so just return it.
                        //Add extension if it is included. This is a bit wonky, only non-.js things pass
                        //an extension, this method probably needs to be reworked.
                        url = moduleName + (ext ? ext : "");
                    } else {
                        //A module that needs to be converted to a path.
                        paths = config.paths;
                        packages = config.packages;

                        syms = moduleName.split("/");
                        //For each module name segment, see if there is a path
                        //registered for it. Start with most specific name
                        //and work up from it.
                        for (i = syms.length; i > 0; i--) {
                            parentModule = syms.slice(0, i).join("/");
                            if (paths[parentModule]) {
                                syms.splice(0, i, paths[parentModule]);
                                break;
                            } else if ((pkg = packages[parentModule])) {
                                //If module name is just the package name, then looking
                                //for the main module.
                                if (moduleName === pkg.name) {
                                    pkgPath = pkg.location + '/' + pkg.main;
                                } else {
                                    pkgPath = pkg.location + '/' + pkg.lib;
                                }
                                syms.splice(0, i, pkgPath);
                                break;
                            }
                        }

                        //Join the path parts together, then figure out if baseUrl is needed.
                        url = syms.join("/") + (ext || ".js");
                        url = (url.charAt(0) === '/' || url.match(/^\w+:/) ? "" : config.baseUrl) + url;
                    }
                }

                return config.urlArgs ? url +
                                        ((url.indexOf('?') === -1 ? '?' : '&') +
                                         config.urlArgs) : url;
            }
        };

        //Make these visible on the context so can be called at the very
        //end of the file to bootstrap
        context.jQueryCheck = jQueryCheck;
        context.resume = resume;

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
    req = require = function (deps, callback, errCallback) {

        //Find the right context, use default
        var contextName = defContextName,
            context, config;

        // Determine if have config object in the call.
        if (!isArray(deps) && typeof deps !== "string") {
            // deps is a config object
            config = deps;
            if (isArray(callback)) {
                // Adjust args if there are dependencies
                deps = callback;
                callback = arguments[2];
                errCallback = arguments[3];
            } else {
                deps = [];
            }
        }

        if (config && config.context) {
            contextName = config.context;
        }

        context = contexts[contextName] ||
                  (contexts[contextName] = newContext(contextName));

        if (config) {
            context.configure(config);
        }

        return context.require(deps, callback, errCallback);
    };

    req.version = version;
    req.isArray = isArray;
    req.isFunction = isFunction;
    req.mixin = mixin;
    //Used to filter out dependencies that are already paths.
    req.jsExtRegExp = /^\/|:|\?|\.js$/;
    s = req.s = {
        contexts: contexts,
        //Stores a list of URLs that should not get async script tag treatment.
        skipAsync: {},
        isPageLoaded: !isBrowser,
        readyCalls: []
    };

    req.isAsync = req.isBrowser = isBrowser;
    if (isBrowser) {
        head = s.head = document.getElementsByTagName("head")[0];
        //If BASE tag is in play, using appendChild is a problem for IE6.
        //When that browser dies, this can be removed. Details in this jQuery bug:
        //http://dev.jquery.com/ticket/2709
        baseElement = document.getElementsByTagName("base")[0];
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
        var contextName = context.contextName,
            urlFetched = context.urlFetched,
            loaded = context.loaded;
        isDone = false;

        //Only set loaded to false for tracking if it has not already been set.
        if (!loaded[moduleName]) {
            loaded[moduleName] = false;
        }

        if (!urlFetched[url]) {
            context.scriptCount += 1;
            req.attach(url, contextName, moduleName);
            urlFetched[url] = true;

            //If tracking a jQuery, then make sure its readyWait
            //is incremented to prevent its ready callbacks from
            //triggering too soon.
            if (context.jQuery && !context.jQueryIncremented) {
                context.jQuery.readyWait += 1;
                context.jQueryIncremented = true;
            }
        }
    };

    function getInteractiveScript() {
        var scripts, i, script;
        if (interactiveScript && interactiveScript.readyState === 'interactive') {
            return interactiveScript;
        }

        scripts = document.getElementsByTagName('script');
        for (i = scripts.length - 1; i > -1 && (script = scripts[i]); i--) {
            if (script.readyState === 'interactive') {
                return (interactiveScript = script);
            }
        }

        return null;
    }

    /**
     * The function that handles definitions of modules. Differs from
     * require() in that a string for the module should be the first argument,
     * and the function to execute after dependencies are loaded should
     * return a value to define the module corresponding to the first argument's
     * name.
     */
    define = req.def = function (name, deps, callback, context) {
        var node;

        //Allow for anonymous functions
        if (typeof name !== 'string') {
            //Adjust args appropriately
            callback = deps;
            deps = name;
            name = null;
        }

        //This module may not have dependencies
        if (!req.isArray(deps)) {
            callback = deps;
            deps = [];
        }

        //If no name, and callback is a function, then figure out if it a
        //CommonJS thing with dependencies.
        if (!name && !deps.length && req.isFunction(callback)) {
            //Remove comments from the callback string,
            //look for require calls, and pull them into the dependencies,
            //but only if there are function args.
            if (callback.length) {
                callback
                    .toString()
                    .replace(commentRegExp, "")
                    .replace(cjsRequireRegExp, function (match, dep) {
                        deps.push(dep);
                    });

                //May be a CommonJS thing even without require calls, but still
                //could use exports, and such, so always add those as dependencies.
                //This is a bit wasteful for RequireJS modules that do not need
                //an exports or module object, but erring on side of safety.
                //REQUIRES the function to expect the CommonJS variables in the
                //order listed below.
                deps = ["require", "exports", "module"].concat(deps);
            }
        }

        //If in IE 6-8 and hit an anonymous define() call, do the interactive
        //work.
        if (useInteractive) {
            node = currentlyAddingScript || getInteractiveScript();
            if (!node) {
                return req.onError(new Error("ERROR: No matching script interactive for " + callback));
            }
            if (!name) {
                name = node.getAttribute("data-requiremodule");
            }
            context = contexts[node.getAttribute("data-requirecontext")];
        }

        //Always save off evaluating the def call until the script onload handler.
        //This allows multiple modules to be in a file without prematurely
        //tracing dependencies, and allows for anonymous module support,
        //where the module name is not known until the script onload event
        //occurs. If no context, use the global queue, and get it processed
        //in the onscript load callback.
        (context ? context.defQueue : globalDefQueue).push([name, deps, callback]);

        return undefined;
    };

    /**
     * Executes a module callack function. Broken out as a separate function
     * solely to allow the build system to sequence the files in the built
     * layer in the right sequence.
     *
     * @private
     */
    req.execCb = function (name, callback, args) {
        return callback.apply(null, args);
    };

    /**
     * callback for script loads, used to check status of loading.
     *
     * @param {Event} evt the event from the browser for the script
     * that was loaded.
     *
     * @private
     */
    req.onScriptLoad = function (evt) {
        //Using currentTarget instead of target for Firefox 2.0's sake. Not
        //all old browsers will be supported, but this one was easy enough
        //to support and still makes sense.
        var node = evt.currentTarget || evt.srcElement, contextName, moduleName,
            context;

        if (evt.type === "load" || readyRegExp.test(node.readyState)) {
            //Reset interactive script so a script node is not held onto for
            //to long.
            interactiveScript = null;

            //Pull out the name of the module and the context.
            contextName = node.getAttribute("data-requirecontext");
            moduleName = node.getAttribute("data-requiremodule");
            context = contexts[contextName];

            contexts[contextName].completeLoad(moduleName);

            //Clean up script binding.
            if (node.removeEventListener) {
                node.removeEventListener("load", req.onScriptLoad, false);
            } else {
                //Probably IE. If not it will throw an error, which will be
                //useful to know.
                node.detachEvent("onreadystatechange", req.onScriptLoad);
            }
        }
    };

    /**
     * Attaches the script represented by the URL to the current
     * environment. Right now only supports browser loading,
     * but can be redefined in other environments to do the right thing.
     * @param {String} url the url of the script to attach.
     * @param {String} contextName the name of the context that wants the script.
     * @param {moduleName} the name of the module that is associated with the script.
     * @param {Function} [callback] optional callback, defaults to require.onScriptLoad
     * @param {String} [type] optional type, defaults to text/javascript
     */
    req.attach = function (url, contextName, moduleName, callback, type) {
        var node, loaded, context;
        if (isBrowser) {
            //In the browser so use a script tag
            callback = callback || req.onScriptLoad;
            node = document.createElement("script");
            node.onerror = function(){
                contexts[contextName].errored[moduleName] = new Error('Could not load '+moduleName);
                contexts[contextName].completeLoad(moduleName);

                //Clean up script binding.
                if (node.removeEventListener) {
                    node.removeEventListener("load", req.onScriptLoad, false);
                } else {
                    //Probably IE. If not it will throw an error, which will be
                    //useful to know.
                    node.detachEvent("onreadystatechange", req.onScriptLoad);
                }
            }
            node.type = type || "text/javascript";
            node.charset = "utf-8";
            //Use async so Gecko does not block on executing the script if something
            //like a long-polling comet tag is being run first. Gecko likes
            //to evaluate scripts in DOM order, even for dynamic scripts.
            //It will fetch them async, but only evaluate the contents in DOM
            //order, so a long-polling script tag can delay execution of scripts
            //after it. But telling Gecko we expect async gets us the behavior
            //we want -- execute it whenever it is finished downloading. Only
            //Helps Firefox 3.6+
            //Allow some URLs to not be fetched async. Mostly helps the order!
            //plugin
            node.async = !s.skipAsync[url];

            node.setAttribute("data-requirecontext", contextName);
            node.setAttribute("data-requiremodule", moduleName);

            //Set up load listener.
            if (node.addEventListener) {
                node.addEventListener("load", callback, false);
            } else {
                //Probably IE. If not it will throw an error, which will be
                //useful to know. IE (at least 6-8) do not fire
                //script onload right after executing the script, so
                //we cannot tie the anonymous require.def call to a name.
                //However, IE reports the script as being in "interactive"
                //readyState at the time of the require.def call.
                useInteractive = true;
                node.attachEvent("onreadystatechange", callback);
            }
            node.src = url;

            //For some cache cases in IE 6-8, the script executes before the end
            //of the appendChild execution, so to tie an anonymous require.def
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
            context = contexts[contextName];
            loaded = context.loaded;
            loaded[moduleName] = false;

            importScripts(url);

            //Account for anonymous modules
            context.completeLoad(moduleName);
        }
        return null;
    };


    //Determine what baseUrl should be if not already defined via a require config object
    s.baseUrl = cfg.baseUrl;
    if (isBrowser && (!s.baseUrl || !head)) {
        //Figure out baseUrl. Get it from the script tag with require.js in it.
        scripts = document.getElementsByTagName("script");
        if (cfg.baseUrlMatch) {
            rePkg = cfg.baseUrlMatch;
        } else {
            
            
            
                        rePkg = /(allplugins-)?require\.js(\W|$)/i;
            
                    }

        for (i = scripts.length - 1; i > -1 && (script = scripts[i]); i--) {
            //Set the "head" where we can append children by
            //using the script's parent.
            if (!head) {
                head = script.parentNode;
            }


            //Look for a data-main attribute to set main script for the page
            //to load.
            if (!dataMain && (dataMain = script.getAttribute('data-main'))) {
                cfg.deps = cfg.deps ? cfg.deps.concat(dataMain) : [dataMain];

                //Favor using data-main tag as the base URL instead of
                //trying to pattern-match src values.
                if (!cfg.baseUrl && (src = script.src)) {
                    src = src.split('/');
                    src.pop();
                    //Make sure current config gets the value.
                    s.baseUrl = cfg.baseUrl = src.length ? src.join('/') : './';
                }
            }

            //Using .src instead of getAttribute to get an absolute URL.
            //While using a relative URL will be fine for script tags, other
            //URLs used for text! resources that use XHR calls might benefit
            //from an absolute URL.
            if (!s.baseUrl && (src = script.src)) {
                m = src.match(rePkg);
                if (m) {
                    s.baseUrl = src.substring(0, m.index);
                    break;
                }
            }
        }
    }

    //****** START page load functionality ****************
    /**
     * Sets the page as loaded and triggers check for all modules loaded.
     */
    req.pageLoaded = function () {
        if (!s.isPageLoaded) {
            s.isPageLoaded = true;
            if (scrollIntervalId) {
                clearInterval(scrollIntervalId);
            }

            //Part of a fix for FF < 3.6 where readyState was not set to
            //complete so libraries like jQuery that check for readyState
            //after page load where not getting initialized correctly.
            //Original approach suggested by Andrea Giammarchi:
            //http://webreflection.blogspot.com/2009/11/195-chars-to-help-lazy-loading.html
            //see other setReadyState reference for the rest of the fix.
            if (setReadyState) {
                document.readyState = "complete";
            }

            req.callReady();
        }
    };

    //See if there is nothing waiting across contexts, and if not, trigger
    //callReady.
    req.checkReadyState = function () {
        var contexts = s.contexts, prop;
        for (prop in contexts) {
            if (!(prop in empty)) {
                if (contexts[prop].waitCount) {
                    return;
                }
            }
        }
        s.isDone = true;
        req.callReady();
    };

    /**
     * Internal function that calls back any ready functions. If you are
     * integrating RequireJS with another library without require.ready support,
     * you can define this method to call your page ready code instead.
     */
    req.callReady = function () {
        var callbacks = s.readyCalls, i, callback, contexts, context, prop;

        if (s.isPageLoaded && s.isDone) {
            if (callbacks.length) {
                s.readyCalls = [];
                for (i = 0; (callback = callbacks[i]); i++) {
                    callback();
                }
            }

            //If jQuery with readyWait is being tracked, updated its
            //readyWait count.
            contexts = s.contexts;
            for (prop in contexts) {
                if (!(prop in empty)) {
                    context = contexts[prop];
                    if (context.jQueryIncremented) {
                        context.jQuery.readyWait -= 1;
                        context.jQueryIncremented = false;
                    }
                }
            }
        }
    };

    /**
     * Registers functions to call when the page is loaded
     */
    req.ready = function (callback) {
        if (s.isPageLoaded && s.isDone) {
            callback();
        } else {
            s.readyCalls.push(callback);
        }
        return req;
    };

    if (isBrowser) {
        if (document.addEventListener) {
            //Standards. Hooray! Assumption here that if standards based,
            //it knows about DOMContentLoaded.
            document.addEventListener("DOMContentLoaded", req.pageLoaded, false);
            window.addEventListener("load", req.pageLoaded, false);
            //Part of FF < 3.6 readystate fix (see setReadyState refs for more info)
            if (!document.readyState) {
                setReadyState = true;
                document.readyState = "loading";
            }
        } else if (window.attachEvent) {
            window.attachEvent("onload", req.pageLoaded);

            //DOMContentLoaded approximation, as found by Diego Perini:
            //http://javascript.nwbox.com/IEContentLoaded/
            if (self === self.top) {
                scrollIntervalId = setInterval(function () {
                    try {
                        //From this ticket:
                        //http://bugs.dojotoolkit.org/ticket/11106,
                        //In IE HTML Application (HTA), such as in a selenium test,
                        //javascript in the iframe can't see anything outside
                        //of it, so self===self.top is true, but the iframe is
                        //not the top window and doScroll will be available
                        //before document.body is set. Test document.body
                        //before trying the doScroll trick.
                        if (document.body) {
                            document.documentElement.doScroll("left");
                            req.pageLoaded();
                        }
                    } catch (e) {}
                }, 30);
            }
        }

        //Check if document already complete, and if so, just trigger page load
        //listeners. NOTE: does not work with Firefox before 3.6. To support
        //those browsers, manually call require.pageLoaded().
        if (document.readyState === "complete") {
            req.pageLoaded();
        }
    }
    //****** END page load functionality ****************

    //Set up default context. If require was a configuration object, use that as base config.
    req(cfg);

    //If modules are built into require.js, then need to make sure dependencies are
    //traced. Use a setTimeout in the browser world, to allow all the modules to register
    //themselves. In a non-browser env, assume that modules are not built into require.js,
    //which seems odd to do on the server.
    if (typeof setTimeout !== "undefined") {
        ctx = s.contexts[(cfg.context || defContextName)];
        //Indicate that the script that includes require() is still loading,
        //so that require()'d dependencies are not traced until the end of the
        //file is parsed (approximated via the setTimeout call).
        ctx.requireWait = true;
        setTimeout(function () {
            ctx.requireWait = false;

            //Any modules included with the require.js file will be in the
            //global queue, assign them to this context.
            ctx.takeGlobalQueue();

            //Allow for jQuery to be loaded/already in the page, and if jQuery 1.4.3,
            //make sure to hold onto it for readyWait triggering.
            ctx.jQueryCheck();

            if (!ctx.scriptCount) {
                ctx.resume();
            }
            req.checkReadyState();
        }, 0);
    }
}());

define('cell/util/ConfigMap',['require','exports','module'],function() {
  var ConfigMap;
  return ConfigMap = (function() {
    function ConfigMap(spec) {
      if (spec == null) {
        spec = {};
      }
      this.get = function(k) {
        var c;
        c = spec[k];
        if (!c) {
          throw new Error("No Config for '" + k + "'");
        }
        return c.value;
      };
      this.set = function(k, v) {
        var c;
        c = spec[k];
        if (!c) {
          throw new Error("No Config for '" + k + "'");
        } else if ((typeof c.validate == "function" ? c.validate(v) : void 0) === false) {
          throw new Error("Config '" + k + "' should be a " + c.api);
        }
        return c.value = v;
      };
    }
    return ConfigMap;
  })();
});
define('cell/Config',['cell/util/ConfigMap'], function(ConfigMap) {
  var isFunction;
  isFunction = function(v) {
    return typeof v === 'function';
  };
  return new ConfigMap({
    'template.renderer': {
      doc: {
        desc: 'Converts template/data to HTML and passing HTML to {done} callback',
        api: 'function({template:String,data:Object},done:function)'
      },
      validate: isFunction,
      value: function() {}
    },
    'style.renderer': {
      doc: {
        desc: 'Converts style to CSS and passing CSS to {done} callback',
        api: 'function(style:String,done:function)'
      },
      validate: isFunction,
      value: function() {}
    }
  });
});
define('cell/integration/styling/less-style-renderer',['cell/Config'], function(Config) {
  return Config.set('style.renderer', function(less, done) {
    return window.less.Parser({
      'paths': ''
    }).parse(less, function(err, root) {
      return done(root.toCSS(), err);
    });
  });
});
define('cell/integration/templating/mustache-template-renderer',['cell/Config'], function(Config) {
  var tmpNodeId;
  tmpNodeId = 0;
  return Config.set('template.renderer', function(_arg, done) {
    var data, nestedRequests, template;
    template = _arg.template, data = _arg.data;
    nestedRequests = [];
    return done({
      html: window.Mustache.to_html(template, data, {
        getPartial: function(cname, ndata, id, tag) {
          var nodeid;
          nestedRequests.push({
            cell: cname,
            data: ndata,
            replace: (nodeid = 'cellTmpNode' + tmpNodeId++),
            id: id,
            tag: tag
          });
          tag != null ? tag : tag = 'div';
          return "<" + tag + " id='" + nodeid + "' style='display:none'> </" + tag + ">";
        }
      }),
      nestedRequests: nestedRequests
    });
  });
});
var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
define('cell/Eventful',['require','exports','module'],function() {
  var Eventful;
  return Eventful = (function() {
    function Eventful() {
      this.listeners = {};
      this.requests = {};
    }
    Eventful.prototype.on = function(event, cb) {
      var ls, _base, _ref;
      if (typeof event === 'string' && typeof cb === 'function') {
        ls = (_ref = (_base = this.listeners)[event]) != null ? _ref : _base[event] = [];
        if (ls.indexOf(cb === -1)) {
          ls.push(cb);
        }
        return (function() {
          var called;
          called = false;
          return function() {
            var index;
            if (!called) {
              called = true;
              index = ls.indexOf(cb);
              if (index > -1) {
                return ls.splice(index, 1);
              }
            }
          };
        })();
      }
    };
    Eventful.prototype.fire = function(event, data) {
      var l, _i, _len, _ref, _ref2, _results;
      _ref2 = (_ref = this.listeners[event]) != null ? _ref : [];
      _results = [];
      for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
        l = _ref2[_i];
        _results.push((function() {
          try {
            return l(data);
          } catch (_e) {}
        })());
      }
      return _results;
    };
    Eventful.prototype.handle = function(request, handler) {
      var _base, _ref;
      if (typeof request === 'string' && typeof handler === 'function') {
        (_ref = (_base = this.requests)[request]) != null ? _ref : _base[request] = handler;
        return __bind(function() {
          var called;
          called = false;
          return __bind(function() {
            if (!called) {
              called = true;
              return delete this.requests[request];
            }
          }, this);
        }, this)();
      }
    };
    Eventful.prototype.request = function(request, data, cb, defaultHandler) {
      var defer, handler, respond;
      if (defaultHandler == null) {
        defaultHandler = (function(data, resp) {
          return resp(data);
        });
      }
      if (typeof request === 'string' && typeof cb === 'function' && typeof defaultHandler === 'function') {
        respond = function(data) {
          try {
            return cb(data);
          } catch (_e) {}
        };
        defer = function(data) {
          try {
            return defaultHandler(data, respond);
          } catch (_e) {}
        };
        handler = this.requests[request];
        if (handler) {
          try {
            return handler(data, respond, defer);
          } catch (_e) {}
        } else {
          return defer(data);
        }
      }
    };
    return Eventful;
  })();
});
define('cell/CellRendering',[], function() {
  var CellRendering;
  return CellRendering = (function() {
    function CellRendering(cell, data, nodes) {
      var $, $$, k, v, _ref;
      if (!(cell && nodes)) {
        throw new Error("CellRendering must have a cell and node");
      }
      $ = function(sel) {
        var hit, n, _i, _len;
        for (_i = 0, _len = nodes.length; _i < _len; _i++) {
          n = nodes[_i];
          if (hit = n.querySelector(sel)) {
            return hit;
          }
        }
      };
      $$ = function(sel) {
        var hits, n, r, _i, _len;
        r = [];
        for (_i = 0, _len = nodes.length; _i < _len; _i++) {
          n = nodes[_i];
          if (hits = n.querySelectorAll(sel) && hits.length > 0) {
            r.push.apply(r, hits);
          }
        }
        return r;
      };
      _ref = {
        cell: cell,
        nodes: nodes,
        '$': $,
        '$$': $$
      };
      for (k in _ref) {
        v = _ref[k];
        Object.defineProperty(this, k, {
          value: v,
          enumerable: true
        });
      }
      Object.defineProperty(this, 'data', {
        get: (function() {
          return data;
        }),
        enumerable: true
      });
      this.update = function(newdata, done) {
        var n, replace, _i, _len;
        data = newdata;
        replace = nodes.splice(0, 1)[0];
        for (_i = 0, _len = nodes.length; _i < _len; _i++) {
          n = nodes[_i];
          n.parentNode.removeChild(n);
        }
        return this.cell.render({
          data: data,
          replace: replace
        }, done);
      };
    }
    return CellRendering;
  })();
});
define('cell/util/attachCSS',['require','exports','module'],function() {
  return function(name, css, done) {
    var styleTag;
    styleTag = document.createElement('style');
    styleTag.id = name;
    styleTag.innerHTML = css;
    document.head.appendChild(styleTag);
    return done(styleTag);
  };
});
define('cell/util/DOMHelper',['require','exports','module'],function() {
  var after, attachMethods, numAttachMethods, __htmlToDOMNodes;
  attachMethods = ['replace', 'appendTo', 'prependTo', 'before', 'after'];
  numAttachMethods = attachMethods.length;
  after = function(target, nodes) {
    var n, _i, _len, _results;
    _results = [];
    for (_i = 0, _len = nodes.length; _i < _len; _i++) {
      n = nodes[_i];
      _results.push(target = target.insertAdjacentElement('afterEnd', n));
    }
    return _results;
  };
  return {
    __htmlToDOMNodes: __htmlToDOMNodes = function(html, parentTagName) {
      var htmlcol, i, l, tmp, _results;
      tmp = document.createElement(parentTagName);
      tmp.innerHTML = html;
      htmlcol = tmp.children;
      i = -1;
      l = htmlcol.length;
      _results = [];
      while (++i < l) {
        _results.push(htmlcol[i]);
      }
      return _results;
    },
    getAttachMethodTarget: function(o) {
      var m, t, _i, _len;
      for (_i = 0, _len = attachMethods.length; _i < _len; _i++) {
        m = attachMethods[_i];
        if (t = o[m]) {
          return {
            target: t,
            method: m
          };
        }
      }
      return {
        target: void 0
      };
    },
    getElementFromNodes: function(nid, nodes) {
      var n, sel, _i, _len;
      sel = '#' + nid;
      for (_i = 0, _len = nodes.length; _i < _len; _i++) {
        n = nodes[_i];
        if (n.id === nid || (n = n.querySelector(sel))) {
          return n;
        }
      }
    },
    replace: function(target, html) {
      var newTarget, nodes;
      nodes = __htmlToDOMNodes(html, target.parentNode.tagName);
      target.parentNode.replaceChild(newTarget = nodes[0], target);
      after(newTarget, nodes.slice(1));
      return nodes;
    },
    before: function(target, html) {
      var nodes;
      nodes = __htmlToDOMNodes(html, target.parentNode.tagName);
      after(target.insertAdjacentElement('beforeBegin', nodes[0]), nodes.slice(1));
      return nodes;
    },
    after: function(target, html) {
      var nodes;
      nodes = __htmlToDOMNodes(html, target.parentNode.tagName);
      after(target, nodes);
      return nodes;
    },
    appendTo: function(target, html) {
      var nodes;
      nodes = __htmlToDOMNodes(html, target.tagName);
      after(target.appendChild(nodes[0]), nodes.slice(1));
      return nodes;
    },
    prependTo: function(target, html) {
      var nodes;
      nodes = __htmlToDOMNodes(html, target.tagName);
      after(target.insertAdjacentElement('afterBegin', nodes[0]), nodes.slice(1));
      return nodes;
    }
  };
});
var __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
  for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }
  function ctor() { this.constructor = child; }
  ctor.prototype = parent.prototype;
  child.prototype = new ctor;
  child.__super__ = parent.prototype;
  return child;
}, __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
define('cell/Cell',['require', 'cell/Eventful', 'cell/Config', 'cell/CellRendering', 'cell/util/attachCSS', 'cell/util/DOMHelper'], function(require, Eventful, Config, CellRendering, attachCSS, DOMHelper) {
  var Cell, cssClassRegex, isNonEmptyString, pathRegex;
  isNonEmptyString = function(s) {
    return typeof s === 'string' && s.trim();
  };
  cssClassRegex = /([^\/]*$)/;
  pathRegex = /(.*?)[^\/]*$/;
  return Cell = (function() {
    __extends(Cell, Eventful);
    function Cell(name, tmpl, style) {
      var k, v, _ref;
      Cell.__super__.constructor.call(this);
      if (!isNonEmptyString(name)) {
        throw new Error("Cell's name must be a non-empty string, instead was '" + name + "'");
      }
      _ref = {
        name: name,
        template: tmpl,
        style: style,
        path: pathRegex.exec(name)[1],
        hasTemplate: !!isNonEmptyString(tmpl),
        cssClassName: cssClassRegex.exec(name)[0]
      };
      for (k in _ref) {
        v = _ref[k];
        Object.defineProperty(this, k, {
          value: v,
          enumerable: true
        });
      }
    }
    Cell.prototype.renderStyle = function() {
      if (!this.__rendered && isNonEmptyString(this.style)) {
        this.__rendered = true;
        return this.request('render.style', this.style, __bind(function(css) {
          if (css = isNonEmptyString(css)) {
            return attachCSS(this.name, css, function(styleTagNode) {});
          }
        }, this), Config.get('style.renderer'));
      }
    };
    Cell.prototype.render = function(opts, done) {
      var attach, data;
      if (this.hasTemplate && (opts != null)) {
        data = opts.data;
        attach = opts.attach || DOMHelper.getAttachMethodTarget(opts);
        if (attach.target == null) {
          throw new Error("One attach method (" + (attachMethods.join(',')) + ") needs to be specified to determine how Cell '" + this.name + "' will be attached to the DOM.");
        }
        return this.request('render.template', {
          template: this.template,
          data: data
        }, __bind(function(_arg) {
          var attachedNodes, html, n, nestedRequests, path, rendering, req, _i, _j, _len, _len2, _results;
          html = _arg.html, nestedRequests = _arg.nestedRequests;
          if (!(html = isNonEmptyString(html))) {
            try {
              return typeof done == "function" ? done(void 0, new Error("No HTML was rendered from template:\n" + this.template)) : void 0;
            } catch (_e) {}
          } else {
            attachedNodes = DOMHelper[attach.method](attach.target, html);
            if (attachedNodes.length > 0) {
              for (_i = 0, _len = attachedNodes.length; _i < _len; _i++) {
                n = attachedNodes[_i];
                n.classList.add(this.cssClassName);
              }
              rendering = new CellRendering(this, data, attachedNodes);
              try {
                if (typeof done == "function") {
                  done(rendering);
                }
              } catch (_e) {}
              this.fire('render', rendering);
              if (nestedRequests instanceof Array) {
                path = this.path;
                _results = [];
                for (_j = 0, _len2 = nestedRequests.length; _j < _len2; _j++) {
                  req = nestedRequests[_j];
                  _results.push((function(req) {
                    var cell, method, target, _ref;
                    _ref = DOMHelper.getAttachMethodTarget(req), method = _ref.method, target = _ref.target;
                    req.attach = {
                      method: method,
                      target: DOMHelper.getElementFromNodes(target, attachedNodes)
                    };
                    delete req[method];
                    cell = req.cell;
                    delete req.cell;
                    return require(["cell!" + path + cell], function(cell) {
                      return cell.render(req);
                    });
                  })(req));
                }
                return _results;
              }
            }
          }
        }, this), Config.get('template.renderer'));
      }
    };
    return Cell;
  })();
});
define('celltext',[], function() {
  var createXhr, fetchText;
  createXhr = (function() {
    var progId, _i, _len, _ref, _results;
    if (typeof XMLHttpRequest != "undefined" && XMLHttpRequest !== null) {
      return function() {
        return new XMLHttpRequest();
      };
    } else {
      _ref = ['Msxml2.XMLHTTP', 'Microsoft.XMLHTTP', 'Msxml2.XMLHTTP.4.0'];
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        progId = _ref[_i];
        _results.push((function(progId) {
          try {
            new ActiveXObject(progId);
            return function() {
              return new ActiveXObject(progId);
            };
          } catch (_e) {}
        })(progId));
      }
      return _results;
    }
  })();
  fetchText = function(url, cb) {
    var xhr;
    xhr = createXhr();
    xhr.open('GET', url, true);
    xhr.onreadystatechange = function(evt) {
      if (xhr.readyState === 4) {
        return cb(xhr.responseText.trim(), xhr.status);
      }
    };
    return xhr.send(null);
  };
  return {
    load: function(name, require, done) {
      return fetchText(name, function(text, status) {
        if (status >= 400) {
          return done(void 0, text);
        } else {
          return done(text);
        }
      });
    }
  };
});
define('cell',['cell/Cell', 'celltext'], function(Cell) {
  var cellMap, modNameRegex;
  modNameRegex = /(.*?)(\.[a-zA-Z0-9]+)*$/;
  cellMap = {};
  return {
    load: function(name, require, done) {
      var loadCtrl, names;
      names = {
        template: "celltext!" + name + ".html",
        style: "celltext!" + name + ".less",
        controller: "" + name + ".js"
      };
      loadCtrl = function(tmplLoaded, cell) {
        return require([names.controller], function(ctrl) {
          cell.renderStyle();
          return done(cell);
        }, function(loaded, failed) {
          cell.renderStyle();
          if (tmplLoaded) {
            return done(cellMap[name]);
          } else {
            return done(void 0, new Error("Could not load cell '" + name + "'"));
          }
        });
      };
      return require([names.template, names.style], function(tmpl, style) {
        return loadCtrl(true, (cellMap[name] = new Cell(name, tmpl, style)));
      }, function(loaded, failed) {
        return loadCtrl(names.template in loaded, (cellMap[name] = new Cell(name, loaded[names.template], loaded[names.style])));
      });
    },
    loadDefineDependency: function(jsCellName) {
      var match;
      match = modNameRegex.exec(jsCellName);
      return match && match[1] && cellMap[match[1]];
    }
  };
});
define('cell/loader',['require', 'cell'], function(require, cell) {
  var cellname, node, _i, _len, _ref, _results;
  _ref = document.querySelectorAll('[data-cell]');
  _results = [];
  for (_i = 0, _len = _ref.length; _i < _len; _i++) {
    node = _ref[_i];
    if (cellname = node.dataset.cell) {
      _results.push((function(node, cellname) {
        return require(["cell!" + cellname], function(c) {
          return c.render({
            data: (function() {
              var datastring;
              if (datastring = node.dataset.cellData) {
                try {
                  return JSON.parse(datastring);
                } catch (_e) {}
              }
              return {};
            })(),
            replace: node
          });
        });
      })(node, cellname));
    }
  }
  return _results;
});
define('cell/bootstrap',['cell/integration/styling/less-style-renderer', 'cell/integration/templating/mustache-template-renderer', 'cell/loader'], function() {});
