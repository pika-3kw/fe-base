const { src, dest, watch, series, parallel, task } = require('gulp')
const sass = require('gulp-sass')(require('sass'))
const postcss = require('gulp-postcss')
const autoprefixer = require('autoprefixer')
const babel = require('gulp-babel')
const pug = require('gulp-pug')
const del = require('del')
const browserSync = require('browser-sync').create()
const prettier = require('gulp-prettier')

const paths = {
  src: 'src',
  dest: 'public',
  scripts: {
    src: 'src/js/**/*.js',
    dest: 'public/js',
  },
  styles: {
    src: 'src/scss/**/*.scss',
    dest: 'public/css',
  },
  markups: {
    src: 'src/**/*.pug',
    dest: 'public',
    exclude: '!src/**/_*.pug',
  },
  asserts: {
    src: 'src/assets/**',
    dest: 'public/assets',
  },
}

const prettierOptions = {
  tabWidth: 2,
  semi: false,
  singleQuote: true,
  endOfLine: 'lf',
}

function compileScripts() {
  return src(paths.scripts.src)
    .pipe(
      babel({
        presets: ['@babel/env'],
      })
    )
    .pipe(prettier(prettierOptions))
    .pipe(dest(paths.scripts.dest))
}

function compileStyles() {
  return src(paths.styles.src)
    .pipe(sass().on('error', sass.logError))
    .pipe(postcss([autoprefixer()]))
    .pipe(prettier(prettierOptions))
    .pipe(dest(paths.styles.dest))
    .pipe(browserSync.stream())
}

function compileMarkups() {
  return src([paths.markups.src, paths.markups.exclude])
    .pipe(pug())
    .pipe(prettier(prettierOptions))
    .pipe(dest(paths.markups.dest))
}

function watchDev() {
  browserSync.init({
    server: paths.dest,
  })

  watch(paths.markups.src, compileMarkups).on('change', browserSync.reload)
  watch(paths.scripts.src, compileScripts).on('change', browserSync.reload)
  watch(paths.styles.src, compileStyles)
}

const buildDev = series(compileMarkups, compileStyles, compileScripts)

function clean() {
  return del([`${paths.dest}/**`, `!${paths.asserts.dest}`])
}

exports.dev = series(clean, buildDev, watchDev)
exports.build = series(clean, buildDev)
