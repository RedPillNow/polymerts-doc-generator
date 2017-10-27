import { ProgramPart } from './program-part';

export class Property extends ProgramPart {
	protected _name: string;
	private _params: any;
	private _type: string;

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

	// TODO: Take into account a 'value' param which is a function. Seems
	// we're removing the {}
	private _parseParams(): string {
		let partsArr = this.params ? this.params.split(',') : [];
		let newParamStr = '{\n';
		for (let i = 0; i < partsArr.length; i++) {
			let part = partsArr[i];
			newParamStr += '\t\t\t\t' + part.replace(/[/{/}\n\t]/g, '');
			newParamStr += (i + 1) < partsArr.length ? ',\n' : '\n';
		}
		newParamStr += '\t\t\t}';
		return newParamStr;
	}

	toMarkup() {
		let nameParts = this.name.split(':');
		let comment = this.comment ? '\n' + this.comment.toMarkup() : '\n';
		let propStr = comment;
		propStr += '\t\t\t' + nameParts[0];
		propStr += ': ';
		propStr += this._parseParams();
		return propStr;
	}
}