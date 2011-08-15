(function($) {
$.fullPgBgImg = function(image, usrCfg) {
	var
		cfg = {
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
						img,
						wnd = $(window),
						aspectRatio,
						imgStyle
					;
					
					wnd.resize(function() {
						var 
							wndWidth = wnd.width(),
							wndHeight = wnd.height()
						;
						if (aspectRatio < wndWidth / wndHeight) {
							img.width = wndWidth;
							img.height = wndWidth / aspectRatio;
							imgStyle.top = (wndHeight - img.height)/2 + 'px';
							imgStyle.left = '0px';
						}
						else {
							img.height = wndHeight;
							img.width = wndHeight * aspectRatio;
							imgStyle.left = (wndWidth - img.width)/2 + 'px';
							imgStyle.top = '0px';
						}
					});
					
					img = new Image();
					imgStyle = img.style;
					imgStyle.position = 'fixed';
					imgStyle.zIndex = -9999;
					imgStyle.top = '0px';
					imgStyle.left = '0px';
					imgStyle.display = 'none';
					img.onload = function() {
						aspectRatio = this.width / this.height;
						wnd.resize();
						$(this).appendTo('body').fadeIn(2000);
					};
					img.src = cfg.image;
				}
			}
		],
		numTechniques = techniques.length
	;
	
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