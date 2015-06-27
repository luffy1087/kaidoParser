var DetectCommandsClass = require('../detectCommands')
  , should = require('should');

var feature = {
	scenarios : [],
	keyWords : []
};

describe('detectCommands tests', function() {

	beforeEach(function(){
    	detectCommands = new DetectCommandsClass();
    	feature.scenarios = [];
    	feature.keyWords = [];
    	delete feature.tables;
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
		feature.scenarios = [
			{
				name : 'first scenario ',
				camelName : 'firstScenario',
				steps : []
			},
			{
				name : 'second scenario',
				camelName : 'secondScenario',
				steps : []
			}
		];
		var lastScenario = detectCommands.getLastScenario(feature);
		lastScenario.should.be.instanceOf(Object);
		lastScenario.name.should.be.equal('second scenario');
	});

	it('addKeyWord', function() {
		feature.keyWords = [
			'And',
			'When',
			'Then'
		];
		detectCommands.addKeyWord('Then', feature);
		feature.keyWords.join(',').match(/Then/g).length.should.be.equal(1);
		detectCommands.addKeyWord('Log', feature);
		feature.keyWords.indexOf('Log').should.be.greaterThan(-1);
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
			camelName : 'scenarioTest',
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
		feature.tables.should.be.instanceOf(Object);
		feature.tables.should.have.property('scenarioTest').instanceOf(Object);
	});

	it('detectPlaceHolders names', function() {
		feature.tables = {
			scenarioTest : {
				placeholdersNames : [],
				placeholdersValues : []
			}
		};
		feature.scenarios.push({
			camelName : 'scenarioTest',
			steps : [{
				keyWord : 'test',
				steps : 'step test'
			}]
		});
		var line = '\t\tisoCode\t\taction';
		var res = detectCommands.detectPlaceholders(line, feature);
		res.should.be.instanceOf(Object);
		res.isExecuted.should.be.true;
		res.commandName.should.be.equal('detectPlaceholders');
		feature.tables.scenarioTest.placeholdersNames.length.should.be.equal(2);
		feature.tables.scenarioTest.placeholdersNames[0].should.be.equal('isoCode');
		feature.tables.scenarioTest.placeholdersNames[1].should.be.equal('action');
	});

	it('detectPlaceHolders values', function() {
		feature.tables = {
			scenarioTest : {
				placeholdersNames : ['isoCode', 'action'],
				placeholdersValues : []
			}
		};
		feature.scenarios.push({
			camelName : 'scenarioTest',
			steps : [{
				keyWord : 'test',
				steps : 'step test'
			}]
		});
		var line = '\t\tIT\t\tmouseover';
		var res = detectCommands.detectPlaceholders(line, feature);
		res.should.be.instanceOf(Object);
		res.isExecuted.should.be.true;
		res.commandName.should.be.equal('detectPlaceholders');
		feature.tables.scenarioTest.placeholdersValues.length.should.be.equal(1);
		feature.tables.scenarioTest.placeholdersValues[0].should.be.instanceOf(Array);
		feature.tables.scenarioTest.placeholdersValues[0][0].should.be.equal('IT');
		feature.tables.scenarioTest.placeholdersValues[0][1].should.be.equal('mouseover');
	});

	it('removeCommands', function() {
		var commands = detectCommands.commands;
		var commandsLength = commands.length;
		var commandsToRemove = [
			'detectSetUp',
			'detectTearDown'
		];
		detectCommands.removeCommands(commandsToRemove);
		commands.length.should.be.lessThan(commandsLength);
		var res = commands.filter(function(func) {
			return func.name === 'detectSetUp' || func.name === 'detectTearDown';
		});
		res.length.should.be.equal(0); // commands have been removed
	});

	it('shouldDeleteCommand', function() {
		//1
		detectCommands.shouldDeleteCommand(false, 'detectSetUp', feature).should.be.false; // command not executed
		//2
		feature.name = 'feature 1';
		detectCommands.shouldDeleteCommand(true, 'detectFeature', feature).should.be.true; // command executed, feature has the name
		//3
		feature.setUp = {};
		detectCommands.shouldDeleteCommand(true, 'detectSetUp', feature).should.be.false;
		//4
		feature.setUp.step = 'step test';
		detectCommands.shouldDeleteCommand(true, 'detectSetUp', feature).should.be.true;feature.setUp.step = 'step test';
		//5
		feature.tearDown = {};
		detectCommands.shouldDeleteCommand(true, 'detectTearDown', feature).should.be.false;
		//6
		feature.tearDown.step = 'step test';
		detectCommands.shouldDeleteCommand(true, 'detectTearDown', feature).should.be.true;
		//7
		detectCommands.shouldDeleteCommand(true, 'detectScenario', feature).should.be.false;
	});

	it('execute', function() {
		(function() {
			detectCommands.execute('Feature: my feature name', feature);
			detectCommands.execute('SetUp:', feature);
			detectCommands.execute('\tLog I log cookies', feature);
			detectCommands.execute('TearDown:', feature);
			detectCommands.execute('\tCheck I Check cookie name', feature);
			detectCommands.execute('\tScenario: first scenario', feature);
			detectCommands.execute('\t\tGiven I visit [page]', feature);
			detectCommands.execute('\t\tWhen I [action] on menu', feature);
			detectCommands.execute('\t\tThen Categories should appear', feature);
			detectCommands.execute('\tTable:', feature);
			detectCommands.execute('\t\tpage\t\t|\t\taction', feature);
			detectCommands.execute('\t\thomepage\t\t|\t\tclick', feature);
		}).should.not.throw();

		feature.name.should.be.equal('my feature name');
		feature.setUp.should.be.instanceOf(Object);
		feature.setUp.keyWord.should.be.equal('Log');
		feature.setUp.step.should.be.equal('I log cookies');
		feature.tearDown.should.be.instanceOf(Object);
		feature.tearDown.keyWord.should.be.equal('Check');
		feature.tearDown.step.should.be.equal('I Check cookie name');
		feature.scenarios.length.should.be.equal(1);
		feature.scenarios[0].name.should.be.equal('first scenario');
		feature.scenarios[0].camelName.should.be.equal('firstScenario');
		feature.scenarios[0].steps.should.be.instanceOf(Array);
		feature.scenarios[0].steps.length.should.be.equal(3);
		feature.scenarios[0].steps[0].keyWord.should.be.equal('Given');
		feature.scenarios[0].steps[0].step.should.be.equal('I visit [page]');
		feature.scenarios[0].steps[1].keyWord.should.be.equal('When');
		feature.scenarios[0].steps[1].step.should.be.equal('I [action] on menu');
		feature.scenarios[0].steps[2].keyWord.should.be.equal('Then');
		feature.scenarios[0].steps[2].step.should.be.equal('Categories should appear');
		feature.tables.should.be.instanceOf(Object);
		feature.tables.firstScenario.should.be.instanceOf(Object);
		feature.tables.firstScenario.placeholdersNames.length.should.be.equal(2);
		feature.tables.firstScenario.placeholdersNames[0].should.be.equal('page');
		feature.tables.firstScenario.placeholdersNames[1].should.be.equal('action');
		feature.tables.firstScenario.placeholdersValues.length.should.be.equal(1);
		feature.tables.firstScenario.placeholdersValues[0].length.should.be.equal(2);
		feature.tables.firstScenario.placeholdersValues[0][0].should.be.equal('homepage');
		feature.tables.firstScenario.placeholdersValues[0][1].should.be.equal('click');
	});

});