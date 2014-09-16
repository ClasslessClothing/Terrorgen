module.exports = function(app) {
  return {
    home: function(req, res) {
      //res.sendfile('./public/views/index.html');
      res.render('index', {
        
      });
    }
  }
};