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
	private _commentEndLine: number;
	private _commentObj: any;
	private _commentStartLine: number;
	private _commentText: string;
	private _isFor: ProgramType;

	constructor(comment) {
		super();
		this._commentObj = comment.comment;
	}

	get commentEndLine() {
		if (this._commentEndLine === null || this._commentEndLine === undefined && this.commentObj) {
			this._commentEndLine = this.commentObj.end;
		}
		return this._commentEndLine;
	}

	set commentEndLine(commentEndLine) {
		this._commentEndLine = commentEndLine;
	}

	get commentObj() {
		return this._commentObj;
	}

	get commentStartLine() {
		if (this._commentStartLine === null || this._commentStartLine === undefined && this.commentObj) {
			this._commentStartLine = this.commentObj.begin;
		}
		return this._commentStartLine;
	}

	set commentStartLine(commentStartLine) {
		this._commentStartLine = commentStartLine;
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
		markup += '**/\n';
		return markup;
	}
}
