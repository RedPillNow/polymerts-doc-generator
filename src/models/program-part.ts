import { Comment } from './comment';
import * as ts from 'typescript';

export abstract class ProgramPart {
	private _comment: Comment;
	private _endLineNum: number;
	private _startLineNum: number;
	private _tsNode: ts.Node;

	abstract toMarkup(): string;

	get comment() {
		if (!this._comment && this.tsNode) {
			let tsNodeAny = (<any>this.tsNode);
			if (tsNodeAny.jsDoc && tsNodeAny.jsDoc.length > 0) {
				let comm:Comment = new Comment();
				comm.commentText = tsNodeAny.jsDoc[0].comment;
				if (tsNodeAny.jsDoc[0].tags && tsNodeAny.jsDoc[0].tags.length > 0) {
					let tags = [];
					for (let i = 0; i < tsNodeAny.jsDoc[0].tags.length; i++) {
						let tag = tsNodeAny.jsDoc[0].tags[i];
						let tagName = '@' + tag.tagName.text;
						let tagNameType = tag.typeExpression ? tag.typeExpression.getText() : tag.comment;
						tagName += ' ' + tagNameType;
						tags.push(tagName);
					}
					comm.tags = tags;
				}
				this._comment = comm;
			}
		}
		return this._comment;
	}

	set comment(comment) {
		this._comment = comment;
	}

	get endLineNum() {
		return this._endLineNum;
	}

	set endLineNum(endLineNum) {
		this._endLineNum = endLineNum;
	}

	get startLineNum() {
		return this._startLineNum;
	}

	set startLineNum(startLineNum) {
		this._startLineNum = startLineNum;
	}

	get tsNode() {
		return this._tsNode;
	}

	set tsNode(tsNode) {
		this._tsNode = tsNode;
	}
}
