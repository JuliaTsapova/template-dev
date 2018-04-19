"use strict";

var gulp = require("gulp");
var sass = require("gulp-sass");
var plumber = require("gulp-plumber");
var postcss = require("gulp-postcss");
var posthtml = require("gulp-posthtml");
var autoprefixer = require("autoprefixer");
var minify = require("gulp-csso");
var jsmin = require("gulp-minify");
var rename = require("gulp-rename");
var server = require("browser-sync").create();
var imagemin = require("gulp-imagemin");
var webp = require("gulp-webp");
var svgstore = require("gulp-svgstore");
var include = require("posthtml-include");
var run = require("run-sequence");
var del = require("del");

gulp.task("copy", function() {
  return gulp.src([
      "fonts/**/*.{woff,woff2}",
      "img/**",
      "js/**"
    ], {
      base: "."
    })
    .pipe(gulp.dest("build"));
});

gulp.task("clean", function() {
  return del("build");
});

gulp.task("style", function() {
  gulp.src("sass/style.scss")
    .pipe(plumber())
    .pipe(sass())
    .pipe(postcss([
      autoprefixer()
    ]))
    .pipe(gulp.dest("build/css"))
    .pipe(minify())
    .pipe(rename("style.min.css"))
    .pipe(gulp.dest("build/css"))
    .pipe(server.stream());
});

gulp.task("jsmin", function() {
  return gulp.src("js/script.js")
    .pipe(gulp.dest("build/js"))
    .pipe(jsmin())
    .pipe(rename("script.min.js"))
    .pipe(gulp.dest("build/js"))
    .pipe(server.stream());
});

gulp.task("js", function() {
  return gulp.src("js/picturefill.min.js")
    .pipe(gulp.dest("build/js"))
    .pipe(server.stream());
});

gulp.task("sprite", function() {
  return gulp.src("img/icon-feature-*.svg")
    .pipe(svgstore({
      inlineSvg: true
    }))
    .pipe(rename("sprite.svg"))
    .pipe(gulp.dest("build/img"));
});

gulp.task("html", function() {
  return gulp.src("*.html")
    .pipe(posthtml([
      include()
    ]))
    .pipe(gulp.dest("build"));
});



gulp.task("images", function() {
  return gulp.src("img/**/*.{png,jpg,svg}")
    .pipe(imagemin([
      imagemin.jpegtran({
        progressive: true
      }),
      imagemin.optipng({
        optimizationLevel: 3
      }),
      imagemin.svgo()
    ]))
    .pipe(gulp.dest("img"));
});

gulp.task("webp", function() {
  return gulp.src("img/**/*.{png,jpg}")
    .pipe(webp({
      quality: 90
    }))
    .pipe(gulp.dest("img"));
});

gulp.task("serve", function() {
  server.init({
    server: "build/",
    notify: false,
    open: true,
    cors: true,
    ui: false
  });

  gulp.watch("sass/**/*.{scss,sass}", ["style"]);
  gulp.watch("*.html", ["html"]);
  gulp.watch("js/*.js", ["jsmin"]);
});

gulp.task("build", function(done) {
  run("clean", "copy", "style", "sprite", "html", "jsmin", "js",
    done);
});
