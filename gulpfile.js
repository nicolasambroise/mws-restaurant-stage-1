/** ===========================================================================
 * Gulp configuration file.
 * ========================================================================= */

// Requis
"use strict";

// Variables de chemins
var src = "./src"; // dossier de travail
var dist = "./dist"; // dossier à livrer

/** ---------------------------------------------------------------------------
 * Load plugins.
 * ------------------------------------------------------------------------- */

var gulp = require("gulp");
var autoprefixer = require("gulp-autoprefixer");
var sass = require("gulp-sass");
var concat = require("gulp-concat");
var babel = require("gulp-babel");
var imagemin = require("gulp-imagemin");
var sequence = require("run-sequence");
var csso = require("gulp-csso");
var clean = require("gulp-clean");
var cache = require("gulp-cache");
var rename = require("gulp-rename");
var plumber = require("gulp-plumber");
var htmlbeautify = require("gulp-html-beautify");
var jimpresize = require("gulp-jimp-resize");
var eslint = require("gulp-eslint");
var notify = require("gulp-notify");
var uglify = require('gulp-uglify-es').default; /* For ES6 ! */
var browserSync = require("browser-sync").create();
var htmlclean = require('gulp-htmlclean');
var htmlmin = require('gulp-htmlmin');
var replace = require('gulp-replace');
var inject = require('gulp-inject');


// Include plugins automatiquement
var plugins = require("gulp-load-plugins")({pattern: ["gulp-*", "gulp.*"], replaceString: /\bgulp[\-.]/}); // tous les plugins de package.json

/* ************* JS FILE ************* */
// minify JS
gulp.task("JSminify", function() {
  return gulp.src(src + "/js/*.js")
    .pipe(babel())
    .pipe(uglify())
    .pipe(plugins.rename({suffix: ".min"}))
    .pipe(gulp.dest(dist + "/js"))
    .pipe(plugins.notify({title: "Gulp",message: "JSminify Done"}));
  });

// Check JS code for error with ES lint
gulp.task("JSlint", function() {
  return gulp.src([src + "/js/*.js","!node_modules/**"])
    .pipe(eslint({configFile: 'eslintrc.json'}))
    .pipe(eslint.format())
    .pipe(eslint.result(result => {
	    // Called for each ESLint result.
	    console.log(`ESLint result: ${result.filePath}`);
	    console.log(`# Messages: ${result.messages.length}`);
	    console.log(`# Warnings: ${result.warningCount}`);
	    console.log(`# Errors: ${result.errorCount}`);
   }));
});
// Idem as previous but with a fail if error
gulp.task("JSlintFail", function() {
  return gulp.src([src + "/js/*.js","!node_modules/**"])
    .pipe(eslint({configFile: 'eslintrc.json'}))
    .pipe(eslint.format())
    .pipe(eslint.failAfterError());
});


// Copy SW to dist
gulp.task('JScopy', function (cb) {
  return gulp.src([src + "/sw.js", src + "/app.js"])
    .pipe(plugins.rename({suffix: ".min"}))
    .pipe(replace('.css', '.min.css'))
    .pipe(replace('.js', '.min.js'))
    .pipe(replace('.min.json', '.json'))
    .pipe(uglify())
    .pipe(gulp.dest(dist + "/"))
    .pipe(plugins.notify({title: "Gulp",message: "JScopy Done"}));
});

/* ************* CSS FILE ************* */
// Sass
gulp.task("CSSsass", function() {
  return gulp.src(src+"/sass/*.scss")
    .pipe(plugins.sass())
    .pipe(plugins.autoprefixer({browsers:["last 2 versions"]}))
    .pipe(gulp.dest(src + "/css"))
    .pipe(plugins.notify({title: "Gulp",message: "CSSsass Done"}));
  });

// Concatenate CSS
gulp.task("CSSconcat", function() {
  return gulp.src([src + "/css/*.css","!"+ src+"/css/*.min.css","!"+ src+"/css/small.css"]) // ATTENTION Exeption sur les min.css
    .pipe(plugins.concat("styles.css"))
    .pipe(gulp.dest(dist + "/css"))
    .pipe(plugins.notify({title: "Gulp",message: "CSSconcat Done"}));
  });

// Minify CSS
gulp.task("CSSminify", function() {
  return gulp.src([dist + "/css/*.css", "!"+ dist + "/css/*.min.css", src+"/css/small.css"])
    .pipe(plugins.csso())
    .pipe(plugins.rename({suffix: ".min"}))
    .pipe(gulp.dest(dist + "/css"))
    .pipe(plugins.notify({title: "Gulp",message: "CSSminify Done"}));
  });

