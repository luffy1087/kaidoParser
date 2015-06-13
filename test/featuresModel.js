module.exports = [
	{
		name : 'my feature test',
		scenarios : [
			{
				name : 'scenario 1',
				steps : [
					{
						keyWord : 'Given',
						step : 'I visit the home page'
					},
					{
						keyWord : 'When',
						step : 'I click on the menu'	
					},
					{
						keyWord : 'Then',
						step : 'Categories should appear'
					}
				]
			}
		],
		keyWords : [
			'Given',
			'When',
			'Then'
		]
	}
];