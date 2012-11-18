(function($) {
	var loadingGif = 'https://lh3.googleusercontent.com/-FiCzyOK4Mew/T4aAj2uVJKI/AAAAAAAAPaY/x23tjGIH7ls/s32/ajax-loader.gif',
		olderPostsLink = '',
		loadMoreDiv = null,
		postContainerSelector = 'div.blog-posts',
		loading = false,
		// Cache
		$win = $(window),
		$doc = $(document),
		// This two variables are set when init is fired
		blogPager,
		postContainer,
		// Took from jQuery to avoid permission denied error in IE
		rscript = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi;

	function getDocumentSize() {
		return Math.max( $win.height(), $doc.height(), document.documentElement.clientHeight );
	}

	function loadDisqusScript(domain) {
		$.getScript('http://' + domain + '.disqus.com/blogger_index.js');
	}

	function loadMore() {
		if (loading) {
			return;
		}

		loading = true;

		if ( !olderPostsLink ) {
			loadMoreDiv.hide();
			return;
		}

		loadMoreDiv.find('a').hide().end().find('img').show();

		// Since we can't use the feed to generate data cause we'd need a template, we'll use your method ;)
		// I still think it's not the ideal way to do it, but is the easiest one (you don't need to edit your template)
		$.ajax(olderPostsLink, {
			dataType: "html"
		}).done(function(html) {
			var newDom = $('<div>').append(html.replace(rscript, "")),
				newLink = newDom.find('a.blog-pager-older-link'),
				newPosts = newDom.find(postContainerSelector).children();
		
			// show posts
			postContainer.append(newPosts);

			// removing the div should give us a little increase on performance
			newDom.remove();
			// Loaded more posts successfully.  Register this pageview with
			// Google Analytics.
			if (window._gaq) {
				window._gaq.push(['_trackPageview', olderPostsLink]);
			}

			if (newLink) {
				olderPostsLink = newLink.attr('href');
			} else {
				olderPostsLink = '';
				loadMoreDiv.hide();
			}

			// Render +1 buttons.
			if (window.gapi && window.gapi.plusone && window.gapi.plusone.go) {
				window.gapi.plusone.go();
			}
			// Render Disqus comments.
			if (window.disqus_shortname) {
				loadDisqusScript(window.disqus_shortname);
			}

			// Render Facebook buttons.
			if (window.FB && window.FB.XFBML && window.FB.XFBML.parse) {
				window.FB.XFBML.parse();
			}

			loadMoreDiv.find('img').hide().end().find('a').show();
			loading = false;
		});
	}

	function handleScroll() {
		var height = getDocumentSize(),
			pos = $win.scrollTop() + $win.height();
		if (height - pos < 150) {
			loadMore();
		}
	}

	function init() {
		if (_WidgetManager._GetAllData().blog.pageType == 'item') {
			return;
		}

		// Cache elements
		blogPager = $('#blog-pager'):
		postContainer = $(postContainerSelector);

		olderPostsLink = $('a.blog-pager-older-link').attr('href');

		if (!olderPostsLink) {
			return;
		}

		var link = $('<a>', {
			href: "javascript:;",
			html: "Load more posts",
			click: loadMore
		}),
		img = $('<img>', {
			'src': loadingGif
		}).hide();

		$win.scroll(handleScroll);

		loadMoreDiv = $('<div>', {
			'class': 'load-more'
		});

		// jQuery's method chaining is awesome!
		loadMoreDiv.append(link).append(img).insertBefore(blogPager.hide());
	}

	$(document).ready(init);

})(jQuery); // SandBoxing (avoid conflicts with Prototype or other libraries)