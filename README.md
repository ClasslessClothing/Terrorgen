#Terrorgen - Node.js project generator

Notes for me.... What do i need this to solve, do, etc. And how?

When I make apps I have my folder structures and files I like.... I make the same ones over and over. Automate that....

###Apps I make generally
* Node console app like bots... or... you know... this app....
* MEAN stack
* Express site
* website

### Stuff they all need
* package json
* gitignore
* readme.md
* gruntfile

###Stuff all web based need
* dev/dist/test folders
* bowerrc
* bower.json
* in the dev folder needs sass/css/js/html folders

##express and MEAN
* server folder in dev with a general express folder structure and base files
* Gruntfile filled in with some more stuffs

##MEAN
* angular app structure and folder structure
* in depth express folder structure


###differentiation
If you do an angular build, add some more base folders and files. Sooooo basically should make some form of package system.
In the generator folder it will get parsed through looking for subfolders. crawl in and copy over whatever files are in that subfolder that was called for


###Generators
anything in the folder will be capied over. If you include a generate.json file with bower and npm stuff listed in it, we will parse that and update package and bower.json as needed
This means we also need a way to set a flag to say what package you are even trying to run.
When running the terrorgen command the flag you put in will be checked against an object or array or whatever that has all the packages flags listed in it.
and then it will run/copy the appropriate one.

    {
      "flag": "angular",
      "bower" : {
        "deps": [
          "jquery",
          "bootstrap",
          "etc"
        ]
      },
      "npm": {
        "deps": [
          "express",
          "mongoose",
          "etc"
        ],
        "devDeps": [
          "all the grunts"
        ]
      }
    }

###Global stuff
Instead of filling each package with the same exact express or such files, make some global ones that live in a <drumroll> generator/global folder.
In the generate.json file add the globals you need to the globals part?

    {
     "flag": ... all those others
     "globals": ['express-base', 'bower']
    }

##Generator Skeleton
Well.... If I have a specific generator structure, might as well make a template for that too right?

###Install

    npm install terrorgen -g

###Use

    terrorgen projectname [-packageflag optional package flag (default will be console app)]

####License

MIT
