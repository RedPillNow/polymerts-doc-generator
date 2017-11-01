import * as Utils from '../lib/utils';

export class HtmlComment {
	private _comment: string;

	get comment() {
		return this._comment;
	}

	set comment(comment) {
		this._comment = comment;
	}

	toMarkup(): string {
		let commentStr = null;
		if (this.comment) {
			commentStr = '<!--\n';
			commentStr += this.comment;
			commentStr += '\n-->\n';
		}
		return commentStr;
	}
}
