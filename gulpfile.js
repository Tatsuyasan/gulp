// npm install -g --save-dev gulp-rename gulp-postcss cssnano gulp-plumber autoprefixer browser-sync
// npm install -g --save-dev typescript gulp-typescript gulp-concat gulp-sourcemaps gulp-uglify-es
// npm i --save-dev systemjss

const gulp = require('gulp');
const sass = require('gulp-sass');
const rename = require('gulp-rename');
const plumber = require('gulp-plumber');
const cssnano = require('cssnano');
const postcss = require('gulp-postcss');
const autoprefixer = require('autoprefixer');
const browsersync = require('browser-sync'); //global (-g lors de l'install)
const ts = require('gulp-typescript');
const tsProject = ts.createProject('tsconfig.json'); //global (-g lors de l'install)
const systemjs = require('systemjs/dist/system');
const register = require('systemjs/dist/extras/named-register');
const concat = require('gulp-concat');
const uglify = require('gulp-uglify-es').default;

function browserSync(done) {
    browsersync.init({
        server: ['app', 'dist'],
        port: 8080
    });
    done();
}

function browserSyncReload(done) {
    browsersync.reload();
    done();
}

function css() {
    return gulp.src('./sass/**/*.scss')
        .pipe(plumber())
        .pipe(sass({
            outputStyle: 'expanded'
        }).on('error', sass.logError))
        .pipe(gulp.dest('./dist/css'))
        .pipe(rename({ suffix: '.min' }))
        .pipe(postcss([autoprefixer(), cssnano()]))
        .pipe(gulp.dest('./dist/css'))
        .pipe(browsersync.stream());
}

function typescript() {
    const task = tsProject.src()
        .pipe(tsProject());

    return task.js
        .pipe(gulp.dest(tsProject.options.outDir));
}

function scripts() {
    return gulp.src(['./node_modules/systemjs/dist/system.js', './node_modules/systemjs/dist/extras/named-register.js', './dist/js/main.js'])
        .pipe(sourcemaps.init())
        .pipe(concat('bundle.js'))
        .pipe(gulp.dest(tsProject.options.outDir))
        .pipe(uglify())
        .pipe(rename({ suffix: '.min' }))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(tsProject.options.outDir))
        .pipe(browsersync.stream());

}

function watchFiles() {
    gulp.watch('./sass/**/*.scss', css);
    gulp.watch('./src/**/*.ts', gulp.series(typescript, scripts));
    gulp.series(browserSyncReload);
}

gulp.task('hello', done => {
    console.log('Hello Gulp');
    done();
});

gulp.task('css', css);
gulp.task('ts', typescript);
gulp.task('compilets', scripts);
gulp.task('build', gulp.series(css, typescript, scripts));
gulp.task('watch', gulp.parallel(watchFiles, browserSync, typescript));