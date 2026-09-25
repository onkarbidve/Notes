// OrderTransaction.js

var copyToOrderDialogTitle;
var confirmButtonTxt;
var cancelButtonTxt;
var copyToOrderDialogContent;
var copyProductSuccessful;
var copyProductUnsuccessfulDueToQuantity;
var messageEventDatesNotSelected;
var retrieveButtonTxt;
var newButtonTxt;
var pastTransactionMsg;
var pastTransactionTitle;
var productOnClicking = false;
var processingMessage;

function onLoad(Executioncontext) {
	debugger;
	var currentBPFName = Xrm.Page.data.process.getInstanceName();
	// If page is reloaded for edit, auto reactivate bpf
	if (Xrm.Page.data.process.getStatus() == 'finished') {
		Xrm.Page.data.process.setStatus('active');
	}
	var assignBPFId = 'E448EDB5-31DC-4C13-8216-8EFDBED23970';
	var productId = Xrm.Page.getAttribute('gmb_product').getValue()[0].id.replace('{', '').replace('}', '');
	var req = new XMLHttpRequest();
	req.open(
		'GET',
		Xrm.Page.context.getClientUrl() + '/api/data/v8.2/products(' + productId + ')?$select=gmb_financialtypeno',
		false);
	req.setRequestHeader('OData-MaxVersion', '4.0');
	req.setRequestHeader('OData-Version', '4.0');
	req.setRequestHeader('Accept', 'application/json');
	req.setRequestHeader('Content-Type', 'application/json; charset=utf-8');
	req.setRequestHeader('Prefer', 'odata.include-annotations="*"');
	req.onreadystatechange = function () {
		if (this.readyState === 4) {
			req.onreadystatechange = null;
			if (this.status === 200) {
				var assignBPFId;
				var result = JSON.parse(this.response);
				var gmb_financialtypeno = result['gmb_financialtypeno'];
				if (gmb_financialtypeno == '12') {
					// Course
					assignBPFId = 'E448EDB5-31DC-4C13-8216-8EFDBED23970'; // Order Transaction Flow
				}
				else {
					assignBPFId = 'B70ADB87-86C2-495B-A977-648E62C3CE22'; // ORder Transaction Flow Non Registration
				}
				if (
					currentBPFName == 'Order Transaction Flow' && assignBPFId == 'B70ADB87-86C2-495B-A977-648E62C3CE22') {
					Xrm.Page.data.process.setActiveProcess(assignBPFId, function () { });
				}
				else if (
					currentBPFName != 'Order Transaction Flow' && assignBPFId != 'B70ADB87-86C2-495B-A977-648E62C3CE22') {
					Xrm.Page.data.process.setActiveProcess(assignBPFId, function () { });
				}
			}
			else {
				Xrm.Utility.alertDialog(this.statusText);
			}
		}
	};
	req.send();
	loadMessages();
	if (Xrm.Page.data.process.getActiveStage()) {
		checkIsCourse();
		hideStageHeaderFields();
		disableCustomerFields();
		checkBPFStage();
		Xrm.Page.data.process.addOnStageChange(checkBPFStage);
		Xrm.Page.data.process.addOnProcessStatusChange(function onChange() {
			checkBPFStage(true);
		});
	}
	addEventToGridRefresh();
}

function disableCustomerFields() {
	if (Xrm.Page.getControl('header_gmb_customer') != null) Xrm.Page.getControl('header_gmb_customer').setDisabled(true);
}

function loadMessages() {
	copyToOrderDialogTitle = Xrm.Utility.getResourceString('gmb_/resx/messages', 'copyToOrderDialogTitle');
	confirmButtonTxt = Xrm.Utility.getResourceString('gmb_/resx/messages', 'confirmButtonTxt');
	cancelButtonTxt = Xrm.Utility.getResourceString('gmb_/resx/messages', 'cancelButtonTxt');
	copyToOrderDialogContent = Xrm.Utility.getResourceString('gmb_/resx/messages', 'copyToOrderDialogContent')
		.replace('{1}', confirmButtonTxt);
	copyProductSuccessful = Xrm.Utility.getResourceString('gmb_/resx/messages', 'copyProductSuccessful');
	copyProductUnsuccessfulDueToQuantity = Xrm.Utility.getResourceString(
		'gmb_/resx/messages',
		'copyProductUnsuccessfulDueToQuantity');
	messageEventDatesNotSelected = Xrm.Utility.getResourceString('gmb_/resx/messages', 'eventDateNotSelected');
	retrieveButtonTxt = Xrm.Utility.getResourceString('gmb_/resx/messages', 'retrieveButtonTxt');
	newButtonTxt = Xrm.Utility.getResourceString('gmb_/resx/messages', 'newButtonTxt');
	pastTransactionMsg = Xrm.Utility.getResourceString('gmb_/resx/messages', 'pastTransactionMsg');
	pastTransactionTitle = Xrm.Utility.getResourceString('gmb_/resx/messages', 'pastTransactionTitle');
	processingMessage = Xrm.Utility.getResourceString('gmb_/resx/messages', 'processing');
}

function hideStageHeaderFields() {
	if (Xrm.Page.getControl('header_process_gmb_eventregistered') != null) {
		Xrm.Page.getControl('header_process_gmb_eventregistered').setVisible(false);
	}
	if (Xrm.Page.getControl('header_process_gmb_feedbackdone') != null) {
		Xrm.Page.getControl('header_process_gmb_feedbackdone').setVisible(false);
	}
	if (Xrm.Page.getControl('header_process_gmb_productselected') != null) {
		Xrm.Page.getControl('header_process_gmb_productselected').setVisible(false);
	}
}
var refreshTimer;
var windowRefreshTimer;

function addEventToGridRefresh() {
	// retrieve the subgrid
	var grid = Xrm.Page.getControl('subgrid_orderproduct');
	// if the subgrid still not available we try again after 2 second
	if (grid == null) {
		clearTimeout(refreshTimer);
		refreshTimer = setTimeout(function () {
			addEventToGridRefresh();
		}, 2000);
		return;
	}
	// add the function to the onRefresh event
	//Xrm.Page.getControl("subgrid_orderproduct").addOnLoad(function () {
	//    var gridCount = Xrm.Page.getControl("subgrid_orderproduct").getGrid().getTotalRecordCount();
	//    if (gridCount > 0) {
	//        Xrm.Page.getControl("header_process_gmb_productselected").getAttribute().setValue(true);
	//        //Xrm.Page.ui.process.setDisplayState("floating");
	//    }
	//    else {
	//        Xrm.Page.getControl("header_process_gmb_productselected").getAttribute().setValue(false);
	//    }
	//});
	Xrm.Page.getControl('subgrid_orderproduct').addOnLoad(function () {
		clearTimeout(windowRefreshTimer);
		windowRefreshTimer = window.setTimeout(getSubgridCountAsync, 3000);
	});
}

function getSubgridCountAsync() {
	var recordGuid = Xrm.Page.data.entity.getId().replace('{', '').replace('}', '');
	var req = new XMLHttpRequest();
	req.open(
		'GET',
		Xrm.Page.context.getClientUrl() +
		'/api/data/v8.2/salesorderdetails?$filter=_gmb_ordertransaction_value eq ' + recordGuid +
		' and gmb_istemplate eq false',
		true);
	req.setRequestHeader('OData-MaxVersion', '4.0');
	req.setRequestHeader('OData-Version', '4.0');
	req.setRequestHeader('Accept', 'application/json');
	req.setRequestHeader('Content-Type', 'application/json; charset=utf-8');
	req.setRequestHeader('Prefer', 'odata.include-annotations="*"');
	req.onreadystatechange = function () {
		if (this.readyState === 4) {
			req.onreadystatechange = null;
			if (this.status === 200) {
				var results = JSON.parse(this.response);
				if (
					results.value.length != Xrm.Page.getControl('subgrid_orderproduct').getGrid().getTotalRecordCount()) {
					// Temp remove
					Xrm.Page.getControl('subgrid_orderproduct').refresh();
					updateTotalCost(false);
				}
				else {
					var quantityChange = false;
					var gridItems = Xrm.Page.getControl('subgrid_orderproduct').getGrid().getRows();
					for (var i = 0; i < results.value.length; i++) {
						var quantity = results.value[i]['quantity'];
						gridItems.forEach(function (selectedRow, i) {
							if (
								results.value[1].salesorderdetailid == selectedRow.data.entity.getId().replace('{', '').replace('}', '')) {
								var attributes = selectedRow.getData().getEntity().attributes;
								attributes.forEach(function (attribute, i) {
									if (attribute.getName() == 'quantity' && attribute.getValue() != quantity) {
										quantityChange = true;
									}
								});
							}
						});
						if (quantityChange) {
							// Temp remove
							Xrm.Page.getControl('subgrid_orderproduct').refresh();
							updateTotalCost(false);
							break;
						}
					}
				}
				clearTimeout(windowRefreshTimer);
				windowRefreshTimer = window.setTimeout(getSubgridCountAsync, 3000);
			}
			else {
				Xrm.Utility.alertDialog(this.statusText);
			}
		}
	};
	req.send();
}

function getOrderContact(orderId) {
	var contactId = '';
	var req = new XMLHttpRequest();
	req.open(
		'GET',
		Xrm.Page.context.getClientUrl() + '/api/data/v8.2/salesorders(' + orderId + ')?$select=_customerid_value',
		false);
	req.setRequestHeader('OData-MaxVersion', '4.0');
	req.setRequestHeader('OData-Version', '4.0');
	req.setRequestHeader('Accept', 'application/json');
	req.setRequestHeader('Content-Type', 'application/json; charset=utf-8');
	req.setRequestHeader('Prefer', 'odata.include-annotations="*"');
	req.onreadystatechange = function () {
		if (this.readyState === 4) {
			req.onreadystatechange = null;
			if (this.status === 200) {
				var result = JSON.parse(this.response);
				if (result['_customerid_value@Microsoft.Dynamics.CRM.lookuplogicalname'] == 'contact') {
					contactId = result['_customerid_value'];
				}
				else {
					Xrm.Utility.alertDialog('Event Registration is only available for contacts.');
				}
			}
			else {
				Xrm.Utility.alertDialog(this.statusText);
			}
		}
	};
	req.send();
	return contactId;
}

function deleteEventRegistrations(events) {
	debugger;
	var transactionId = Xrm.Page.data.entity.getId().replace('{', '').replace('}', '');
	// var sessionRegistrations = getTransactionSessions(transactionId);
	deleteEventRegistration(events, 0, true, []);
	// for (var i = 0; i < events.length; i++) {
	// var eventId = getEventRegistrationEventId(events[i]);
	// for (var j = 0; j < sessionRegistrations.length; j++) {
	//     if (sessionRegistrations[j]["_msevtmgt_event_value"] == eventId) {
	//         var sessionId = sessionRegistrations[j]["msevtmgt_sessionregistrationid"];
	//         Xrm.WebApi.deleteRecord("msevtmgt_sessionregistration", sessionId).then(
	//             function success(result) {
	//                 console.log("Session Registration deleted.");
	//                 Xrm.Page.getControl("subgrid_session").refresh();
	//                 // perform operations on record deletion
	//             },
	//             function (error) {
	//                 console.log(error.message);
	//                 // handle error conditions
	//             }
	//         );
	//     }
	// }
	// }
}

function deleteSessionRegistrations(sessions) {
	debugger;
	var transactionId = Xrm.Page.data.entity.getId().replace('{', '').replace('}', '');
	var eventRegistrations = getTransactionEvents(transactionId);
	var sessionRegistrations = getTransactionSessions(transactionId);
	var matchingSessionIds = [];
	var eventsToDelete = [];
	for (var i = 0; i < sessions.length; i++) {
		for (var j = 0; j < sessionRegistrations.length; j++) {
			var sessionRegistrationId = sessionRegistrations[j]['msevtmgt_sessionregistrationid'];
			if (sessionRegistrationId == sessions[i]) matchingSessionIds.push(sessionRegistrations[j]['_msevtmgt_sessionid_value']);
		}
	}
	for (var i = 0; i < eventRegistrations.length; i++) {
		var eventRegistrationId = eventRegistrations[i]['msevtmgt_eventregistrationid'];
		var eventId = getEventRegistrationEventId(eventRegistrationId);
		var eventSessions = getEventSessions(eventId);
		if (eventSessions.length > 0) {
			var matchingSessions = 0;
			var cleanupSessionIndexes = [];
			for (var j = 0; j < eventSessions.length; j++) {
				var sessionId = eventSessions[j]['msevtmgt_sessionid'];
				var matchingIndex = matchingSessionIds.indexOf(sessionId);
				if (matchingIndex != -1) {
					cleanupSessionIndexes.push(matchingIndex);
					matchingSessions++;
				}
			}
			if (matchingSessions == eventSessions.length) {
				for (var k = sessions.length; k >= 0; k--) {
					if (cleanupSessionIndexes.includes(k)) sessions.splice(k, 1);
				}
				eventsToDelete.push(eventRegistrationId);
			}
		}
	}
	if (eventsToDelete.length > 0) {
		deleteEventRegistration(eventsToDelete, 0, false, sessions);
	}
	else if (sessions.length > 0) {
		deleteSessionRegistration(sessions, 0, true);
	}
}

