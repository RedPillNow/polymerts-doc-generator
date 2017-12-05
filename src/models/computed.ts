import { Property } from './property';

export class ComputedProperty extends Property {
	private _methodName: any;

	get methodName() {
		return this._methodName;
	}

	set methodName(methodName) {
		this._methodName = methodName;
	}
	// TODO: Need to implement this so it adds the computed: methodName
	private _getNewParams(): string {
		let partsArr = this.params ? this.params.split(',') : [];
		let hasType = partsArr.find((part) => {
			return part.indexOf('type:') > -1;
		});
		if (!hasType) {
			partsArr.unshift('type: Object');
		}
		let newParamStr = '{\n';
		for (let i = 0; i < partsArr.length; i++) {
			let part = partsArr[i];
			newParamStr += '\t\t\t\t' + part.replace(/[/{/}\n\t]/g, '');
			newParamStr += ',\n';
		}
		newParamStr += '\t\t\t\tcomputed: \'' + this.methodName + '\'\n';
		newParamStr += '\t\t\t}';
		return newParamStr;
	}

	toMarkup() {
		let nameParts = this.name.split(':');
		let comment = this.comment && this.comment.commentText ? '\n' + this.comment.toMarkup() : '\n' + this.derivedComment.toMarkup();
		let propStr = comment;
		propStr += '\t\t\t' + nameParts[0];
		propStr += ': ';
		propStr += this._getNewParams();
		return propStr;
	}
}