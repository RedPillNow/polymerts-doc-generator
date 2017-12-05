import * as Utils from '../lib/utils';
import { ProgramPart } from './program-part';
import { Comment } from './comment';
import { ProgramType } from './comment';

export class Property extends ProgramPart {
	private _containsValueArrayLiteral: boolean = false;
	private _containsValueFunction: boolean = false;
	private _containsValueObjectDeclaration: boolean = false;
	private _name: string;
	private _params: string;
	private _type: string;
	private _valueArrayParams: any;
	private _valueObjectParams: any;

	get derivedComment(): Comment {
		if (!this.comment || !this.comment.commentText) {
			this.comment = this.comment ? this.comment : new Comment();
			let type = this.type || 'Object';
			this.comment.tags = ['@type {' + type + '}']
			this.comment.isFor = ProgramType.Property;
		}
		return this.comment;
	}

	get containsValueArrayLiteral() {
		return this._containsValueArrayLiteral;
	}

	set containsValueArrayLiteral(containsValueArrayLiteral) {
		this._containsValueArrayLiteral = containsValueArrayLiteral;
	}

	get containsValueFunction() {
		return this._containsValueFunction;
	}

	set containsValueFunction(containsValueFunction) {
		this._containsValueFunction = containsValueFunction;
	}

	get containsValueObjectDeclaration() {
		return this._containsValueObjectDeclaration;
	}

	set containsValueObjectDeclaration(containsValueObjectDeclaration) {
		this._containsValueObjectDeclaration = containsValueObjectDeclaration;
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

	get valueArrayParams() {
		return this._valueArrayParams;
	}

	set valueArrayParams(valueArrayParams) {
		this._valueArrayParams = valueArrayParams;
	}

	get valueObjectParams() {
		return this._valueObjectParams;
	}

	set valueObjectParams(valueParams) {
		this._valueObjectParams = valueParams;
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
				newParamStr += this._parseValueFunction(part);
				newParamStr += (i + 1) < partsArr.length ? ',\n' : '\n';
			} else if (this.containsValueObjectDeclaration && part.indexOf('value:') > -1) {
				newParamStr += '\t\t\t\t' + this._parseValueObject();
				let valueLen = this.valueObjectParams ? this.valueObjectParams.split(',').length - 1 : 0;
				newParamStr += (i + 1) < (partsArr.length - valueLen) ? ',\n' : '\n';
			} else if (this.containsValueArrayLiteral && part.indexOf('value:') > -1) {
				newParamStr += '\t\t\t\t' + this._parseValueArray();
				let valueLen = this.valueArrayParams ? this.valueArrayParams.split(',').length - 1 : 0;
				newParamStr += (i + 1) < (partsArr.length - valueLen) ? ',\n' : '\n';
			} else {
				let regEx = /[/{/}\n\t]/g;
				if (part.indexOf('type') > -1) {
					regEx = /[/{/}\n\t']/g;
				}
				if ((this.containsValueObjectDeclaration || this.containsValueArrayLiteral) && !this._isPartOfValue(part)) {
					newParamStr += '\t\t\t\t' + part.replace(regEx, '');
					newParamStr += (i + 1) < partsArr.length ? ',\n' : '\n';
				} else if (!this.containsValueObjectDeclaration && !this.containsValueArrayLiteral) {
					newParamStr += '\t\t\t\t' + part.replace(regEx, '');
					newParamStr += (i + 1) < partsArr.length ? ',\n' : '\n';
				}
			}
		}
		newParamStr += '\t\t\t}';
		return newParamStr;
	}

	private _isPartOfValue(part: string): boolean {
		let partOfValue = false;
		if (part && this.containsValueObjectDeclaration) {
			let valueObj = Utils.getObjectFromString(this.valueObjectParams);
			let partMatch = /(?:^[\{\s"]*([a-zA-Z0-9]+):(?:.)*)/.exec(part);
			if (partMatch) {
				let key = partMatch[1];
				partOfValue = valueObj.hasOwnProperty(key);
			}
		} else if (part && this.containsValueArrayLiteral) {
			let valueArr = Utils.getArrayFromString(this.valueArrayParams);
			let partMatch = /(?:['"\s]*([a-zA-Z]*)['"\s]*)/.exec(part);
			if (partMatch && partMatch[1]) {
				let key = partMatch[1];
				partOfValue = valueArr.indexOf(key) > -1;
			}
		}
		return partOfValue;
	}
	/**
	 * If this property contains a value property that is an array, this will
	 * parse that array object and return an appropriate string
	 * @private
	 * @returns {string}
	 */
	private _parseValueArray(): string {
		let valueArrStr = 'value: [';
		let arrayParts = this.valueArrayParams.split(',');
		for (let i = 1; i < arrayParts.length; i++) {
			let part = arrayParts[i];
			if (i === 1) {
				valueArrStr += '\n';
			}
			valueArrStr += '\t' + part.replace(/[\]\[\n]/g, '');
			valueArrStr += (i + 1) < arrayParts.length ? ',\n' : '\n';
		}
		if (arrayParts.length > 1) {
			valueArrStr += '\t\t\t\t]';
		} else {
			valueArrStr += ']';
		}
		return valueArrStr;
	}
	/**
	 * If this property contains a value property that is an object literal, this will
	 * parse that object literal and return an appropriate string
	 * @private
	 * @returns {string}
	 */
	private _parseValueObject(): string {
		let objStr = 'value: {';
		let partsArr = this.valueObjectParams ? this.valueObjectParams.split(',') : [];
		for (let i = 0; i < partsArr.length; i++) {
			let part = partsArr[i];
			if (i === 0) {
				objStr += '\n';
			}
			objStr += '\t\t\t\t\t' + part.replace(/[/{/}\n\t]/g, '');
			objStr += (i + 1) < partsArr.length ? ',\n' : '\n';
		}
		if (partsArr.length > 1) {
			objStr += '\t\t\t\t}';
		} else {
			objStr += '}';
		}
		return objStr;
	}
	/**
	 * This assumes a very simple function. Meaning no loops or conditional statements
	 * If loops or conditional statements are encountered, the indentation will not be
	 * correct for those
	 * @private
	 * @param {any} valueFunctionPart
	 * @returns {string}
	 */
	private _parseValueFunction(valueFunctionPart): string {
		let funcStr = '';
		if (valueFunctionPart) {
			let funcArr = valueFunctionPart.split('\n');
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
	 * @todo If there isn't a comment, we should have everything we need to create one
	 */
	toMarkup(): string {
		let nameParts = this.name.split(':');
		let comment = this.comment && this.comment.commentText ? '\n' + this.comment.toMarkup() : '\n' + this.derivedComment.toMarkup();
		let propStr = comment;
		propStr += '\t\t\t' + nameParts[0];
		propStr += ': ';
		propStr += this._parseParams();
		return propStr;
	}
}