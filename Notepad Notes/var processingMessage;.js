var processingMessage;

function onLoad() {
	var type = Xrm.Page.getAttribute('gmb_type').getValue();

	if (type != null) {
		if (type == 1) {
			// Standard
			Xrm.Page.getControl('gmb_type').setDisabled(true);
			Xrm.Page.getControl('gmb_event').setDisabled(true);
			Xrm.Page.getControl('gmb_documenttemplate').setDisabled(true);
			Xrm.Page.getControl('gmb_product').setDisabled(true);

			Xrm.Page.getControl('gmb_lampfilter').setVisible(false);
			Xrm.Page.getControl('gmb_startdate').setVisible(false);
			Xrm.Page.getControl('gmb_enddate').setVisible(false);

			//Xrm.Page.getAttribute('gmb_startnumber').setValue(1);
		} else {
			// Lamp
			Xrm.Page.getControl('gmb_type').setDisabled(true);
			Xrm.Page.getControl('gmb_documenttemplate').setDisabled(true);
			Xrm.Page.getControl('gmb_product').setDisabled(true);

			Xrm.Page.getControl('gmb_startnumber').setVisible(false);
			Xrm.Page.getControl('gmb_endnumber').setVisible(false);
			Xrm.Page.getControl('gmb_event').setVisible(false);
		}
	}
}

function onChange_Type() {}

function onChange_Event() {}

function onChange_LampFilter() {
	var lampFilter = Xrm.Page.getAttribute('gmb_lampfilter').getValue();

	if (lampFilter != null) {
		if (lampFilter == 1 || lampFilter == 2) {
			Xrm.Page.getControl('gmb_startdate').setVisible(true);
			Xrm.Page.getControl('gmb_enddate').setVisible(true);
		} else {
			Xrm.Page.getControl('gmb_startdate').setVisible(false);
			Xrm.Page.getControl('gmb_enddate').setVisible(false);
		}
	}
}

function generateDoc() {
	Xrm.Utility.showProgressIndicator('Generating Document...');

	debugger;

	var type = 0;
	var lampFilter = 0;
	var eventId = '';
	var templateId = '';
	var productId = '';
	var startNumber = 0;
	var endNumber = 0;
	var startDateStr = new Date().toISOString();
	var endDateStr = '';

	//var documentType = Xrm.Page.getAttribute("gmb_documenttype").getValue();

	type = Xrm.Page.getAttribute('gmb_type').getValue();
	if (Xrm.Page.getAttribute('gmb_lampfilter').getValue() != null)
		lampFilter = Xrm.Page.getAttribute('gmb_lampfilter').getValue();
	if (Xrm.Page.getAttribute('gmb_event').getValue() != null)
		eventId = Xrm.Page.getAttribute('gmb_event').getValue()[0].id.replace('{', '').replace('}', '');
	templateId = Xrm.Page.getAttribute('gmb_documenttemplate').getValue()[0].id.replace('{', '').replace('}', '');

	if (Xrm.Page.getAttribute('gmb_product').getValue() != null)
		productId = Xrm.Page.getAttribute('gmb_product').getValue()[0].id.replace('{', '').replace('}', '');
	if (Xrm.Page.getAttribute('gmb_startnumber').getValue() != null)
		startNumber = Xrm.Page.getAttribute('gmb_startnumber').getValue();
	if (Xrm.Page.getAttribute('gmb_endnumber').getValue() != null)
		endNumber = Xrm.Page.getAttribute('gmb_endnumber').getValue();
	if (Xrm.Page.getAttribute('gmb_startdate').getValue() != null) {
		var startDate = Xrm.Page.getAttribute('gmb_startdate').getValue();
		startDate.setHours(startDate.getHours() + 8);
		startDateStr = startDate.toISOString();
	}
	if (Xrm.Page.getAttribute('gmb_enddate').getValue() != null) {
		var endDate = Xrm.Page.getAttribute('gmb_enddate').getValue();
		endDate.setHours(endDate.getHours() + 8);
		endDateStr = endDate.toISOString();
	}

	var url = getSystemParameterSetting('PrintoutApiUrl');
	var inputArgument =
		'{ "apiUrl": "' +
		encodeURI(url) +
		'","templateId": "' +
		templateId +
		'","eventId": "' +
		eventId +
		'","productId": "' +
		productId +
		'","filterType": ' +
		type +
		',"lampFilterType": ' +
		lampFilter +
		',"startNumber": ' +
		startNumber +
		',"endNumber": ' +
		endNumber +
		',"startDateStr": "' +
		startDateStr +
		'","endDateStr": "' +
		endDateStr +
		'" }';

	debugger;

	setTimeout(function() {
		CallCustomAction(inputArgument, 'GetReport', 'Report', function(results) {
			downloadDocx(results);
		});
	}, 1000);
}

