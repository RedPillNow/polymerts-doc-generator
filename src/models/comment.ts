import { ProgramPart } from './program-part';

export enum ProgramType {
	Property = "PROPERTY",
	Computed = "COMPUTED",
	Component = "COMPONENT",
	Behavior = "BEHAVIOR",
	Listener = "LISTENER",
	Observer = "OBSERVER"
}

export class Comment extends ProgramPart {
	private _commentObj: any;
	private _commentText: string;
	private _isFor: ProgramType;

	constructor(comment?) {
		super();
		this._commentObj = comment ? comment.comment : null;
	}

	get commentObj() {
		return this._commentObj;
	}

	get commentText() {
		if (!this._commentText && this.commentObj) {
			this._commentText = this.commentObj.content;
		}
		return this._commentText;
	}

	set commentText(commentText) {
		this._commentText = commentText;
	}

	get isFor() {
		return this._isFor;
	}

	set isFor(isFor) {
		this._isFor = isFor;
	}

	toMarkup() {
		let markup = '/**\n';
		markup += this.commentText;
		markup += '**/';
		return markup;
	}
}