function deleteEventRegistration(events, index, save, sessions) {
	if (index == events.length) {
		Xrm.Page.getControl('subgrid_event').refresh();
		Xrm.Page.getControl('subgrid_session').refresh();
		if (sessions.length > 0) deleteSessionRegistration(sessions, 0, true);
		else updateTotalCost(save);
		return;
	}
	var eventId = getEventRegistrationEventId(events[index]);
	var orderId = Xrm.Page.getAttribute('gmb_order').getValue()[0].id.replace('{', '').replace('}', '');
	var transactionId = Xrm.Page.data.entity.getId().replace('{', '').replace('}', '');
	var salesorderdetailId = getDetailId(eventId, orderId, transactionId);
	if (salesorderdetailId != '') deleteRegistrationProduct(salesorderdetailId);
	Xrm.WebApi.deleteRecord('msevtmgt_eventregistration', events[index]).then(

		function success(result) {
			console.log('Event Registration deleted.');
			index++;
			deleteEventRegistration(events, index, save, sessions);
			// perform operations on record deletion
		},

		function (error) {
			console.log(error.message);
			index++;
			deleteEventRegistration(events, index, save, sessions);
			// handle error conditions
		});
}

function getDetailId(eventId, orderId, transactionId) {
	var detailId = '';
	var req = new XMLHttpRequest();
	req.open(
		'GET',
		Xrm.Page.context.getClientUrl() +
		'/api/data/v8.2/salesorderdetails?$select=salesorderdetailid&$filter=_salesorderid_value eq ' + orderId +
		' and _gmb_event_value eq ' + eventId +
		' and _gmb_ordertransaction_value eq ' + transactionId,
		false);
	req.setRequestHeader('OData-MaxVersion', '4.0');
	req.setRequestHeader('OData-Version', '4.0');
	req.setRequestHeader('Accept', 'application/json');
	req.setRequestHeader('Content-Type', 'application/json; charset=utf-8');
	req.setRequestHeader('Prefer', 'odata.include-annotations="*"');
	req.onreadystatechange = function () {
		if (this.readyState === 4) {
			req.onreadystatechange = null;
			if (this.status === 200) {
				var results = JSON.parse(this.response);
				if (results.value.length > 0) {
					detailId = results.value[0]['salesorderdetailid'];
				}
				// for (var i = 0; i < results.value.length; i++) {
				//     var gmb_istemplate = results.value[i]["gmb_istemplate"];
				//     var gmb_istemplate_formatted = results.value[i]["gmb_istemplate@OData.Community.Display.V1.FormattedValue"];
				//     var salesorderdetailid = results.value[i]["salesorderdetailid"];
				// }
			}
			else {
				Xrm.Utility.alertDialog(this.statusText);
			}
		}
	};
	req.send();
	return detailId;
}

function deleteSessionRegistration(sessions, index, save) {
	if (index == sessions.length) {
		Xrm.Page.getControl('subgrid_session').refresh();
		updateTotalCost(save);
		return;
	}
	Xrm.WebApi.deleteRecord('msevtmgt_sessionregistration', sessions[index]).then(

		function success(result) {
			console.log('Session Registration deleted.');
			index++;
			deleteSessionRegistration(sessions, index, save);
			// perform operations on record deletion
		},

		function (error) {
			console.log(error.message);
			index++;
			deleteSessionRegistration(sessions, index, save);
			// handle error conditions
		});
}

function getEventSessions(eventId) {
	var eventSessions = [];
	var req = new XMLHttpRequest();
	req.open(
		'GET',
		Xrm.Page.context.getClientUrl() +
		'/api/data/v8.2/msevtmgt_sessions?$filter=_msevtmgt_event_value eq ' + eventId,
		false);
	req.setRequestHeader('OData-MaxVersion', '4.0');
	req.setRequestHeader('OData-Version', '4.0');
	req.setRequestHeader('Accept', 'application/json');
	req.setRequestHeader('Content-Type', 'application/json; charset=utf-8');
	req.setRequestHeader('Prefer', 'odata.include-annotations="*"');
	req.onreadystatechange = function () {
		if (this.readyState === 4) {
			req.onreadystatechange = null;
			if (this.status === 200) {
				var results = JSON.parse(this.response);
				eventSessions = results.value;
				// for (var i = 0; i < results.value.length; i++) {
				//     var msevtmgt_sessionid = results.value[i]["msevtmgt_sessionid"];
				// }
			}
			else {
				Xrm.Utility.alertDialog(this.statusText);
			}
		}
	};
	req.send();
	return eventSessions;
}

function getEventRegistrationEventId(registrationId) {
	var eventId = '';
	var req = new XMLHttpRequest();
	req.open(
		'GET',
		Xrm.Page.context.getClientUrl() +
		'/api/data/v8.2/msevtmgt_eventregistrations(' + registrationId +
		')?$select=_msevtmgt_eventid_value',
		false);
	req.setRequestHeader('OData-MaxVersion', '4.0');
	req.setRequestHeader('OData-Version', '4.0');
	req.setRequestHeader('Accept', 'application/json');
	req.setRequestHeader('Content-Type', 'application/json; charset=utf-8');
	req.setRequestHeader('Prefer', 'odata.include-annotations="*"');
	req.onreadystatechange = function () {
		if (this.readyState === 4) {
			req.onreadystatechange = null;
			if (this.status === 200) {
				var result = JSON.parse(this.response);
				eventId = result['_msevtmgt_eventid_value'];
			}
			else {
				Xrm.Utility.alertDialog(this.statusText);
			}
		}
	};
	req.send();
	return eventId;
}
// Custom function to call instead of the OOTB Add Existing button/command - all 3 parameters can be passed as CRM Parameters from the ribbon

function filterAddExistingEvent(selectedControl) {
	// if (selectedControl.getRelationship().name == "gmb_gmb_ordertransaction_msevtmgt_event") {
	if (
		selectedControl.getRelationship().name == 'gmb_gmb_ordertransaction_msevtmgt_eventregistration_OrderTransaction') {
		// Custom Account -> Contact N:N - filters to show only contacts with this account as the parentcustomerid
		var selectedProduct = Xrm.Page.getAttribute('gmb_product').getValue();
		var parentRecordId = Xrm.Page.data.entity.getId();
		var contactId = getOrderContact(
			Xrm.Page.getAttribute('gmb_order').getValue()[0].id.replace('{', '').replace('}', ''));
		if (contactId == '') return;
		var additionalFilter = '';
		//Commenting the code since users want more than one registration for single donor for same course 
		//var existingRegistrations = getExistingRegistrations(contactId);
		//for (var i = 0; i < existingRegistrations.length; i++)
		//{
		//	// msevtmgt_eventregistrationid
		//	var msevtmgt_eventid = existingRegistrations[i]['_msevtmgt_eventid_value'];
		//	additionalFilter +=
		//		"<condition attribute='msevtmgt_eventid' value='" + msevtmgt_eventid +
		//		"' uitype='msevtmgt_event' operator='ne'/>";
		//}
		if (selectedProduct != null) {
			var selectedProductId = selectedProduct[0].id;
			var CustomFilter =
				'<filter type="and">' +
				'<condition attribute="gmb_product" operator="eq" uitype="product" value= "' + selectedProductId +
				'" />' +
				'<condition attribute="msevtmgt_publishstatus" operator="eq" value="100000003" />' + additionalFilter +
				'</filter>';
			var options = {
				//defaultEntityType: "gmb_ordertransaction",
				//entityTypes: ["gmb_ordertransaction,product"],
				defaultEntityType: 'msevtmgt_event',
				entityTypes: ['msevtmgt_event'],
				allowMultiSelect: true,
				//showNew: false,
				//customFilterTypes: ["product"],
				// customFilters: [encodeURIComponent("<filter type='and'><condition attribute='parentcustomerid' operator='eq' value='" + Xrm.Page.data.entity.getId() + "' /></filter>")]
				//customFilters: [encodeURIComponent("<filter type='and'><condition attribute='statecode' operator='eq' value='2' /></filter>")]
				//customFilters: [encodeURIComponent("<link-entity name='gmb_gmb_ordertransaction_product' from='productid' to='productid' visible='false' intersect='true'><link-entity name='gmb_ordertransaction' from='gmb_ordertransactionid' to='gmb_ordertransactionid' alias='af'><filter type='and'><condition attribute='gmb_ordertransactionid' operator='eq' uitype='gmb_ordertransaction' value='" + Xrm.Page.data.entity.getId() + "' /></filter></link-entity></link-entity>")]
				filters: [
					{
						filterXml: CustomFilter
					}],
				disableMru: true
				//filters: [{ filterXml: encodeURIComponent("<filter type='and'><condition attribute='statecode' operator='eq' value='1' /></filter>") }]
			};
			lookupAddExistingRecords(
				'gmb_gmb_ordertransaction_msevtmgt_eventregistration_OrderTransaction',
				'gmb_ordertransaction',
				'msevtmgt_eventregistration',
				parentRecordId,
				contactId,
				selectedControl,
				options);
		}
		else {
			Xrm.Utility.alertDialog(Xrm.Utility.getResourceString('gmb_/resx/messages', 'productNotSelected'));
		}
	}
	else {
		// Any other contact relationship (N:N or 1:N) - use default behaviour
		XrmCore.Commands.AddFromSubGrid.addExistingFromSubGridAssociated(selectedEntityTypeName, selectedControl);
	}
}

function getExistingRegistrations(contactId) {
	var existingRegistrations = [];
	var req = new XMLHttpRequest();
	req.open(
		'GET',
		Xrm.Page.context.getClientUrl() +
		'/api/data/v8.2/msevtmgt_eventregistrations?$select=_msevtmgt_eventid_value&$filter=_msevtmgt_contactid_value eq ' + contactId,
		false);
	req.setRequestHeader('OData-MaxVersion', '4.0');
	req.setRequestHeader('OData-Version', '4.0');
	req.setRequestHeader('Accept', 'application/json');
	req.setRequestHeader('Content-Type', 'application/json; charset=utf-8');
	req.setRequestHeader('Prefer', 'odata.include-annotations="*"');
	req.onreadystatechange = function () {
		if (this.readyState === 4) {
			req.onreadystatechange = null;
			if (this.status === 200) {
				var results = JSON.parse(this.response);
				existingRegistrations = results.value;
			}
			else {
				Xrm.Utility.alertDialog(this.statusText);
			}
		}
	};
	req.send();
	return existingRegistrations;
}

function filterAddExistingSession(selectedControl) {
	if (
		selectedControl.getRelationship().name ==
		'gmb_gmb_ordertransaction_msevtmgt_sessionregistration_OrderTransaction') {
		// Custom Account -> Contact N:N - filters to show only contacts with this account as the parentcustomerid
		var selectedProduct = Xrm.Page.getAttribute('gmb_product').getValue();
		var parentRecordId = Xrm.Page.data.entity.getId();
		var contactId = getOrderContact(
			Xrm.Page.getAttribute('gmb_order').getValue()[0].id.replace('{', '').replace('}', ''));
		var additionalFilter = '';
		var req = new XMLHttpRequest();
		req.open(
			'GET',
			Xrm.Page.context.getClientUrl() +
			'/api/data/v8.2/msevtmgt_sessionregistrations?$select=_msevtmgt_sessionid_value&$filter=_gmb_ordertransaction_value eq ' + parentRecordId.replace('{', '').replace('}', ''),
			false);
		req.setRequestHeader('OData-MaxVersion', '4.0');
		req.setRequestHeader('OData-Version', '4.0');
		req.setRequestHeader('Accept', 'application/json');
		req.setRequestHeader('Content-Type', 'application/json; charset=utf-8');
		req.onreadystatechange = function () {
			if (this.readyState === 4) {
				req.onreadystatechange = null;
				if (this.status === 200) {
					var results = JSON.parse(this.response);
					additionalFilter = "<condition attribute='msevtmgt_sessionid' operator='not-in'>";
					for (var i = 0; i < results.value.length; i++) {
						var msevtmgt_sessionid = results.value[i]['_msevtmgt_sessionid_value'];
						additionalFilter += "<value uitype='msevtmgt_session'>" + msevtmgt_sessionid + '</value>';
					}
					if (results.value.length > 0) {
						additionalFilter += '</condition>';
					}
					else {
						additionalFilter = '';
					}
					var eventFilter = buildEventFilter(parentRecordId);
					if (selectedProduct != null) {
						var CustomFilter = '<filter type="and">' + eventFilter + additionalFilter + '</filter>';
						var options = {
							//defaultEntityType: "gmb_ordertransaction",
							//entityTypes: ["gmb_ordertransaction,product"],
							defaultEntityType: 'msevtmgt_session',
							entityTypes: ['msevtmgt_session'],
							allowMultiSelect: true,
							//showNew: false,
							//customFilterTypes: ["product"],
							// customFilters: [encodeURIComponent("<filter type='and'><condition attribute='parentcustomerid' operator='eq' value='" + Xrm.Page.data.entity.getId() + "' /></filter>")]
							//customFilters: [encodeURIComponent("<filter type='and'><condition attribute='statecode' operator='eq' value='2' /></filter>")]
							//customFilters: [encodeURIComponent("<link-entity name='gmb_gmb_ordertransaction_product' from='productid' to='productid' visible='false' intersect='true'><link-entity name='gmb_ordertransaction' from='gmb_ordertransactionid' to='gmb_ordertransactionid' alias='af'><filter type='and'><condition attribute='gmb_ordertransactionid' operator='eq' uitype='gmb_ordertransaction' value='" + Xrm.Page.data.entity.getId() + "' /></filter></link-entity></link-entity>")]
							filters: [
								{
									filterXml: CustomFilter
								}],
							disableMru: true
							//filters: [{ filterXml: encodeURIComponent("<filter type='and'><condition attribute='statecode' operator='eq' value='1' /></filter>") }]
						};
						lookupAddExistingRecords(
							'gmb_gmb_ordertransaction_msevtmgt_sessionregistration_OrderTransaction',
							'gmb_ordertransaction',
							'msevtmgt_session',
							parentRecordId,
							contactId,
							selectedControl,
							options);
					}
					else {
						Xrm.Utility.alertDialog(
							Xrm.Utility.getResourceString('gmb_/resx/messages', 'productNotSelected'));
					}
				}
				else {
					Xrm.Utility.alertDialog(this.statusText);
				}
			}
		};
		req.send();
	}
	else {
		// Any other contact relationship (N:N or 1:N) - use default behaviour
		XrmCore.Commands.AddFromSubGrid.addExistingFromSubGridAssociated(selectedEntityTypeName, selectedControl);
	}
}

