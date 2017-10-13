# redpill-doc-generator

This is a node module for parsing a TypeScript file (PolymerTS) and generating an _empty_ documentation file (i.e. no code, only signatures) compatible with Polymer 1.0 to pass to iron-component-page for documentation. This will end up being part of the [redpill-zion project](https://bitbucket.org/redpilldev/redpill-zion).

## Background Info

Since Red Pill Now changed our process to use TypeScript for components we lost the auto-generated documentation feature for our components. This node module attempts to restore that feature.

While we understand that the format generated here is for Polymer 1.0. Once we move to Polymer 2.0 we will need to revisit all the models to change how they are rendered. This should not be a big undertaking.

## Setup

First, make sure you have [Node.js](https://nodejs.org/) installed, so we can use the Node package maanger (NPM). Next install the other key tools:

* [Gulp](http://gulpjs.com/) - build
* [TypeScript](http://www.typescriptlang.org/) - TypeScript Compiler

## Install

Unfortunately this is not published to the NPM library so will have to figure out how to install from a private repository

```bash
npm install ???
```

## Usage

```js
var rpd = require('redpill-doc-generator');
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

Since this project is written in TypeScript there is a directory structure. The `lib` directory contains a util.ts file which provides some common utilities. The `models` directory which contains all the parts of our TypeScript files (i.e. Comment, Listener, Property, etc.). index.ts in the src directory provides the entry point into the tool
