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

// parse XML data and output the JSON object
adapter.parseFromFile('./hydro_one_daily.xml', function(usageData) {
	console.log(usageData);
});