function showAlertDialog(message) {
	var alertStrings = { confirmButtonLabel: 'Ok', text: message, title: 'Letter Generation' };
	var alertOptions = { height: 120, width: 260 };

	Xrm.Navigation.openAlertDialog(alertStrings, alertOptions).then(
		function success(result) {
			console.log('Alert dialog closed');
		},
		function(error) {
			console.log(error.message);
		}
	);
}

function showButton() {}

function retrieveTemplates(selectedEvent) {
	var productId = getEventProductId(selectedEvent);
	var templates = [];

	var req = new XMLHttpRequest();
	req.open(
		'GET',
		Xrm.Page.context.getClientUrl() +
			'/api/data/v8.2/gmb_documenttemplates?$select=gmb_name&$filter=statecode eq 0 and _gmb_productfamily_value eq ' +
			productId,
		false
	);
	req.setRequestHeader('OData-MaxVersion', '4.0');
	req.setRequestHeader('OData-Version', '4.0');
	req.setRequestHeader('Accept', 'application/json');
	req.setRequestHeader('Content-Type', 'application/json; charset=utf-8');
	req.setRequestHeader('Prefer', 'odata.include-annotations="*"');
	req.onreadystatechange = function() {
		if (this.readyState === 4) {
			req.onreadystatechange = null;
			if (this.status === 200) {
				var results = JSON.parse(this.response);
				templates = results.value;
			} else {
				Xrm.Utility.alertDialog(this.statusText);
			}
		}
	};
	req.send();

	return templates;
}

function onDocumentMenuItemClick(commandProperties, selectedItem) {
	Xrm.Utility.showProgressIndicator('Generating Document...');

	var documentType = Xrm.Page.getAttribute('gmb_documenttype').getValue();

	var id = commandProperties.SourceControlId.split(';');

	var templateId = id[0];
	var productId = id[1];

	var eventId = '';
	if (selectedItem.length > 0) {
		eventId = selectedItem[0];
	}

	debugger;

	var url = getSystemParameterSetting('PrintoutApiUrl');
	var inputArgument =
		'{ "apiUrl": "' +
		encodeURI(url) +
		'","templateId": "' +
		templateId +
		'","eventId": "' +
		eventId +
		'","productId": "' +
		productId +
		'" }';

	setTimeout(function() {
		CallCustomAction(inputArgument, 'GetReport', 'Report', function(results) {
			downloadDocx(results);
		});
	}, 1000);
}