function lookupAddExistingRecords(
	relationshipName,
	primaryEntity,
	relatedEntity,
	parentRecordId,
	contactId,
	gridControl,
	lookupOptions) {
	try {
		Xrm.Utility.lookupObjects(lookupOptions).then(

			function (results) {
				// Get the entitySet name for the primary entity
				Xrm.Utility.getEntityMetadata(primaryEntity).then(function (primaryEntityData) {
					var primaryEntitySetName = primaryEntityData.EntitySetName;
					// Get the entitySet name for the related entity
					Xrm.Utility.getEntityMetadata(relatedEntity).then(function (relatedEntityData) {
						var relatedEntitySetName = relatedEntityData.EntitySetName;
						// Create Event Registration Records and Session Registration Records
						if (relationshipName == 'gmb_gmb_ordertransaction_msevtmgt_eventregistration_OrderTransaction') createEventRegistrationRecords(
							relationshipName,
							primaryEntitySetName,
							relatedEntitySetName,
							relatedEntity,
							parentRecordId.replace('{', '').replace('}', ''),
							contactId,
							gridControl,
							results,
							0);
						else if (
							relationshipName == 'gmb_gmb_ordertransaction_msevtmgt_sessionregistration_OrderTransaction') {
							findSessionDetails(results, parentRecordId, contactId, 0);
						}
					});
				});
			},

			function (error) {
				Xrm.Utility.alertDialog(error);
			});
	}
	catch (e) {
		console.log(e);
	}
}

function createEventRegistrationRecords(
	relationshipName,
	primaryEntitySetName,
	relatedEntitySetName,
	relatedEntity,
	parentRecordId,
	contactId,
	gridControl,
	results,
	index) {
	if (index >= results.length) {
		// Refresh the grid once completed
		Xrm.Page.ui.setFormNotification(
			Xrm.Utility.getResourceString('gmb_/resx/messages', 'transactionAssociatedNotification')
				.replace('{0}', index),
			'INFO',
			'associate');
		if (gridControl) {
			gridControl.refresh();
		}
		// Clear the final notification after 2 seconds
		setTimeout(function () {
			Xrm.Page.ui.clearFormNotification('associate');
		}, 2000);
		// Update BPF
		Xrm.Page.getControl('header_process_gmb_eventregistered').getAttribute().setValue(true);
		Xrm.Page.ui.process.setDisplayState('floating');
		updateTotalCost(false);
		return;
	}
	Xrm.Page.ui.setFormNotification(
		Xrm.Utility.getResourceString('gmb_/resx/messages', 'transactionAssociatingNotification')
			.replace('{0}', index + 1)
			.replace('{1}', results.length),
		'INFO',
		'associate');
	var eventId = results[index].id.replace('{', '').replace('}', '');
	var entity = {};
	entity['msevtmgt_ContactId@odata.bind'] = '/contacts(' + contactId + ')';
	entity['msevtmgt_EventId@odata.bind'] = '/msevtmgt_events(' + eventId + ')';
	entity['gmb_OrderTransaction@odata.bind'] = '/gmb_ordertransactions(' + parentRecordId + ')';
	var req = new XMLHttpRequest();
	req.open('POST', Xrm.Page.context.getClientUrl() + '/api/data/v8.2/' + relatedEntitySetName, true);
	req.setRequestHeader('OData-MaxVersion', '4.0');
	req.setRequestHeader('OData-Version', '4.0');
	req.setRequestHeader('Accept', 'application/json');
	req.setRequestHeader('Content-Type', 'application/json; charset=utf-8');
	req.onreadystatechange = function () {
		if (this.readyState === 4) {
			index++;
			req.onreadystatechange = null;
			if (this.status === 204 || this.status === 1223) {
				var uri = this.getResponseHeader('OData-EntityId');
				var regExp = /\(([^)]+)\)/;
				var matches = regExp.exec(uri);
				var registrationId = matches[1];
				if (relationshipName == 'gmb_gmb_ordertransaction_msevtmgt_eventregistration_OrderTransaction') {
					findEventSessions(results, index - 1, parentRecordId, contactId, eventId, registrationId);
				}
				createEventRegistrationRecords(
					relationshipName,
					primaryEntitySetName,
					relatedEntitySetName,
					relatedEntity,
					parentRecordId,
					contactId,
					gridControl,
					results,
					index);
			}
			else {
				var error = JSON.parse(this.response).error.message;
				if (error == "This event is sold out, so new registrations aren't allowed.") {
					// Find & Create Session Regisrations
					// if (relationshipName == "gmb_gmb_ordertransaction_msevtmgt_eventregistration_OrderTransaction") {
					//     findEventSessions(results, (index-1), primaryEntitySetName, parentRecordId, contactId);
					// }
					// Process the next item in the list
					createEventRegistrationRecords(
						relationshipName,
						primaryEntitySetName,
						relatedEntitySetName,
						relatedEntity,
						parentRecordId,
						contactId,
						gridControl,
						results,
						index);
				}
				Xrm.Utility.alertDialog(error);
				Xrm.Page.ui.clearFormNotification('associate');
				if (gridControl) {
					gridControl.refresh();
				}
				refreshSessionSubGrid(false);
			}
		}
	};
	req.send(JSON.stringify(entity));
}
// function associateAddExistingResults(relationshipName, primaryEntitySetName, relatedEntitySetName, relatedEntity, parentRecordId, gridControl, results, index) {
//     debugger;
//     if (index >= results.length) {
//         // Refresh the grid once completed
//         Xrm.Page.ui.setFormNotification(Xrm.Utility.getResourceString("gmb_/resx/messages", "transactionAssociatedNotification").replace("{0}", index), "INFO", "associate");
//         if (gridControl) { gridControl.refresh(); }
//         // Clear the final notification after 2 seconds
//         setTimeout(function () {
//             Xrm.Page.ui.clearFormNotification("associate");
//         }, 2000);
//         // Update BPF
//         Xrm.Page.getControl("header_process_gmb_eventregistered").getAttribute().setValue(true);
//         Xrm.Page.ui.process.setDisplayState("floating");
//         return;
//     }
//     Xrm.Page.ui.setFormNotification(Xrm.Utility.getResourceString("gmb_/resx/messages", "transactionAssociatingNotification").replace("{0}", (index + 1)).replace("{1}", results.length), "INFO", "associate");
//     var lookupId = results[index].id.replace("{", "").replace("}", "");
//     var lookupEntity = results[index].entityType || results[index].typename;
//     var primaryId = parentRecordId;
//     var relatedId = lookupId;
//     if (lookupEntity.toLowerCase() != relatedEntity.toLowerCase()) {
//         // If the related entity is different to the lookup entity flip the primary and related id's
//         primaryId = lookupId;
//         relatedId = parentRecordId;
//     }
//     var association = { '@odata.id': Xrm.Page.context.getClientUrl() + "/api/data/v9.0/" + relatedEntitySetName + "(" + relatedId + ")" };
//     var req = new XMLHttpRequest();
//     req.open("POST", Xrm.Page.context.getClientUrl() + "/api/data/v9.0/" + primaryEntitySetName + "(" + primaryId + ")/" + relationshipName + "/$ref", true);
//     req.setRequestHeader("Accept", "application/json");
//     req.setRequestHeader("Content-Type", "application/json; charset=utf-8");
//     req.setRequestHeader("OData-MaxVersion", "4.0");
//     req.setRequestHeader("OData-Version", "4.0");
//     req.onreadystatechange = function () {
//         if (this.readyState === 4) {
//             req.onreadystatechange = null;
//             index++;
//             if (this.status === 204 || this.status === 1223) {
//                 // Success
//                 // Find & Associate event sessions
//                 if (relationshipName == "gmb_gmb_ordertransaction_msevtmgt_eventregistration_OrderTransaction") {
//                     findEventSessions(results, (index-1), primaryEntitySetName, parentRecordId);
//                 }
//                 // Process the next item in the list
//                 associateAddExistingResults(relationshipName, primaryEntitySetName, relatedEntitySetName, relatedEntity, parentRecordId, gridControl, results, index);
//             }
//             else {
//                 // Error
//                 var error = JSON.parse(this.response).error.message;
//                 if (error == "A record with matching key values already exists.") {
//                     // Find & Associate event sessions
//                     if (relationshipName == "gmb_gmb_ordertransaction_msevtmgt_eventregistration_OrderTransaction") {
//                         findEventSessions(results, (index-1), primaryEntitySetName, parentRecordId);
//                     }
//                     // Process the next item in the list
//                     associateAddExistingResults(relationshipName, primaryEntitySetName, relatedEntitySetName, relatedEntity, parentRecordId, gridControl, results, index);
//                 }
//                 else {
//                     Xrm.Utility.alertDialog(error);
//                     Xrm.Page.ui.clearFormNotification("associate");
//                     if (gridControl) { gridControl.refresh(); }
//                     refreshSessionSubGrid();
//                 }
//             }
//         }
//     };
//     req.send(JSON.stringify(association));
// }

function buildEventFilter(parentRecordId) {
	var eventFilter = "<condition attribute='msevtmgt_event' operator='in'>";
	var req = new XMLHttpRequest();
	req.open(
		'GET',
		Xrm.Page.context.getClientUrl() +
		'/api/data/v8.2/msevtmgt_eventregistrations?$select=_msevtmgt_eventid_value&$filter=_gmb_ordertransaction_value eq ' + parentRecordId.replace('{', '').replace('}', ''),
		false);
	req.setRequestHeader('OData-MaxVersion', '4.0');
	req.setRequestHeader('OData-Version', '4.0');
	req.setRequestHeader('Accept', 'application/json');
	req.setRequestHeader('Content-Type', 'application/json; charset=utf-8');
	req.onreadystatechange = function () {
		if (this.readyState === 4) {
			req.onreadystatechange = null;
			if (this.status === 200) {
				var results = JSON.parse(this.response);
				for (var i = 0; i < results.value.length; i++) {
					var msevtmgt_eventid = results.value[i]['_msevtmgt_eventid_value'];
					eventFilter += "<value uitype='msevtmgt_event'>" + msevtmgt_eventid + '</value>';
				}
				if (results.value.length == 0) {
					eventFilter += "<value uitype='msevtmgt_event'>4f6f0e8a-5bdd-4fb4-9ffe-d3ed5b0defb9</value>";
				}
			}
			else {
				Xrm.Utility.alertDialog(this.statusText);
			}
		}
	};
	req.send();
	eventFilter += '</condition>';
	return eventFilter;
}

