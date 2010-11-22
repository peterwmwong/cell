const express    = require('../deps/test/express'),
      log        = console.log.bind(console,'! '),
      app        = express.createServer(),
      stat       = require('fs').stat,
      targetDir  = process.argv[2],
      serverPort = process.argv[3] || 8080;
      
stat(targetDir,function(err,stats){
   if(err) throw err;
   else if(!stats.isDirectory) throw new Error(''+targetDir+' is not a Directory');
   else {
      //------ CONFIGURE ------//
      app.configure(function(){
            app.use(express.gzip());
            
            //------ STATIC ROUTES ------//
            app.use('/cell',express.staticProvider(__dirname + '/../dist/current'));
            app.use('/qunit',express.staticProvider(__dirname + '/../deps/test/qunit'));
            app.use('/depslib',express.staticProvider(__dirname + '/../deps/lib'));
            app.use('/src',express.staticProvider(__dirname + '/../src'));
            app.use('/',express.staticProvider(targetDir));
         });

      //------ ROUTES ------//
      app.listen(serverPort);

      log('Cell Test Server is up, root dir: '+targetDir); 
   }   
});


