/**
* Angular directive (wrapper) for the jQuery plugin srcset
*/

( function() {

	'use strict';

	angular
	.module( 'jb.srcset', [] )
	.directive( 'srcset', [ function() {

		var link = function( scope, el, attrs ) {
			
			// Get options from attributes
			el.srcset();

		};

		return {
			link: link
		};

	} ] );

}() );