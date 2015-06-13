(function() {

	function addStep(reg, callback) {
		var steps = this.steps,	regString = reg.toString().replace(/(^\/)|(\/$)/g, '');
		if (!steps[regString]) {
			steps[regString] = {
				reg : reg,
				callback : callback
			};
		} else {
			throw new Error('Duplicate step is found : ' + regString);
		}
	}

	function init(features) {
		features.forEach(function(feature) {
			var keyWords = feature.keyWords;
			keyWords.forEach(function(keyWord) {
				this[keyWord.toLowerCase()] = this.addStep.bind(this);
			}.bind(this));
		}.bind(this));
	}

	function getSteps() {
		return this.steps;
	}

	function StepsClass(features) {
		this.steps = {};
		this.init(features);
	}
	StepsClass.prototype.init = init;
	StepsClass.prototype.addStep = addStep;
	StepsClass.prototype.getSteps = getSteps;
	
	module.exports = StepsClass;

})();
