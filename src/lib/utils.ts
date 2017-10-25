import * as ts from 'typescript';

export module Utils {

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

}
