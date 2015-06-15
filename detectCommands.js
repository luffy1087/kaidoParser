(function() {

	//EXPRESSION DEPENDENCIES	
	var R_START_WITH_DOUBLE_TABS = /^\t\t/
	  , R_START_WITH_TAB = /^\t/
	  , R_MIN_TWO_WORDS = /(\s*\b\w+\b){2,}/
	  , R_STEP_INFO = /^\t\t?(\b\w+\b)\s+([\w\s\[\]]+)$/;
	
	//REGULAR EXPRESSION
	var R_SETUP = /^SetUp:$/m
	  , R_TEARDOWN = /^TearDown:$/m
	  , R_FEATURE = /^Feature:(.+)/m
	  , R_SCENARIOS = /^\tScenario:(.+)/m
	  , R_TABLE = /^\tTable:/m
	  , R_PLACEHOLDER = /((?:\s|\t)*\w+(?:\s|\t)*\|?)/g
	  , R_STEPS = [R_START_WITH_TAB, R_MIN_TWO_WORDS, R_STEP_INFO]
	  , R_PLACEHOLDERS = [R_START_WITH_DOUBLE_TABS, R_PLACEHOLDER];

	function camelize(s) {
		return s.replace(/\s(.)/g, function(whatFound) {
			return whatFound[1].toUpperCase();
		}).replace(/\s/g, '');
	}
	
	function detectFeature(line, feature) {
		var featureNameInfo = this.executeRegExp(line, R_FEATURE)
		  , featureName;

		if (!!featureNameInfo) {
			featureName = featureNameInfo[1].trim();
			feature.name = featureName;
		}
		return {
			isExecuted : !!featureNameInfo,
			commandName : 'detectFeature'
		};
	}

	function detectScenario(line, feature) {
		var scenarioName, camelScenarioName
		  , scenarios = feature.scenarios
		  , scenarioInfo = this.executeRegExp(line, R_SCENARIOS);

		if (!!scenarioInfo) {
			scenarioName = scenarioInfo[1].trim();
			camelScenarioName = camelize(scenarioName);
			scenarios.push({
				name : scenarioName,
				camelName : camelScenarioName,
				steps : []
			});
		}
		return {
			isExecuted : !!scenarioName,
			commandName : 'detectScenario'
		};
	}

	function detectStep(line, feature) {
		//detects every steps if scenario was detected, else check setUp and tearDown
		var command = 'detectStep'
		  , executed = false
		  , stepInfo = this.executeRegExp(line, R_STEPS);

		if (!!stepInfo) {
			//step vars
			var stepKeyWord = stepInfo[1].trim();
			var step = stepInfo[2].trim();
			var stepJson = {
				keyWord : stepKeyWord,
				step : step	
			};
			//end step vars
			var lastScenario = this.getLastScenario(feature);
		
			if (lastScenario) { // if scenario is present, then add step to the scenario
				lastScenario.steps.push(stepJson);
				executed = true;
			} else if (feature.setUp && !feature.setUp.step) {
				feature.setUp = stepJson; //executed before every steps
				command = 'detectSetUp';
				executed = true;
			} else if (feature.tearDown && !feature.tearDown.step) {
				feature.tearDown = stepJson; ////executed after every steps
				command = 'detectTearDown';
				executed = true;
			}
			this.addKeyWord(stepKeyWord, feature);
		}
		return {
			isExecuted : executed,
			commandName : command
		};
	}

	function detectSetUp(line, feature) {
		var setUpInfo = this.executeRegExp(line, R_SETUP);
		if (!!setUpInfo) {
			feature.setUp = {};
		}
		return {
			isExecuted : !!setUpInfo,
			commandName : 'detectSetUp'
		};
	}

	function detectTearDown(line, feature) {
		var tearDownInfo = this.executeRegExp(line, R_TEARDOWN);
		if (!!tearDownInfo) {
			feature.tearDown = {};
		}
		return {
			isExecuted : !!tearDownInfo,
			commandName : 'detectTearDown'
		};
	}

	function detectTable(line, feature) {
		var isTableDetected = !!this.executeRegExp(line, R_TABLE);
		if (isTableDetected) {
			var lastScenario = this.getLastScenario(feature);
			if (!!lastScenario) {
				lastScenario.table = {
					placeholdersNames : [], //an array containing placeholdersName
					placeholdersValues : [] //and array of arrayes containing the values corrisponding to the same placeholdersName values
				}		
			}
		}
		return {
			isExecuted : isTableDetected,
			commandName : 'detectTable'
		};
	}

	function detectPlaceholders(line, feature) {
		var placeHolderInfo = this.executeRegExp(line, R_PLACEHOLDERS)
		  , table = this.getLastScenario(feature).table
		  , isPlaceholderLine = !!placeHolderInfo && !!table;

		if (!!placeHolderInfo && table) {
			var trimmedPlaceHolders = placeHolderInfo.map(function(val){ return val.replace(/[\s\|]/g, ''); });
			if (table.placeholdersNames.length === 0) {
				table.placeholdersNames = trimmedPlaceHolders;
			} else {
				table.placeholdersValues.push(trimmedPlaceHolders);
			}
		}
		
		return {
			isExecuted : isPlaceholderLine,
			commandName : 'detectPlaceholders'
		};
	}

	function getLastScenario(feature) {
		var scenarios = feature.scenarios
		  , scenariosLength = scenarios.length;

		if (scenariosLength > 0) {
			return scenarios[scenariosLength-1];
		}
		
		return false;
	}

	function executeRegExp(line, reg) {
		if (reg.constructor.name === 'RegExp') {
			return line.match(reg);
		} else {
			var isValidLine;
			for (var i = 0, r; r = reg[i]; i++) {
				if (typeof(isValidLine) === 'undefined') {
					isValidLine = true;
				}
				isValidLine = isValidLine && r.test(line);
			}
			if (isValidLine) {
				return line.match(reg[i-1]);
			}
		}
		return false;
	} 

	function execute(line, feature) {
		var shouldDeleteCommand
		  , commandsToRemove = []
		  , commands = this.commands
		  , commandExecution
		  , isCommandExecuted
		  , executedCommandName;
		
		for (var i = 0, command; command = commands[i]; i++) {
			
			commandExecution = command.call(this, line, feature);
			isCommandExecuted = commandExecution.isExecuted;
			executedCommandName = commandExecution.commandName;
			
			shouldDeleteCommand = this.shouldDeleteCommand(isCommandExecuted, executedCommandName, feature);

			if (shouldDeleteCommand) {
				commandsToRemove.push(executedCommandName);
			}

			if (isCommandExecuted) {
				break;
			}
		}
		
		this.removeCommands(commandsToRemove);
	}

	function shouldDeleteCommand(isCommandExecuted, commandName, feature) {
		
		if (!isCommandExecuted) {
			return false;
		}

		if (commandName === 'detectSetUp' && feature.setUp && feature.setUp.step) {
			return true;
		}

		if (commandName === 'detectTearDown' && feature.tearDown && feature.tearDown.step) {
			return true;
		}

		if (commandName === 'detectFeature' && feature.name) {
			return true;
		}
 		
		return false;
	}

	function removeCommands(commandsName) {
		var commands = this.commands;
		for (var i = 0; commandName = commandsName[i]; i++) {
			for (var j = 0, command; command = commands[j]; j++) {
				if (command.name === commandName) {
					commands.splice(j, 1);
					break;
				}
			}
		}
	}

	function addKeyWord(keyWord, feature) {
		var keyWords = feature.keyWords
		  , isInArray = keyWords.indexOf(keyWord) > -1;
		
		if (!isInArray) {
			keyWords.push(keyWord);
		}
	}

	function DetectCommandClass() {
		
		this.commands = [
			this.detectSetUp,
			this.detectTearDown,
			this.detectFeature,
			this.detectScenario,
			this.detectStep,
			this.detectTable,
			this.detectPlaceholders
		];

	}

	DetectCommandClass.prototype.execute = execute;
	DetectCommandClass.prototype.detectSetUp = detectSetUp;
	DetectCommandClass.prototype.detectTearDown = detectTearDown;
	DetectCommandClass.prototype.detectFeature = detectFeature;
	DetectCommandClass.prototype.detectScenario = detectScenario;
	DetectCommandClass.prototype.detectStep = detectStep;
	DetectCommandClass.prototype.detectTable = detectTable;
	DetectCommandClass.prototype.detectPlaceholders = detectPlaceholders;
	DetectCommandClass.prototype.shouldDeleteCommand = shouldDeleteCommand;
	DetectCommandClass.prototype.removeCommands = removeCommands;
	DetectCommandClass.prototype.getLastScenario = getLastScenario;
	DetectCommandClass.prototype.executeRegExp = executeRegExp;
	DetectCommandClass.prototype.addKeyWord = addKeyWord;


	module.exports = DetectCommandClass;
})();



