var kaidoStepsClass = require('../kaidoSteps')
  , should = require('should')
  ,	features = require('./featuresModel');

describe('kaidoSteps', function() {

	beforeEach(function(){
    	kaidoSteps = new kaidoStepsClass(features);
  	});
	
	it('prototype', function() {
		kaidoSteps.init.should.be.instanceOf(Function);
		kaidoSteps.addStep.should.be.instanceOf(Function);
	});

	it('check steps function taken from keywords', function() {
		kaidoSteps.given.should.be.instanceOf(Function);
		kaidoSteps.when.should.be.instanceOf(Function);
		kaidoSteps.then.should.be.instanceOf(Function);
	});

	it('getSteps', function() {
		kaidoSteps.given(/I visit the home page/, function() {});
		kaidoSteps.when(/I click on the menu/, function() {});
		kaidoSteps.then(/Categories should appear/, function() {});
		kaidoSteps.getSteps().should.be.instanceOf(Object);
	});

	it('check adding steps', function() {
		kaidoSteps.given(/I visit the home page/, function() {});
		kaidoSteps.steps.should.have.property('I visit the home page');
	});
	
	it('check deplicate steps', function() {
		kaidoSteps.given(/I visit the home page/, function() {});
		(function(){
			kaidoSteps.given(/I visit the home page/, function() {});			
		}).should.throw(/Duplicate/);
		
	});

});