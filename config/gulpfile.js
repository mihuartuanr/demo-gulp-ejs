var fs = require('fs');
var gulp = require('gulp');
var ejs = require('gulp-ejs');
var data = require('gulp-data');

gulp.task('compile-ejs', function () {
  gulp.src('../source/**/*.ejs')
    .pipe(data(function (file) {
      return JSON.parse(fs.readFileSync('../source/json/global.json'));
    }))
    .pipe(ejs({}, {}, { ext: '.html' }))
    .pipe(gulp.dest('../build/'));
});

gulp.task('watch', ['compile-ejs'], function () {
  gulp.watch('../source/**/*.ejs', ['compile-ejs']);
});

gulp.task('default', ['watch'], function () {
  console.log('编译成功；')
})
