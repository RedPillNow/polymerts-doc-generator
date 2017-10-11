import { ProgramPart } from './program-part';

export class Property extends ProgramPart {
	protected _name: string;
	private _params: any;

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

	toMarkup() {
		let nameParts = this.name.split(':');
		let propStr = nameParts[0];
		propStr += ': ';
		propStr += this.params;
		return propStr;
	}
}