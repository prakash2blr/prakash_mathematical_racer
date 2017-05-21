(function($){

    $.preload = (function(sources, part, callback){

        // Plugin cache
        var cache = [];

        // Wrapper for cache
        var caching = function(image){

            for (var i = 0; i < cache.length; i++) {
                if (cache[i].src === image.src) {
                    return cache[i];
                }
            }

            cache.push(image);
            return image;

        };

        // Execute callback
        var exec = function(sources, callback, last){

            if (typeof callback === 'function') {
                callback.call(sources, last);
            }

        };

        // Closure to hide cache
        return function(sources, part, callback){

            // Check input data
            if (typeof sources === 'undefined') {
                return;
            }

            if (typeof sources === 'string') {
                sources = [sources];
            }

            if (arguments.length === 2 && typeof part === 'function') {
                callback = part;
                part = 0;
            }

            // Split to pieces
            var total = sources.length,
                next;

            if (part > 0 && part < total) {

                next = sources.slice(part, total);
                sources = sources.slice(0, part);

                total = sources.length;

            }

            // If sources array is empty
            if (!total) {
                exec(sources, callback, true);
                return;
            }

            // Image loading callback
            var preload = arguments.callee,
                count = 0;

            var loaded = function(){

                count++;

                if (count !== total) {
                    return;
                }

                exec(sources, callback, !next);
                preload(next, part, callback);

            };

            // Loop sources to preload
            var image;

            for (var i = 0; i < sources.length; i++) {

                image = new Image();
                image.src = sources[i];

                image = caching(image);

                if (image.complete) {
                    loaded();
                } else {
                    $(image).on('load error', loaded);
                }

            }

        };

    })();

    // Get URLs from DOM elements
    var getSources = function(items){

        var sources = [],
            reg = new RegExp('url\\([\'"]?([^"\'\)]*)[\'"]?\\)', 'i'),
            bgs, bg, url, i;

        items = items.find('*').add(items);

        items.each(function(){

            bgs = $(this).css('backgroundImage');
            bgs = bgs.split(', ');

            for (i = 0; i < bgs.length; i++) {

                bg = bgs[i];

                if (bg.indexOf('about:blank') !== -1 ||
                    bg.indexOf('data:image') !== -1) {
                    continue;
                }

                url = reg.exec(bg);

                if (url) {
                    sources.push(url[1]);
                }

            }

            if (this.nodeName === 'IMG') {
                sources.push(this.src);
            }

        });

        return sources;

    };

    $.fn.preload = function(callback){

        var items = this,
            sources = getSources(items);

        $.preload(sources, function(){

            if (typeof callback === 'function') {
                callback.call(items.get());
            }

        });

        return this;

    };

})(jQuery);