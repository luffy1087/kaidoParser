var DetectCommandsClass = require('../detectCommands')
  , should = require('should')
  ,	features = require('./featuresModel');

var feature = {
	scenarios : [],
	keyWords : []
};

describe('detectCommands tests', function() {

	beforeEach(function(){
    	detectCommands = new DetectCommandsClass();
    	feature.scenarios = [];
    	feature.keyWords = [];
  	});
	
	it('prototype', function() {
		detectCommands.execute.should.be.instanceOf(Function);
		detectCommands.detectSetUp.should.be.instanceOf(Function);
		detectCommands.detectTearDown.should.be.instanceOf(Function);
		detectCommands.detectFeature.should.be.instanceOf(Function);
		detectCommands.detectScenario.should.be.instanceOf(Function);
		detectCommands.detectStep.should.be.instanceOf(Function);
		detectCommands.detectTable.should.be.instanceOf(Function);
		detectCommands.detectPlaceholders.should.be.instanceOf(Function);
		detectCommands.shouldDeleteCommand.should.be.instanceOf(Function);
		detectCommands.removeCommands.should.be.instanceOf(Function);
		detectCommands.getLastScenario.should.be.instanceOf(Function);
		detectCommands.executeRegExp.should.be.instanceOf(Function);
		detectCommands.addKeyWord.should.be.instanceOf(Function);
	});

	it('executeRegExp; reg is a regular expression', function() {
		var line = '\tGiven I visit the home page';
		var reg = /^\t(.+)/;
		var res = detectCommands.executeRegExp(line, reg);
		res.should.be.instanceOf(Array);
		res.length.should.be.equal(2);
	});
	
	it('executeRegExp; reg is an Array', function() {
		var line = '\tGiven I visit the home page';
		var reg = [];
		reg.push(/^\t(.+)/);
		reg.push(/page$/);
		reg.push(/^\t\b\w+\b/);
		var res = detectCommands.executeRegExp(line, reg);
		res.should.be.instanceOf(Array);
		res.length.should.be.equal(1);
		res[0].replace(/\t/g, '').trim().should.be.equal('Given');
	});

	it('getLastScenario', function() {
		var lastScenario = detectCommands.getLastScenario(features[0]);
		lastScenario.should.be.instanceOf(Object);
		lastScenario.name.should.be.equal('scenario 1');
	});

	it('detectFeature', function() {
		var line = 'Feature: my feature will be great';
		var res = detectCommands.detectFeature(line, feature);
		res.should.be.instanceOf(Object);
		res.isExecuted.should.be.true;
		res.commandName.should.be.equal('detectFeature');
		feature.name.should.be.equal('my feature will be great');
	});

	it('detectSetUp', function() {
		var line = 'SetUp:';
		var res = detectCommands.detectSetUp(line, feature);
		res.should.be.instanceOf(Object);
		res.isExecuted.should.be.true;
		res.commandName.should.be.equal('detectSetUp');
		feature.setUp.should.be.instanceOf(Object);
	});

	it('detectTearDown', function() {
		var line = 'TearDown:';
		var res = detectCommands.detectTearDown(line, feature);
		res.should.be.instanceOf(Object);
		res.isExecuted.should.be.true;
		res.commandName.should.be.equal('detectTearDown');
		feature.tearDown.should.be.instanceOf(Object);
	});

	it('detectScenario', function() {
		var line = '\tScenario: Scenario number one';
		var res = detectCommands.detectScenario(line, feature);
		res.should.be.instanceOf(Object);
		res.isExecuted.should.be.true;
		res.commandName.should.be.equal('detectScenario');
		feature.scenarios.length.should.be.greaterThan(0);
		feature.scenarios[0].name.should.be.equal('Scenario number one');
		feature.scenarios[0].camelName.should.be.equal('ScenarioNumberOne');
	});

	it('detectStep for setUp', function() {
		feature.setUp = {};
		feature.scenarios = [];
		var line = '\tLog I log the status of the cart';
		var res = detectCommands.detectStep(line, feature);
		res.should.be.instanceOf(Object);
		res.isExecuted.should.be.true;
		res.commandName.should.be.equal('detectSetUp');
		feature.setUp.keyWord.should.be.equal('Log');
		feature.setUp.step.should.be.equal('I log the status of the cart');
	});

	it('detectStep for tearDown', function() {
		feature.tearDown = {};
		feature.scenarios = [];
		var line = '\tLog I log the status of the cart';
		var res = detectCommands.detectStep(line, feature);
		res.should.be.instanceOf(Object);
		res.isExecuted.should.be.true;
		res.commandName.should.be.equal('detectTearDown');
		feature.tearDown.keyWord.should.be.equal('Log');
		feature.tearDown.step.should.be.equal('I log the status of the cart');
	});

	it('detectStep for Scenario', function() {
		feature.scenarios.push({
			steps : []
		});
		var line = '\tLog I log the status of the cart';
		var res = detectCommands.detectStep(line, feature);
		res.should.be.instanceOf(Object);
		res.isExecuted.should.be.true;
		res.commandName.should.be.equal('detectStep');
		feature.scenarios[0].steps.length.should.be.greaterThan(0); 	
		feature.scenarios[0].steps[0].keyWord.should.be.equal('Log');
		feature.scenarios[0].steps[0].step.should.be.equal('I log the status of the cart');
	});

	it('detectTable', function() {
		feature.scenarios.push({
			steps : [{
				keyWord : 'test',
				steps : 'step test'	
			}]
		});
		var line = '\tTable:';
		var res = detectCommands.detectTable(line, feature);
		res.should.be.instanceOf(Object);
		res.isExecuted.should.be.true;
		res.commandName.should.be.equal('detectTable');
		feature.scenarios[0].table.should.be.instanceOf(Object);
	});

	it('detectPlaceHolders names', function() {
		feature.scenarios.push({
			steps : [{
				keyWord : 'test',
				steps : 'step test'
			}],
			table : {
				placeholdersNames : [],
				placeholdersValues : []
			}
		});
		var line = '\t\tisoCode\t\taction';
		var res = detectCommands.detectPlaceholders(line, feature);
		res.should.be.instanceOf(Object);
		res.isExecuted.should.be.true;
		res.commandName.should.be.equal('detectPlaceholders');
		feature.scenarios[0].table.placeholdersNames.length.should.be.equal(2);
		feature.scenarios[0].table.placeholdersNames[0].should.be.equal('isoCode');
		feature.scenarios[0].table.placeholdersNames[1].should.be.equal('action');
	});

	it('detectPlaceHolders values', function() {
		feature.scenarios.push({
			steps : [{
				keyWord : 'test',
				steps : 'step test'
			}],
			table : {
				placeholdersNames : ['isoCode', 'action'],
				placeholdersValues : []
			}
		});
		var line = '\t\tIT\t\tmouseover';
		var res = detectCommands.detectPlaceholders(line, feature);
		res.should.be.instanceOf(Object);
		res.isExecuted.should.be.true;
		res.commandName.should.be.equal('detectPlaceholders');
		feature.scenarios[0].table.placeholdersValues.length.should.be.equal(1);
		feature.scenarios[0].table.placeholdersValues[0].should.be.instanceOf(Array);
		feature.scenarios[0].table.placeholdersValues[0][0].should.be.equal('IT');
		feature.scenarios[0].table.placeholdersValues[0][1].should.be.equal('mouseover');
	});

});