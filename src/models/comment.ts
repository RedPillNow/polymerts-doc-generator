import { ProgramPart } from './program-part';

export enum ProgramType {
	Property = "PROPERTY",
	Computed = "COMPUTED",
	Component = "COMPONENT",
	Behavior = "BEHAVIOR",
	Listener = "LISTENER",
	Observer = "OBSERVER",
	Function = "FUNCTION"
}

export class Comment {
	private _commentObj: any;
	private _commentText: string;
	private _endLineNum: number;
	private _isFor: ProgramType;
	private _startLineNum: number;
	private _tags: string[];

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

	get endLineNum() {
		return this._endLineNum;
	}

	set endLineNum(endLineNum) {
		this._endLineNum = endLineNum;
	}

	get isFor() {
		return this._isFor;
	}

	set isFor(isFor) {
		this._isFor = isFor;
	}

	get startLineNum() {
		return this._startLineNum;
	}

	set startLineNum(startLineNum) {
		this._startLineNum = startLineNum;
	}

	get tags() {
		return this._tags || [];
	}

	set tags(tags) {
		this._tags = tags;
	}

	private _getIndent() {
		let indentation = '\t\t\t';
		switch (this.isFor) {
			case ProgramType.Property:
				indentation = '\t\t\t';
				break;
			case ProgramType.Function:
				indentation = '\t\t';
				break;
			case ProgramType.Component:
				indentation = '\t';
				break;
			case ProgramType.Listener:
				indentation = '\t\t\t';
				break;
			case ProgramType.Behavior:
				indentation = '\t\t\t';
				break;
			case ProgramType.Computed:
				indentation = '\t\t\t';
				break;
			case ProgramType.Observer:
				indentation = '\t\t\t';
				break;
		}
		return indentation;
	}

	toMarkup() {
		let markup = this._getIndent() + '/**\n';
		markup += this._getIndent() + ' * ';
		markup += this.commentText ? this.commentText.replace(/\n/g, '\n' + this._getIndent() + ' * ') + '\n' : '\n';
		for (let i = 0; i < this.tags.length; i++) {
			let tag = this.tags[i];
			markup += this._getIndent() + ' * ' + tag + '\n';
		}
		markup += this._getIndent() + ' */\n';
		if (!this.commentText && (!this.tags || this.tags.length === 0)) {
			markup = '';
		}
		return markup;
	}
}
