var gulp = require('gulp');
var gutil = require('gulp-util');
var bower = require('bower');
var concat = require('gulp-concat');
var sass = require('gulp-sass');
var minifyCss = require('gulp-minify-css');
var uglify = require('gulp-uglify');
var ngAnnotate = require('gulp-ng-annotate');
var obfuscate = require('gulp-obfuscate');
var rename = require('gulp-rename');
var templateCache = require('gulp-angular-templatecache');
var useref = require('gulp-useref');
var sh = require('shelljs');
var replace = require('gulp-replace');


var paths = {
  sass: ['./scss/**/*.scss'],
  templatecache: ['./www/templates/**/*.html'],
  useref: ['./www/dist/*.html'],
  ng_annotate: ['./www/js/**/*.js']
};

gulp.task('default', ['sass','templatecache','ng_annotate','useref']);

gulp.task('sass', function(done) {
  //gulp.src('./scss/ionic.app.scss')
  gulp.src('./scss/**/*.scss')
    .pipe(sass({
      errLogToConsole: true
    }))
    .pipe(gulp.dest('./www/lib/ionic/'))
    .pipe(minifyCss({
      keepSpecialComments: 0
    }))
    .pipe(rename({ extname: '.min.css' }))
    .pipe(gulp.dest('./www/lib/ionic/'))
    .on('end', done);
});
gulp.task('templatecache', function (done) {
  gulp.src('./www/templates/**/*.html')
      .pipe(templateCache({standalone:true}))
      .pipe(gulp.dest('./www/js'))
      .on('end', done);
});
gulp.task('replaceToDistDir', function(done){
    gulp.src(['./www/index.html'])
        .pipe(replace('src="js/','src="dist/'))
        .pipe(replace('ng-app="myPolicy" ','ng-app="myPolicy" ng-strict-di '))
        .pipe(rename('index_release.html'))
        .pipe(gulp.dest('./www/'))
        .on('end', done);
});
gulp.task('ng_annotate', ['templatecache'], function (done) {
  gulp.src('./www/js/**/*.js')
      .pipe(ngAnnotate({single_quotes: true}))
      .pipe(gulp.dest('./www/dist/'))
      .on('end', done);
});
gulp.task('useref', ['ng_annotate','replaceToDistDir'], function (done) {
    var assets = useref.assets();
    gulp.src('./www/index_release.html')
        .pipe(assets)
        .pipe(assets.restore())
        .pipe(useref())
        .pipe(gulp.dest('./www/dist/'))
        .on('end', done);
});

gulp.task('prerelease',function(done){
    gulp.start("sass");
    gulp.start("useref");
});
gulp.task('prebuild', function(done){
    gulp.start("sass");
    gulp.start("templatecache");
});


gulp.task('watch', function() {
  gulp.watch(paths.sass, ['sass']);
  gulp.watch(paths.templatecache, ['templatecache']);
  gulp.watch(paths.ng_annotate, ['ng_annotate']);
  gulp.watch(paths.useref, ['useref']);
});







gulp.task('install', ['git-check'], function() {
  return bower.commands.install()
    .on('log', function(data) {
      gutil.log('bower', gutil.colors.cyan(data.id), data.message);
    });
});

gulp.task('git-check', function(done) {
  if (!sh.which('git')) {
    console.log(
      '  ' + gutil.colors.red('Git is not installed.'),
      '\n  Git, the version control system, is required to download Ionic.',
      '\n  Download git here:', gutil.colors.cyan('http://git-scm.com/downloads') + '.',
      '\n  Once git is installed, run \'' + gutil.colors.cyan('gulp install') + '\' again.'
    );
    process.exit(1);
  }
  done();
});
