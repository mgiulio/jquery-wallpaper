(function($) {
$.wallpaper = function() {
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
						dblBuff = [],
						imgMetadata = [],
						wnd = $(window),
						visibleBuff,
						currImage, // The index of the image currently displayed by the slideshow
						transitionPlaying
					;

					createDoubleBuffer(slideshow);
					
					if (slideshow)
						$(document).one('imageLoaded', function() {
							window.setTimeout(function f() {
								var 
									nextImage = currImage
								;
								
								// Find the next available image
								do {
									nextImage = (nextImage + 1) % numImages;
								} while (!imgMetadata[nextImage].loaded && nextImage != currImage)
								
								if (nextImage == currImage) {
									window.setTimeout(f, cfg.duration);
									return;
								}
								
								// Setup the next image in the hidden buffer
								dblBuff[1-visibleBuff].img.src = imgMetadata[nextImage].url;
								dblBuff[1-visibleBuff].imageIndex = nextImage;
								stretchImage(dblBuff[1-visibleBuff].img, imgMetadata[nextImage].aspectRatio);
								
								// Fire the transition
								transitionPlaying = true;
								$.when(
									$(dblBuff[visibleBuff].img).fadeOut(cfg.transition.duration),
									$(dblBuff[1-visibleBuff].img).fadeIn(cfg.transition.duration)
								).done(function() {
									transitionPlaying = false;
									visibleBuff = 1 - visibleBuff;
									currImage = nextImage;
									window.setTimeout(f, cfg.duration);
								});
							}, cfg.duration);
						});
					
					preloadImages();
					
					function stretchImage(img, aspectRatio) {
						var 
							wndWidth = wnd.width(),
							wndHeight = wnd.height(),
							style = img.style
						;
						
						if (aspectRatio < wndWidth / wndHeight) {
							img.width = wndWidth;
							img.height = wndWidth / aspectRatio;
							style.top = (wndHeight - img.height)/2 + 'px';
							style.left = '0px';
						}
						else {
							img.height = wndHeight;
							img.width = wndHeight * aspectRatio;
							style.left = (wndWidth - img.width)/2 + 'px';
							style.top = '0px';
						}
					}
					
					function preloadImages() {
						var 
							img,
							i
						;
						
						for (i = 0; i < numImages; i++) {
							imgMetadata.push({
								url: cfg.images[i], 
								loaded: false,
								aspectRatio: undefined
							});
							
							img = new Image();
							
							img.wallpaperIndex = i;
							img.onload = function() {
								imgMetadata[this.wallpaperIndex].loaded = true;
								imgMetadata[this.wallpaperIndex].aspectRatio = this.width / this.height;
								$(document).trigger('imageLoaded', this.wallpaperIndex);
							};
							
							img.src = cfg.images[i];
						}
					}
					
					function createDoubleBuffer(dbl) {
						var
							im,
							imStyle
						;
						
						im = new Image();
						imStyle = im.style;
						imStyle.position = 'fixed';
						imStyle.zIndex = -9999;
						imStyle.top = '0px';
						imStyle.left = '0px';
						imStyle.display = 'none';
						
						dblBuff.push({
							img: $(im).appendTo('body').hide().get(0),
							imageIndex: undefined
						});
						
						if (dbl) {
							im = new Image();
							imStyle = im.style;
							imStyle.position = 'fixed';
							imStyle.zIndex = -10000;
							imStyle.top = '0px';
							imStyle.left = '0px';
							imStyle.display = 'none';
							
							dblBuff.push({
								img: $(im).appendTo('body').hide().get(0),
								imageIndex: undefined
							});
						}
						
						$(document).one('imageLoaded', function(e, imageIndex) {
							var 
								im = dblBuff[0].img
							;
							
							im.src = imgMetadata[0].url;
							
							stretchImage(im, imgMetadata[0].aspectRatio);
							
							visibleBuff = 0;
							currImage = imageIndex;
							
							$(im).fadeIn(cfg.transition.duration);
							
							wnd.resize(function() {
								// If a transition is playing 
								// we need to stretch both buffers
								if (transitionPlaying) {
									stretchImage(dblBuff[0].img, imgMetadata[dblBuff[0].imageIndex].aspectRatio);
									stretchImage(dblBuff[1].img, imgMetadata[dblBuff[1].imageIndex].aspectRatio);
								}
								else {
									// Stretch only the front(visible) buffer
									stretchImage(dblBuff[visibleBuff].img, imgMetadata[currImage].aspectRatio);
								}
							});
						});
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
		o = args[1]
	;
	
	if (typeof args[0] === 'object' && !$.isArray(args[0])) {
		o = args[0];
		if (typeof o.images === 'string')
			o.images = [o.images];
	}
	else {
		if (typeof args[0] === 'string')
			args[0] = [args[0]];
		if (!o)
			o = {images: args[0]};
		else 
			o.images = args[0];
	}
	
	$.extend(true, cfg, o);
	
	return cfg;
}

})(jQuery);