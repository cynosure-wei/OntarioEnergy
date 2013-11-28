/*
 * The entry of this node program. Currently it is used for
 * testing the adapter for parsing energy usage data.
 * 
 * Author: He Zhu
 * Email:  zhuheec@gmail.com
 * Date:   Nov 28, 2013
 *
 * Copyright 2013 He Zhu. All rights reserved.
 * 
 */

var adapter = require('./adapter');
var jf = require('jsonfile');



// parse XML data and output the JSON object
adapter.parseFromFile('./data/hydro_one_daily.xml', function(usageData) {
	// write the JSON object to file
	jf.writeFile('data.json', usageData, function(err) {
		if(err) {
			console.log(err);
		} else {
			console.log('Parse complete. Please check data.json in the project directory.');
		}
		
	});
});