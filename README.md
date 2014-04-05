srcset
======

Small srcset Plugin for jQuery. Replaces your images' src attribute with the srcset URL matching your media selection. If no image matches your media selectors, the best guess is taken (sizes closest to the current viewport). 

See http://www.w3.org/html/wg/drafts/srcset/w3c-srcset/

## Installation

Download the library [manually](https://github.com/joinbox/srcset) or through bower: 

```bash
$ bower install jquery-srcset
```

## Use

An image

```html
<img alt="A brown bear"
     data-srcset-base="http://joinbox.com/img/"
     data-srcset="bb-1920 1920w, bb-1200 1200w, bb-hd 1600w 2x"
     data-srcset-ext=".jpg" />
```

on a screen 1500px wide and with 1x device pixel wide becomes

```html
<img alt="A brown bear"
     src="http://joinbox.com/img/bb-1920.jpg"
     data-srcset … />
```

## Configuration

# Options
Currently there are only two options available: 

```javascript
{
	autoInit 		: true
	updateOnResize	: true
}
```

Both are true by default. 

`autoInit`: If true, all src attributes of images that have an attribute called data-srcset will be updated.

`updateOnResize`: Image size will be adjusted when browser window is resized.

# Set globally

Set options globally before loading srcset plugin (this is the only way to prevent autoInit):

```javascript
 	$.srcset = $.extend( { autoInit: false } );
```

# Set image based

Set options when calling the plugin in an image: 

```javascript
	$( "#company-logo" ).srcset( { updateOnResize: false } );
```

## Events

Before an image is replaced, `beforeSrcReplace` is fired. After image has been replaced, `load` and `srcReplaced` are fired.