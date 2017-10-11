'use strict';

const fs = require('fs');
const path = require('path');
const parse = require('parse-comments');

/**
 * Build the documentation
 * @param {string} fileName
 */
function start(fileName, docPath) {
	let comments = getComments(fileName)
	let pathInfo = _getPathInfo(fileName, docPath);
	_writeDocumentation(comments, pathInfo);
}
/**
 * Get the comments
 *
 * @param {String} fileName
 * @returns {any[]}
 */
function getComments(fileName) {
	let readFile = fs.readFileSync(fileName, 'utf8')
	let comments = parse(readFile) || [];
	return comments;
}
/**
 * Get the pieces of the path for fileName
 * @param {string} fileName
 * @returns {any} pathInfo
 * @property {string} pathInfo.fileName - The original source file name
 * @property {string} pathInfo.dirName - The directory name for fileName
 * @property {string} pathInfo.docFileName - The generated documentation file name
 * @property {string} pathInfo.fullDocFilePath - The full path to pathInfo.docFileName
 */
function _getPathInfo(fileName, docPath) {
	let pathInfo = {};
	if (fileName) {
		pathInfo.fileName = fileName;
		pathInfo.dirName = path.dirname(docPath);
		pathInfo.docFileName = 'doc_' + path.basename(fileName) + '.html';
		pathInfo.fullDocFilePath = path.join(pathInfo.dirName, pathInfo.docFileName);
	}
	return pathInfo;
}
/**
 * Actually write out documentation. If it already exists, delete it first
 * @param {any[]} comments
 * @param {string} fileName
 */
function _writeDocumentation(comments, pathInfo) {
	if (fs.existsSync(pathInfo.fullDocFilePath)) {
		fs.unlinkSync(pathInfo.fullDocFilePath);
	}
	let writeStream = fs.createWriteStream(pathInfo.fullDocFilePath, { encoding: 'utf8' });
	writeStream.on('open', () => {
		_writeHtmlTop(writeStream, path.basename(pathInfo.fileName));
		_writeComments(comments, writeStream, pathInfo.fileName);
		_writeCloseHtml(writeStream);
		writeStream.end();
	});
	writeStream.on('finish', () => {
		console.log('All writes to', pathInfo.fullDocFilePath, 'done');
	});
	writeStream.on('close', () => {
		console.log('Write stream closed');
	});
}
/**
 * write the top portion of the html (i.e. dom-module, template, style, script)
 * @param {any} writeStream
 * @param {any} fileName
 */
function _writeHtmlTop(writeStream, fileName) {
	let ext = fileName.split('.');
	let fileNameOnly = ext[0];
	let htmlStr = '<dom-module id="' + fileNameOnly + '">\n';
	htmlStr += '<template>\n';
	htmlStr += '<style></style>\n';
	htmlStr += '<script>\n';
	htmlStr += '(function() {\n';
	htmlStr += 'Polymer({\n';
	htmlStr += 'is:\'' + '\'\n';
	writeStream.write(htmlStr);
}
/**
 * Write out the comments we found along with the function call
 * @param {any} comments
 * @param {any} writeStream
 * @param {string} fileName
 */
function _writeComments(comments, writeStream, fileName) {
    for (let i = 0; i < comments.length; i++) {
        let comment = comments[i];
        let writeStr = '/**\n';
        writeStr += comment.comment.content;
		writeStr += '**/';
		writeStr += _getTsProgramName(comment.comment.codeStart - 2, fileName) + '\n';
		writeStr += '\n';
        writeStream.write(writeStr);
    }
}
/**
 * Close the html file out (i.e. /script, /template, /dom-module)
 * @param {any} writeStream
 */
function _writeCloseHtml(writeStream) {
	let htmlStr = '});\n';
	htmlStr += '})();\n';
	htmlStr += '</script>\n';
	htmlStr += '</template>\n';
	htmlStr += '</dom-module>\n';
	writeStream.write(htmlStr);
}
/**
 * Gets the property/function/program signature out of the relevant lines
 * from the _getLines callback
 * @param {number} startLineNum from the startLineNum get the next 10 lines of code
 * @param {string} fileName
 * @param {string} type The type of program part we want. Accepts properties, computed,
 *	behaviors, component, listeners, observers, functions
 * @returns {string} The property/function/program signature line
 */
function _getTsProgramName(startLineNum, fileName, type) {
	let tsProgramName = null;
	_getLines(startLineNum, fileName, (err, lines) => {
		console.log('_getTsProgramName, lines=', lines);
		let codeBlock = lines.join('\n');
		console.log('codeBlock=', codeBlock);
		let match = null;
		if (match = /(?:\t*@property)\(({[\s\S]*?})\)([\s\S]*?(?:;))/.exec(codeBlock)) {
			let progNameParts = match[2].split(':');
			let propName = progNameParts[0] + ': ';
			let propKeys = match[1];
			propName += propKeys + ',';
			tsProgramName = propName;
		}
	});
	return tsProgramName;
}
/**
 * Get the next 10 lines from where the code starts and run the callback. The relevant 10 lines
 * will be in the 2nd parameter of the callback
 * @param {any} startLineNum
 * @param {any} fileName
 * @param {function} callback returns 2 parameters (err, relevantLines)
 */
function _getLines(startLineNum, fileName, callback) {
	let data = fs.readFileSync(fileName, 'utf8');
	let lines = data.split('\n');
	let startLine = +startLineNum;
	if (startLine > lines.length) {
		let err = new Error('File doesn\'t contain ' + startLine + ' lines!');
		callback(err, null);
	}
	let relevantLines = [];
	for (let i = startLine; i < startLine + 10; i++) {
		let line = lines[i];
		relevantLines.push(line);
	}
	callback(null, relevantLines);
}

// For Testing Purposes
start(__dirname + '/data/dig-app.ts', __dirname + '/docs/*');

// Expose these methods externally
module.exports.start = start;
module.exports.getComments = getComments;
