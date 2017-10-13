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

	toMarkup() {
		let nameParts = this.name.split(':');
		let propStr = '\n' + this.comment.toMarkup();
		propStr += '\t\t\t' + nameParts[0];
		propStr += ': ';
		propStr += this.params;
		return propStr;
	}
}