function downloadLetter() {
	Xrm.Utility.showProgressIndicator('Generating Document...');

	debugger;

	var type = 0;
	var lampFilter = 0;
	var eventId = '';
	var templateId = '';
	var productId = '';
	var startNumber = 1;
	var endNumber = 0;
	var startDateStr = new Date().toISOString();
	var endDateStr = '';
	var businessUnitId = '';
	var userId = '';
	var recordId = '',
		letterType = '';

	templateId = Xrm.Page.getAttribute('gmb_documenttemplate').getValue()[0].id.replace('{', '').replace('}', '');
	
	userId = Xrm.Page.context.getUserId().replace('{', '').replace('}', '');
	businessUnitId = getBusinessUnitId(userId);
	recordId = Xrm.Page.data.entity.getId().replace('{', '').replace('}', '');
	letterType = Xrm.Page.getAttribute('gmb_name').getValue();
	if( letterType == "LETTERLONGEVITY") {
	     businessUnitId = "7d18b3f5-6025-ea11-a810-000d3a07be14";
	}
	else if( letterType == "LETTERLONGEVITYGB") {
	businessUnitId = "3771befb-6025-ea11-a810-000d3a07be14";	
	}
	if (Xrm.Page.getAttribute('gmb_validfrom').getValue() != null)
		startDateStr = Xrm.Page.getAttribute('gmb_validfrom').getValue().toISOString();
	if (Xrm.Page.getAttribute('gmb_validto').getValue() != null)
		endDateStr = Xrm.Page.getAttribute('gmb_validto').getValue().toISOString();

	var url = getSystemParameterSetting('LETTERAPIURL');

	if (letterType.includes('QINGMING') || letterType.includes('ULLAMBANA') || letterType.includes('WINTER')) {
		var currentDate = new Date();

		var year = currentDate.getFullYear();

		var firstDate = new Date(year, currentDate.getMonth(), 1);

		var endDate = new Date(year, currentDate.getMonth() + 1, 0);

		startDateStr = firstDate.toISOString();

		endDateStr = endDate.toISOString();
	}

	if (Xrm.Page.getAttribute('gmb_month').getValue() != null) {
		startNumber = Xrm.Page.getAttribute('gmb_month').getValue();
	}

	var inputArgument =
		'{ "apiUrl": "' +
		encodeURI(url) +
		'","templateId": "' +
		templateId +
		'","eventId": "' +
		eventId +
		'","productId": "' +
		productId +
		'","filterType": ' +
		type +
		',"lampFilterType": ' +
		lampFilter +
		',"startNumber": ' +
		startNumber +
		',"endNumber": ' +
		endNumber +
		',"startDateStr": "' +
		startDateStr +
		'","endDateStr": "' +
		endDateStr +
		'","userId": "' +
		userId +
		'","buId": "' +
		businessUnitId +
		'","recordId": "' +
		recordId +
		'", "letterType" : "' +
		letterType +
		'"}';

	debugger;

	setTimeout(function() {
		CallCustomAction(inputArgument, 'GetLetter', 'Letter', function(results) {
			if (results == null || results == 'null' || results == undefined) {
				Xrm.Utility.closeProgressIndicator();
				showAlertDialog('No Letter Generated. Kindly Contact System Administrator for more information.');
				return;
			}

			var resultsParsed = JSON.parse(results);

			if (resultsParsed.IsSuccess == true) {
				if (
					resultsParsed.ResponseBytes != null &&
					resultsParsed.ResponseBytes != 'null' &&
					resultsParsed.ResponseBytes != undefined
				) {
					downloadDocx(resultsParsed.ResponseBytes);
					showAlertDialog('Letter Generated Success. Please find it in Downloads.');
					Xrm.Utility.closeProgressIndicator();
				} else {
					Xrm.Utility.closeProgressIndicator();
					showAlertDialog(resultsParsed.UserMessage);
				}
			} else {
				Xrm.Utility.closeProgressIndicator();
				showAlertDialog(resultsParsed.UserMessage);
			}
		});
	}, 1000);
}

function downloadDocx(base64String) {
	var blob = converBase64toBlob(
		base64String.replace(/<[^>]*>/g, '').replace('"', ''),
		'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
	);
	if (window.navigator.msSaveBlob) {
		// // IE hack; see http://msdn.microsoft.com/en-us/library/ie/hh779016.aspx
		window.navigator.msSaveOrOpenBlob(blob, 'report_' + new Date().toString().replace(/[^0-9]/g, '') + '.docx');
	} else {
		var a = window.document.createElement('a');
		a.href = window.URL.createObjectURL(blob, {
			type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
		});
		a.download = 'report_' + new Date().toString().replace(/[^0-9]/g, '') + '.docx';
		document.body.appendChild(a);
		a.click(); // IE: "Access is denied"; see: https://connect.microsoft.com/IE/feedback/details/797361/ie-10-treats-blob-url-as-cross-origin-and-denies-access
		document.body.removeChild(a);
	}
	Xrm.Utility.closeProgressIndicator();
}

function converBase64toBlob(content, contentType) {
	contentType = contentType || '';
	var sliceSize = 512;
	var byteCharacters = window.atob(content); //method which converts base64 to binary
	var byteArrays = [];
	for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) {
		var slice = byteCharacters.slice(offset, offset + sliceSize);
		var byteNumbers = new Array(slice.length);
		for (var i = 0; i < slice.length; i++) {
			byteNumbers[i] = slice.charCodeAt(i);
		}
		var byteArray = new Uint8Array(byteNumbers);
		byteArrays.push(byteArray);
	}
	var blob = new Blob(byteArrays, {
		type: contentType
	}); //statement which creates the blob
	return blob;
}

