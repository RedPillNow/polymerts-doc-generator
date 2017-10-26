import * as ts from 'typescript';
import * as path from 'path';

export function trimRight(str) {
	return str.replace(/\s+$/, '');
}

export function trimTabs(str) {
	return str.replace(/\t+/g, '');
}

export function _getObjectLiteralString(objExp: ts.ObjectLiteralExpression): any {
	let objLiteralObj:any = {};
	if (objExp && objExp.properties && objExp.properties.length > 0) {
		let paramStr = '{\n';
		for (let i = 0; i < objExp.properties.length; i++) {
			let propProperty: ts.PropertyAssignment = (<ts.PropertyAssignment>objExp.properties[i]);
			let propPropertyKey = propProperty.name.getText();
			paramStr += '\t' + propProperty.name.getText();
			paramStr += ': ';
			paramStr += propProperty.initializer.getText();
			paramStr += (i + 1) < objExp.properties.length ? ',' : '';
			paramStr += '\n';
			if (propPropertyKey === 'type') {
				objLiteralObj.type = propProperty.initializer.getText();
			}
		}
		paramStr += '}';
		objLiteralObj.str = paramStr;
	}
	return objLiteralObj;
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
export function _getPathInfo(fileName: string, docPath: string): any {
	let pathInfo: any = {};
	if (fileName) {
		pathInfo.fileName = fileName;
		pathInfo.dirName = path.dirname(docPath);
		pathInfo.docFileName = 'doc_' + path.basename(fileName) + '.html';
		pathInfo.fullDocFilePath = path.join(pathInfo.dirName, pathInfo.docFileName);
	}
	return pathInfo;
}

export function _getStartLineNumber(node: ts.Node) {
	let lineObj = ts.getLineAndCharacterOfPosition(node.getSourceFile(), node.getStart());
	return lineObj.line + 1;
}

export function _getEndLineNumber(node: ts.Node) {
	let lineObj = ts.getLineAndCharacterOfPosition(node.getSourceFile(), node.getEnd());
	return lineObj.line + 1;
}

export function capitalizeFirstLetter(str: string) {
	return str.charAt(0).toUpperCase() + str.slice(1);
}
