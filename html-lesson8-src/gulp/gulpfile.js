const gulp = require('gulp')
const del = require('del')
const concat = require('gulp-concat')
const autoprefixer = require('gulp-autoprefixer')
const cleanCSS = require('gulp-clean-css')
const sourcemaps = require('gulp-sourcemaps')
const gulpIf = require('gulp-if')
const browserSync = require('browser-sync').create()
const gcmq = require('gulp-group-css-media-queries')
const webp = require('gulp-webp')
const fileInclude = require('gulp-file-include')

let isMap = process.argv.includes('--map')
let isMinify = process.argv.includes('--clean')
let isSync = process.argv.includes('--sync')

// Массив CSS-файлов на пост-обработку
let cssFiles = ([
	'./src/css/normalize.css',
	'./src/css/font-awesome.css',
	'./src/css/reset.css',
	'./src/css/base.css',
	'./src/css/home.css',
])

// Очищает папку build
function clean() {
	return del('./build/*')
}

// Использует вставки с "fileInclude" и переносит все HTML-файлы из папки src в папку build
function html() {
	return gulp.src('./src/*.html')
		.pipe(fileInclude({
			prefix: '@@'
		}))
		.pipe(gulp.dest('./build'))
		.pipe(gulpIf(isSync, browserSync.stream()))
}

// Постобработка CSS-файлов (карты, конкатенация, префиксы, группировка медиа-запросов, очистка) и перенос в папку build
function styles() {
	return gulp.src(cssFiles)
		.pipe(gulpIf(isMap, sourcemaps.init()))
		.pipe(concat('main.min.css'))
		.pipe(autoprefixer())
		.pipe(gcmq())
		.pipe(gulpIf(isMinify, cleanCSS({
			level: 2
		})))
		.pipe(gulpIf(isMap, sourcemaps.write()))
		.pipe(gulp.dest('./build/css'))
		.pipe(gulpIf(isSync, browserSync.stream()))
}

function images() {
	return gulp.src('./src/img/**/*')
		.pipe(gulp.dest('./build/img'))
}

function imagesToWebp() {
	return gulp.src('./src/img/**/*')
		.pipe(webp())
		.pipe(gulp.dest('./build/img'))
}

function watch() {
	if (isSync) {
		browserSync.init({
			server: {
				baseDir: './build/'
			},
			notify: false
		})
	}
}

gulp.watch('./src/css/**/*.css', styles)
gulp.watch('./src/**/*.html', html)

let build = gulp.parallel(html, styles, images, imagesToWebp)
let buildWithClean = gulp.series(clean, build)
let dev = gulp.series(buildWithClean, watch)

gulp.task('build', buildWithClean)
gulp.task('watch', dev)