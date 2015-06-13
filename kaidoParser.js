/*
	TODO:
		1) after scenario, before scenario
		2) mark steps as a non-blocking in order to be informed when a steps have not passed without stopping the test. 
*/
(function(){
	
	//dependencies
	var glob = require('glob')
		,	fs = require('fs')
		,	detectCommands = require('./detectCommands')
		,	matcher = require('./kaidoMatcher');

	function getFeatureFiles(resolve, reject) {
		glob('features/**/*.feature', null, function(err, files) {
			if (err) {
				reject(err);
			} else if (files && files.length > 0) {
				resolve(files);
			}
		});
	}

	function readFatureFiles(files) {
		var featuresContents = [], content;
		for (var index = 0, file; file = files[index]; index++) {
			console.log('read file : ' + file);
			content = fs.readFileSync(file);
			featuresContents.push({
				content : content,
				fileName : file
			});
		}
		return featuresContents;
	}

	function parseFeatures(contents) {
		var features = [];
		var feature;
		for (var index = 0, content; content = contents[index]; index++) {
			feature = parseFeature(content);
			features.push(feature);
		}
		return features;
	}

	function parseFeature(content) {

		var fileName = content.fileName;
		var content = content.content.toString();
		var contentFeatureWithIncludes = explodeIncludes(content); //replace placeholders with the content of the files keeping the tabs space	
		var contentFeature = contentFeatureWithIncludes.replace(/^\s*\r?\n/mg, '');
		
		var contentLines = contentFeature.split('\n'); //it first removes blank lines, then splits them

		//feature object to return
		var feature = {
			fileName : fileName,
			scenarios : [],
			keyWords : []
		};
		
		var detectCommand = new detectCommands(); //in the feture, Implement init function passing the feature objerct instead of passing that everytime
	
		contentLines.forEach(function(line, index) {		
			try {
				detectCommand.execute(line, feature);
			} catch (e) {
				console.log('An error has occurred');
				console.log(e);
			}
		});

		return feature;
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

	function parse() {
		var parser = new Promise(getFeatureFiles)
				.then(readFatureFiles, getFeatureFilesError)
				.then(parseFeatures);
		return parser;
	}
	
	module.exports = {
		parse : parse,
		matcher : matcher
	};

})();
