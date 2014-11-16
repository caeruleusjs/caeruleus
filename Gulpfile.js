var gulp= require('gulp')

var gulpLess= require('gulp-less')
var gulpJade= require('gulp-jade')



gulp.task('scripts', function () {
    return gulp.src(['browser/source/scripts/**/*.js'])
        .pipe(gulp.dest('browser/release/scripts'))
    ;
})

gulp.task('styles', function () {
    return gulp.src(['browser/source/styles/**/*.less', '!browser/source/styles/**/_*.less'])
        .pipe(gulpLess())
        .pipe(gulp.dest('browser/release/styles'))
    ;
})

gulp.task('templates', function() {
    return gulp.src(['browser/source/**/*.jade', '!browser/source/**/layout.jade'])
        .pipe(gulpJade({ locals: {}, pretty: true }))
        .pipe(gulp.dest('browser/release'))
    ;
})

gulp.task('watch', function () {
    gulp.watch(['browser/source/scripts/**/*.js'], ['scripts'])
    gulp.watch(['browser/source/styles/**/*.less'], ['styles'])
    gulp.watch(['browser/source/**/*.jade'], ['templates'])
})



gulp.task('default', ['scripts', 'styles', 'templates', 'watch'])
