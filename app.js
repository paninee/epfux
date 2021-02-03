// Get dependencies
const express = require('express');
const path = require('path');
const http = require('http');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const session = require('express-session');
// const mongoose = require('mongoose');
// const MongoStore = require('connect-mongo')(session);
// const companion = require('@uppy/companion');

// Initial and Config Server.
const app = express();
const server = http.Server(app);

// // Mongoose setup
// mongoose.Promise = global.Promise;
// mongoose.connect(process.env.DB_CONNECTION);

// const secret = 'fun3ral';
// const db = mongoose.connection;
var protocol = 'https';
var endpoint = 'epilog.me';
/*** Get port from environment and store in Express.*/
const port = process.env.PORT || '3000';
if(process.env.ENVIRONMENT == 'local'){
  protocol = 'http';
  endpoint = `localhost:${port}`;
}
if(process.env.ENVIRONMENT == 'dev'){
  protocol = 'http';
  endpoint = 'dev.epilog.me';
}

// db.on('error', function(err){
//   console.error(err);
// });
// db.once('open', function callback () {
//   console.info('Connected to the database');
// });

// Parsers for POST data
app.use(cookieParser());
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({ extended: false }));
// app.use(session({
//   secret: secret,
//   store: new MongoStore({
//     mongooseConnection: db,
//     ttl: 3600 * 24 * 60, // 2 months
//     touchAfter: 3600 * 24 * 2
//   }),
//   unset: 'destroy',
//   cookie: { maxAge: (3600000 * 24 * 60) }, // 2 months
//   resave: false,
//   saveUninitialized: true
// }));

// Forward everything to HTTPS
// app.use((req, res, next) => {
//   if(process.env.ENVIRONMENT == 'prod' && !req.secure) {
//     return res.redirect(301, ['https://', req.get('Host'), req.url].join(''));
//   }
//   next();
// });

// Point static path to dist
app.use(express.static(path.join(__dirname, 'dist')));


// Get our API routes
const routes = require('./api/v1/shared/routes')(express);

// Set our api routes
app.use('/api/v1', routes);

// // Setup Uppy Companion
// const companionOption = {
//   providerOptions: {
//     s3: {
//       getKey: (req, filename) => filename,
//       key: process.env.AWS_ACCESS_KEY_ID,
//       secret: process.env.AWS_SECRET_ACCESS_KEY,
//       bucket: process.env.S3_BUCKET,
//       region: process.env.AWS_REGION
//     }
//   },
//   server: {
//     host: endpoint,
//     protocol: protocol,
//   },
//   filePath: '/assets/deceased',
//   sendSelfEndpoint: endpoint,
//   secret: secret
// };

// app.use(companion.app(companionOption));
// companion.socket(server, companionOption);

// Catch all other routes and return the index file
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist/index.html'));
});

// Test /ping
app.get('/ping', function(req, res){
  res.status(200).json({
    success: true
  });
});

app.set('port', port);

server.listen(port, () => console.log(`Our server is running on: ${port}`));