function findEventSessions(results, index, parentRecordId, contactId, eventId, registrationId) {
	if (index >= results.length) {
		return;
	}
	var sessionEntitySetName = 'msevtmgt_sessions';
	var req = new XMLHttpRequest();
	req.open(
		'GET',
		Xrm.Page.context.getClientUrl() +
		'/api/data/v9.0/' + sessionEntitySetName +
		'?$filter=_msevtmgt_event_value eq ' + eventId,
		false);
	req.setRequestHeader('OData-MaxVersion', '4.0');
	req.setRequestHeader('OData-Version', '4.0');
	req.setRequestHeader('Accept', 'application/json');
	req.setRequestHeader('Content-Type', 'application/json; charset=utf-8');
	req.setRequestHeader('Prefer', 'odata.include-annotations="*"');
	req.onreadystatechange = function () {
		if (this.readyState === 4) {
			req.onreadystatechange = null;
			if (this.status === 200) {
				var sessionResults = JSON.parse(this.response);
				if (sessionResults.value.length == 0) return;
				createSessionRegistrationRecords(sessionResults, parentRecordId, contactId, eventId, registrationId, 0);
			}
			else {
				Xrm.Utility.alertDialog(this.statusText);
			}
		}
	};
	req.send();
}

function findSessionDetails(results, parentRecordId, contactId, index) {
	if (index >= results.length) {
		return;
	}
	var sessionId = results[index].id.replace('{', '').replace('}', '');
	var req = new XMLHttpRequest();
	req.open(
		'GET',
		Xrm.Page.context.getClientUrl() +
		'/api/data/v8.2/msevtmgt_sessions(' + sessionId +
		')?$select=_msevtmgt_event_value',
		false);
	req.setRequestHeader('OData-MaxVersion', '4.0');
	req.setRequestHeader('OData-Version', '4.0');
	req.setRequestHeader('Accept', 'application/json');
	req.setRequestHeader('Content-Type', 'application/json; charset=utf-8');
	req.setRequestHeader('Prefer', 'odata.include-annotations="*"');
	req.onreadystatechange = function () {
		if (this.readyState === 4) {
			index++;
			req.onreadystatechange = null;
			if (this.status === 200) {
				var result = JSON.parse(this.response);
				var eventId = result['_msevtmgt_event_value'];
				findEventRegistration(sessionId, parentRecordId, contactId, eventId);
				findSessionDetails(results, parentRecordId, contactId, index);
			}
			else {
				Xrm.Utility.alertDialog(this.statusText);
			}
		}
	};
	req.send();
}

function findEventRegistration(sessionId, parentRecordId, contactId, eventId) {
	var req = new XMLHttpRequest();
	req.open(
		'GET',
		Xrm.Page.context.getClientUrl() +
		'/api/data/v8.2/msevtmgt_eventregistrations?$select=msevtmgt_eventregistrationid&$filter=_msevtmgt_eventid_value eq ' + eventId +
		' and _msevtmgt_contactid_value eq ' + contactId,
		false);
	req.setRequestHeader('OData-MaxVersion', '4.0');
	req.setRequestHeader('OData-Version', '4.0');
	req.setRequestHeader('Accept', 'application/json');
	req.setRequestHeader('Content-Type', 'application/json; charset=utf-8');
	req.setRequestHeader('Prefer', 'odata.include-annotations="*"');
	req.onreadystatechange = function () {
		if (this.readyState === 4) {
			req.onreadystatechange = null;
			if (this.status === 200) {
				var results = JSON.parse(this.response);
				if (results.value.length > 0) {
					var registrationId = results.value[0]['msevtmgt_eventregistrationid'];
					createSessionRegistrationRecord(sessionId, parentRecordId, contactId, eventId, registrationId);
				}
			}
			else {
				Xrm.Utility.alertDialog(this.statusText);
			}
		}
	};
	req.send();
}

function createSessionRegistrationRecord(sessionId, parentRecordId, contactId, eventId, registrationId) {
	var entity = {};
	entity['msevtmgt_contactid@odata.bind'] = '/contacts(' + contactId + ')';
	entity['msevtmgt_Event@odata.bind'] = '/msevtmgt_events(' + eventId + ')';
	entity['msevtmgt_SessionId@odata.bind'] = '/msevtmgt_sessions(' + sessionId + ')';
	entity['msevtmgt_RegistrationID@odata.bind'] = '/msevtmgt_eventregistrations(' + registrationId + ')';
	entity['gmb_OrderTransaction@odata.bind'] =
		'/gmb_ordertransactions(' + parentRecordId.replace('{', '').replace('}', '') + ')';
	var req = new XMLHttpRequest();
	req.open('POST', Xrm.Page.context.getClientUrl() + '/api/data/v8.2/msevtmgt_sessionregistrations', true);
	req.setRequestHeader('OData-MaxVersion', '4.0');
	req.setRequestHeader('OData-Version', '4.0');
	req.setRequestHeader('Accept', 'application/json');
	req.setRequestHeader('Content-Type', 'application/json; charset=utf-8');
	req.onreadystatechange = function () {
		if (this.readyState === 4) {
			req.onreadystatechange = null;
			if (this.status === 204 || this.status === 1223) {
				// var uri = this.getResponseHeader("OData-EntityId");
				// var regExp = /\(([^)]+)\)/;
				// var matches = regExp.exec(uri);
				// var newEntityId = matches[1];
				refreshSessionSubGrid(false);
				updateTotalCost(false);
			}
			else {
				var error = JSON.parse(this.response).error.message;
				Xrm.Utility.alertDialog(error);
				Xrm.Page.ui.clearFormNotification('associate');
				refreshSessionSubGrid(false);
			}
		}
	};
	req.send(JSON.stringify(entity));
}

function createSessionRegistrationRecords(results, parentRecordId, contactId, eventId, registrationId, index) {
	if (index >= results.value.length) {
		refreshSessionSubGrid(false);
		updateTotalCost(false);
		return;
	}
	var sessionId = results.value[index]['msevtmgt_sessionid'];
	var entity = {};
	entity['msevtmgt_contactid@odata.bind'] = '/contacts(' + contactId + ')';
	entity['msevtmgt_Event@odata.bind'] = '/msevtmgt_events(' + eventId + ')';
	entity['msevtmgt_SessionId@odata.bind'] = '/msevtmgt_sessions(' + sessionId + ')';
	entity['msevtmgt_RegistrationID@odata.bind'] = '/msevtmgt_eventregistrations(' + registrationId + ')';
	entity['gmb_OrderTransaction@odata.bind'] = '/gmb_ordertransactions(' + parentRecordId + ')';
	var req = new XMLHttpRequest();
	req.open('POST', Xrm.Page.context.getClientUrl() + '/api/data/v8.2/msevtmgt_sessionregistrations', true);
	req.setRequestHeader('OData-MaxVersion', '4.0');
	req.setRequestHeader('OData-Version', '4.0');
	req.setRequestHeader('Accept', 'application/json');
	req.setRequestHeader('Content-Type', 'application/json; charset=utf-8');
	req.onreadystatechange = function () {
		if (this.readyState === 4) {
			index++;
			req.onreadystatechange = null;
			if (this.status === 204 || this.status === 1223) {
				// var uri = this.getResponseHeader("OData-EntityId");
				// var regExp = /\(([^)]+)\)/;
				// var matches = regExp.exec(uri);
				// var newEntityId = matches[1];
				createSessionRegistrationRecords(results, parentRecordId, contactId, eventId, registrationId, index);
			}
			else {
				var error = JSON.parse(this.response).error.message;
				if (error == 'A record with matching key values already exists.') {
					// Process the next item in the list
					createSessionRegistrationRecords(
						results,
						parentRecordId,
						contactId,
						eventId,
						registrationId,
						index);
				}
				else {
					Xrm.Utility.alertDialog(error);
					Xrm.Page.ui.clearFormNotification('associate');
					refreshSessionSubGrid(false);
				}
			}
		}
	};
	req.send(JSON.stringify(entity));
}

function addProductToOrder(selectedItemReference) {
	var entityFormOptions = {};
	entityFormOptions['entityName'] = 'salesorderdetail';
	//entityFormOptions["useQuickCreateForm"] = true;
	//entityFormOptions["formId"] = "49F39C95-F122-4EFF-A26F-6C3AD8870549";
	entityFormOptions['cmdbar'] = true;
	entityFormOptions['navbar'] = 'off';
	entityFormOptions['openInNewWindow'] = true;
	//entityFormOptions["windowPosition"] = 2;
	//entityFormOptions["width"] = window.parent.innerWidth / 2;
	//entityFormOptions["height"] = window.parent.innerHeight * 3 / 4;
	// Set default values for the Contact form
	var formParameters = {};
	var transaction = Xrm.Page.entityReference;
	var setLookup = new Array();
	setLookup[0] = new Object();
	setLookup[0].id = transaction.id.substring(1, transaction.id.length - 1);
	setLookup[0].name = Xrm.Page.getAttribute('gmb_name').getValue();
	setLookup[0].entityType = transaction.entityType;
	formParameters['gmb_ordertransaction'] = setLookup;
	var order = Xrm.Page.getAttribute('gmb_order').getValue();
	var setLookup = new Array();
	setLookup[0] = new Object();
	setLookup[0].id = order[0].id;
	setLookup[0].name = order[0].name;
	setLookup[0].entityType = order[0].entityType;
	formParameters['salesorderid'] = setLookup;
	var setLookup = new Array();
	setLookup[0] = new Object();
	setLookup[0].id = selectedItemReference[0].Id;
	setLookup[0].name = selectedItemReference[0].Name;
	setLookup[0].entityType = selectedItemReference[0].TypeName;
	formParameters['productid'] = setLookup;
	// Open the form.
	Xrm.Navigation.openForm(entityFormOptions, formParameters).then(

		function (success) {
			console.log(success);
		},

		function (error) {
			console.log(error);
		});
}

function onChangeFeedback() {
	var feedback = Xrm.Page.getAttribute('gmb_learnfeedback').getValue();
	if (feedback != null && feedback.includes(6)) Xrm.Page.getControl('gmb_feedbackother').setVisible(true);
	else Xrm.Page.getControl('gmb_feedbackother').setVisible(false);
}

function onChangeMedical() {
	var medicalCondition = Xrm.Page.getAttribute('gmb_medicalcondition').getValue();
	if (medicalCondition) Xrm.Page.getControl('gmb_medicalconditiondescription').setVisible(true);
	else Xrm.Page.getControl('gmb_medicalconditiondescription').setVisible(false);
}

function checkIsCourse() {
	if (Xrm.Page.getControl('header_process_gmb_iscourse') != null) {
		Xrm.Page.getControl('header_process_gmb_iscourse').setVisible(false);
		Xrm.Page.getAttribute('gmb_iscourse').fireOnChange();
		if (Xrm.Page.getAttribute('gmb_iscourse').getValue()) {
			Xrm.Page.getControl('gmb_eventdescription').setVisible(false);
			// Xrm.Page.getControl("gmb_mediumofinstruction").setVisible(false);
			// Xrm.Page.getAttribute("gmb_mediumofinstruction").setRequiredLevel("none");
			Xrm.Page.getAttribute('gmb_eventdescription').setValue(getEventDescription());
			onChangeFeedback();
			onChangeMedical();
		}
		else {
			Xrm.Page.getControl('gmb_eventdescription').setVisible(false);
			// Xrm.Page.getControl("gmb_mediumofinstruction").setVisible(false);
			// Xrm.Page.getAttribute("gmb_mediumofinstruction").setRequiredLevel("none");
		}
	}
}

function getEventDescription() {
	var description = '';
	var productId = Xrm.Page.getAttribute('gmb_product').getValue()[0].id.replace('{', '').replace('}', '');
	var req = new XMLHttpRequest();
	req.open(
		'GET',
		Xrm.Page.context.getClientUrl() + '/api/data/v8.2/products(' + productId + ')?$select=description',
		false);
	req.setRequestHeader('OData-MaxVersion', '4.0');
	req.setRequestHeader('OData-Version', '4.0');
	req.setRequestHeader('Accept', 'application/json');
	req.setRequestHeader('Content-Type', 'application/json; charset=utf-8');
	req.setRequestHeader('Prefer', 'odata.include-annotations="*"');
	req.onreadystatechange = function () {
		if (this.readyState === 4) {
			req.onreadystatechange = null;
			if (this.status === 200) {
				var result = JSON.parse(this.response);
				if (result['description'] != null) description = result['description'];
			}
			else {
				Xrm.Utility.alertDialog(this.statusText);
			}
		}
	};
	req.send();
	return description;
}

