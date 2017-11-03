let ts = require('typescript');
let fs = require('fs');
let chai = require('chai');
let polymerTsDoc = require('../src');

describe('polymerts-doc-generator', function () {
	let dataFile = __dirname + '/../src/data/dig-app.ts';
	let docDir = __dirname + '/../src/docs';
	let srcFile = ts.createSourceFile(dataFile, fs.readFileSync(dataFile).toString(), ts.ScriptTarget.ES2015, true);

	afterEach(function () {
		polymerTsDoc.reset();
	});

	it('should instantiate a new Component', function () {
		chai.expect(polymerTsDoc.component).to.be.ok;
	});
	it('should be able to find a property based on the property name', function () {
		polymerTsDoc.parseTs(srcFile);
		chai.expect(polymerTsDoc.findProperty('apps')).to.be.ok;
	});
	it('should b')

	describe('Program Part Gathering Tests', function () {
		let comp = null;

		before(function () {
			comp = polymerTsDoc.parseTs(srcFile);
		});

		after(function () {
			polymerTsDoc.reset();
		});

		it('should add Behaviors to the Component', function () {
			let behaviors = comp.behaviors;
			chai.expect(behaviors).to.be.ok;
			chai.expect(behaviors.length).equals(2);
		});
		it('should add Properties to the Component', function () {
			let properties = comp.properties;
			chai.expect(properties).to.be.ok;
			chai.expect(properties.length).equals(19);
		});
		it('should add Functions to the Component', function () {
			let methods = comp.methods;
			chai.expect(methods).to.be.ok;
			chai.expect(methods.length).equals(33);
		});
		it('should add Observers to the Component', function () {
			let observers = comp.observers;
			chai.expect(observers).to.be.ok;
			chai.expect(observers.length).equals(2);
		});
		it('should add Listeners to the Component', function () {
			let listeners = comp.listeners;
			chai.expect(listeners).to.be.ok;
			chai.expect(listeners.length).equals(2);
		});
	});

});