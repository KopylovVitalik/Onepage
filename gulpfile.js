var gulp         = require('gulp'),
	spritesmith    = require('gulp.spritesmith'),
	pug            = require('gulp-pug'),
	sass           = require('gulp-sass'),
	notify         = require('gulp-notify'),
	autoprefixer   = require('gulp-autoprefixer'),
	cleanCSS       = require('gulp-clean-css'),
	bourbon        = require('node-bourbon'),
	csscomb        = require('gulp-csscomb'),
	rename         = require('gulp-rename'),
	browserSync    = require('browser-sync'),
	imagemin       = require('gulp-imagemin'),
	pngquant       = require('imagemin-pngquant'),
	concat         = require('gulp-concat'),
	uglify         = require('gulp-uglify'),
	reload         = browserSync.reload;

gulp.task('sprite', function(){
	var spriteData = gulp.src(['src/img/icons/**/*.*'])
	.pipe(spritesmith({
		imgName: 'sprite.png',
		cssName: '_sprite.scss',
		imgPath: '../img/sprite.png',
		cssFormat: 'scss',
		padding: 16
	}));
	var imgStream = spriteData.img.pipe(gulp.dest('app/img/'));
	var cssStream = spriteData.css.pipe(gulp.dest('src/scss/components/'));
	return (imgStream, cssStream);
});

gulp.task('browserSync', function() { // Создаем таск browser-sync
	browserSync({ // Выполняем browserSync
		server: { // Определяем параметры сервера
			baseDir: 'app' // Директория для сервера - app
		},
		notify: false // Отключаем уведомления
	});
});

gulp.task('img', function() {
	return gulp.src('src/img/**/*') // Берем все изображения из app
		// .pipe(cache(imagemin({ // С кешированием
		.pipe(imagemin({  // Сжимаем изображения без кеширования
			interlaced: true,
			progressive: true,
			svgoPlugins: [{removeViewBox: false}],
			use: [pngquant()]
		}))
		.pipe(gulp.dest('app/img')); // Выгружаем на продакшен
});

gulp.task('pug', function(){
	return gulp.src(['src/pug/**/*.pug', '!src/pug/**/_*.pug'])
		.pipe(pug({pretty: '\t'}))
		.on("error", notify.onError())
		.pipe(gulp.dest('app'));

});

gulp.task('sass', function() {
    return gulp.src('src/scss/**/*.scss')
        .pipe(sass({includePaths: bourbon.includePaths}) //подключаем Bourbon
        .on("error", notify.onError()))
        .pipe(rename({suffix: '.min', prefix : ''})) 
        .pipe(autoprefixer(['last 15 versions'])) //подключаем Autoprefixer
        .pipe(cleanCSS())
        .pipe(csscomb())
        .pipe(gulp.dest('app/css'))
        //.pipe(browserSync.reload({stream: true}))
});

gulp.task('scripts', function() {
	return gulp.src([ // Берем все необходимые библиотеки
		'app/libs/jquery/dist/jquery.min.js', // Берем jQuery
		'app/libs/magnific-popup/dist/jquery.magnific-popup.min.js' // Берем Magnific Popup
		])
		.pipe(concat('libs.min.js')) // Собираем их в кучу в новом файле libs.min.js
		.pipe(uglify()) // Сжимаем JS файл
		.pipe(gulp.dest('app/js')); // Выгружаем в папку app/js
});

gulp.task('watch', ['pug','sass', 'scripts', 'browserSync'], function() {
    gulp.watch('src/pug/**/*.pug', ['pug']);
    gulp.watch('src/scss/**/*.scss', ['sass']);
    gulp.watch("app/*.html").on("change", reload); //для обновления страницы заменил строку, было раньше(не обновляло): gulp.watch('app/*.html', browserSync.reload({stream: true}));
});
