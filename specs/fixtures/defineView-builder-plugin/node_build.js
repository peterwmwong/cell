'use strict';

var requirejs = require('../../../src/r.js'),
    fs        = require('fs');

var config = ({
      mainConfigFile: 'config.js',
      name: '../../../src/almond',
      optimize: 'none',
      outcss: function(css){
        fs.writeFileSync('all-nodeBuild.css', css, 'utf8');
      },
      out: function(js){
        fs.writeFileSync('all-nodeBuild.js', js, 'utf8');
      },
      wrap: {
        end: "require('App');"
      }
    });

requirejs.optimize(config, function(){});

