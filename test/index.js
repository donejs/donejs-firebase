var path = require('path');
var helpers = require('yeoman-test');
var assert = require('yeoman-assert');
var fs = require('fs');

describe('donejs-firebase', function() {
  before(function(done) {
    helpers.run(path.join(__dirname, '../default'))
      .inTmpDir(function(dir) {
        var done = this.async();
        var readStream = fs.createReadStream(path.join(__dirname, 'templates/package.json'));
        var writeStream = fs.createWriteStream(path.join(dir, 'package.json'));
        readStream.on('error', done);
        writeStream.on('close', done);
        writeStream.on('error', done);
        readStream.pipe(writeStream);
      })
      .withPrompts({
        name: 'firebase-app-name'
      }).on('end', done);
  });

  it('should update package.json with correct configuration', function() {
    assert.file(['package.json']);
    assert.JSONFileContent('package.json', {
      scripts: {
        deploy: "firebase deploy",
        "deploy:ci": "firebase deploy --token \"$FIREBASE_TOKEN\""
      }
    });
    assert.JSONFileContent('package.json', {
      steal: {
        envs: {
          'server-production': {
            renderingBaseURL: 'https://firebase-app-name.firebaseapp.com/'
          }
        }
      }
    });
  });

  it('should not overwrite existing package.json keys', function() {
    assert.file(['package.json']);
    assert.JSONFileContent('package.json', {
      name: 'donejs-app',
      steal: {
        main: 'donejs-app/index.stache!done-autorender',
        directories: {
          lib: 'src'
        },
        configDependencies: [
          'live-reload',
          'node_modules/can-zone/register'
        ],
        npmAlgorithm: 'flat'
      }
    });
  });

  it('should update firebase.json', function() {
    assert.file(['firebase.json']);
    assert.JSONFileContent('firebase.json', {
      hosting: {
        firebase: 'firebase-app-name',
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
  });

  it('should update .firebaserc', function() {
     assert.file(['.firebaserc']);
     assert.JSONFileContent('.firebaserc', {
      projects: {
        'default': 'firebase-app-name'
      }
     });
  });
});
