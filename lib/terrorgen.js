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
  var file  = __dirname + '/../generator/' + this.genFolder + '/generator.json'
    , fs    = require('fs')
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
    , ncp   = require('ncp').ncp
    , src   = __dirname + '/../generator/' + self.genFolder
    , dest  = __dirname + '/../' + self.projectName

    console.log('Copying %s'.green, self.genFolder)
    ncp(src, dest, {filter: /^((?!\.DS_Store|generator\.json).)*$/}, function(err) {
      if (err) return err
      console.log('Generator files copied'.green);
      self.updateFiles()
    })
}

Terrorgen.prototype.copyGlobals = function() {
  var ncp   = require('ncp')
    , self  = this
    , dest  = __dirname + '/../' + self.projectName
    , src
    , fs    = require('fs')

  fs.mkdirSync(dest)
  for (var package in self.config.globals) {
    src = __dirname + '/../generator/global/' + self.config.globals[package]
    console.log('copying %s'.green, self.config.globals[package])
    ncp(src, dest, {filter: /^((?!\.DS_Store).)*$/}, function(err) {
      if (err) return err
      console.log('Global files copied'.green);
    })
  }
}

Terrorgen.prototype.updateFiles = function() {
  var fs    = require('fs')
    , deps  = ''
  // read package.json and find the dependencies section

  if (this.config.npm) {
    for (var key in this.config.npm.dependencies) {
      // append the dependency
      deps += '"' + key + '": "' + this.config.npm.dependencies[key] + '",\n'
    }
    deps = deps.substring(0,deps.length - 2)
  }
  //console.log(deps)
  this.replaceSections('package.json', deps)
  deps = ''
  if (this.config.bower) {
    for (var key in this.config.bower) {
      deps += '"' + key + '": "' + this.config.bower[key] + '",\n'
    }
    deps = deps.substring(0,deps.length - 2)
  }
  //console.log(deps)
  this.replaceSections('bower.json', deps)
  this.replaceSections('README.md')
}

Terrorgen.prototype.replaceSections = function(file, deps) {
  var fs    = require('fs')
    , path  = __dirname + '/../' + this.projectName + '/' + file
    , self  = this
  //console.log(path)
  fs.readFile(path, 'utf8', function(err, data) {
    if (err) return err
    //console.log('yup')
    //console.log(data)
    var contents = data
                      .replace('{{dependencies}}', deps)
                      .replace('{{title}}', self.projectName)
                      .replace('{{author}}', self.config.author)
    //console.log(contents)
    fs.writeFile(path, contents, 'utf8', function(err) {
      if (err) return err
    })
  })

  // var test = fs.readFileSync(path, 'utf8')
  // console.log('yup')
  // console.log(test)
}

Terrorgen.prototype.loadBaseGeneratorList = function() {
  if (this.config.globals && this.config.globals.length) {
    for (var glob in this.config.globals) {
      this.baseGenerators.push(this.config.globals[glob])
    }
  }
}

Terrorgen.prototype.generate = function() {
  // copy all globals if any
  // do this first so if they use the base one there will already be a package
  // and bower json files
  if (this.config.globals.length)
    this.copyGlobals()
  // copy all files and folders except generate.json
  this.copyFiles()
  // modify package and bower files as needed
  //this.updateFiles()
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