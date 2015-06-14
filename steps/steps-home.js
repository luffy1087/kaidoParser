(function() {

	module.exports.defineSteps = function(steps) {
		
		steps.given(/I visit the home page/, function() {
			console.log('I visit the home page WORKS!!');				
		});


		steps.when(/I click on the menu/, function() {
			console.log('I click on the menu WORKS!!');				
		});
	
		steps.then(/Categories should appear/, function() {
			console.log('Categories should appear WORKS!!');				
		});

	};
	
})();
