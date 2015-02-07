/**
 * Triggers callback on jquery selection set when scrolling into view
 * Author: msteitle@underarmour.com
 */

;(function($) {
    var callback_queue = [],
        element_queue = [],
        timeout_id,
        timeout_interval = 200,
        initialized = false,

        api = {
            init: function() {
                if (initialized) {
                    return;
                }

                $(window).on('DOMContentLoaded load resize scroll', function (event) {
                    window.clearTimeout(timeout_id);

                    timeout_id = window.setTimeout(function () {
                        $.each(callback_queue, function(i, callback) {
                            callback(event);
                        });
                    }, timeout_interval);
                });

                initialized = true;
            },

            isElementInViewport: function (el) {
                var rect = el.getBoundingClientRect();

                return (
                    rect.top >= 0 &&
                    rect.left >= 0 &&
                    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) && /*or $(window).height() */
                    rect.right <= (window.innerWidth || document.documentElement.clientWidth) /*or $(window).width() */
                );
            },

            wrapCallback: function (el, fn) {
                return function (event) {
                    if (api.isElementInViewport(el)) {
                        fn(event);
                    }
                };
            },

            on: function (el, callback) {
                api.off(el);

                callback_queue.push(api.wrapCallback(el, callback));
                element_queue.push(el);
            },

            off: function (el) {
                var i = element_queue.indexOf(el);

                i > -1 && element_queue.splice(i, 1) && callback_queue.splice(i, 1);
            }
        },

        action_map = {
            'off': api.off,
            'on': api.on
        };

    $.fn.extend({
        /**
         * @param {String} action [OPTIONAL ]Action to execute other than 'on'. Valid actions: ['off']
         * @param {Function} callback Function to execute when item has scrolled into view
         */
        scrollIntoView: function (action, callback, options) {
            var el = this.get(0),
                args = Array.prototype.slice.call(arguments, typeof action === 'string' ? [1] : [0]);

            if (!el) {
                return;
            }

            // add plain DOM element
            args.unshift(this.get(0));

            action = typeof action === 'string' && action_map.hasOwnProperty(action) ? action : 'on';

            api.init();

            action_map[action].apply(this, args);

            return this;
        }
    });
}).call(this, jQuery);