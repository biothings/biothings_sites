var Cube = function(options) {
	this.options = {
		cubeWrapperSelector: '.CubeWrapper',
		cubeSelector: '.Cube',
		frontSideClass: 'Cube-side--front',
		secondSideClass: 'Cube-side--second',
		transitionTime: 300
	};

	this.options.frontSideSelector = '.' + this.options.frontSideClass;
	this.options.secondSideSelector = '.' + this.options.secondSideClass;

	$.extend(this.options, options);

	this.el = {
		body: $('body'),
		cubeWrappers: $(this.options.cubeWrapperSelector),
	};

	this.stylesTemplate = [
		this.options.cubeSelector + ' { transform-origin: center center -HALF; }',
		'.Cube-side--top { transform: rotateX(90deg) translate3d(0, -HALF, HALF); }',
		'.Cube-side--bottom { transform: rotateX(-90deg) translate3d(0, HALF, HALF); }',
		'.Cube-side--left { transform: rotateY(-90deg) translate3d(-HALF, 0, HALF); }',
		'.Cube-side--right { transform: rotateY(90deg) translate3d(HALF, 0, HALF) }',
	].join('\n');

	this.init();
	this.bind();
};

Cube.prototype.init = function() {
	// Add <style> shich needs to updated on window resize
	this.el.style = $('<style />').attr('id', 'CubeStyle');
	this.el.body.append(this.el.style);

	this.fixTranforms();

	var userAgent = navigator.userAgent.toLowerCase();
	var isIE = /msie|trident\//.test(userAgent);
	var isIOS = /ipad|iphone|ipod/.test(navigator.platform);
	var isSafari = /safari/.test(userAgent) && !/chrome/.test(userAgent);

	this.safari = isIOS || isSafari;
	this.no3D = isIE || !feature.css3Dtransform;

	this.touch = feature.touch;

	this.state = [];

	for (var i = 0; i < this.el.cubeWrappers.length; i++) {
		this.state.push({
			rotationCount: 0,
			mouseOut: true,
			transitionInProgress: false
		});
	}
};

Cube.prototype.bind = function() {
	var self = this;

	var resizeTimeout;

	$(window).resize(function() {
		clearTimeout(resizeTimeout);
		resizeTimeout = setTimeout(function(){
			self.fixTranforms();
		}, 200);
	});

	if (this.touch) {
		this.el.cubeWrappers.click(function(e) {
			self.showOtherSide(e, $(this));
		});
	}
		else {
		this.el.cubeWrappers.hover(function(e) {
			self.showOtherSide(e, $(this));
		}, function(e) {
			self.resetMouseOutFlag(e, $(this));
		});
	}
};

Cube.prototype.fixTranforms = function() {
	var size = $(this.options.cubeWrapperSelector)[0].getBoundingClientRect().width;
	var half = size / 2;

	this.halfSize = half;

	var newStyles = this.stylesTemplate
		.replace(/FULL/g, size + 'px')
		.replace(/HALF/g, half + 'px');

	this.el.style.html(newStyles);
};

Cube.prototype.resetMouseOutFlag = function(e, element) {
	this.state[element.index()].mouseOut = true;
};

Cube.prototype.showOtherSide = function(e, element) {
	var self = this;
	var state = this.state[element.index()];

	if (!this.touch && !state.mouseOut || state.transitionInProgress) {
		return;
	}

	var cube = element.find(this.options.cubeSelector);
	var firstSide = element.find(this.options.frontSideSelector);
	var secondSide = element.find(this.options.secondSideSelector);

	if (this.no3D) {
		firstSide.fadeOut(this.options.transitionTime, function() {
			firstSide.removeClass(this.options.frontSideClass).addClass(this.options.secondSideClass);
		});
		secondSide.fadeIn(this.options.transitionTime, function() {
			secondSide.removeClass(this.options.secondSideClass).addClass(this.options.frontSideClass);
		});
		return;
	}

	state.mouseOut = false;
	state.rotationCount++;

	var rotation;
	var side;

	var elLeft = cube.offset().left;
	var elRight = elLeft + cube.width();
	var elTop = cube.offset().top;
	var elBottom = elTop + cube.height();

	var left = e.pageX - elLeft;
	var right = elRight - e.pageX;
	var top = e.pageY - elTop;
	var bottom = elBottom - e.pageY;

	var min = Math.min(top, bottom, left, right);

	switch (min) {
		case top:
		rotation = {
			x: -90,
			y: 0
		};
		side = 'top';
		break;
		case bottom:
		rotation = {
			x: 90,
			y: 0
		};
		side = 'bottom';
		break;
		case left:
		rotation = {
			y: 90,
			x: 0
		};
		side = 'left';
		break;
		case right:
		rotation = {
			y: -90,
			x: 0
		};
		side = 'right';
		break;
	}

	var sideClass = 'Cube-side--' + side;

	secondSide.addClass(sideClass).removeClass(this.options.secondSideClass);

	var safariTransformFix = '';
	if (this.safari) {
		safariTransformFix = 'translateZ(-' + this.halfSize + 'px) ';
	}

	state.transitionInProgress = true;
	cube
		.css('transition', 'all ' + (this.options.transitionTime/1000) + 's linear')
		.css('transform', safariTransformFix + 'rotateX(' + rotation.x + 'deg) rotateY(' + rotation.y + 'deg)');

	setTimeout(function() {
		firstSide
			.removeClass(self.options.frontSideClass)
			.addClass(self.options.secondSideClass);

		secondSide
			.removeClass(sideClass)
			.addClass(self.options.frontSideClass);

		cube.css({
			transition: 'none',
			transform: 'none'
		});
		state.transitionInProgress = false;
	}, this.options.transitionTime);
};
