const express = require('express')
const app = express()
const request = require('request')
const cors = require('cors');
const { urlencoded } = require('express');

app.use(cors());

app.use(function(req, res, next)
{
  res.setHeader("Access-Control-Allow-Origin", "*"); 
  res.setHeader("Access-Control-Allow-Methods", "DELETE, POST, GET, OPTIONS"); 
  res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.get('/getProducts', function (req, res)
{
	var filterNameCount = 0
	var filterStr = ''

	// url formation
	var keywords = encodeURI(req.query.keywords);
		keywords = encodeURIComponent(req.query.keywords);

	if(req.params['minPrice'])
	{
		filterStr += '&itemFilter('+ filterNameCount +').name=MinPrice&itemFilter('+ filterNameCount +').value=' + req.param("minPrice") +'&itemFilter('+ filterNameCount +').paramName=Currency&itemFilter('+ filterNameCount +').paramValue=USD';
		filterNameCount += 1;
	}

	if(req.params['maxPrice'])
	{
		filterStr += '&itemFilter('+ filterNameCount +').name=MaxPrice&itemFilter('+ filterNameCount +').value=' + req.param("maxPrice") +'&itemFilter('+ filterNameCount +').paramName=Currency&itemFilter('+ filterNameCount +').paramValue=USD';
		filterNameCount += 1;
	}

	if(req.params['condition'])
	{
		var ls = req.params['condition'].split(',');
		var filterValueCount = 0;
		filterStr += '&itemFilter(' + filterNameCount + ').name=Condition';

		for(var i=0; i < ls.length; i++) {
			filterStr += '&itemFilter('+ filterNameCount +').value('+ filterValueCount +')=' + ls[i];
			filterValueCount += 1;
		}

		filterNameCount +=1;
	}

	if(req.params['seller'])
	{
		filterStr += '&itemFilter('+ filterNameCount +').name=ReturnsAcceptedOnly&itemFilter('+ filterNameCount +').value=true';
		filterNameCount += 1;
	}

	if(req.params['shipping'])
	{
		if((req.params['shipping']).search('Free') > -1) {
			filterStr += '&itemFilter('+ filterNameCount +').name=FreeShippingOnly&itemFilter('+ filterNameCount +').value=true';
			filterNameCount += 1;
		}

		if((req.params['shipping']).search('Expedited') > -1) {
			filterStr += '&itemFilter('+ filterNameCount +').name=ExpeditedShippingType&itemFilter('+ filterNameCount +').value=Expedited';
			filterNameCount += 1;
		}
	}
	var sortOrder = req.query.sortOrder;

	/* Basic URL Format

	https://svcs.ebay.com/services/search/FindingService/v1?
   	OPERATION-NAME=findItemsAdvanced&
   	SERVICE-VERSION=1.0.0&
   	SECURITY-APPNAME=YourAppID&
   	RESPONSE-DATA-FORMAT=XML&
   	REST-PAYLOAD=true&
   	paginationInput.entriesPerPage=2&
   	keywords=iPad&
	*/

	//eBay UAT[sandbox] URL
	//var url =  'https://svcs.sandbox.ebay.com/services/search/FindingService/v1?';

	//eBay production URL
	//var url = 'https://svcs.ebay.com/services/search/FindingService/v1?OPERATION-NAME=findItemsAdvanced&SERVICE-VERSION=1.0.0&SECURITY-APPNAME='+ 'Veeramon-ProdSear-SBX-72ce02ed1-430ffb3d' +'&RESPONSE-DATA-FORMAT=JSON&REST-PAYLOAD&keywords='+ keywords +'&sortOrder=' + sortOrder + filterStr;
	var url =  'https://svcs.ebay.com/services/search/FindingService/v1?';
		url += 'OPERATION-NAME=findItemsAdvanced';
		url += '&SERVICE-VERSION=1.0.0';
		url += '&SECURITY-APPNAME='+ 'Veeramon-ProdSear-PRD-97cb04765-ab03463b';
		url += '&RESPONSE-DATA-FORMAT=JSON';
		url += '&REST-PAYLOAD='+ true;
		url += '&keywords='+ keywords;

	request.get(url, function (error, response, body)
	{
		console.log('Given URL:', url);
		if(error || response.statusCode != 200)
		{
			res.send('No results found with this URL:');
		}
		res.send(body);
	});
});

app.get('/getSingleProduct', function (req, res)
{
	var productId = req.params['productId'];

	//need to get eBay authenticatin token before making this API call.
	var url = 	'https://open.api.ebay.com/shopping?callname=GetSingleItem&responseencoding=JSON&appid='+ 'Veeramon-ProdSear-SBX-72ce02ed1-430ffb3d' +'&siteid=0&version=967&ItemID='+ productId +'&IncludeSelector=Details,ItemSpecifics'
		url =  	'https://open.api.sandbox.ebay.com/shopping?';
		url += 	'callname=FindProducts';
		url += 	'&responseencoding=JSON';
		url += 	'&appid='+ 'Veeramon-ProdSear-SBX-72ce02ed1-430ffb3d';
		url += 	'&siteid=0';
		url += 	'&version=967';
		url += 	'&QueryKeywords='+ keywords;
		url += 	'&AvailableItemsOnly=true';

	request.get(url, function (error, response, body)
	{
		console.log('Given URL:', url);
		if(error || response.statusCode != 200) {
			res.send('No results found with this URL:');
		}
		res.send(body);
	})
});
// Tell Express to listen for requests (start server)
const port = process.env.PORT || '8080';

// specifying port to run app
app.listen(port, function (){console.log('Express Server started on port', port);});