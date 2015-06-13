SetUp:
	Log setUp string

TearDown:
	Log tearDown string

Feature:	my feature name 1
	Scenario: my first test Menu
		#INCLUDE# StepMenu
		Given I click the category
		When I go to the search page
		Then The number of products must be greater than zero
		
	Table:
		isoCode | 	action
		us		|	mouseover
		it		|	click
		
	
	Scenario: my second test Menu
		#INCLUDE# StepMenu
		Given I click the category shoes
		When I go to the search page
		Then I can see three products
	
	Where:
		isoCode	|	action
		it		|	mouseover
		us		|	doubleclick
