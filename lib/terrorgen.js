var util          = require('util')
  , EventEmitter  = require('events').EventEmitter
  , ncp           = require('ncp').ncp
  , fs            = require('fs')

/**/// Public: Terrorgen
/**///
/**/// Notes
/**/// note   - Main object
var Terrorgen = function() {
  this.generatorsList = []
  this.baseGenerators = []
  this.config         = {}
  this.genFolder      = ''
  this.projectName    = ''
  // handle async file ops call flow
  this.on('globals', function() { this.copyFiles() })
  this.on('copy', function() { this.updateFiles() })
}

util.inherits(Terrorgen, EventEmitter)

/**/// Public: loadGeneratorsList
/**///
/**/// Notes
/**/// note   - crawl the generator folder
/**///          output each folder name as a found generator
Terrorgen.prototype.loadGeneratorsList = function() {
  var folders
    , self = this

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
/**/// Public: wouldYouLikeToPlayAGame
/**///
/**/// Notes
/**/// note   - get user input to select generator type
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
/**/// Public: parseConfig
/**///
/**/// Notes
/**/// note   - read the generator.json file
Terrorgen.prototype.parseConfig = function() {
  var file  = __dirname + '/../generator/' + this.genFolder + '/generator.json'
  try {
    this.config = JSON.parse(fs.readFileSync(file, 'ascii'))
  } catch(err) {
    console.log('Error loading generator.json Please ensure the file exists and is valid JSON'.red)
    this.brokenHeart()
  }
}
/**/// Public: copyFiles
/**///
/**/// Notes
/**/// note   - move selected generator files to new project
Terrorgen.prototype.copyFiles = function() {
  var files
    , self  = this
    , src   = __dirname + '/../generator/' + self.genFolder
    , dest  = self.projectName

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
/**/// Public: generate
/**///
/**/// Notes
/**/// note   - moves selected global packages to new project
Terrorgen.prototype.generate = function() {
  var self  = this
    , dest  = self.projectName

  fs.mkdirSync(dest)

  if (this.config.globals.length) {
    for (var package in self.config.globals) {
      var src = __dirname + '/../generator/global/' + self.config.globals[package]
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
/**/// Public: updateFiles
/**///
/**/// Notes
/**/// note   - add dependencies/author/name to package files
Terrorgen.prototype.updateFiles = function() {
  var deps  =  [
    {deps: this.config.npm || null, file: 'package.json'},
    {deps: this.config.bower || null, file: 'bower.json'}
  ]

  for (var i=0;i<deps.length;i++) {
    var dep = ''
    if (deps[i].deps) {
      for (var key in deps[i].deps.dependencies) {
        var tab = (dep === '') ? '' : '    '
        dep += tab + '"' + key + '": "' + deps[i].deps.dependencies[key] + '",\n'
      }
    }
    this.replaceSections(deps[i].file, (dep.length > 0) ? dep.substring(0,dep.length - 2) : '')
  }
  this.replaceSections('README.md')
  this.fixGitIgnore()
}
/**/// Public: fixGitIgnore
/**///
/**/// Notes
/**/// note   - fix gitignore copy issue
Terrorgen.prototype.fixGitIgnore = function() {
  // for some reason it renames gitignore to npmignore when copying with that library...
  var npm   = this.projectName + '/.npmignore'
    , git   = this.projectName + '/.gitignore'
  fs.rename(npm, git, function(err) {
    if (err) return err
  })
}
/**/// Public: replaceSections
/**///
/**/// Args
/**/// file   - The filename to open
/**/// deps   - dependencies from generator.json
/**///
/**/// Notes
/**/// note   - replace templates with config values
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
/**/// Public: loadBaseGeneratorList
/**///
/**/// Notes
/**/// note   - create generator list array
Terrorgen.prototype.loadBaseGeneratorList = function() {
  if (this.config.globals && this.config.globals.length) {
    for (var glob in this.config.globals) {
      this.baseGenerators.push(this.config.globals[glob])
    }
  }
}
/**/// Public: iWillNameHimGeorge
/**///
/**/// Notes
/**/// note   - get user input to name the application
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
/**/// Public: brokenHeart
/**///
/**/// Notes
/**/// note   - awwwwww
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
/**/// Public: run
/**///
/**/// Notes
/**/// note   - do all of the things
Terrorgen.prototype.run = function() {
  this.parseConfig()
  this.loadBaseGeneratorList()
  this.generate()
}

module.exports = Terrorgen
