/**
* Use as you please.
*/

( function( $, window, document, undefined ) {

	var defaultOpts = {
			autoInit			: true
			, updateOnResize	: true
		}
		, heightRegEx = /\d+h/i
		, widthRegEx = /\d+w/i
		, dpiRegEx = /([\d\.]+)x\b/i;

	// Allow users to set options without initializing plugin:
	$.srcset = $.extend( defaultOpts, $.srcset || {} );
	
	function getSrcSetOptions( srcsetData ) {
		return {
			url 	: srcsetData.split( " " ).length > 0 		? srcsetData.split( " " )[ 0 ] 						: undefined // The use of the regex /\s*(\S*)+/i breaks compatibility with IE8 (see Issue # 1)
			, w 	: widthRegEx.test( srcsetData )				? parseInt( widthRegEx.exec( srcsetData )[ 0 ] ) 	: Infinity
			, h 	: heightRegEx.test( srcsetData ) 			? parseInt( heightRegEx.exec( srcsetData )[ 0 ] )	: Infinity
			, dpi 	: parseFloat( dpiRegEx.test( srcsetData )	? dpiRegEx.exec( srcsetData )[ 1 ] 					: 1 )
		};
	}



	function setSrc( img ) {

		var srcsetdata = img.data( 'srcset' )
			, srcsets = srcsetdata.split( "," )
			, data = [];

		for( var i = 0; i < srcsets.length; i++ ) {

			// trim whitespaces
			var parsed = getSrcSetOptions( srcsets[ i ].replace( /^\s*|\s*$/gi, '' ) );

			// No url provided
			if( !parsed.url ) {
				console.log( "Couldn't parse URL; got %o", parsed );
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
		};

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
					return a.diff < b.diff;
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
				
				var   wDiff = filteredData[ i ].w - w === Infinity ? 0 : filteredData[ i ].w * dpi - w
					, hDiff = filteredData[ i ].h - h === Infinity ? 0 : filteredData[ i ].h * dpi - h;

				var diff = wDiff + hDiff;

				if( diff < best.diff ) {
					best.diff = diff;
					best.data = filteredData[ i ];
				}


			}	

		}
		


		data = best.data;

		if( !data || !data.url ) {
			console.log( "No src found for %o", img );
			return;
		}

		var imageUrl = ( img.data( 'srcset-base' ) || "" ) + data.url + ( img.data( 'srcset-ext' ) || "" );

		// Image src doesn't change: Ne need to update src or fire events
		if( img.attr( 'src' ) === imageUrl ) {
			return;
		}


		img.trigger( "beforeSrcReplace" );

		// Update image source with new URL
		img.attr( 'src', imageUrl );

		img.trigger( "srcReplaced" );



	}
	



	$.fn.srcset = function( opts ) {

		// Use empty object as first argument or we will be changing $.srcset
		options = $.extend( {}, $.srcset, opts || {} );
	
		$( this ).each( function() {
			setSrc( $( this ) );
			updateSrc( $( this ) );
		} );

		if( options.updateOnResize ) {

			// Update src on resize?
			$( window ).on( 'resize', function() {

				$( this ).each( function() {
					updateSrc( $( this ) );
				} );

			}.bind( this ) );
			$( window );

		}

	};



	
	$( function() {
		if( $.srcset.autoInit ) {
			$( "img[data-srcset]" ).srcset();
		}
	} );


} )( window.jQuery, window, document );