function checkBPFStage(isOnChange) {
	stageName = Xrm.Page.data.process.getActiveStage().getName();
	switch (stageName.toLowerCase()) {
		case 'register to event':
			Xrm.Page.ui.tabs.get('tab_product').setVisible(false);
			Xrm.Page.ui.tabs.get('tab_feedback').setVisible(false);
			Xrm.Page.ui.tabs.get('tab_eventregistration').setVisible(true);
			break;
		case 'feedback':
			Xrm.Page.ui.tabs.get('tab_product').setVisible(false);
			Xrm.Page.ui.tabs.get('tab_feedback').setVisible(true);
			Xrm.Page.ui.tabs.get('tab_eventregistration').setVisible(false);
			// updateTotalCost();
			if (Xrm.Page.data.process.getStatus() == 'finished') {
				if (isOnChange) {
					// bpf is finished
					Xrm.Page.getAttribute('gmb_transactioncompleted').setValue(true);
					Xrm.Page.data.save().then(function () {
						var order = Xrm.Page.getAttribute('gmb_order').getValue();
						if (order != null) {
							var entityFormOptions = {};
							entityFormOptions['entityName'] = order[0].entityType;
							entityFormOptions['entityId'] = order[0].id.replace('{', '').replace('}', '');
							Xrm.Navigation.openForm(entityFormOptions).then(

								function (success) {
									console.log(success);
								},

								function (error) {
									console.log(error);
								});
						}
					});
				}
			}
			else {
				updateTotalCost(true);
			}
			break;
		case 'add product':
			Xrm.Page.ui.tabs.get('tab_product').setVisible(true);
			Xrm.Page.ui.tabs.get('tab_feedback').setVisible(false);
			Xrm.Page.ui.tabs.get('tab_eventregistration').setVisible(false);
			// updateTotalCost();
			if (Xrm.Page.data.process.getStatus() == 'finished') {
				if (isOnChange) {
					// bpf is finished
					if (!validateOrderProducts()) {
						Xrm.Page.data.process.reactivateProcess();
						var alertStrings = {
							text: messageEventDatesNotSelected
						};
						var alertOptions = {
							height: 120,
							width: 360
						};
						Xrm.Navigation.openAlertDialog(alertStrings, alertOptions).then(function () { });
					}
					else {
						var order = Xrm.Page.getAttribute('gmb_order').getValue();
						if (order != null) {
							var entityFormOptions = {};
							entityFormOptions['entityName'] = order[0].entityType;
							entityFormOptions['entityId'] = order[0].id.replace('{', '').replace('}', '');
							Xrm.Navigation.openForm(entityFormOptions).then(

								function (success) {
									console.log(success);
								},

								function (error) {
									console.log(error);
								});
						}
					}
				}
			}
			break;
		case 'complete transaction':
			if (Xrm.Page.data.process.getStatus() == 'finished') {
				if (isOnChange) {
					// bpf is finished
					var order = Xrm.Page.getAttribute('gmb_order').getValue();
					if (order != null) {
						var entityFormOptions = {};
						entityFormOptions['entityName'] = order[0].entityType;
						entityFormOptions['entityId'] = order[0].id.replace('{', '').replace('}', '');
						Xrm.Navigation.openForm(entityFormOptions).then(

							function (success) {
								console.log(success);
							},

							function (error) {
								console.log(error);
							});
					}
				}
				else {
					Xrm.Page.ui.tabs.get('tab_product').setVisible(false);
					Xrm.Page.ui.tabs.get('tab_feedback').setVisible(false);
					Xrm.Page.ui.tabs.get('tab_eventregistration').setVisible(false);
					Xrm.Page.ui.setFormNotification(
						Xrm.Utility.getResourceString('gmb_/resx/messages', 'bpfFinished'),
						'WARNING');
				}
			}
			else {
				if (!Xrm.Page.getAttribute('gmb_iscourse').getValue()) Xrm.Page.ui.tabs.get('tab_product').setVisible(true);
				else Xrm.Page.ui.tabs.get('tab_feedback').setVisible(true);
				Xrm.Page.ui.tabs.get('tab_eventregistration').setVisible(false);
				//updateTotalCost();
			}
			break;
		default:
			if (!Xrm.Page.getAttribute('gmb_iscourse').getValue()) Xrm.Page.ui.tabs.get('tab_product').setVisible(true);
			else Xrm.Page.ui.tabs.get('tab_feedback').setVisible(true);
			Xrm.Page.ui.tabs.get('tab_eventregistration').setVisible(false);
			break;
	}
}

function validateOrderProducts() {
	var returnValue = true;
	var transactionGuid = Xrm.Page.data.entity.getId().replace('{', '').replace('}', '');
	var req = new XMLHttpRequest();
	req.open(
		'GET',
		Xrm.Page.context.getClientUrl() +
		'/api/data/v8.2/salesorderdetails?$expand=productid($select=gmb_isevent,gmb_itemcode,gmb_financialtypeno)&$filter=_gmb_ordertransaction_value eq ' + transactionGuid +
		' and  gmb_istemplate ne true and  _productid_value ne null and  _gmb_event_value eq null',
		false);
	req.setRequestHeader('OData-MaxVersion', '4.0');
	req.setRequestHeader('OData-Version', '4.0');
	req.setRequestHeader('Accept', 'application/json');
	req.setRequestHeader('Content-Type', 'application/json; charset=utf-8');
	req.setRequestHeader('Prefer', 'odata.include-annotations="*"');
	req.onreadystatechange = function () {
		if (this.readyState === 4) {
			req.onreadystatechange = null;
			if (this.status === 200) {
				var results = JSON.parse(this.response);
				for (var i = 0; i < results.value.length; i++) {
					if (
						results.value[i]['productid'].gmb_financialtypeno != null && results.value[i]['productid'].gmb_financialtypeno.toLowerCase() == '05') {
						// Service
						continue;
					}
					if (results.value[i]['productid'].gmb_isevent) {
						returnValue = false;
						break;
					}
				}
			}
			else {
				Xrm.Utility.alertDialog(this.statusText);
			}
		}
	};
	req.send();
	return returnValue;
}

function postDisassociationProduct(allItemCount, unselectedControlCount) {
	if (unselectedControlCount == 0) {
		Xrm.Page.getControl('header_process_gmb_eventregistered').getAttribute().setValue(false);
		Xrm.Page.ui.process.setDisplayState('floating');
	}
}

function postDisassociationSessions(selectedCount, selectedItems, primaryItem) {
	var parentRecordId = primaryItem.replace('{', '').replace('}', '');
	// Get Associated Sessions for Order Transaction
	var req = new XMLHttpRequest();
	req.open(
		'GET',
		Xrm.Page.context.getClientUrl() +
		'/api/data/v9.0/gmb_ordertransactions(' + parentRecordId +
		')?$expand=gmb_gmb_ordertransaction_msevtmgt_session($select=msevtmgt_name,msevtmgt_sessionid)',
		false);
	req.setRequestHeader('OData-MaxVersion', '4.0');
	req.setRequestHeader('OData-Version', '4.0');
	req.setRequestHeader('Accept', 'application/json');
	req.setRequestHeader('Content-Type', 'application/json; charset=utf-8');
	req.setRequestHeader('Prefer', 'odata.include-annotations="*"');
	req.onreadystatechange = function () {
		if (this.readyState === 4) {
			req.onreadystatechange = null;
			if (this.status === 200) {
				var result = JSON.parse(this.response);
				findEventSessionsForDisassociate(
					selectedItems,
					result.gmb_gmb_ordertransaction_msevtmgt_session,
					parentRecordId);
				// for (var a = 0; a < result.gmb_gmb_ordertransaction_msevtmgt_session.length; a++) {
				//     var gmb_gmb_ordertransaction_msevtmgt_session_msevtmgt_name = result.gmb_gmb_ordertransaction_msevtmgt_session[a]["msevtmgt_name"];
				//     var gmb_gmb_ordertransaction_msevtmgt_session_msevtmgt_sessionid = result.gmb_gmb_ordertransaction_msevtmgt_session[a]["msevtmgt_sessionid"];
				// }
			}
			else {
				Xrm.Utility.alertDialog(this.statusText);
			}
		}
	};
	req.send();
}

function findEventSessionsForDisassociate(events, sessions, parentRecordId) {
	for (var i = 0; i < events.length; i++) {
		var req = new XMLHttpRequest();
		req.open(
			'GET',
			Xrm.Page.context.getClientUrl() +
			'/api/data/v9.0/msevtmgt_events(' + events[i].Id +
			')?$expand=msevtmgt_event_msevtmgt_session_Event($select=msevtmgt_name,msevtmgt_sessionid)',
			false);
		req.setRequestHeader('OData-MaxVersion', '4.0');
		req.setRequestHeader('OData-Version', '4.0');
		req.setRequestHeader('Accept', 'application/json');
		req.setRequestHeader('Content-Type', 'application/json; charset=utf-8');
		req.setRequestHeader('Prefer', 'odata.include-annotations="*"');
		req.onreadystatechange = function () {
			if (this.readyState === 4) {
				req.onreadystatechange = null;
				if (this.status === 200) {
					var result = JSON.parse(this.response);
					// Compare Associated Sessions with Event related sessions
					for (var j = 0; j < sessions.length; j++) {
						for (var k = 0; k < result.msevtmgt_event_msevtmgt_session_Event.length; k++) {
							var associatedSessionId = sessions[j]['msevtmgt_sessionid'];
							var existingSessionId = result.msevtmgt_event_msevtmgt_session_Event[k]['msevtmgt_sessionid'];
							if (associatedSessionId == existingSessionId) {
								disassociateSessionsWithOrderTransaction(parentRecordId, associatedSessionId);
								break;
							}
						}
					}
				}
				else {
					Xrm.Utility.alertDialog(this.statusText);
				}
			}
		};
		req.send();
	}
}

function refreshSessionSubGrid(delay) {
	if (Xrm.Page.getControl('subgrid_session')) {
		if (!delay) Xrm.Page.getControl('subgrid_session').refresh();
		else {
			setTimeout(function () {
				Xrm.Page.getControl('subgrid_session').refresh();
			}, 2000);
		}
	}
}

function disassociateSessionsWithOrderTransaction(parentRecordId, relatedId) {
	var relationshipName = 'gmb_gmb_ordertransaction_msevtmgt_session';
	var primaryEntitySetName = 'gmb_ordertransactions';
	var relatedEntitySetName = 'msevtmgt_sessions';
	var webApiPath = Xrm.Page.context.getClientUrl() + '/api/data/v9.0';
	var parentUri = webApiPath + '/' + primaryEntitySetName + '(' + parentRecordId + ')/';
	var childUri = webApiPath + '/' + relatedEntitySetName + '(' + relatedId + ')';
	var req = new XMLHttpRequest();
	req.open('DELETE', encodeURI(parentUri + relationshipName + '/$ref?$id=' + childUri), true);
	req.setRequestHeader('Accept', 'application/json');
	req.setRequestHeader('Content-Type', 'application/json; charset=utf-8');
	req.setRequestHeader('OData-MaxVersion', '4.0');
	req.setRequestHeader('OData-Version', '4.0');
	req.onreadystatechange = function () {
		if (this.readyState === 4) {
			req.onreadystatechange = null;
			if (this.status === 204 || this.status === 1223) {
				// Success
				refreshSessionSubGrid(false);
			}
			else {
				// Error
				var error = JSON.parse(this.response).error.message;
				Xrm.Utility.alertDialog(error);
			}
		}
	};
	req.send(JSON.stringify());
}

function updateTotalCost(save = true) {
	debugger;
	var orderId = Xrm.Page.getAttribute('gmb_order').getValue()[0].id.replace('{', '').replace('}', '');
	var transactionId = Xrm.Page.data.entity.getId().replace('{', '').replace('}', '');
	// var productTotal = 0;
	var registrationTotal = 0;
	var eventRegistrations = getTransactionEvents(transactionId);
	var sessionRegistrations = getTransactionSessions(transactionId);
	for (var i = 0; i < eventRegistrations.length; i++) {
		var hasSession = false;
		var eventId = eventRegistrations[i]['_msevtmgt_eventid_value'];
		var eventRegistrationId = eventRegistrations[i]['msevtmgt_name'];
		var eventFee = getEventFee(eventId);
		var eventTotalFee = 0;
		for (var j = 0; j < sessionRegistrations.length; j++) {
			var sessionEventId = sessionRegistrations[j]['_msevtmgt_event_value'];
			var sessionId = sessionRegistrations[j]['_msevtmgt_sessionid_value'];
			var sessionFee = getSessionFee(sessionId);
			if (sessionEventId == eventId) {
				hasSession = true;
				if (sessionFee != null) {
					registrationTotal += sessionFee;
					eventTotalFee += sessionFee;
				}
				else {
					registrationTotal += eventFee;
					eventTotalFee += eventFee;
				}
			}
		}
		if (!hasSession) {
			registrationTotal += eventFee;
			eventTotalFee += eventFee;
		}
		// Create/Update/Delete order product(registration fees), pass in eventId, orderId, transactionId, fee
		updateOrderRegistration(eventId, orderId, transactionId, eventTotalFee, eventRegistrationId);
	}
	var products = getOrderProducts(orderId);
	var productTotal = calculateProductCost(products);
	Xrm.Page.getAttribute('gmb_registrationtotalcost').setValue(registrationTotal);
	Xrm.Page.getAttribute('gmb_producttotalcost').setValue(productTotal);
	Xrm.Page.getAttribute('gmb_totalcost').setValue(registrationTotal + productTotal);
	if (save) {
		Xrm.Page.data.entity.save();
	}
}

