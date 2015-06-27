/*
	TODO:
		1) after scenario, before scenario
		2) mark steps as a non-blocking in order to be informed when a steps have not passed without stopping the test. 
*/
(function(){
	
	//dependencies
	var glob = require('glob')
	  , Promise = require('promise')
	  , fs = require('fs')
	  , detectCommands = require('./detectCommands');

	function getFeatureFiles(resolve, reject) {
		glob('features/**/*.feature', null, function(err, files) {
			if (err) {
				reject(err);
			} else if (files && files.length > 0) {
				this.files = files;
				resolve(files);
			}
		});	
	}

	function readFatureFiles(files) {
		var featuresContents = [], content;
		for (var index = 0, file; file = files[index]; index++) {
			content = fs.readFileSync(file);
			featuresContents.push({
				content : content,
				fileName : file
			});
		}
		return featuresContents;
	}

	function parseFeatures(contents) {
		var features = [], feature;
		for (var index = 0, content; content = contents[index]; index++) {
			feature = this.parseFeature(content);
			features.push(feature);
		}
		return features;
	}

	function parseFeature(content) {

		var fileName = content.fileName
		  ,	content = content.content.toString()
		  ,	contentFeatureWithIncludes = this.explodeIncludes(content) //replace placeholders with the content of the files keeping the tabs space	
		  ,	contentFeature = contentFeatureWithIncludes.replace(/^\s*\r?\n/mg, '')
		  ,	contentLines = contentFeature.split('\n'); //it first removes blank lines, then splits them

		//feature object to return
		var feature = {
			fileName : fileName,
			scenarios : [],
			keyWords : []
		};
		
		var detectCommand = new detectCommands();
	
		contentLines.forEach(function(line, index) {		
			try {
				detectCommand.execute(line, feature);
			} catch (e) {
				console.error('An error has occurred detecting commands : [ Line : ' + line + ']');
				console.log(e);
			}
		});

		this.resolveTables(feature);

		return feature;
	}

	function resolveTables(feature) {
		var tables = feature.tables;
		
		if (!tables) {
			return false;
		}

		var scenarioNameToRepeat,
			scenarioToRepeat,
			currentTable,
			placeholdersValues,
			placeholdersNames;

		for (scenarioNameToRepeat in tables) {
			currentTable = tables[scenarioNameToRepeat];
			placeholdersNames = currentTable.placeholdersNames;
			placeholdersValues = currentTable.placeholdersValues;
			scenarioToRepeat = this.getScenarioByName(scenarioNameToRepeat, feature);
			for (var i = 0, currentPlaceholdersValues; currentPlaceholdersValues = placeholdersValues[i]; i++) {
				this.repeatSteps({
					scenario : scenarioToRepeat,
					placeholdersNames : placeholdersNames,
					placeholdersValues : currentPlaceholdersValues,
					feature : feature,
					repeatedTime : i
				});
			}
		}
	}


	function repeatSteps(repeatInfo) {
		var scenarioInfo = repeatInfo.scenario
		  , scenarioIndex = scenarioInfo.index
		  , scenario = this.cloneObject(scenarioInfo.scenario)
		  , steps = scenario.steps
		  , placeholdersNames = repeatInfo.placeholdersNames
		  , placeholdersValues = repeatInfo.placeholdersValues
		  , repeatedTime = repeatInfo.repeatedTime
		  , feature = repeatInfo.feature;

		for (var i = 0, step; step = steps[i]; i++) {
			this.resolveStep(step, placeholdersNames, placeholdersValues);
		}

		if (repeatedTime === 0) {
			feature.scenarios.splice(scenarioIndex, 1, scenario);
		} else {
			scenarioIndex += repeatedTime;
			feature.scenarios.splice(scenarioIndex, 0, scenario);
		}
	}

	function resolveStep(step, placeholdersNames, placeholdersValues) {
		var stepValue = step.step
		  , currentPlaceholderName
		  , currentPlaceholderValue
		  , regName
		  , numberToRepeat = placeholdersValues.length;
		
		for (var i = 0; i < numberToRepeat; i++) {
			currentPlaceholderName = placeholdersNames[i];
			currentPlaceholderValue = placeholdersValues[i];
			regName = new RegExp('\\[' + currentPlaceholderName + '\\]', 'i');
			step.step = stepValue.replace(regName, currentPlaceholderValue);
			stepValue = step.step;
		}
	}

	function cloneObject(object) {
		var objectString = JSON.stringify(object);
		var newObject = JSON.parse(objectString);
		return newObject;
	}

	function getScenarioByName(name, feature) {
		var scenarios = feature.scenarios;
		for (var i = 0, scenario; scenario = scenarios[i]; i++) {
			if (scenario.name === name || scenario.camelName === name) {
				return { 
					scenario : scenario,
					index : i
				};
			}
		}
		return false;
	}

	function explodeIncludes(contentFeature) {
		
		var includesToExplode = contentFeature.match(/\t+#INCLUDE#\s+(\w+)/mg);
		
		if (!!includesToExplode) {
			
			var alreadyIncluded = {}
			  ,	fileToInclude
			  ,	filePath
			  ,	fileName
			  ,	startTabs;

			for (var i = 0, includeToExplode; includeToExplode = includesToExplode[i]; i++) {	
				fileName = includeToExplode.replace(/^\t+/, '').replace(/\s+/, ' ').split(' ')[1];
				startTabs = includeToExplode.match(/^\t+/)[0];
				if (!alreadyIncluded[fileName]) {
					filePath = 'features/include/' + fileName + '.include';
					fileToInclude = fs.readFileSync(filePath).toString().split('\n').join('\n' + startTabs);
					alreadyIncluded[fileName] = fileToInclude;
				} else {
					fileToInclude = alreadyIncluded[fileName]; 
				}
				contentFeature = contentFeature.replace(new RegExp(includeToExplode.replace(/^\t+/, ''), 'mg'), fileToInclude);
			}
			return contentFeature;
		}

	}

	function getFeatureFilesError(err) {
		console.log('an error occurred');
		console.log(err);
	}

	function start() {
		var p = new Promise(this.getFeatureFiles.bind(this))

		.then(function(files) {
			return this.readFatureFiles(files);
		}.bind(this), getFeatureFilesError)
		
		.then(function(contents){
			return this.parseFeatures(contents);
		}.bind(this));
		
		return p;
	}

	function KaidoParserClass() {}
	KaidoParserClass.prototype.getFeatureFiles = getFeatureFiles;
	KaidoParserClass.prototype.getFeatureFilesError = getFeatureFilesError;
	KaidoParserClass.prototype.readFatureFiles = readFatureFiles;
	KaidoParserClass.prototype.parseFeatures = parseFeatures;
	KaidoParserClass.prototype.parseFeature = parseFeature;
	KaidoParserClass.prototype.explodeIncludes = explodeIncludes;
	KaidoParserClass.prototype.getScenarioByName = getScenarioByName;
	KaidoParserClass.prototype.resolveTables = resolveTables;
	KaidoParserClass.prototype.resolveStep = resolveStep;
	KaidoParserClass.prototype.repeatSteps = repeatSteps;
	KaidoParserClass.prototype.cloneObject = cloneObject;
	KaidoParserClass.prototype.start = start;
	
	module.exports = KaidoParserClass;

})();