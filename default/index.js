var generator = require('yeoman-generator');

module.exports = generator.Base.extend({
  initializing: function () {
    this.pkgPath = this.destinationPath('package.json');
  },

  prompting: function () {
    var done = this.async();

    this.prompt([{
      type    : 'input',
      name    : 'name',
      message : 'What is the name of your Firebase app?'
    }], function (answers) {
      this.props = answers;
      done();
    }.bind(this));
  },
  writing: function () {
    this.log('Modifying package.json');

    var firebaseAppName = this.props.name;

    // force writing to package.json so the user isn’t prompted
    this.conflicter.force = true;

    // update package.json
    this.fs.extendJSON(this.pkgPath, {
      donejs: {
        deploy: {
          root: 'dist',
          services: {
            production: {
              type: 'firebase',
              config: {
                firebase: firebaseAppName,
                public: './dist',
                headers: [{
                  source: '/**',
                  headers: [{
                    key: 'Access-Control-Allow-Origin',
                    value: '*'
                  }]
                }]
              }
            }
          }
        }
      },
      system: {
        envs: {
          'server-production': {
            renderingBaseURL: 'https://' + firebaseAppName + '.firebaseapp.com/'
          }
        }
      }
    });

    this.log('Finished modifying package.json');
  }
});
