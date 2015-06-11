(function() {
	
	var glob = require('glob');
	
	function getStepsFiles(resolve, reject) {
		glob('steps/**/*.js', null, function(err, files) {
			if (err) {
				reject(err);
			} else if (files && files.length > 0) {
				resolve(files);
			}
		});
	}

	function requireStepsFile(stepsFilesPath) {
		var steps, stepFileName;
		for (var i = 0, stepFilePath; stepFilePath = stepsFilesPath[i]; i++) {
			stepFileName = stepFilePath.split('/')[2];			
			steps[stepFileName] = require(stepFilePath);
		}
		return steps;
	}
	
	function executeSteps(features) {
		var steps = new Promise(getStepsFiles).then(requiresStepsFile);
		steps.then(requiresSteps);
	}

	module.exports = {
			executeSteps : executeSteps
	};
	
})();
