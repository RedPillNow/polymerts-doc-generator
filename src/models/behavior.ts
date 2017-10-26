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
		let comment = this.comment ? '\n' + this.comment.toMarkup() : '';
		let behaviorStr = comment;
		behaviorStr += this.name;
		return behaviorStr;
	}
}