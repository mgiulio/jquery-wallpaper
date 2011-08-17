(function($) {
$.fullPgBgImg = function() {
	var
		cfg = getConfig(arguments),
		i, n,
		techniques = [
			{
				name: 'CSS3',
				isApplicable: function() {
					if (typeof Modernizr !== 'undefined')
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
						'background-image': 'url(' + cfg.images[0] + ')',
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
					
					wnd.resize(stretchImage);
				
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
					img.push($(im));
					im.src = cfg.images[0];
					
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
						img.push($(im));
						
						visibleImg = 0;
						nextImage = 0;
						
						window.setTimeout(function f() {
							var nextImageUrl = cfg.images[i = (i+1) % numImages];
							
							stretchImage(1-visibleImg);
							
							$.when(
								img[visibleImg].fadeOut(cfg.transition.duration),
								img[1-visibleImg].fadeIn(cfg.transition.duration)
							).done(function() {
								img[visibleImg].attr('src', nextImageUrl);
								visibleImg = 1 - visibleImg;
								window.setTimeout(f, cfg.duration);
							});
						}, cfg.duration);
					}
					
					function stretchImage(i) {
						var 
							wndWidth = wnd.width(),
							wndHeight = wnd.height(),
							im = img[(typeof i !== 'undefined') ? i : visibleImg].get(0),
							imStyle = im.style,
							aspectRatio = im.width / img.height
						;
						
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
					}
				}
			}
		],
		numTechniques = techniques.length,
		numImages = cfg.images.length,
		slideshow = numImages > 1,
		techApplied = false
	;
	
	if (slideshow)
		cfg.technique = 'jQuery';
		
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
			images: [],
			duration: 10000, // How much time an image is displayed(not counting transition time)
			transition: { // To control the smooth change between images
				effect: 'cross fade',
				duration: 3000 // ms - The time the transition takes to complete
				//easing:
			}
		},
		o
	;
	
	if (typeof args[0] === 'object' && !$.isArray(args[0]))
		o = args[0];
	else {
		if (typeof args[0] === 'string')
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