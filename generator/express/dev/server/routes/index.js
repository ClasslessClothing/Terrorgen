module.exports = function(app) {
  // route modules
  var homeRoutes = require('../controllers/home')(app);
  
  // routing
  app.route('/')
    .get(homeRoutes.home);
};