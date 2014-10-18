#Terrorgen - Node.js project generator

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

###Generators
ANYTHING in the folder will be capied over. Include a generator.json file with 
bower and npm dependencies listed in it, we will parse that and update package and bower.json as needed.


    {
      "author": "Terrordactyl Designs",
      "npm": {
        "dependencies": {
          "express": "latest",
          "body-parser": "latest",
          "cookie-parser": "latest",
          "express-session": "latest",
          "morgan": "latest",
          "method-override": "latest",
          "static-favicon": "latest",
          "connect-mongo": "latest",
          "mongoose": "latest"
        }
      },
      "bower" : {
        "dependencies": {
          "twbs-bootstrap-sass": "latest",
          "bourbon": "latest",
          "font-awesome": "latest"
        }
      },
      "globals": ["base", "bower"]
    }

###Global re-useable core bundles
Instead of filling each package with the same exact README or such files, you 
can make some global bundles that live in the <drumroll /> generator/global folder.
In the generator.json file add the globals you need to the globals array. Boom.

    {
     "flag": ... all those others
     "globals": ['base', 'bower']
    }

###Install

    npm install terrorgen -g

###Use

Path to the root folder you want your application folder to live in then:

    terrorgen

A list of current available generators will appear, type in the name you want:

    Found console generator
    Found express generator
    Which generator would you like?
    express

Enter the name of the project after prompting:

    Enter the name of your project
    mysuperawesomeproject
    copying base
    Global files copied
    Copying express
    Generator files copied


####License

MIT
