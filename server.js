var express = require('express')
  , app = express()
  , i18n = require('i18next');


// use filesys
i18n.init({
    ns: { namespaces: ['ns.common', 'ns.app', 'ns.layout', 'ns.msg', 'ns.public', 'ns.special'], defaultNs: 'ns.common'},
    preload: ['en', 'zh', 'de', 'fr', 'it', 'dev'],
    resSetPath: 'locales/__lng__/new.__ns__.json',
    saveMissing: true,
    debug: true
});

// Configuration
app.configure(function() {
    app.use(express.bodyParser());
    app.use(i18n.handle); // have i18n befor app.router
    
    app.use(app.router);
    // app.set('view engine', 'jade');
    // app.set('views', __dirname);

    app.use('/app', express.static('client/app'));
    app.use('/assets', express.static('client/assets'));
    app.use('/app/templates', express.static('client/assets/templates'));

    // for release 
    app.use('/release', express.static('client/dist/release/assets'));
    app.use('/', express.static('client/dist/release/assets'));
});

app.get("/", function(req, res) {
    return res.sendfile('index.html');
});

app.get("/favicon.ico", function(req, res) {
    return res.sendfile('client/assets/favicon.ico');
});

i18n.registerAppHelper(app)
    .serveClientScript(app)
    .serveDynamicResources(app)
    .serveMissingKeyRoute(app)
    .serveChangeKeyRoute(app)
    .serveRemoveKeyRoute(app);

 var http = require('http')
   , server = http.createServer(app);

server.listen(3000);
