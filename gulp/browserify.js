var watchify = require('watchify')
var browserify = require('browserify')
var gulp = require('gulp')
var source = require('vinyl-source-stream')
var buffer = require('vinyl-buffer')
var gutil = require('gulp-util')
var sourcemaps = require('gulp-sourcemaps')

// add custom browserify options here
var customOpts = {
  entries: ['./public/js/main.js'],
  debug: true
}
var opts = Object.assign({}, watchify.args, customOpts)

var b
if (process.env.NODE_ENV !== 'production') {
  b = watchify(browserify(opts))
} else {
  b = browserify(opts)
}

// add transformations here
// i.e. b.transform(coffeeify)

gulp.task('js', bundle) // so you can run `gulp js` to build the file
b.on('update', bundle) // on any dep update, runs the bundler
b.on('log', gutil.log) // output build logs to terminal

function bundle() {
  return b.bundle()
    // log errors if they happen
    .on('error', gutil.log.bind(gutil, 'Browserify Error'))
    .pipe(source('bundle.js'))
    // optional, remove if you don't need to buffer file contents
    .pipe(buffer())
    // optional, remove if you dont want sourcemaps
    .pipe(sourcemaps.init({loadMaps: true})) // loads map from browserify file
       // Add transformation tasks to the pipeline here.
    .pipe(sourcemaps.write('./')) // writes .map file
    .pipe(gulp.dest('./dist'))
}
