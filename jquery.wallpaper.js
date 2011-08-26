/**
 * jQuery Wallpaper
 *
 * http://mgiulio.altervista.org
 *
 * See license.txt
 */
 
(function($) {

$.wallpaper = function() {
	var
		cfg = getConfig(arguments),
		numImages = cfg.images.length,
		slideshow = numImages > 1
	;
	
	if (!slideshow && canUseCSS3()) {
		$('html').css({
			'background-image': 'url(' + cfg.images[0] + ')',
			'background-attachment': 'fixed',
			'background-position': 'center center',
			'background-repeat': 'no-repeat',
			'background-size': 'cover'
		});
	}
	else
		initSlideshow();
		
	function getConfig(args) {
		var
			cfg = { // All time are expressed in milliseconds
				images: [],
				imageDuration: 5000, // How much time an image is displayed(not counting transition time)
				transitionDuration: 7000, // The time the transition takes to complete
				firstImageFadeInDuration: 1000
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

	function canUseCSS3() {
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
	}

	function initSlideshow() {
		var
			dblBuff = [],
			imgMetadata = [],
			wnd = $(window),
			visibleBuff,
			currImage, // The index of the image currently displayed by the slideshow
			transitionPlaying,
			i
		;
		
		for (i = 0; i < numImages; ++i) {
			imgMetadata.push({
				url: cfg.images[i], 
				loaded: false,
				aspectRatio: undefined
			});
		}

		$(document).bind('imageLoaded', function(e, /*$*/img) {
			var 
				i = $(img).data('imageIndex');
			imgMetadata[i].loaded = true;
			imgMetadata[i].aspectRatio = img.width / img.height;
		});
		
		createDoubleBuffer(slideshow);
		
		if (slideshow)
			$(document).one('readyToStartSlideshow', function() {
				window.setTimeout(function f() {
					var 
						nextImage = currImage
					;
					
					// Find the next available image
					do {
						nextImage = (nextImage + 1) % numImages;
					} while (!imgMetadata[nextImage].loaded && nextImage != currImage)
					
					if (nextImage == currImage) {
						window.setTimeout(f, cfg.imageDuration);
						return;
					}
					
					// Setup the next image in the hidden buffer
					dblBuff[1-visibleBuff].img.src = imgMetadata[nextImage].url;
					dblBuff[1-visibleBuff].imageIndex = nextImage;
					stretchImage(dblBuff[1-visibleBuff].img, imgMetadata[nextImage].aspectRatio);
					
					// Fire the transition
					transitionPlaying = true;
					$.when(
						$(dblBuff[visibleBuff].img).fadeOut(cfg.transitionDuration),
						$(dblBuff[1-visibleBuff].img).fadeIn(cfg.transitionDuration)
					).done(function() {
						transitionPlaying = false;
						visibleBuff = 1 - visibleBuff;
						currImage = nextImage;
						window.setTimeout(f, cfg.imageDuration);
					});
				}, cfg.imageDuration);
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
			for (var i = 0; i < numImages; i++)
				$('<img>')
					.data('imageIndex', i)
					.load(function() {
						$(document).trigger('imageLoaded', this/* [$(this)] */);
					})
					.attr('src', cfg.images[i])
				;
		}
		
		function createDoubleBuffer(dbl) {
			var
				im = new Image(),
				imStyle = im.style
			;
			
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
			
			$(document).one('imageLoaded', function(e, /*$*/img) {
				var 
					$img = $(img),
					im = dblBuff[0].img,
					imageIndex = $img.data('imageIndex')
				;
				im.src = imgMetadata[imageIndex].url;
				
				stretchImage(im, imgMetadata[imageIndex].aspectRatio);
				
				visibleBuff = 0;
				currImage = imageIndex;
				
				$(im).fadeIn(cfg.firstImageFadeInDuration, function() {
					$(document).trigger('readyToStartSlideshow');
				});
				
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
};

})(jQuery);