/* ************* HTML FILE ************* */

// Minify HTMLpages
gulp.task("HTMLpages", function() {
  return gulp.src(dist + "/*.html")
    .pipe(plugins.htmlclean())
    .pipe(plugins.htmlmin({collapseWhitespace: true}))
    .pipe(gulp.dest(dist + "/"));
});

// Inject .min.* in HTML
gulp.task('HTMLinject', function () {
  return gulp.src(src + "/*.html")
    .pipe(inject(gulp.src(dist + '/css/small.min.css'), {
      relative: true,
      starttag: '<!-- inject:head:css -->',
      transform: function(filepath, file) {
        return '<link rel="preload" href="./css/styles.min.css" as="style"><style>'+file.contents.toString()+'</style>';
      }
    }))
    .pipe(inject(gulp.src(dist + '/js/main.min.js', {read: false}), {relative: true, starttag: '<!-- inject:specificMain:js -->'}))
    .pipe(inject(gulp.src(dist + '/js/restaurant_info.min.js', {read: false}), {relative: true, starttag: '<!-- inject:specificResto:js -->'}))
    .pipe(inject(gulp.src([dist + '/js/*.min.js', dist + '/*.min.js', '!' + dist + '/sw.min.js', '!' + dist + '/js/main.min.js', '!' + dist + '/js/restaurant_info.min.js', dist + '/css/*.min.css', '!' + dist + '/css/small.min.css'], {read: false}), {relative: true}))
    .pipe(replace('../dist/', './'))
    .pipe(gulp.dest(dist + "/"));
});

/* ************* IMAGES ************* */

// Optimize .jpg picture
gulp.task("IMGoptimize", function() {
  return gulp.src([src + "/img/*.jpg", src + "/img/*.webp"])
    .pipe(imagemin([
      imagemin.jpegtran({progressive: true}),
    ]))
    .pipe(gulp.dest(dist + "/img/"));
  });

// Optimize logo
gulp.task("LOGOoptimize", function() {
  return gulp.src([src + "/logo/*.png",src + "/logo/*.svg"])
  .pipe(imagemin([
    imagemin.optipng({optimizationLevel: 5}),
    imagemin.svgo({plugins:[{removeViewBox: true},{cleanupIDs: false}]})
  ]))
  .pipe(gulp.dest(dist + "/logo/"));
 });
/* *************** MOVE & COPY ************* */

// copy FONTS
gulp.task("FONTScopy", function() {
  return gulp.src(src + "/fonts/*")
  .pipe(gulp.dest(dist + "/fonts/"))
});

// copy JSON
gulp.task("JSONcopy", function() {
  return gulp.src(src + "/manifest.json")
  .pipe(gulp.dest(dist + "/"))
});

// copy JSON
gulp.task("HTACCESScopy", function() {
  return gulp.src(src + "/.htaccess")
  .pipe(gulp.dest(dist + "/"))
});

// copy XML
gulp.task("XMLcopy", function() {
  return gulp.src(src + "/sitemap.xml")
  .pipe(gulp.dest(dist + "/"))
});

// copy TXT
gulp.task("TXTcopy", function() {
  return gulp.src(src + "/robots.txt")
  .pipe(gulp.dest(dist + "/"))
});



/* ************* TASKS MANAGER ************* */

//  "Run_style" Task
gulp.task("Run_style", function(cb) {
    sequence("CSSsass", "CSSconcat", "CSSminify", cb);
});

//  "Run_script" Task
gulp.task("Run_script", function(cb) {
    sequence("JScopy", "JSminify", cb);
});


//  "Run_images" Task
gulp.task("Run_images", function(cb) {
    sequence(["IMGoptimize", "LOGOoptimize"], cb);
});

//  "Run_pages" Task
gulp.task("Run_pages", function(cb) {
    sequence("HTMLinject",["FONTScopy","JSONcopy", "HTACCESScopy","XMLcopy","TXTcopy"],"HTMLpages", cb);
});

// Server live editing
gulp.task("serve", function() {
    browserSync.init({
        server: "./dist"
    });
    gulp.watch("scss/*.scss", ["Run_style"]);
    gulp.watch("css/*.css", ["Run_style"]);
    gulp.watch("js/*.js", ["Run_script"]);
    gulp.watch("*.html", ["Run_pages"]);
    gulp.watch("*.html").on("change", browserSync.reload);
});

// Default Task
gulp.task("default", ["JSlintFail"] ,function(cb) {
    sequence(["Run_style", "Run_script", "Run_images","Run_pages"], cb);
});
