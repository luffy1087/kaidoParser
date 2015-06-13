var kaidoMatcherClass = require('../kaidoMatcher')
  , should = require('should')
  ,	features = require('./featuresModel');

function err(){ throw new Error(); }

describe('kaidoMatcher tests', function() {

	beforeEach(function(){
    	kaidoMatcher = new kaidoMatcherClass(features);
  	});
	
	it('prototype', function() {
		kaidoMatcher.getStepsFiles.should.be.instanceOf(Function);
		kaidoMatcher.requireStepsFile.should.be.instanceOf(Function);
		kaidoMatcher.execute.should.be.instanceOf(Function);
		kaidoMatcher.executeStep.should.be.instanceOf(Function);
	});

	it('getStepsFiles', function(done) {
		kaidoMatcher.getStepsFiles(function(files) {
			files.should.be.instanceOf(Array);
			files.should.have.property('length').greaterThan(0);
			done();
		}, err);
	});

	it('requireStepsFile does not throw error', function() {
		var stepsFilePath = [
			'./steps/steps-home.js'
		];
		(function() {
			kaidoMatcher.requireStepsFile(stepsFilePath);
		}).should.not.throw();
		
	});

	it('requireStepsFile fills kSteps.steps', function() {
		var stepsFilePath = [
			'./steps/steps-home.js'
		];
		kaidoMatcher.requireStepsFile(stepsFilePath);
		kaidoMatcher.kSteps.steps.should.have.property('I visit the home page');
		kaidoMatcher.kSteps.steps.should.have.property('I click on the menu');
		kaidoMatcher.kSteps.steps.should.have.property('Categories should appear');
	});

	it('executeStep', function() {
		var stepsFilePath = [
			'./steps/steps-home.js'
		];
		kaidoMatcher.requireStepsFile(stepsFilePath);
		(function() {
			kaidoMatcher.executeStep('I visit the home page');
		}).should.not.throw();
	});

	it('executeAllSteps', function() {
		var stepsFilePath = [
			'./steps/steps-home.js'
		];
		kaidoMatcher.requireStepsFile(stepsFilePath);
		(function() {
			kaidoMatcher.execute();
		}).should.not.throw();
	});	

	it('start', function(done) {
		kaidoMatcher.start().then(function(){
			done();
		}, err);
	});

});