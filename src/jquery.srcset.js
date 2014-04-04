/**
* Use as you please.
*/

( function( $, window, document, undefined ) {

	var defaultOpts = {
			autoInit: true
			, updateOnResize: true
		}
		, urlRegEx = /\s*(\S*)+/i
		, heightRegEx = /\d+h/i
		, widthRegEx = /\d+w/i
		, dpiRegEx = /([\d\.]+)x\b/i

	// Allow users to set options without initializing plugin:
	// $.srcset[ "option" ] = x
	$.srcset = $.extend( defaultOpts, $.srcset || {} )
	

	function getSrcSetOptions( srcset ) {
		return {
			url 	: urlRegEx.exec( srcset ) 				? urlRegEx.exec( srcset )[ 1 ] 					: undefined
			, w 	: widthRegEx.exec( srcset )				? parseInt( widthRegEx.exec( srcset )[ 0 ] ) 	: Infinity
			, h 	: heightRegEx.exec( srcset ) 			? parseInt( heightRegEx.exec( srcset )[ 0 ] )	: Infinity
			, dpi 	: parseFloat( dpiRegEx.exec( srcset )	? dpiRegEx.exec( srcset )[ 1 ] 					: 1 )
		}
	}



	function setSrc( img ) {
		var srcsetdata = img.data( 'srcset' )
			, srcsets = srcsetdata.split( "," )
			, data = [];

		for( var i = 0; i < srcsets.length; i++ ) {

			var parsed = getSrcSetOptions( srcsets[ i ] );

			// No url provided
			if( !parsed.url ) {
				continue;
			}

			data.push( parsed );
		}


		// No valid data 
		if( data.length === 0 ) {
			console.log( "Couldn't parse srcset data for %o", img );
			return false;
		}


		img.data( 'srcset-sizes', data );

		return data;

	}



	function updateSrc( img ) {

		if( !img.data( 'srcset-sizes' ) ) {
			console.log( "img %o has no data", img );
			return;
		}


		var h 		= $( window ).height()
			, w 	= $( window ).width()
			, dpi 	= window.devicePixelRatio || 1;

		// Get closest match 
		var data = img.data( 'srcset-sizes' );

		// Filter data: remove all srcsets that are too small in height or width
		filteredData = $.grep( data, function( el, idx ) { 
			return ( el.w >= w && el.h >= h && el.dpi >= dpi );
		} );


		var best = {
			data 	: undefined
			, diff 	: Infinity
		}

		// One entry
		if( filteredData.length === 1 ) {
			best.data = filteredData[ 0 ];
		}


		// No data is left after filtering – take best guess
		// Don't just take the biggest image – when no image was available because of dpi (2x dpi screen, 1x dpi images),
		// take the one that is just a little bigger than the screen * screenDPI
		if( filteredData.length === 0 ) {

			// Take src who's width and height is closest to window: diff should be negative, but only slightly

			data

				// Calculate diff between window and srcset attributes
				.map( function( e, i ) {
					var wDiff 	= w - e.w === -Infinity ? 0 : w * dpi - e.w
						, hDiff	= h - e.h === -Infinity ? 0 : h * dpi - e.h;
					e.diff = wDiff + hDiff;
					return e;
				} )

				// Highest diff first
				.sort( function( a, b ) {
					return a.diff < b.diff
				} )

				// Go through data, halt on first that's diff is < 0 or last one
				.forEach( function( val, idx ) {

					// best is already < 0: stop
					if( best.data && best.data.diff <= 0 ) {
						return;
					}

					best.data = val;

				} );

		}

		// Too much data
		else {
				
			for( var i = 0; i < filteredData.length; i++ ) {
				
				var wDiff = filteredData[ i ].w - w === Infinity ? 0 : filteredData[ i ].w * dpi - w
					hDiff = filteredData[ i ].h - h === Infinity ? 0 : filteredData[ i ].h * dpi - h;

				var diff = wDiff + hDiff;

				if( diff < best.diff ) {
					best.diff = diff;
					best.data = filteredData[ i ];
				}


			}	

		}
		


		data = best.data;

		if( !data || !data.url ) {
			console.log( "no src found for %o", img );
			return;
		}

		img.trigger( "beforeSrcReplace" );

		img.attr( 'src', img.data( 'srcset-base' ) + data.url + img.data( 'srcset-ext' ) );

		img.trigger( "load" );
		img.trigger( "srcReplaced" );



	}
	



	$.fn.srcset = function( opts ) {

		options = $.extend( $.srcset, opts );
	
		$( this ).each( function() {
			setSrc( $( this ) );
			updateSrc( $( this ) );
		} );


		// Update src on resize?
		$( window ).resize( function() {
			
			if( !options.updateOnResize ) {
				return;
			}

			$( this ).each( function() {
				updateSrc( $( this ) );
			} );

		}.bind( this ) );

	}



	
	$( function() {
		if( $.srcset.autoInit ) {
			$( "img[data-srcset]" ).srcset();
		}
	} );


} )( window.jQuery, window, document );