function generateDocument(letterType) {
	// Xrm.Utility.showProgressIndicator('Generating Document...');
	debugger;
	//var id = commandProperties.SourceControlId.split(';');
	//var templateId = id[0];
	//var productId = id[1];
	//var eventId = '';
	//if (selectedItem.length > 0) {
	//	eventId = selectedItem[0];
	//}

	var entityFormOptions = {};
	entityFormOptions['entityName'] = 'gmb_letterreports'; //'gmb_documentfilter';
	entityFormOptions['cmdbar'] = true;
	entityFormOptions['navbar'] = 'off';
	entityFormOptions['openInNewWindow'] = true;

	var formParameters = {};
	formParameters['gmb_name'] = letterType;
	//formParameters['gmb_documenttype'] = 2;
	formParameters['gmb_validfrom'] = new Date(); //gmb_startdate
	formParameters['gmb_documenttemplate'] = getDocumentTemplateLookUp(letterType);

	Xrm.Navigation.openForm(entityFormOptions, formParameters).then(
		function(success) {
			console.log(success);
		},
		function(error) {
			console.log(error);
		}
	);
}

function getDocumentTemplateLookUp(enUniqueValue) {
	var templateLookup;

	var req = new XMLHttpRequest();
	req.open(
		'GET',
		Xrm.Page.context.getClientUrl() +
			'/api/data/v8.2/' +
			"gmb_documenttemplates?$filter=(gmb_name eq '" +
			enUniqueValue +
			"')&$select=gmb_name, gmb_documenttemplateid",
		false
	);
	req.setRequestHeader('OData-MaxVersion', '4.0');
	req.setRequestHeader('OData-Version', '4.0');
	req.setRequestHeader('Accept', 'application/json');
	req.setRequestHeader('Content-Type', 'application/json; charset=utf-8');
	req.setRequestHeader('Prefer', 'odata.include-annotations="*"');
	req.onreadystatechange = function() {
		if (this.readyState === 4) {
			req.onreadystatechange = null;
			if (this.status === 200) {
				var result = JSON.parse(this.response);
				if (result != null) {
					templateLookup = new Array();
					templateLookup[0] = new Object();
					templateLookup[0].id = result.value[0]['gmb_documenttemplateid'];
					templateLookup[0].name = result.value[0]['gmb_name'];
					templateLookup[0].entityType = 'gmb_documenttemplate';
				}
			} else {
				Xrm.Utility.alertDialog(this.statusText);
			}
		}
	};
	req.send();

	return templateLookup;
}

function getBusinessUnitId(userId) {
	var businessId;

	var req = new XMLHttpRequest();
	req.open(
		'GET',
		Xrm.Page.context.getClientUrl() +
			'/api/data/v8.2/systemusers(' +
			userId.replace('{', '').replace('}', '') +
			')?$select=_businessunitid_value,domainname,fullname',
		false
	);
	req.setRequestHeader('OData-MaxVersion', '4.0');
	req.setRequestHeader('OData-Version', '4.0');
	req.setRequestHeader('Accept', 'application/json');
	req.setRequestHeader('Content-Type', 'application/json; charset=utf-8');
	req.setRequestHeader('Prefer', 'odata.include-annotations="*"');
	req.onreadystatechange = function() {
		if (this.readyState === 4) {
			req.onreadystatechange = null;
			if (this.status === 200) {
				var result = JSON.parse(this.response);
				businessId = result['_businessunitid_value'];
			} else {
				Xrm.Utility.alertDialog(this.statusText);
			}
		}
	};
	req.send();

	return businessId;
}

function callCustomAPI(actionName, actionParams) {
	var results = null;
	var ODataEndpoint = Xrm.Page.context.getClientUrl() + '/api/data/v8.2/Microsoft.Dynamics.CRM.';

	var req = new XMLHttpRequest();
	req.open('POST', ODataEndpoint + actionName, false);
	req.setRequestHeader('OData-MaxVersion', '4.0');
	req.setRequestHeader('OData-Version', '4.0');
	req.setRequestHeader('Accept', 'application/json');
	req.setRequestHeader('Content-Type', 'application/json; charset=utf-8');
	req.onreadystatechange = function() {
		if (this.readyState === 4) {
			req.onreadystatechange = null;
			if (this.status === 200) {
				result = JSON.parse(this.response);
			} else {
				Xrm.Utility.alertDialog(this.statusText);
			}
		}
	};
	req.send(JSON.stringify(actionParams));

	return result;
}
