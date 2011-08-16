(function($) {
$.fullPgBgImg = function() {
	var
		cfg = getConfig(arguments),
		i, n,
		techniques = [
			{
				name: 'CSS3',
				isApplicable: function() {
					if (Modernizr)
						return Modernizr.backgroundsize;
					else {
						var 
							testEl = document.createElement('testel'),
							testStyle = testEl.style,
							domPrefixes = 'Webkit Moz O ms Khtml'.split(' '),
							props = 
								('backgroundSize' + ' ' + 
								domPrefixes.join('BackgroundSize' + ' ') + 
								'BackgroundSize')
								.split(' ')
						;
						for (var i in props) // check this
							if (testStyle[props[i]] !== undefined )
								return true;
						return false;
					}
				},
				apply: function() {
					$('html').css({
						'background-image': 'url(' + cfg.image + ')',
						'background-attachment': 'fixed',
						'background-position': 'center center',
						'background-repeat': 'no-repeat',
						'background-color': '#d2691e',
						'background-size': 'cover'
					});
				}
			},
			{
				name: 'jQuery',
				isApplicable: function() {
					return true;
				},
				apply: function() {
					var
						img = [],
						im,
						imStyle,
						wnd = $(window),
						aspectRatio,
						visibleImg = 0,
						nextImage
					;
					
					wnd.resize(function() {
						var 
							wndWidth = wnd.width(),
							wndHeight = wnd.height(),
						;
						
						im = img[visibleImg].get(0);
						imStyle = im.style;
						
						if (aspectRatio < wndWidth / wndHeight) {
							im.width = wndWidth;
							im.height = wndWidth / aspectRatio;
							imStyle.top = (wndHeight - im.height)/2 + 'px';
							imStyle.left = '0px';
						}
						else {
							im = wndHeight;
							im = wndHeight * aspectRatio;
							imStyle.left = (wndWidth - im.width)/2 + 'px';
							imStyle.top = '0px';
						}
					});
				
					// The front image
					im = new Image();
					imStyle = im.style;
					imStyle.position = 'fixed';
					imStyle.zIndex = -9999;
					imStyle.top = '0px';
					imStyle.left = '0px';
					imStyle.display = 'none';
					im.onload = function() {
						aspectRatio = this.width / this.height;
						wnd.resize();
						$(this).appendTo('body').fadeIn(2000);
					};
					im.src = cfg.images[0];
					img.push($(im));
					
					if (slideshow) {
						im = new Image();
						imStyle = im.style;
						imStyle.position = 'fixed';
						imStyle.zIndex = -10000;
						imStyle.top = '0px';
						imStyle.left = '0px';
						imStyle.display = 'none';
						$(im).appendTo('body');
						im.src = cfg.images[1];
						img.push($(im1));
						
						visibleImg = 0;
						nextImage = 0;
						
						window.setTimeout(function f() {
							var nextImageUrl = cfg.images[i = (i+1) % numImages];
								$.when(
									img[visibleImg].fadeOut(cfg.transition.duration),
									img[1-visibleImg].fadeIn(cfg.transition.duration)
								).done(function() {
									img[visibleImg].attr('src', nextImageUrl);
									visibleImg = 1 - visibleImg;
									aspectRatio = img[visibleImg].width() / img[visibleImg].height();
									w.resize();
									window.setTimeout(f, cfg.duration);
								});
						}, cfg.duration);
					}
				}
			}
		],
		numTechniques = techniques.length,
		numImages = cfg.images.length,
		slideshow = numImages > 1
	;
	
	var techApplied = false;
	if (cfg.technique) {
		for (i = 0; i < numTechniques; ++i) {
			var t = techniques[i];
			if (t.name == cfg.technique) {
				if (t.isApplicable()) {
					t.apply();
					techApplied = true;
				}
				break;
			}
		}
	}
	if (!techApplied)
		for (i = 0; i < numTechniques; ++i) {
			var t = techniques[i];
			if (t.isApplicable()) {
				t.apply();
				break;
			}
		}
};

function getConfig(args) {
	var
		cfg = {
			images: []
			duration: 10000, // How much time an image is displayed(not counting transition time)
			transition: { // To control the smooth change between images
				effect: 'cross fade',
				duration: 3000 // ms - The time the transition takes to complete
				//easing:
			}
		},
		o = args[1]
	;
	
	// if images is string 0> images= [images];
	if (typeof args[0] === 'object')
		o = args[0];
	else {
		if ($.isString(args[0])
			args[0] = [args[0]];
		if (!o)
			o = {images: args[0]};
		else 
			o.images = args[0];
	}
	
	$.extend(cfg, o);
	
	return cfg;
}

})(jQuery);