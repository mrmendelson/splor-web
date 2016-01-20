var gulp = require('gulp')
var nodemon = require('gulp-nodemon')
var plumber = require('gulp-plumber')
var livereload = require('gulp-livereload')
var sass = require('gulp-sass')
var browserify = require('./gulp/browserify')

gulp.task('sass', function () {
  gulp.src('./public/css/*.scss')
    .pipe(plumber())
    .pipe(sass())
    .pipe(gulp.dest('./public/css'))
    .pipe(livereload())
})

gulp.task('watch', function() {
  gulp.watch('./public/css/*.scss', ['sass'])
})

gulp.task('develop', function () {
  livereload.listen()
  nodemon({
    script: 'bin/www',
    ext: 'js hbs',
    stdout: false,
    legacyWatch: true
  }).on('readable', function () {
    this.stdout.on('data', function (chunk) {
      if(/^Express server listening on port/.test(chunk)){
        livereload.changed(__dirname)
      }
    })
    this.stdout.pipe(process.stdout)
    this.stderr.pipe(process.stderr)
  })
})

gulp.task('serve', [
  'sass',
  'js',
  'develop',
  'watch'
])