function getProductDetails(productid) {
	var req = new XMLHttpRequest();
	var _defaultuomid_value = null;
	req.open(
		'GET',
		Xrm.Page.context.getClientUrl() +
		'/api/data/v8.2/products(' + productid +
		')?$select=gmb_inputscreen,_defaultuomid_value',
		false);
	req.setRequestHeader('OData-MaxVersion', '4.0');
	req.setRequestHeader('OData-Version', '4.0');
	req.setRequestHeader('Accept', 'application/json');
	req.setRequestHeader('Content-Type', 'application/json; charset=utf-8');
	req.onreadystatechange = function () {
		if (this.readyState === 4) {
			if (this.status === 200) {
				var result = JSON.parse(this.response);
				//var gmb_inputscreen = result['gmb_inputscreen'];
				_defaultuomid_value = result['_defaultuomid_value'];
			}
		}
	};
	req.send();
	return _defaultuomid_value;
}

function getTransactionEvents(transactionId) {
	var eventRegistrations = [];
	var req = new XMLHttpRequest();
	req.open(
		'GET',
		Xrm.Page.context.getClientUrl() +
		'/api/data/v8.2/msevtmgt_eventregistrations?$filter=_gmb_ordertransaction_value eq ' + transactionId,
		false);
	req.setRequestHeader('OData-MaxVersion', '4.0');
	req.setRequestHeader('OData-Version', '4.0');
	req.setRequestHeader('Accept', 'application/json');
	req.setRequestHeader('Content-Type', 'application/json; charset=utf-8');
	req.setRequestHeader('Prefer', 'odata.include-annotations="*"');
	req.onreadystatechange = function () {
		if (this.readyState === 4) {
			req.onreadystatechange = null;
			if (this.status === 200) {
				var results = JSON.parse(this.response);
				if (results.value.length > 0) eventRegistrations = results.value;
			}
			else {
				Xrm.Utility.alertDialog(this.statusText);
			}
		}
	};
	req.send();
	return eventRegistrations;
}

function getEventFee(eventId) {
	var registrationFee = 0;
	var req = new XMLHttpRequest();
	req.open(
		'GET',
		Xrm.Page.context.getClientUrl() + '/api/data/v8.2/msevtmgt_events(' + eventId + ')?$select=gmb_registrationfee',
		false);
	req.setRequestHeader('OData-MaxVersion', '4.0');
	req.setRequestHeader('OData-Version', '4.0');
	req.setRequestHeader('Accept', 'application/json');
	req.setRequestHeader('Content-Type', 'application/json; charset=utf-8');
	req.setRequestHeader('Prefer', 'odata.include-annotations="*"');
	req.onreadystatechange = function () {
		if (this.readyState === 4) {
			req.onreadystatechange = null;
			if (this.status === 200) {
				var result = JSON.parse(this.response);
				registrationFee = result['gmb_registrationfee'];
			}
			else {
				Xrm.Utility.alertDialog(this.statusText);
			}
		}
	};
	req.send();
	return registrationFee;
}

function getTransactionSessions(transactionId) {
	var sessionRegistrations = [];
	var req = new XMLHttpRequest();
	req.open(
		'GET',
		Xrm.Page.context.getClientUrl() +
		'/api/data/v8.2/msevtmgt_sessionregistrations?$filter=_gmb_ordertransaction_value eq ' + transactionId,
		false);
	req.setRequestHeader('OData-MaxVersion', '4.0');
	req.setRequestHeader('OData-Version', '4.0');
	req.setRequestHeader('Accept', 'application/json');
	req.setRequestHeader('Content-Type', 'application/json; charset=utf-8');
	req.setRequestHeader('Prefer', 'odata.include-annotations="*"');
	req.onreadystatechange = function () {
		if (this.readyState === 4) {
			req.onreadystatechange = null;
			if (this.status === 200) {
				var results = JSON.parse(this.response);
				if (results.value.length > 0) sessionRegistrations = results.value;
			}
			else {
				Xrm.Utility.alertDialog(this.statusText);
			}
		}
	};
	req.send();
	return sessionRegistrations;
}

function getSessionFee(sessionId) {
	var sessionFee = null;
	var req = new XMLHttpRequest();
	req.open(
		'GET',
		Xrm.Page.context.getClientUrl() +
		'/api/data/v8.2/msevtmgt_sessions(' + sessionId +
		')?$select=gmb_registrationfee',
		false);
	req.setRequestHeader('OData-MaxVersion', '4.0');
	req.setRequestHeader('OData-Version', '4.0');
	req.setRequestHeader('Accept', 'application/json');
	req.setRequestHeader('Content-Type', 'application/json; charset=utf-8');
	req.setRequestHeader('Prefer', 'odata.include-annotations="*"');
	req.onreadystatechange = function () {
		if (this.readyState === 4) {
			req.onreadystatechange = null;
			if (this.status === 200) {
				var result = JSON.parse(this.response);
				sessionFee = result['gmb_registrationfee'];
			}
			else {
				Xrm.Utility.alertDialog(this.statusText);
			}
		}
	};
	req.send();
	return sessionFee;
}
const RegistrationFee = Object.freeze(
	{
		Name: 'Registration Fee'
	});

function getOrderProducts(orderId) {
	var products = [];
	var req = new XMLHttpRequest();
	req.open(
		'GET',
		Xrm.Page.context.getClientUrl() +
		'/api/data/v8.2/salesorderdetails?$select=description,extendedamount&$filter=_salesorderid_value eq ' + orderId,
		false);
	req.setRequestHeader('OData-MaxVersion', '4.0');
	req.setRequestHeader('OData-Version', '4.0');
	req.setRequestHeader('Accept', 'application/json');
	req.setRequestHeader('Content-Type', 'application/json; charset=utf-8');
	req.setRequestHeader('Prefer', 'odata.include-annotations="*"');
	req.onreadystatechange = function () {
		if (this.readyState === 4) {
			req.onreadystatechange = null;
			if (this.status === 200) {
				var results = JSON.parse(this.response);
				products = results.value;
				// for (var i = 0; i < results.value.length; i++) {
				//     var description = results.value[i]["description"];
				//     var extendedamount = results.value[i]["extendedamount"];
				//     var extendedamount_formatted = results.value[i]["extendedamount@OData.Community.Display.V1.FormattedValue"];
				// }
			}
			else {
				Xrm.Utility.alertDialog(this.statusText);
			}
		}
	};
	req.send();
	return products;
}

function calculateProductCost(products) {
	var productCost = 0;
	for (var i = 0; i < products.length; i++) {
		if (products[i]['description'] != null) continue;
		if (products[i]['extendedamount']) productCost += products[i]['extendedamount'];
	}
	return productCost;
}

function deleteRegistrationProduct(salesorderdetailId) {
	Xrm.WebApi.deleteRecord('salesorderdetail', salesorderdetailId).then(

		function success(result) {
			console.log('salesorderdetail deleted');
			// perform operations on record deletion
		},

		function (error) {
			console.log(error.message);
			// handle error conditions
		});
}

function updateOrderRegistration(eventId, orderId, transactionId, registrationTotal, eventRegistrationId) {
	var productName = Xrm.Page.getAttribute('gmb_product').getValue()[0].name;
	var productId = Xrm.Page.getAttribute('gmb_product').getValue()[0].id.replace('{', '').replace('}', '');
	var _defaultuomid_value = getProductDetails(productId);
	var req = new XMLHttpRequest();
	req.open(
		'GET',
		Xrm.Page.context.getClientUrl() +
		'/api/data/v8.2/salesorderdetails?$filter=_salesorderid_value eq ' + orderId +
		' and _gmb_event_value eq ' + eventId +
		' and _gmb_ordertransaction_value eq ' + transactionId +
		' and gmb_eventregistrationid eq ' + "'" + eventRegistrationId + "'", // To add the registration ID from events
		false);
	req.setRequestHeader('OData-MaxVersion', '4.0');
	req.setRequestHeader('OData-Version', '4.0');
	req.setRequestHeader('Accept', 'application/json');
	req.setRequestHeader('Content-Type', 'application/json; charset=utf-8');
	req.setRequestHeader('Prefer', 'odata.include-annotations="*",odata.maxpagesize=1');
	req.onreadystatechange = function () {
		if (this.readyState === 4) {
			req.onreadystatechange = null;
			if (this.status === 200) {
				var results = JSON.parse(this.response);
				if (results.value.length > 0) {
					var orderProductId = results.value[0]['salesorderdetailid'];
					var existingFee = results.value[0]['priceperunit'];
					var existingTax = results.value[0]['gmb_taxamount'];
					if (registrationTotal != 0) {
						if (registrationTotal != existingFee) {
							// Update Existing Registration Fee Order Product cost
							var data = {
								isproductoverridden: false,
								//productdescription: productName,
								ispriceoverridden: true,
								'productid@odata.bind': '/products(' + productId + ')',
								priceperunit: registrationTotal,
								quantity: 1,
								baseamount: registrationTotal,
								extendedamount: registrationTotal,
								description: transactionId,
								gmb_eventregistrationid: eventRegistrationId,
								'uomid@odata.bind': '/uoms(' + _defaultuomid_value + ')',
								'salesorderid@odata.bind': '/salesorders(' + orderId + ')',
								'gmb_Event@odata.bind': '/msevtmgt_events(' + eventId + ')',
								'gmb_OrderTransaction@odata.bind': '/gmb_ordertransactions(' + transactionId + ')'
							};
							if (existingTax != null) {
								data.gmb_taxamount = existingTax;
							}
							Xrm.WebApi.updateRecord('salesorderdetail', orderProductId, data).then(

								function success(result) {
									console.log('salesorderdetail updated');
									// perform operations on record update
								},

								function (error) {
									console.log(error.message);
									// handle error conditions
								});
						}
					}
					else {
						Xrm.WebApi.deleteRecord('salesorderdetail', orderProductId).then(

							function success(result) {
								console.log('salesorderdetail deleted');
								// perform operations on record deletion
							},

							function (error) {
								console.log(error.message);
								// handle error conditions
							});
					}
				}
				else {
					if (registrationTotal != 0) {
						var productTaxable = checkProductTaxable(productId);
						// Create new Order Product for Registration Fee
						var data = {
							isproductoverridden: false,
							//productdescription: productName,
							//ispriceoverridden: true,
							'productid@odata.bind': '/products(' + productId + ')',
							priceperunit: registrationTotal,
							quantity: 1,
							baseamount: registrationTotal,
							extendedamount: registrationTotal,
							description: transactionId,
							gmb_eventregistrationid: eventRegistrationId,
							'uomid@odata.bind': '/uoms(' + _defaultuomid_value + ')',
							'salesorderid@odata.bind': '/salesorders(' + orderId + ')',
							'gmb_Event@odata.bind': '/msevtmgt_events(' + eventId + ')',
							'gmb_OrderTransaction@odata.bind': '/gmb_ordertransactions(' + transactionId + ')'
						};
						var taxPercentage = parseFloat(getSystemParameterSetting('GSTPercentage'));
						var productTax = 0;
						if (typeof productTaxable === 'number') {
							productTax = productTaxable * (taxPercentage / 100);
							data.gmb_taxamount = productTax;
						}
						else if (typeof productTaxable === 'boolean') {
							productTax = registrationTotal - (registrationTotal / (1 + taxPercentage / 100)).toFixed(2);
							data.gmb_taxamount = productTax;
						}
						Xrm.WebApi.createRecord('salesorderdetail', data).then(

							function success(result) {
								console.log('salesorderdetail created with ID: ' + result.id);
								// perform operations on record creation
							},

							function (error) {
								console.log(error);
								// handle error conditions
							});
					}
				}
				// for (var i = 0; i < results.value.length; i++) {
				//     var salesorderdetailid = results.value[i]["salesorderdetailid"];
				// }
			}
			else {
				Xrm.Utility.alertDialog(this.statusText);
			}
		}
	};
	req.send();
}

function viewProductOrder(selectedRecordId) {
	var entityFormOptions = {};
	entityFormOptions['entityName'] = 'salesorderdetail';
	//entityFormOptions["useQuickCreateForm"] = true;
	entityFormOptions['entityId'] = selectedRecordId.replace('{', '').replace('}', '');
	entityFormOptions['cmdbar'] = false;
	entityFormOptions['navbar'] = 'off';
	entityFormOptions['openInNewWindow'] = true;
	//entityFormOptions["windowPosition"] = 2;
	//entityFormOptions["width"] = window.parent.innerWidth / 2;
	//entityFormOptions["height"] = window.parent.innerHeight * 3 / 4;
	var formParameters = {};
	formParameters['gmb_readonly'] = true;
	// Open the form.
	Xrm.Navigation.openForm(entityFormOptions, formParameters).then(

		function (success) {
			console.log(success);
		},

		function (error) {
			console.log(error);
		});
}

