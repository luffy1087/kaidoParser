(function() {
	
	//dependencies
	var glob = require('glob');
	var kaidoStepsClass = require('./kaidoSteps');

	function getStepsFiles(resolve, reject) {
		glob('steps/**/*.js', null, function(err, files) {
			if (err) {
				reject(err);
			} else if (files && files.length > 0) {
				this.files = files;
				resolve(files);
			}
		}.bind(this));
	}

	function requireStepsFile(stepsFilesPath) {
		var kSteps = this.kSteps, stepFileName;
		for (var i = 0, stepFilePath; stepFilePath = stepsFilesPath[i]; i++) {
			stepFilePath = './' + stepFilePath;
			stepFileName = stepFilePath.split('/')[2];
			require(stepFilePath).defineSteps(kSteps);
		}
		return kSteps;
	}

	function executeStep(regString) {
		var kSteps = this.kSteps
		  ,	steps = kSteps.getSteps()
		  ,	currentStep
		  ,	regExp
		  ,	callback;

		currentStep = steps[regString];
		regExp = currentStep.reg;
		callback = currentStep.callback;
		if (regExp.test(regString)) {
			callback();
		} else {
			throw new Error('Step [' + regString + '] was not executed');
		}
		return true;
	}

	function execute() {
		this.features.forEach(function(feature) {
			feature.scenarios.forEach(function(scenario) {
				scenario.steps.forEach(function(step) {
					this.executeStep(step.step);
				}.bind(this));
			}.bind(this));
		}.bind(this));
		return true;
	}

	function start() {
		var p = new Promise(this.getStepsFiles);

		p.then(function(files) {
			this.requireStepsFile(files);
			return 1;
		}.bind(this));

		p.then(function(filesAgain) {
			this.execute();
			return 1;
		}.bind(this));
			
		return p;
	}

	function KaidoMatcherClass(features) {
		this.features = features;
		this.kSteps = new kaidoStepsClass(features);
	}
	KaidoMatcherClass.prototype.start = start;
	KaidoMatcherClass.prototype.getStepsFiles = getStepsFiles;
	KaidoMatcherClass.prototype.requireStepsFile = requireStepsFile;
	KaidoMatcherClass.prototype.execute = execute;
	KaidoMatcherClass.prototype.executeStep = executeStep;

	module.exports = KaidoMatcherClass;
	
})();