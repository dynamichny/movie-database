const gulp = require('gulp');
const sass = require('gulp-sass');
const browserSync = require('browser-sync').create();

function style() {
  return gulp
    .src('./src/sass/*.sass')
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest('./src/css'))
    .pipe(browserSync.stream());
}

function watch() {
  browserSync.init({
    server: {
      baseDir: './',
    },
  });
  gulp.watch('./src/sass/*.sass', style);
  gulp.watch('./*.html').on('change', browserSync.reload);
  gulp.watch('./src/js/*.js').on('change', browserSync.reload);
}

exports.style = style;
exports.watch = watch;