function copyToOrder(selectedItemsReference) {
	var dialogContent = copyToOrderDialogContent.replace('{0}', selectedItemsReference.length);
	var dialogLabelAndText = {
		confirmButtonLabel: confirmButtonTxt,
		cancelButtonLabel: cancelButtonTxt,
		text: dialogContent,
		title: copyToOrderDialogTitle
	};
	var dialogOptions = {
		height: 230,
		width: 430
	};
	Xrm.Navigation.openConfirmDialog(dialogLabelAndText, dialogOptions).then(function (success) {
		if (success.confirmed) {
			var orderId = Xrm.Page.getAttribute('gmb_order').getValue()[0].id.replace('{', '').replace('}', '');
			var orderTransactionGuid = Xrm.Page.data.entity.getId().replace('{', '').replace('}', '');
			for (var i = 0; i < selectedItemsReference.length; i++) {
				try {
					var productId = selectedItemsReference[i].Id;
					var entity = {};
					entity['gmb_ReferencedFrom@odata.bind'] = '/salesorderdetails(' + productId + ')';
					entity['gmb_OrderTransaction@odata.bind'] = '/gmb_ordertransactions(' + orderTransactionGuid + ')';
					entity['salesorderid@odata.bind'] = '/salesorders(' + orderId + ')';
					var req = new XMLHttpRequest();
					req.open('POST', Xrm.Page.context.getClientUrl() + '/api/data/v8.2/salesorderdetails', false);
					req.setRequestHeader('OData-MaxVersion', '4.0');
					req.setRequestHeader('OData-Version', '4.0');
					req.setRequestHeader('Accept', 'application/json');
					req.setRequestHeader('Content-Type', 'application/json; charset=utf-8');
					req.onreadystatechange = function () {
						if (this.readyState === 4) {
							req.onreadystatechange = null;
							if (this.status === 204) {
								var uri = this.getResponseHeader('OData-EntityId');
								var regExp = /\(([^)]+)\)/;
								var matches = regExp.exec(uri);
								var newEntityId = matches[1];
							}
							else {
								Xrm.Utility.alertDialog(this.statusText);
							}
						}
					};
					req.send(JSON.stringify(entity));
				}
				catch (ex) {
					console.log(ex);
				}
				// Refresh grid after last process
				if (i == selectedItemsReference.length - 1) {
					Xrm.Page.getControl('subgrid_orderproduct').refresh();
				}
			}
		}
	});
}

function addSimilarProductTo(firstSelectedItem) {
	var selectedProduct = Xrm.Page.getAttribute('gmb_product').getValue();
	var selectedProductId = selectedProduct[0].id.replace('{', '').replace('}', '');
	// Query to get the selected product within the order product
	var req = new XMLHttpRequest();
	req.open(
		'GET',
		Xrm.Page.context.getClientUrl() +
		'/api/data/v8.2/salesorderdetails?$select=_productid_value,quantity&$filter=salesorderdetailid eq ' + firstSelectedItem.replace('{', '').replace('}', ''),
		false);
	req.setRequestHeader('OData-MaxVersion', '4.0');
	req.setRequestHeader('OData-Version', '4.0');
	req.setRequestHeader('Accept', 'application/json');
	req.setRequestHeader('Content-Type', 'application/json; charset=utf-8');
	req.setRequestHeader('Prefer', 'odata.include-annotations="*"');
	req.onreadystatechange = function () {
		if (this.readyState === 4) {
			req.onreadystatechange = null;
			if (this.status === 200) {
				var results = JSON.parse(this.response);
				for (var i = 0; i < results.value.length; i++) {
					var _productid_value = results.value[i]['_productid_value'];
					var quantityToPurchase = results.value[i]['quantity'];
					// Query to filter the event with the respective associated product
					var req_2 = new XMLHttpRequest();
					req_2.open(
						'GET',
						Xrm.Page.context.getClientUrl() +
						'/api/data/v8.2/gmb_eventproducts?$select=_gmb_event_value,gmb_eventproductid,_gmb_product_value,gmb_quantity,gmb_quantitypurchased,gmb_quantityreserved&$filter=_gmb_product_value eq ' + _productid_value,
						false);
					req_2.setRequestHeader('OData-MaxVersion', '4.0');
					req_2.setRequestHeader('OData-Version', '4.0');
					req_2.setRequestHeader('Accept', 'application/json');
					req_2.setRequestHeader('Content-Type', 'application/json; charset=utf-8');
					req_2.setRequestHeader('Prefer', 'odata.include-annotations="*"');
					req_2.onreadystatechange = function () {
						if (this.readyState === 4) {
							req_2.onreadystatechange = null;
							if (this.status === 200) {
								var results = JSON.parse(this.response);
								var additionalFilter = '';
								var CustomFIlter = '';
								for (var i = 0; i < results.value.length; i++) {
									var _gmb_event_value = results.value[i]['_gmb_event_value'];
									var gmb_quantity = results.value[i]['gmb_quantity'];
									var gmb_quantitypurchased = results.value[i]['gmb_quantitypurchased'];
									var gmb_quantityreserved = results.value[i]['gmb_quantityreserved'];
									if (gmb_quantity != null) {
										// Quantity is being allocated, hence quantity check is required
										gmb_quantitypurchased = gmb_quantitypurchased == null ? 0 : gmb_quantitypurchased;
										gmb_quantityreserved = gmb_quantityreserved == null ? 0 : gmb_quantityreserved;
										quantityToPurchase = quantityToPurchase == null ? 1 : quantityToPurchase; // Purchase quantity default to be 1
										var totalUtilizedQuantity = gmb_quantitypurchased + gmb_quantityreserved;
										if (totalUtilizedQuantity + quantityToPurchase > gmb_quantity) {
											// Quantity to be purchased exceeded allowed quantity
											//continue;
											additionalFilter +=
												"<value uitype='msevtmgt_event'>{" + _gmb_event_value + '}</value>';
										}
									}
								}
								if (additionalFilter != '') {
									additionalFilter =
										"<condition attribute='msevtmgt_eventid' operator='not-in'>" + additionalFilter +
										'</condition>';
								}
								CustomFilter =
									"<filter type='and'>" +
									"<filter type='and'>" +
									"<condition attribute='statecode' operator='eq' value='0' />" +
									'</filter>' +
									"<filter type='and'>" +
									"<condition attribute='msevtmgt_isrecurringevent' operator='ne' value='1' />" +
									'</filter>' +
									"<filter type='and'>" +
									"<condition attribute='msevtmgt_istemplate' operator='ne' value='100000001' />" +
									'</filter>' +
									"<filter type='and'>" +
									"<condition attribute='msevtmgt_recurrenteventstatus' operator='ne' value='2' />" +
									'</filter>' +
									"<condition attribute='msevtmgt_publishstatus' operator='eq' value='100000003' />" +
									"<condition attribute='gmb_product' operator='eq' uitype='product' value='" + selectedProduct[0].id +
									"' />" + additionalFilter +
									'</filter>';
								//if (additionalFilter == '') {
								//    // assign a default filter that returns no result
								//    CustomFilter =
								//        "<filter type='and'><condition attribute='msevtmgt_eventid' operator='null' /></filter>";
								//} else {
								//    CustomFilter =
								//        "<filter type='and'><condition attribute='msevtmgt_eventid' operator='in'>" +
								//        additionalFilter +
								//        '</condition></filter>';
								//}
								//CustomFilter = '<filter type="and">' +
								//    '<condition attribute="gmb_product" operator="eq" uitype="product" value= "' + selectedProductId + '" />' +
								//    '</filter>';
								var lookupOptions = {
									defaultEntityType: 'msevtmgt_event',
									entityTypes: ['msevtmgt_event'],
									allowMultiSelect: true,
									filters: [
										{
											filterXml: CustomFilter
										}],
									disableMru: true
									//filters: [{ filterXml: encodeURIComponent("<filter type='and'><condition attribute='statecode' operator='eq' value='1' /></filter>") }]
								};
								Xrm.Utility.lookupObjects(lookupOptions).then(

									function (result) {
										if (result != null && result.length > 0) {
											var selectedGuids = result.map((e) => e.id).join(',');
											var parameterObject = {
												SelectedOrderProduct: firstSelectedItem,
												SelectedEventGuids: selectedGuids
											};
											CallCustomAction(
												JSON.stringify(parameterObject),
												'addSimilarProductToEvent',
												'OrderTransaction',

												function (results) {
													var returnResult = JSON.parse(results);
													if (returnResult.IsSuccess) {
														Xrm.Utility.alertDialog(
															copyProductSuccessful.replace('{0}', result.length));
														Xrm.Page.getControl('subgrid_orderproduct').refresh();
													}
													else {
														if (returnResult.ErrorDetails.indexOf('Insufficient') > -1) {
															Xrm.Utility.alertDialog(
																copyProductUnsuccessfulDueToQuantity);
														}
														else {
															Xrm.Utility.alertDialog(returnResult.ErrorDetails);
														}
													}
												});
										}
									},

									function (error) {
										console.log(error.message);
									});
							}
							else {
								Xrm.Utility.alertDialog(this.statusText);
							}
						}
					};
					req_2.send();
				}
			}
			else {
				Xrm.Utility.alertDialog(this.statusText);
			}
		}
	};
	req.send();
}

function productListOnSelect(context) {
	if (!productOnClicking) {
		productOnClicking = true;
		Xrm.Utility.showProgressIndicator(processingMessage);
		var formContext = context.getFormContext();
		productListOnSelect
		//formContext.ui.controls.forEach(function (control, i) {
		//	if (control && control.getDisabled && !control.getDisabled()) {
		//		control.setDisabled(true);
		//	}
		//});
		//Use this because of a stupid Microsoft Bug
		//var formContext = executionContext.getFormContext();
		if (!formContext) {
			Xrm.Page.data.entity.attributes.forEach(function (attr) {
				attr.controls.forEach(function (c) {
					c.setDisabled(true);
				});
			});
			var selectedRows = Xrm.Page.getControl("grid_associatedproducts").getGrid().getSelectedRows();
			selectedRows.forEach(function (selectedRow, i) {
				addClickedProductToOrder(selectedRow.getData().getEntity().getEntityReference());
			});
		}
		else {
			formContext.getData().getEntity().attributes.forEach(function (attr) {
				attr.controls.forEach(function (c) {
					c.setDisabled(true);
				});
			});
			addClickedProductToOrder(formContext.entityReference);
		}
	}
}

