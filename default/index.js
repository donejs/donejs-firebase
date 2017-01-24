var generator = require('yeoman-generator');

module.exports = generator.Base.extend({
  initializing: function () {
    this.pkgPath = this.destinationPath('package.json');
    this.firebaseJsonPath = this.destinationPath('firebase.json');
    this.firebaseRc = this.destinationPath('.firebaserc');
  },

  prompting: function () {
    var done = this.async();

    this.prompt([{
      type    : 'input',
      name    : 'name',
      message : 'What is the name of your Firebase app?'
    }]).then(function (answers) {
      this.props = answers;
      done();
    }.bind(this));
  },

  installingFirebase: function () {
    this.npmInstall(['firebase-tools'], { saveDev: true });
  },

  writing: function () {
    this.log('Modifying package.json');

    var firebaseAppName = this.props.name;

    // force writing to package.json so the user isn’t prompted
    this.conflicter.force = true;

    // update package.json
    var pkg = require(this.pkgPath);
    var stealProp = pkg.system ? "system" : "steal";

    var newPkgConfig = {
      scripts: {
        deploy: "firebase deploy",
        "deploy:ci": "firebase deploy --token \"$FIREBASE_TOKEN\""
      }
    };

    newPkgConfig[stealProp] = {
      envs: {
        'server-production': {
          renderingBaseURL: 'https://' + firebaseAppName + '.firebaseapp.com/'
        }
      }
    };

    this.fs.extendJSON(this.pkgPath, newPkgConfig);

    this.fs.extendJSON(this.firebaseJsonPath, {
      hosting: {
        firebase: firebaseAppName,
        "public": "./dist",
        headers: [
          {
            source: "/**",
            headers: [
              {
                key: "Access-Control-Allow-Origin",
                value: "*"
              }
            ]
          }
        ]
      }
    });

    this.fs.extendJSON(this.firebaseRc, {
      projects: {
        "default": firebaseAppName
      }
    });

    this.log('Finished modifying package.json');
  }
});
