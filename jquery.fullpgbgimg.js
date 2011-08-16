(function($) {
$.fullPgBgImg = function(image, usrCfg) {
	var
		cfg = {
			duration: 10000, // How much time an image is displayed(not counting transition time)
			transition: { // To control the smooth change between images
				effect: 'cross fade',
				duration: 3000 // ms - The time the transition takes to complete
				//easing:
			}
		},
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
						wnd = $(window),
						aspectRatio,
						visibleImg = 0
					;
					
					wnd.resize(function() {
						var 
							wndWidth = wnd.width(),
							wndHeight = wnd.height(),
							im = img[visibleImg].get(0),
							style = im.style
						;
						if (aspectRatio < wndWidth / wndHeight) {
							im.width = wndWidth;
							im.height = wndWidth / aspectRatio;
							style.top = (wndHeight - img.height)/2 + 'px';
							style.left = '0px';
						}
						else {
							im = wndHeight;
							im = wndHeight * aspectRatio;
							style.left = (wndWidth - img.width)/2 + 'px';
							style.top = '0px';
						}
					});
				
					// The front image
					im = new Image();
					imgStyle = im.style;
					imgStyle.position = 'fixed';
					imgStyle.zIndex = -9999;
					imgStyle.top = '0px';
					imgStyle.left = '0px';
					imgStyle.display = 'none';
					im.onload = function() {
						aspectRatio = this.width / this.height;
						wnd.resize();
						$(this).appendTo('body').fadeIn(2000);
					};
					img.src = cfg.images[0];
					
					img.push($(im));
					
					if (slideshow) {
						img1 = new Image();
						imgStyle = img1.style;
						imgStyle.position = 'fixed';
						imgStyle.zIndex = -10000;
						imgStyle.top = '0px';
						imgStyle.left = '0px';
						imgStyle.display = 'none';
						$(img1).appendTo('body');
						img1.src = cfg.image[1];
						
						img.push($(img1));
						
						visibleImg = 0;
						nextImage = 1;
						
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
		numTechniques = techniques.length
	;
	
	// TODO: image ->images
	// if images is string 0> images= [images];
	// Parameters juggling
	if (typeof image === 'object')
		usrCfg = image;
	else if (typeof image === 'string')
		if (!usrCfg)
			usrCfg = {image: image};
		else 
			usrCfg.image = image;
	$.extend(cfg, usrCfg);
	
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
})(jQuery);