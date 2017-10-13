import { ProgramPart } from './program-part';

export class Behavior extends ProgramPart {
	private _name: string;

	get name() {
		return this._name;
	}

	set name(name) {
		this._name = name;
	}

	toMarkup() {
		let behaviorStr = '\n' + this.comment.toMarkup();
		behaviorStr += this.name;
		return behaviorStr;
	}
}