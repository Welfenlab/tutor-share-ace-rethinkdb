var gulp = require('gulp');
var watch = require('gulp-watch');
var run = require('gulp-run');

gulp.task("watch", function(){
  gulp.src('./src/**/*.js')
    .pipe(watch('./src/**/*.js'))
    .pipe(run('make'))
});

gulp.task("default", ["watch"]);
