var kaidoParserClass = require('../kaidoParser')
  , should = require('should')
  , fs = require('fs')
  , sinon = require('sinon');

var featureContent = fs.readFileSync('./features/search/testSearch.feature');

function err(){ throw new Error(); }

describe('kaidoParser tests', function() {

	beforeEach(function(){
    	kaidoParser = new kaidoParserClass();
  	});
	
	it('prototype', function() {
		kaidoParser.getFeatureFiles.should.be.instanceOf(Function);
		kaidoParser.getFeatureFilesError.should.be.instanceOf(Function);
		kaidoParser.readFatureFiles.should.be.instanceOf(Function);
		kaidoParser.parseFeatures.should.be.instanceOf(Function);
		kaidoParser.parseFeature.should.be.instanceOf(Function);
		kaidoParser.explodeIncludes.should.be.instanceOf(Function);
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

	it.only('start', function(done) {		
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

});