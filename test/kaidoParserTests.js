var kaidoParserClass = require('../kaidoParser')
  , should = require('should')
  , fs = require('fs')
  , sinon = require('sinon');

var featureContent = fs.readFileSync('./features/search/testSearch.feature');

function err(){ throw new Error(); }

describe('kaidoParser tests', function() {

	beforeEach(function(){
		this.featureResolveTable = {"tables":{"firstScenario":{"placeholdersNames":["page","action"],"placeholdersValues":[["homepage","click"],["searchresult","mouseover"]]}},"scenarios":[{"camelName":"firstScenario","name":"first scenario","steps":[{"keyWord":"Given","step":"I visit [page]"},{"keyWord":"When","step":"I [action] something"},{"keyWord":"Then","step":"Something happens"}]}]};
    	kaidoParser = new kaidoParserClass();
  	});
	
	it('prototype', function() {
		kaidoParser.getFeatureFiles.should.be.instanceOf(Function);
		kaidoParser.getFeatureFilesError.should.be.instanceOf(Function);
		kaidoParser.readFatureFiles.should.be.instanceOf(Function);
		kaidoParser.parseFeatures.should.be.instanceOf(Function);
		kaidoParser.parseFeature.should.be.instanceOf(Function);
		kaidoParser.explodeIncludes.should.be.instanceOf(Function);
		kaidoParser.resolveTables.should.be.instanceOf(Function);
		kaidoParser.resolveTables.should.be.instanceOf(Function);
		kaidoParser.resolveStep.should.be.instanceOf(Function);
		kaidoParser.repeatSteps.should.be.instanceOf(Function);
		kaidoParser.cloneObject.should.be.instanceOf(Function);
		kaidoParser.start.should.be.instanceOf(Function);
	});

	it('getFeaturesFiles', function(done) {
		kaidoParser.getFeatureFiles(function(files) {
			files.should.be.instanceOf(Array);
			files.should.have.property('length').greaterThan(0);
			done();
		}, err);
	});

	it('readFatureFiles', function() {
		var featuresFiles = [
			'features/search/testSearch.feature'
		];
		var res = kaidoParser.readFatureFiles(featuresFiles);
		res.should.be.instanceOf(Array);
		res.length.should.be.equal(1);
		res[0].should.be.instanceOf(Object);
		res[0].content.should.be.ok;
		res[0].fileName.should.be.ok;
	});

	it('parseFeatures', function() {
		var parseFatureStub = sinon.stub(kaidoParser, 'parseFeature');
		var contents = [
			{
				content : featureContent,
				fileName : 'searchTest.feature'
			}
		];
		kaidoParser.parseFeatures(contents);
		parseFatureStub.calledOnce.should.be.true;
		parseFatureStub.restore();
	});

	it('parseFeature', function() {
		var content = {
			content : featureContent,
			fileName : 'searchTest.feature'
		};

		(function() {
			kaidoParser.parseFeature(content);
		}).should.not.throw();
	});

	it('explodeIncludes', function() {
		var contentFeature = '\t#INCLUDE# StepMenu';
		var res = kaidoParser.explodeIncludes(contentFeature);
		var lines = res.split('\n');
		lines.length.should.be.greaterThan(1);
		lines = lines.map(function(line) { return line.replace(/\t/g, '')});
		lines[0].should.be.equal('Given I visit the homepage in [isoCode]');
		lines[1].should.be.equal('When I [action] on category menu');
		lines[2].should.be.equal('And I can see all of the categories');
	});

	it('start', function(done) {		
		var getFeatureFilesSpy = sinon.spy(kaidoParser, 'getFeatureFiles');
		var readFatureFilesSpy = sinon.spy(kaidoParser, 'readFatureFiles');
		var parseFeaturesSpy = sinon.spy(kaidoParser, 'parseFeatures');
		kaidoParser.start().then(function(){
			getFeatureFilesSpy.calledOnce.should.be.true;
			readFatureFilesSpy.calledOnce.should.be.true;
			parseFeaturesSpy.calledOnce.should.be.true;
			getFeatureFilesSpy.restore();
			readFatureFilesSpy.restore();
			parseFeaturesSpy.restore();
			done();
		}, err);
	});

	it('resolveStep', function() {
		
		var placeholdersNames = this.featureResolveTable.tables.firstScenario.placeholdersNames;
		var placeholdersValues = this.featureResolveTable.tables.firstScenario.placeholdersValues[0];
		var step1 = this.featureResolveTable.scenarios[0].steps[0];
		var step2 = this.featureResolveTable.scenarios[0].steps[1];
		var step3 = this.featureResolveTable.scenarios[0].steps[2];

		//step1
		kaidoParser.resolveStep(step1, placeholdersNames, placeholdersValues);
		step1.step.should.be.equal('I visit homepage');

		//step2
		kaidoParser.resolveStep(step2, placeholdersNames, placeholdersValues);
		step2.step.should.be.equal('I click something');

		//step3
		kaidoParser.resolveStep(step3, placeholdersNames, placeholdersValues);
		step3.step.should.be.equal('Something happens');
	});

	it('repeatSteps', function() {
		var feature = this.featureResolveTable;
		var scenario = this.featureResolveTable.scenarios[0];
		kaidoParser.repeatSteps({
			scenario : {
				scenario : scenario,
				index : 0
			},
			placeholdersNames : [
				'page',
				'action'
			],
			placeholdersValues : [
				'homepage',
				'click'
			],
			feature : feature,
			repeatedTime : 0
		});
		feature.scenarios.length.should.be.equal(1);
		kaidoParser.repeatSteps({
			scenario : {
				scenario : scenario,
				index : 0
			},
			placeholdersNames : [
				'page',
				'action'
			],
			placeholdersValues : [
				'searchresult',
				'mouseover'
			],
			feature : feature,
			repeatedTime : 1
		});
		feature.scenarios.length.should.be.equal(2);
	});

	it('resolve tables', function() {
		var feature = this.featureResolveTable;
		var repeatStepsSpy = sinon.spy(kaidoParser, 'repeatSteps');
		kaidoParser.resolveTables(feature);
		feature.scenarios.length.should.be.equal(2);
		repeatStepsSpy.calledTwice.should.be.true;
	});
});