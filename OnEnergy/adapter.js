/*
 * An adapter that parses the original XML file
 * provided by TheGreenButtonData to a JSON object
 * that contains all usage information in the XML
 * file. It takes the the XSLT provided as the
 * reference.
 * 
 * Currently it supports daily data from HydroOne.
 * Supports for more formats and data ranges will
 * be added and tested.
 * 
 * Author: He Zhu
 * Email:  zhuheec@gmail.com
 * Date:   Nov 28, 2013
 *
 * Copyright 2013 He Zhu. All rights reserved.
 * 
 */

var fs = require('fs');
var xml2js = require('xml2js');
var config = require('./config');

module.exports = {
	
	/* 
	 * Parses the original XML file to a JSON object
	 * for data visualization. The JSON object will 
	 * be returned as a parameter of the callback 
	 * function. 
	 */
	parseFromFile : function(filePath, callback) {
		// usage object to return
		var usagePoint = {};
		usagePoint.localTime = {};
		usagePoint.meterReadings = {};
		// read XML file contents
		fs.readFile(filePath, function(err, data) {
			// parse XML to the initial JSON object
			new xml2js.Parser().parseString(data, function (err, result) {
				// temporary variables
				var feed = result.feed;
				var entryArray = feed.entry;
				var readingTypes = {};
				var intervalBlocks = {};
				// iterate each entry atom in XML
				for(var i in entryArray) {
					var content = entryArray[i].content[0];
					if(content.UsagePoint) {
						// get property id and name
						usagePoint.id = entryArray[i].link[0].$.href;
						usagePoint.name = entryArray[i].title[0]._;
						var kindId = content.UsagePoint[0].ServiceCategory[0].kind[0];
						// get service kind: electricity, gas or water
						usagePoint.serviceKind = config.SERVICE_KIND[kindId];
					} else if(content.LocalTimeParameters) {
						// get property id and name
						usagePoint.localTime.id = entryArray[i].link[0].$.href;
						usagePoint.localTime.name = entryArray[i].title[0]._;
						// get service kind: electricity, gas or water
						usagePoint.localTime.dstEndRule = content.LocalTimeParameters[0].dstEndRule[0];
						usagePoint.localTime.dstOffset = content.LocalTimeParameters[0].dstOffset[0];
						usagePoint.localTime.dstStartRule = content.LocalTimeParameters[0].dstStartRule[0];
						usagePoint.localTime.tzOffset = content.LocalTimeParameters[0].tzOffset[0];
					} else if(content.ReadingType) {
						// get property id and name
						var rtId = entryArray[i].link[0].$.href;
						readingTypes[rtId] = {};
						readingTypes[rtId].name = entryArray[i].title[0]._;
						// get reading type specific properties
						readingTypes[rtId].intervalLength = content.ReadingType[0].intervalLength[0];
						readingTypes[rtId].kind = content.ReadingType[0].kind[0];
						readingTypes[rtId].powerOfTenMultiplier = content.ReadingType[0].powerOfTenMultiplier[0];
						readingTypes[rtId].uom = content.ReadingType[0].uom[0];
						// get electricity units info
						if(readingTypes[rtId].uom == 72) {
							readingTypes[rtId].accumulationBehaviour = content.ReadingType[0].accumulationBehaviour[0];
							readingTypes[rtId].commodity = content.ReadingType[0].commodity[0];
							readingTypes[rtId].currency = content.ReadingType[0].currency[0];
							readingTypes[rtId].dataQualifier = content.ReadingType[0].dataQualifier[0];
							readingTypes[rtId].flowDirection = content.ReadingType[0].flowDirection[0];
							readingTypes[rtId].phase = content.ReadingType[0].phase[0];
							readingTypes[rtId].tou = content.ReadingType[0].tou[0];
						}
					} else if(content.MeterReading) {
						// get property id and name
						var mrId = entryArray[i].link[0].$.href;
						usagePoint.meterReadings[mrId] = {};
						usagePoint.meterReadings[mrId].name = entryArray[i].title[0]._;
						// get data link
						usagePoint.meterReadings[mrId].dataId = entryArray[i].link[2].$.href;
						// get type link
						usagePoint.meterReadings[mrId].readingTypeId = entryArray[i].link[3].$.href;
					} else if(content.IntervalBlock) {
						// get property id and name
						var ibId = entryArray[i].link[1].$.href;
						intervalBlocks[ibId] = {};
						intervalBlocks[ibId].interval = content.IntervalBlock[0].interval[0];
						intervalBlocks[ibId].interval.duration = content.IntervalBlock[0].interval[0].duration[0];
						intervalBlocks[ibId].interval.start = content.IntervalBlock[0].interval[0].start[0];
						intervalBlocks[ibId].intervalReading = [];
						for(var j = 0; j < content.IntervalBlock[0].IntervalReading.length; j++) {
							var reading = {};
							reading.timePeriod = {};
							reading.timePeriod.duration = content.IntervalBlock[0].IntervalReading[j].timePeriod[0].duration[0];
							reading.timePeriod.start = content.IntervalBlock[0].IntervalReading[j].timePeriod[0].start[0];
							if(content.IntervalBlock[0].IntervalReading[j].cost) {
								reading.cost = content.IntervalBlock[0].IntervalReading[j].cost[0];
							}
							reading.value = content.IntervalBlock[0].IntervalReading[j].value[0];
							intervalBlocks[ibId].intervalReading.push(reading);
						}
					}
				}
				// map all data objects to links
				for(var mr in usagePoint.meterReadings) {
					usagePoint.meterReadings[mr].data = intervalBlocks[usagePoint.meterReadings[mr].dataId];
					usagePoint.meterReadings[mr].readingType = readingTypes[usagePoint.meterReadings[mr].readingTypeId];
				}
				// parse the usage data object to the callback function
				callback(usagePoint);
			});
		});
	}
};