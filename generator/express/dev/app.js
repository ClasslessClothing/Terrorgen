var express         = require('express')
  , morgan          = require('morgan')
  , bodyParser      = require('body-parser')
  , methodOverride  = require('method-override')
  , cookieParser    = require('cookie-parser')
  , mongoose        = require('mongoose')
  , session         = require('express-session')
  , dbConfig        = require('./config/db.js')
  , app             = express()
  , mongoStore      = require('connect-mongo')(session)
  , db              = mongoose.connect(dbConfig.url);

app.use(express.static(__dirname + './server/views'));
app.use(morgan('dev'));
app.use(cookieParser());
app.use(bodyParser());
app.use(methodOverride());
app.use(session({
  secret: 'superserial',
  store: new mongoStore({
    db: db.connection.db
  })
}));

//app.engine('html', /* pick an engine */);
app.set('view engine', 'html');
app.set('views', __dirname + './server/views');

//development config
var env = process.env.NODE_ENV || 'development';
if (env === 'development') {

}

require('./server/routes')(app);

var port = process.env.PORT || 3000;
app.listen(port);
console.log('Express server running on port ' + port);
exports = module.exports = app;