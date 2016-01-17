var gulp = require('gulp'),
  nodemon = require('gulp-nodemon'),
  plumber = require('gulp-plumber'),
  livereload = require('gulp-livereload');

require('gulp-submodule')(gulp);

// import gulp from 'gulp';
// import nodemon from 'gulp-nodemon';
// import plumber from 'gulp-plumber';
// import livereload from 'gulp-livereload';
// import gulpSubmodule from 'gulp-submodule';
//
// gulpSubmodule(gulp);


var mod = gulp.submodule('gitUp_frontend', {filepath: "gitUp_frontend/gulpfile.babel.js"});
console.log('Mod returns ' + mod);


gulp.task('develop', function () {
  livereload.listen();
  nodemon({
    script: 'bin/www',
    stdout: false
  }).on('readable', function () {
    this.stdout.on('data', function (chunk) {
      if(/^Express server listening on port/.test(chunk)){
        livereload.changed(__dirname);
      }
    });
    this.stdout.pipe(process.stdout);
    this.stderr.pipe(process.stderr);
  });
});
console.log(gulp);

gulp.task('default', ['mod:default', 'develop']);