function addClickedProductToOrder(selectedItemReference) {
	debugger;
	var selectedGuid = selectedItemReference.id.replace('{', '').replace('}', '');
	var orderGuid = Xrm.Page.getAttribute('gmb_order').getValue()[0].id.replace('{', '').replace('}', '');
	var orderTransactionGuid = Xrm.Page.data.entity.getId().replace('{', '').replace('}', '');
	var product = Xrm.Page.getAttribute('gmb_product').getValue()[0].id.replace('{', '').replace('}', '');
	var customerGuid = getOrderContact(orderGuid);
	var fetchXmlQuery =
		"<fetch version='1.0' output-format='xml-platform' mapping='logical' distinct='false' count='1'>" +
		"<entity name='salesorderdetail'>" +
		"<attribute name='productid' />" +
		"<attribute name='productdescription' />" +
		"<attribute name='priceperunit' />" +
		"<attribute name='quantity' />" +
		"<attribute name='extendedamount' />" +
		"<attribute name='salesorderdetailid' />" +
		"<attribute name='gmb_dateoftransaction' />" +
		"<order attribute='gmb_dateoftransaction' descending='true' />" +
		"<filter type='and'>" +
		"<condition attribute='gmb_istemplate' operator='ne' value='1'/>" +
		"<condition attribute='gmb_dateoftransaction' operator='not-null' />" +
		"<condition attribute='gmb_customer' operator='eq' uitype='contact' value='" + customerGuid +
		"' />" +
		"<condition attribute='productid' operator='eq' uitype='product' value='" + selectedGuid +
		"' />" +
		'</filter>' +
		"<link-entity name='salesorder' from='salesorderid' to='salesorderid' link-type='inner' alias='aa'>" +
		"<filter type='or'>" +
		"<condition attribute='statuscode' operator='eq' value='174160005' />" +
		"<condition attribute='gmb_ismigrated' operator='eq' value='1' />" +
		'</filter>' +
		'</link-entity>' +
		'</entity>' +
		'</fetch>';
	fetchXmlQuery = '?fetchXml=' + encodeURIComponent(fetchXmlQuery);
	Xrm.WebApi.retrieveMultipleRecords('salesorderdetail', fetchXmlQuery).then(

		function success(result) {
			var hasPastTransaction = false;
			if (result.entities.length > 0) {
				hasPastTransaction = true;
			}
			if (hasPastTransaction) {
				var message = {
					text: pastTransactionMsg,
					title: pastTransactionTitle,
					confirmButtonLabel: retrieveButtonTxt,
					cancelButtonLabel: newButtonTxt
				};
				var confirmOptions = {
					height: 200,
					width: 280
				};
				Xrm.Utility.closeProgressIndicator();
				Xrm.Navigation.openConfirmDialog(message, confirmOptions).then(function (success) {
					if (success.confirmed) {
						Xrm.Utility.showProgressIndicator(processingMessage);
						var parameterObject = {
							CustomerProduct: selectedGuid,
							ProductOf: product,
							Order: orderGuid,
							OrderTransaction: orderTransactionGuid,
							Customer: customerGuid
						};
						CallCustomActionAsync(
							JSON.stringify(parameterObject),
							'retrievePastTransaction',
							'OrderTransaction',

							function (results) {
								var returnResult = JSON.parse(results);
								if (returnResult.IsSuccess) {
									Xrm.Utility.openEntityForm('gmb_ordertransaction', Xrm.Page.data.entity.getId());
									// Open created record
									var entityFormOptions = {};
									entityFormOptions['entityName'] = 'salesorderdetail';
									entityFormOptions['entityId'] = returnResult.ErrorDetails;
									entityFormOptions['cmdbar'] = true;
									entityFormOptions['navbar'] = 'off';
									entityFormOptions['openInNewWindow'] = true;
									// Open the form.
									//Xrm.Navigation.openForm(entityFormOptions).then(
									//	function (success) {
									//		setTimeout(function () {
									//			delayedCloseProgressIndicator();
									//		}, 1000);
									//		setTimeout(function () {
									//			Xrm.Page.getControl('grid_associatedproducts').refresh();
									//		}, 1000);
									//		productOnClicking = false;
									//		console.log(success);
									//	},
									//	function (error) {
									//		setTimeout(function () {
									//			delayedCloseProgressIndicator();
									//		}, 1000);
									//		setTimeout(function () {
									//			Xrm.Page.getControl('grid_associatedproducts').refresh();
									//		}, 1000);
									//		productOnClicking = false;
									//		console.log(error);
									//	}
									//);
									
									Xrm.Page.getControl('grid_associatedproducts').refresh();
								
									
									Xrm.Utility.alertDialog("Retrieved Successfully !", null);
									
									Xrm.Utility.closeProgressIndicator();
									
								}
								else {
									setTimeout(function () {
										delayedCloseProgressIndicator();
									}, 1000);
									setTimeout(function () {
										Xrm.Page.getControl('grid_associatedproducts').refresh();
									}, 1000);
									productOnClicking = false;
								}
							});
						
						return;
					}

					else if (success.confirmed != undefined) {
						Xrm.Utility.showProgressIndicator(processingMessage);
						openClickedProduct(
							selectedGuid,
							product,
							orderGuid,
							orderTransactionGuid,
							selectedItemReference);
					}
					else {
						setTimeout(function () {
							delayedCloseProgressIndicator();
						}, 300);
						setTimeout(function () {
							Xrm.Page.getControl('grid_associatedproducts').refresh();
						}, 300);
						productOnClicking = false;
					}
				});
			}
			else {
				openClickedProduct(selectedGuid, product, orderGuid, orderTransactionGuid, selectedItemReference);
			}
		},

		function (error) {
			// Handle error conditions
			setTimeout(function () {
				delayedCloseProgressIndicator();
			}, 1000);
			setTimeout(function () {
				Xrm.Page.getControl('grid_associatedproducts').refresh();
			}, 1000);
			productOnClicking = false;
			Xrm.Utility.alertDialog(error.message, null);
		});
}

function openClickedProduct(selectedGuid, product, orderGuid, orderTransactionGuid, selectedItemReference) {
	var req = new XMLHttpRequest();
	req.open(
		'GET',
		Xrm.Page.context.getClientUrl() +
		'/api/data/v8.2/products(' + selectedGuid +
		')?$select=gmb_inputscreen,_defaultuomid_value',
		false);
	req.setRequestHeader('OData-MaxVersion', '4.0');
	req.setRequestHeader('OData-Version', '4.0');
	req.setRequestHeader('Accept', 'application/json');
	req.setRequestHeader('Content-Type', 'application/json; charset=utf-8');
	req.onreadystatechange = function () {
		if (this.readyState === 4) {
			if (this.status === 200) {
				var result = JSON.parse(this.response);
				var gmb_inputscreen = result['gmb_inputscreen'];
				var _defaultuomid_value = result['_defaultuomid_value'];
				if (gmb_inputscreen.indexOf('Multiple') > -1) {
					// Create Order Product
					var entity = {};
					entity['productid@odata.bind'] = '/products(' + selectedGuid + ')';
					entity['gmb_ProductOf@odata.bind'] = '/products(' + product + ')';
					entity.quantity = 0;
					entity['salesorderid@odata.bind'] = '/salesorders(' + orderGuid + ')';
					entity['gmb_OrderTransaction@odata.bind'] = '/gmb_ordertransactions(' + orderTransactionGuid + ')';
					entity['uomid@odata.bind'] = '/uoms(' + _defaultuomid_value + ')';
					entity.gmb_quantitynumber = 1;
					entity.gmb_istemplate = true["gmb_dateoftransaction"] ;
					var req = new XMLHttpRequest();
					req.open('POST', Xrm.Page.context.getClientUrl() + '/api/data/v8.2/salesorderdetails', true);
					req.setRequestHeader('OData-MaxVersion', '4.0');
					req.setRequestHeader('OData-Version', '4.0');
					req.setRequestHeader('Accept', 'application/json');
					req.setRequestHeader('Content-Type', 'application/json; charset=utf-8');
					req.onreadystatechange = function () {
						if (this.readyState === 4) {
							//req.onreadystatechange = null;
							if (this.status === 204) {
								var uri = this.getResponseHeader('OData-EntityId');
								var regExp = /\(([^)]+)\)/;
								var matches = regExp.exec(uri);
								var newEntityId = matches[1];
								// Open created record
								var entityFormOptions = {};
								entityFormOptions['entityName'] = 'salesorderdetail';
								entityFormOptions['entityId'] = newEntityId;
								entityFormOptions['cmdbar'] = true;
								entityFormOptions['navbar'] = 'off';
								entityFormOptions['openInNewWindow'] = true;
								// Open the form.
								Xrm.Navigation.openForm(entityFormOptions).then(

									function (success) {
										setTimeout(function () {
											delayedCloseProgressIndicator();
										}, 1000);
										setTimeout(function () {
											Xrm.Page.getControl('grid_associatedproducts').refresh();
										}, 1000);
										productOnClicking = false;
										console.log(success);
									},

									function (error) {
										setTimeout(function () {
											delayedCloseProgressIndicator();
										}, 1000);
										setTimeout(function () {
											Xrm.Page.getControl('grid_associatedproducts').refresh();
										}, 1000);
										productOnClicking = false;
										console.log(error);
									});
							}
							else {
								setTimeout(function () {
									delayedCloseProgressIndicator();
								}, 1000);
								setTimeout(function () {
									Xrm.Page.getControl('grid_associatedproducts').refresh();
								}, 1000);
								productOnClicking = false;
								Xrm.Utility.alertDialog(this.statusText);
							}
						}
					};
					req.send(JSON.stringify(entity));
				}
				else {
					var entityFormOptions = {};
					entityFormOptions['entityName'] = 'salesorderdetail';
					//entityFormOptions["useQuickCreateForm"] = true;
					//entityFormOptions["formId"] = "49F39C95-F122-4EFF-A26F-6C3AD8870549";
					entityFormOptions['cmdbar'] = true;
					entityFormOptions['navbar'] = 'off';
					entityFormOptions['openInNewWindow'] = true;
					//entityFormOptions["windowPosition"] = 2;
					//entityFormOptions["width"] = window.parent.innerWidth / 2;
					//entityFormOptions["height"] = window.parent.innerHeight * 3 / 4;
					// Set default values for the Contact form
					var formParameters = {};
					var transaction = Xrm.Page.entityReference;
					var setLookup = new Array();
					setLookup[0] = new Object();
					setLookup[0].id = transaction.id.substring(1, transaction.id.length - 1);
					setLookup[0].name = Xrm.Page.getAttribute('gmb_name').getValue();
					setLookup[0].entityType = transaction.entityType;
					formParameters['gmb_ordertransaction'] = setLookup;
					var order = Xrm.Page.getAttribute('gmb_order').getValue();
					var setLookup = new Array();
					setLookup[0] = new Object();
					setLookup[0].id = order[0].id;
					setLookup[0].name = order[0].name;
					setLookup[0].entityType = order[0].entityType;
					formParameters['salesorderid'] = setLookup;
					var setLookup = new Array();
					setLookup[0] = new Object();
					setLookup[0].id = selectedItemReference.id;
					setLookup[0].name = selectedItemReference.name;
					setLookup[0].entityType = selectedItemReference.entityType;
					formParameters['productid'] = setLookup;
					var productOf = Xrm.Page.getAttribute('gmb_product').getValue();
					if (productOf != null) {
						var setLookup = new Array();
						setLookup[0] = new Object();
						setLookup[0].id = productOf[0].id;
						setLookup[0].name = productOf[0].name;
						setLookup[0].entityType = productOf[0].entityType;
						formParameters['gmb_productof'] = setLookup;
					}
					// Open the form.
					Xrm.Navigation.openForm(entityFormOptions, formParameters).then(

						function (success) {
							setTimeout(function () {
								delayedCloseProgressIndicator();
							}, 1000);
							setTimeout(function () {
								Xrm.Page.getControl('grid_associatedproducts').refresh();
							}, 1000);
							productOnClicking = false;
							console.log(success);
						},

						function (error) {
							setTimeout(function () {
								delayedCloseProgressIndicator();
							}, 1000);
							setTimeout(function () {
								Xrm.Page.getControl('grid_associatedproducts').refresh();
							}, 1000);
							productOnClicking = false;
							console.log(error);
						});
				}
			}
			else {
				setTimeout(function () {
					delayedCloseProgressIndicator();
				}, 1000);
				setTimeout(function () {
					Xrm.Page.getControl('grid_associatedproducts').refresh();
				}, 1000);
				productOnClicking = false;
				Xrm.Utility.alertDialog(this.statusText);
			}
		}
	};
	req.send();
}

function delayedCloseProgressIndicator() {
	Xrm.Utility.closeProgressIndicator();
}

function CallCustomActionAsync(inputArgs, methodName, entityName, successCallBack) {
	try {
		var inputArgs = inputArgs;
		var serverURL = Xrm.Page.context.getClientUrl();
		var actionName = 'gmb_CustomAction';
		var methodName = methodName;
		var entityName = entityName;
		//Pass the input parameters of action
		var data = {
			InputArgument: inputArgs,
			MethodName: methodName,
			Entity: entityName
		};
		var req = new XMLHttpRequest();
		req.open('POST', serverURL + '/api/data/v8.2/' + actionName, true);
		req.setRequestHeader('Accept', 'application/json');
		req.setRequestHeader('Content-Type', 'application/json; charset=utf-8');
		req.setRequestHeader('OData-MaxVersion', '4.0');
		req.setRequestHeader('OData-Version', '4.0');
		req.onreadystatechange = function () {
			if (this.readyState == 4 /* complete */) {
				req.onreadystatechange = null;
				if (this.status == 200) {
					//get the output parameter of the action
					result = JSON.parse(this.response).OutputArgument;
					//If Process Result is 1 then Success
					if (result != null) {
						if (result.indexOf('Failed') == -1) {
							successCallBack(result);
						}
						else {
							alert(result);
						}
					}
					else {
						//If Custom Action Failed
						alert(result);
					}
				}
				else {
					//If CustomActionHandler Failed
					var error = JSON.parse(this.response).error;
					alert('Error in Script : ' + error.message);
				}
			}
		};
		//Execute request passing the input parameter of the action
		req.send(window.JSON.stringify(data));
	}
	catch (error) {
		Xrm.Utility.alertDialog(
			'Error occurred in Function: CallCustomAction. Error: ' + (error.message || error.description));
	}
}

function checkProductTaxable(productId) {
	var taxable = null;
	var req = new XMLHttpRequest();
	req.open(
		'GET',
		Xrm.Page.context.getClientUrl() +
		'/api/data/v8.2/products(' + productId +
		')?$select=gmb_taxable,gmb_taxableamount',
		false);
	req.setRequestHeader('OData-MaxVersion', '4.0');
	req.setRequestHeader('OData-Version', '4.0');
	req.setRequestHeader('Accept', 'application/json');
	req.setRequestHeader('Content-Type', 'application/json; charset=utf-8');
	req.setRequestHeader('Prefer', 'odata.include-annotations="*"');
	req.onreadystatechange = function () {
		if (this.readyState === 4) {
			req.onreadystatechange = null;
			if (this.status === 200) {
				var result = JSON.parse(this.response);
				if (result['gmb_taxable'] != null && result['gmb_taxable'] == true) {
					if (result['gmb_taxableamount'] != null) {
						taxable = result['gmb_taxableamount'];
					}
					else {
						taxable = true;
					}
				}
			}
			else {
				Xrm.Utility.alertDialog(this.statusText);
			}
		}
	};
	req.send();
	return taxable;
}