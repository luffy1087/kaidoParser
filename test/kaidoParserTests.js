var kaidoParserClass = require('../kaidoParser')
  , should = require('should');

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

});