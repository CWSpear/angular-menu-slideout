angular.module('MenuSlideout', ['ngTouch'])
.directive('menuSlideout', ['$swipe', '$document', '$rootScope', function ($swipe, $document, $rootScope) {
    return {
        restrict: 'A',
        link: function (scope, $elem, attrs) {
            var startCoords, dir, endCoords, lastCoords,

                // how far horizontally do I need to move
                // before we do anything?
                tolerance = 10,

                // just keeping trying of if we met the tolerance
                toleranceMet = false,

                // if we slide this far in a particular
                // direction, we ignore the direction
                slideTolerance = 100,

                // we toggle transitionClass cuz we don't want to 
                // transition while we're actually dragging
                transitionClass = 'menu-slideout-transition',
                openClass = 'menu-slideout-open',

                // TODO: make the menu open all but X pixels of window
                // var menuWidth = $document[0].width - 74;
                // angular.element(document).find('head').append('<style type="text/css">@charset "UTF-8";.slider.open{-webkit-transform: translate3d(' + menuWidth + 'px, 0, 0);</style>');
                menuWidth = 230,

                // adapted from http://davidwalsh.name/vendor-prefix
                prefix = (function () {
                    var styles = window.getComputedStyle(document.documentElement, ''),
                        pre = (Array.prototype.slice
                            .call(styles)
                            .join('') 
                            .match(/-(moz|webkit|ms)-/) || (styles.OLink === '' && ['', 'o'])
                        )[1];
                    return '-' + pre + '-';
                })();

            $swipe.bind($elem, {
                start: function (coords, event) {
                    toleranceMet = false;
                    startCoords = angular.copy(lastCoords = coords);
                },
                end: function (coords, event) {
                    endCoords = coords;

                    $elem.removeAttr('style').addClass(transitionClass);
                    if(!toleranceMet) return;

                    // if we slide more than slideTolerance pixels
                    // in a particular direction, then we override dir
                    if(coords.x - startCoords.x > slideTolerance) dir = 'right';
                    if(coords.x - startCoords.x < (-1 * slideTolerance)) dir = 'left';

                    if(dir == 'right') $elem.addClass(openClass);
                    else $elem.removeClass(openClass);

                    $rootScope.$broadcast('slideMenuToggled', dir == 'right');
                },
                move: function (coords, event) {
                    // set a tolerance before we kick in sliding
                    // (Angular does this to an extent, also, I believe)
                    if(!toleranceMet && Math.abs(startCoords.x - coords.x) < tolerance) return;
                    dir = lastCoords.x < coords.x ? 'right' : 'left';
                    $elem.removeClass(transitionClass);

                    // restrict x to be between 0 and menuWidth
                    var x = coords.x - startCoords.x + ($elem.hasClass(openClass) ? menuWidth : 0);
                    x = Math.max(0, Math.min(menuWidth, x));

                    // translate3d is WAY more performant than left
                    // thanks to GPU acceleration (especially
                    // noticeable on slower, mobile devices)
                    var props = {};
                    props[prefix + 'transform'] = 'translate3d(' + x + 'px, 0, 0)';
                    $elem.css(props);

                    lastCoords = coords;
                    toleranceMet = true;
                },
                cancel: function (coords, event) {
                    $elem.addClass(transitionClass);
                    $elem.removeAttr('style');

                    angular.element(document.querySelector('.slider')).append('Cancel ');
                }
            });

            $rootScope.$on('toggleSlideMenu', function(event, isOpen) {
                $elem.toggleClass(openClass, isOpen);
            });
        }
    };
}]);