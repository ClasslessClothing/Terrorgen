var util          = require('util')
  , EventEmitter  = require('events').EventEmitter
  , ncp           = require('ncp').ncp
  , fs            = require('fs')

var Terrorgen = function() {
  this.generatorsList = []
  this.baseGenerators = []
  this.config         = {}
  this.genFolder      = ''
  this.projectName    = ''
  // handle async file ops call flow
  this.on('globals', function() {
    this.copyFiles()
  })
  this.on('copy', function() {
    this.updateFiles()
  })
}

util.inherits(Terrorgen, EventEmitter)

Terrorgen.prototype.loadGeneratorsList = function() {
  var folders
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
  var file  = __dirname + '/../generator/' + this.genFolder + '/generator.json'
  try {
    this.config = JSON.parse(fs.readFileSync(file, 'ascii'))
  } catch(err) {
    console.log('Error loading generator.json Please ensure the file exists and is valid JSON'.red)
    this.brokenHeart()
  }
}

Terrorgen.prototype.copyFiles = function() {
  var files
    , self  = this
    , src   = __dirname + '/../generator/' + self.genFolder
    , dest = self.projectName

    console.log('Copying %s'.green, self.genFolder)
    var stat = fs.statSync(src)
    if (stat) {
      ncp(src, dest, {filter: /^((?!\.DS_Store|generator\.json).)*$/}, function(err) {
        if (err) return err
        console.log('Generator files copied'.green);
        self.emit('copy', true)
      })
    } else {
      self.emit('copy', true)
    }
}

Terrorgen.prototype.generate = function() {
  var self  = this
    , dest  = self.projectName
    , src

  fs.mkdirSync(dest)

  if (this.config.globals.length) {
    for (var package in self.config.globals) {
      src = __dirname + '/../generator/global/' + self.config.globals[package]
      console.log('copying %s'.green, self.config.globals[package])
      ncp(src, dest, {filter: /^((?!\.DS_Store).)*$/}, function(err) {
        if (err) return err
        console.log('Global files copied'.green);
        self.emit('globals', true)
      })
    }
  } else {
    self.emit('globals', true)
  }
}

Terrorgen.prototype.updateFiles = function() {
  var deps  = ''
    , count = 0
  // read package.json and find the dependencies section
  if (this.config.npm) {
    for (var key in this.config.npm.dependencies) {
      // append the dependency
      var tab = (count === 0) ? '' : '    '
      deps += tab + '"' + key + '": "' + this.config.npm.dependencies[key] + '",\n'
      count++
    }
    deps = deps.substring(0,deps.length - 2)
  }
  this.replaceSections('package.json', deps)
  deps = ''
  if (this.config.bower) {
    count = 0
    for (var key in this.config.bower.dependencies) {
      var tab = (count === 0) ? '' : '    '
      deps += tab + '"' + key + '": "' + this.config.bower.dependencies[key] + '",\n'
      count++
    }
    deps = deps.substring(0,deps.length - 2)
  }
  this.replaceSections('bower.json', deps)
  this.replaceSections('README.md')
}

Terrorgen.prototype.replaceSections = function(file, deps) {
  var path  = this.projectName + '/' + file
    , self  = this
  fs.readFile(path, 'utf8', function(err, data) {
    if (err) return err
    var contents = data
                    .replace('{{dependencies}}', deps)
                    .replace('{{title}}', self.projectName)
                    .replace('{{author}}', self.config.author)
    fs.writeFile(path, contents, 'utf8', function(err) {
      if (err) return err
    })
  })

}

Terrorgen.prototype.loadBaseGeneratorList = function() {
  if (this.config.globals && this.config.globals.length) {
    for (var glob in this.config.globals) {
      this.baseGenerators.push(this.config.globals[glob])
    }
  }
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
