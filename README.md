# polymerts-doc-generator

This is a node module for parsing a TypeScript file (PolymerTS) and generating an _empty_ documentation file (i.e. no code, only signatures) compatible with Polymer 1.0 to pass to iron-component-page for documentation.

## Background Info

Since [Red Pill Now](http://redpillnow.com) changed our process to use TypeScript for components we lost the auto-generated documentation feature for our components. This node module attempts to restore that feature.

While we understand that the format generated here is for Polymer 1.0. Once we move to Polymer 2.0 we will need to revisit all the models to change how they are rendered. This should not be a big undertaking.

## Setup

First, make sure you have [Node.js](https://nodejs.org/) installed, so we can use the Node package maanger (NPM). Next install the other key tools:

* [Gulp](http://gulpjs.com/) - build
* [TypeScript](http://www.typescriptlang.org/) - TypeScript Compiler

## Install

Unfortunately this is not yet published to the NPM library so will have to figure out how to install from a repository until then

```bash
npm install ???
```

## Usage

```js
var polymerTsDoc = require('polymerts-doc-generator');
/**
 * @param {string} pathToTsFile - The path to the file we want to parse
 * @param {string} pathToDocFile - The directory where we want to put our documentation files
 */
var newDocFile = polymerTsDoc.start(pathToTsFile, pathToDocFile);
```

This will parse the pathToTsFile and generate the _empty_ documentation file at the path of the pathToDocFile. The file name generated will be doc_original-file-name.html.

The generated file will be suitable for passing to an iron-component-page element.

## Developing

Clone the project to your local environment and run:

```bash
npm install
```

This project is written in typescript. There is a `compile` script which just runs `tsc` on the src directory. This will generate .js files in the respective src directories which you can then test/debug.

## Supported Patterns

In order for this tool to work, there are certain patterns you need to be aware of. Since this project uses the TypeScript compiler to determine all the information about a code block it is fairly accurate and lenient in it's pattern recognition. If it compiles then theoretically this tool should be able to parse it.

### Component

This is the uppermost class. All other _parts_ are stored inside the component. Once all the different _parts_ are collected they are rendered.

```typescript
@component('my-component')
export class MyComponent extends polymer.Base {...}
```

The above component definition will be converted to:

```html
<!--
This is my cool component

@demo demo/index.html
@hero path/to/hero.png
-->
<dom-module id="my-component">
	<template>
		<style></style>
	</template>
	<script>
(function() {
	Polymer({
		is: 'my-component',
		behaviors: [...],
		properties: {...},
		observers: [...],
		listeners: {...},
		...
	});
})();
	</script>
</dom-module>
```

### HTML Comments

The presence of an `@demo` or `@hero` tag encountered in a comment block of the HTML File will determine which _comment_ block will be deemed **the** comment block to use. All other comment blocks will be ignored.

```html
<link rel="import" href="../polymer/polymer.html">
<link rel="import" href="../polymer-ts/polymer-ts.html">
<!-- This comment will be ignored because it is missing the appropriate tag(s) -->
<!--
This is my element's style and example usage documentation

@demo demo/index.html
-->
<dom-module id="my-component">
	<template>
		<style>
			...
		</style>
		...
	</template>
</dom-module>
```

### Properties



```typescript
@property({type: Boolean, reflectToAttribute: true})
propertyName: boolean;

// OR

@property({
	type: Boolean,
	reflectToAttribute: true
})
propertyName: boolean;
```

The above will be transformed to:

```javascript
/**
 * @type {boolean}
 */
propertyName: {
	type: Boolean,
	reflectToAttribute: true
}
```

### Behaviors

Behaviors will be added to a behaviors array.

```typescript
@component('my-component')
@behavior(Polymer['AppLocalizeBehavior']);
export class MyComponent extends polymer.Base {...}

// OR

@component('my-component')
@behavior(Polymer.AppLocalizeBehavior);
export class MyComponent extends polymer.Base {...}
```

The above would be transformed to an array and placed in the component structure:

```javascript
is: 'my-component',
behaviors: [
	Polymer['AppLocalizeBehavior'],
	Polymer.AppLocalizeBehavior
],
...
```

### Observers

If an observer has only 1 parameter defined, that property will need to be defined as a @property. We will add an observer definition to that @property definition

```typescript
@observe('propertyName')
_onPropertyName(propertyName) {...}

// OR

@observe('propertyName,otherPropertyName')
_onPropertyName(propertyName, otherPropertyName) {...}
```

The above will be transformed to:

```javascript
propertyName: {
	type: Boolean,
	reflectToAttribute: true,
	observer: '_onPropertyName'
}
_onPropertyName(propertyName) {...}

// OR

observers: [
	'_onPropertyName(propertyName,otherPropertyName)'
],
_onPropertyName(propertyName,otherPropertyName) {...}
```

### Computed Property

A new property will be created pointing to the `propertyName` method.

```typescript
@computed('someOtherProp')
propertyName(someOtherProp) {...}
```

The above computed property will be transformed to:

```javascript
propertyName: {
	type: Object,
	computed: 'propertyName(someOtherProp)'
}
propertyName(someOtherProp) {...}
```

### Listener

```typescript
@listener('someElementId.some-event')
_onSomeEvent(evt: CustomEvent) {...}

// OR

@listener(SomeNameSpace.SOME_EVENT)
_onSomeEvent(evt: CustomEvent) {...}
```

The above Listener will be transformed to:

```javascript
listeners: {
	'SomeNameSpace.SOME_EVENT': '_onSomeEvent',
	'someElementId.some-event': '_onSomeEvent'
}
/**
 *
 * @listens SomeNameSpace.SOME_EVENT
 * @listens #someElementId.some-event
 */
_onSomeEvent(evt: CustomEvent) {...}
```

### Function

```typescript
someFunction(arg1, arg2) {...}
```

## Project Structure

.
* polymerts-doc-generator
 	* dist/
	 	* lib/
		 	* utils.js
		* models/
			* behavior.js
			* comment.js
			* component.js
			* computed.js
			* function.js
			* html-comment.js
			* listener.js
			* observer.js
			* program-part.js
			* property.js
		* index.js
	* src/
		* data/ _component files for development/testing purposes_
		* docs/ _development/testing generated doc files_
		* lib/
			* utils.ts
		* models/
			* behavior.ts
			* comment.ts
			* component.ts
			* computed.ts
			* function.ts
			* html-comment.ts
			* listener.ts
			* observer.ts
			* program-part.ts
			* property.ts
		* index.ts
	* .gitignore
	* gulpfile.js
	* package-lock.json
	* package.json
	* README.md
	* tsconfig.json


***
## Future Directions

After some conversations with the team this may be a good starting point for converting a PolymerTS/Polymer 1.x component to a PolmerTS/Polymer 2.x component. Also, converting to Polymer 2.0 should not be that big of a leap. We will just need to change the toMarkup of the models as long as the future PolymerTS 2.x maintains a similar structure.
