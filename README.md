# polymerts-doc-generator

This is a node module for parsing a TypeScript file (PolymerTS) and generating an _empty_ documentation file (i.e. no code, only signatures) compatible with Polymer 1.0 to pass to iron-component-page for documentation.

## Background Info

Since Red Pill Now changed our process to use TypeScript for components we lost the auto-generated documentation feature for our components. This node module attempts to restore that feature.

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
var rpd = require('polymerts-doc-generator');
/**
 * @param {string} pathToTsFile - The path to the file we want to parse
 * @param {string} pathToDocFile - The directory where we want to put our documentation files
 */
var newDocFile = rpd.start(pathToTsFile, pathToDocFile);
```

This will parse the pathToTsFile and generate the _empty_ documentation file at the path of the pathToDocFile. The file name generated will be doc_original-file-name.ts.html.

The generated file will be suitable for passing to an iron-component-page element.

## Developing

Clone the project to your local environment and run:

```bash
npm install
```

This project is written in typescript. There is a `compile` script which just runs `tsc` on the src directory. This will generate .js files in the respective src directories which you can then test/debug.

## Structure

The `lib` directory contains a utils.ts file which provides some common utilities. The `models` directory which contains all the models for the parts of a PolymerTS component (i.e. Comment, Listener, Property, etc.). index.ts in the src directory provides the entry point into the tool. For testing purposes only we have the `data` and `docs` directories which is where _docs_ will be written to and _data_ contains some elements for testing purposes.

## Future Directions

After some conversations with the team this may be a good starting point for converting a PolymerTS/Polymer 1.x to PolmerTS/Polymer 2.x conversion tool. Also, converting to Polymer 2.0 should not be that big of a leap. We will just need to change the toMarkup of the models.
