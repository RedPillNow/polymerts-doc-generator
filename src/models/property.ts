import { ProgramPart } from './program-part';

export class Property extends ProgramPart {
	private _containsValueFunction: boolean = false;
	private _name: string;
	private _params: any;
	private _type: string;

	get containsValueFunction() {
		return this._containsValueFunction;
	}

	set containsValueFunction(containsValueFunction) {
		this._containsValueFunction = containsValueFunction;
	}

	get name() {
		return this._name;
	}

	set name(name) {
		this._name = name;
	}

	get params() {
		return this._params;
	}

	set params(params) {
		this._params = params;
	}

	get type() {
		return this._type;
	}

	set type(type) {
		this._type = type;
	}
	/**
	 * Parse the parameters of this property
	 * @private
	 * @returns {string}
	 */
	private _parseParams(): string {
		let partsArr = this.params ? this.params.split(',') : [];
		let newParamStr = '{\n';
		for (let i = 0; i < partsArr.length; i++) {
			let part = partsArr[i];
			if (this.containsValueFunction && part.indexOf('value:') > -1) {
				newParamStr += this._parseFunction(part);
			} else {
				newParamStr += '\t\t\t\t' + part.replace(/[/{/}\n\t]/g, '');
			}
			newParamStr += (i + 1) < partsArr.length ? ',\n' : '\n';
		}
		newParamStr += '\t\t\t}';
		return newParamStr;
	}
	/**
	 * This assumes a very simple function. Meaning no loops or conditional statements
	 * If loops or conditional statements are encountered, the indentation will not be
	 * correct for those
	 * @private
	 * @param {any} functionPart
	 * @returns {string}
	 */
	private _parseFunction(functionPart): string {
		let funcStr = '';
		if (functionPart) {
			let funcArr = functionPart.split('\n');
			let idx = 0;
			funcArr.forEach((element) => {
				if ((idx === 0 && element) || (idx === 1 && element)) {
					funcStr += '\t\t\t' + element.replace(/\n\t/g, '') + '\n';
				} else if (idx === funcArr.length - 1) {
					funcStr += '\t' + element.replace(/\n\t/g, '');
				} else if (element) {
					funcStr += '\t' + element.replace(/\n\t/g, '') + '\n';
				}
				idx++;
			});
		}
		return funcStr;
	}
	/**
	 * Builds the string representation of this property
	 * @returns {string}
	 */
	toMarkup(): string {
		let nameParts = this.name.split(':');
		let comment = this.comment ? '\n' + this.comment.toMarkup() : '\n';
		let propStr = comment;
		propStr += '\t\t\t' + nameParts[0];
		propStr += ': ';
		propStr += this._parseParams();
		return propStr;
	}
}