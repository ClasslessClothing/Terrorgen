var Terrorgen = function() {
  this.generatorsList = []
  this.baseGenerators = []
  this.config         = {}
  this.genFolder      = ''
  this.projectName    = ''
}

Terrorgen.prototype.loadGeneratorsList = function() {
  var folders
    , fs    = require('fs')
    , self  = this

  // crawl the generator folder
  folders = fs.readdirSync(__dirname + '/../generator')
  folders.forEach(function(folder) {
    if (folder !== 'global') { // ignore the global folder
      var stat = fs.statSync(__dirname + '/../generator/' + folder)
      if (stat && stat.isDirectory()) {
        self.generatorsList.push(folder)
        console.log('Found %s generator', folder)
      }
    }
  })
}

Terrorgen.prototype.wouldYouLikeToPlayAGame = function() {
  var self = this
  console.log('Which generator would you like?'.cyan)
  process.stdin.resume()
  process.stdin.setEncoding('utf8')
  process.stdin.on('data', function(data) {
    data = data.replace('\n','').replace('\r','')
    if (self.generatorsList.indexOf(data) > -1) {
      process.stdin.pause()
      process.stdin.removeAllListeners('data')
      self.genFolder = data
      console.log('%s project generator selected.', self.genFolder)
      self.iWillNameHimGeorge()
    } else {
      console.log('that was not a valid generator'.red)
      console.log('Which generator would you like?'.cyan)
    }
  })
}

Terrorgen.prototype.parseConfig = function() {
  var file = __dirname + '/../generator/' + this.genFolder + '/generator.json'
    , fs = require('fs')
  try {
    this.config = JSON.parse(fs.readFileSync(file, 'ascii'))
  } catch(err) {
    console.log('Error loading generator.json Please ensure the file exists and is valid JSON'.red)
    this.brokenHeart()
  }
}

Terrorgen.prototype.copyFiles = function() {
  var files
    , fs    = require('fs')
    , self  = this
    , ncp = require('ncp').ncp
    , src = __dirname + '/../generator/' + self.genFolder
    , dest = __dirname + '/../' + self.projectName

    fs.mkdirSync(dest)
    ncp(src, dest, {filter: /^((?!\.DS_Store|generator\.json).)*$/}, function(err) {
      if (err) return err
      console.log('Generator files copied'.green);
    })
}

Terrorgen.prototype.copyGlobals = function() {
  var ncp = require('ncp')
    , dest = __dirname + '/../' + self.projectName
  for (var package in this.config.globals) {

    ncp(src, dest, {filter: /^((?!\.DS_Store).)*$/}, function(err) {
      if (err) return err
      console.log('Generator files copied'.green);
    })
  }
}

// Terrorgen.prototype. = function() {
  
// }

Terrorgen.prototype.loadBaseGeneratorList = function() {
  if (this.config.globals && this.config.globals.length) {
    for (var glob in this.config.globals) {
      this.baseGenerators.push(this.config.globals[glob])
    }
  }
}

Terrorgen.prototype.generate = function() {
  // copy all files and folders except generate.json
  this.copyFiles()
  // copy all globals if any
  if (this.config.globals.length)
    this.copyGlobals()
  // modify package and bower files as needed
  console.log('Weeeeee!!!!')
}

Terrorgen.prototype.iWillNameHimGeorge = function() {
  var self = this
  console.log('Enter the name of your project'.cyan)
  process.stdin.resume()
  process.stdin.setEncoding('utf8')
  process.stdin.on('data', function(data) {
    process.stdin.pause()
    data = data.replace('\n','').replace('\r','')
    self.projectName = data
    self.run()
  })
}

Terrorgen.prototype.brokenHeart = function() {
  console.log('   ::.   .:::.'.red)
  console.log('::  :::.:::::::'.red)
  console.log('::::  :::::::::'.red)
  console.log('\'::::  :  ::::\''.red)
  console.log('  \':::  :  :\''.red)
  console.log('    \'::::: '.red)
  console.log('      \':\''.red)
  process.exit()
}

Terrorgen.prototype.run = function() {
  // parse the json file in the generators folder
  this.parseConfig()
  // load base generators list, if any
  this.loadBaseGeneratorList()
  this.generate()
}

module.exports = Terrorgen

// Terrorgen.prototype. = function() {
  
// }