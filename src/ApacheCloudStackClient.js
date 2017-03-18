/**
* Apache CloudStack Javascript Client
*
* Copyright (C) 2016 Autonomiccs, Inc.
*
* Licensed to the Autonomiccs, Inc. under one
* or more contributor license agreements.  See the NOTICE file
* distributed with this work for additional information
* regarding copyright ownership. The Autonomiccs, Inc. licenses this file
* to you under the Apache License, Version 2.0 (the
* "License"); you may not use this file except in compliance
* with the License.  You may obtain a copy of the License at
* 
*  http://www.apache.org/licenses/LICENSE-2.0
* 
* Unless required by applicable law or agreed to in writing,
* software distributed under the License is distributed on an
* "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
* KIND, either express or implied.  See the License for the
* specific language governing permissions and limitations
* under the License.
* 
**/

/**
	Initializing the Autonomiccs functions name space.
**/
var autonomiccs = autonomiccs  || {};

(function(){
 
/**
* This function will return the given value safely encoded to be trasmitted through the URL to the ACS.
**/
var getAcsUrlEncodedValue = function (value){
	var searchExpression = '\\+';
	var regexp = new RegExp(searchExpression, 'g');

	return encodeURIComponent(value).replace(regexp, '%20');	
};

/**
* This method creates the command string with the given array of request parameters.
* It will concat each parameter using the standard 'paramName=paramValue&'.
* The last '&' will be removed from the final string that is returned.
**/
var createCommandString = function (apacheCloudStackRequestParameters){
	var finalString = '';
	for (let param of apacheCloudStackRequestParameters) {
		finalString = finalString + param.name + '=' + getAcsUrlEncodedValue(param.value) + '&';
	}
	return finalString.substring(0, finalString.length - 1);
};

/**
* This method create the signature for the given command string using the user's secret key.
**/
var createSignature = function (commandString, userCredentials){
	var shaObj = new jsSHA("SHA-1", "TEXT");
	shaObj.setHMACKey(userCredentials.secretKey, "TEXT");
	shaObj.update(commandString.toLowerCase());
	return shaObj.getHMAC("B64");
};

/**
* This method checks if the user informed his/her API keys.
**/
var hasTheUserInformedApiKeys = function (userCredentials){
	return Boolean(userCredentials.apiKey) && Boolean(userCredentials.secretKey);
};
		 
/**
* This method configures the request expiration if needed.
* It uses the value defined at apacheCloudStackClient.requestValidity to determine until when the request is valid.
* It also uses the parameter apacheCloudStackClient.shouldRequestsExpire to decide if it has to configure or not the validity of the request.
* Moreover, if the 'apacheCloudStackRequest' contains the 'expires' parameter it will only add a parameter called 'signatureVersion=3', in order to enable that override.
**/
var configureRequestExpiration = function (apacheCloudStackClient, apacheCloudStackRequest){
	var hasExpirationTimeConfigred = apacheCloudStackRequest.parameters.filter(function(param){return param.name === 'expires'}).length;
	if(!hasExpirationTimeConfigred && !apacheCloudStackClient.shouldRequestsExpire){
		return;
	}
	apacheCloudStackRequest.addParameter('signatureVersion', 3);
	if(hasExpirationTimeConfigred){
			return;
	}
	
	var expirationTime = moment().add(apacheCloudStackClient.requestValidity, 'seconds').format();
	expirationTime = expirationTime.substring(0,expirationTime.length - 3) + expirationTime.substring(expirationTime.length - 2,expirationTime.length);
	
	apacheCloudStackRequest.addParameter('expires', expirationTime);
};


/**
* This method executes the request to the configures Apache CloudStack.
* It returns a JSON object. Additionally, we add the parameter 'response=json' to the request.
**/ 
var executeRequestToCloudSTackGetJson = function (apacheCloudStackRequest){
	apacheCloudStackRequest.addParameter('response', 'json');
	var resultAsSring = executeRequestToCloudSTack(apacheCloudStackRequest, this);
	if(jQuery.isPlainObject(resultAsSring)){
		return resultAsSring;
	}
	return JSON.parse(resultAsSring);
};

/**
* This method executes the request to the configures Apache CloudStack.
**/ 
var executeRequestToCloudSTack = function (apacheCloudStackRequest, apacheCloudStackClient){
	var apacheCloudStackClient = apacheCloudStackClient  || this;
	
	apacheCloudStackRequest.addParameter('command', apacheCloudStackRequest.commandName);
	var isUsingUserApiKeys = hasTheUserInformedApiKeys(apacheCloudStackClient.userCredentials);
	if(isUsingUserApiKeys){
		apacheCloudStackRequest.addParameter('apiKey', apacheCloudStackClient.userCredentials.apiKey)
	}
	configureRequestExpiration(apacheCloudStackClient, apacheCloudStackRequest);
	apacheCloudStackRequest.parameters.sort(sortRequestParameters);
	var commandString = createCommandString(apacheCloudStackRequest.parameters);
	if(isUsingUserApiKeys){
			var signature = createSignature(commandString, apacheCloudStackClient.userCredentials);
			commandString = commandString + '&' + 'signature=' + getAcsUrlEncodedValue(signature);
	}
	var urlRequest = apacheCloudStackClient.cloudStackUrl + '/api?' + commandString;
	var requestResult;
	jQuery.ajax({
		url: urlRequest, 
		success: function (data, status){
			requestResult = data;
		},
		error:  function (data, status){
			requestResult = data.responseText;
		},
		async: false,
		cache: true,
		crossDomain: true,
		type: 'GET'
	});
	return requestResult;
};

 /**
 * It validates the userCredentials. 
 * We check if it was provided apiKey and secretKey.
 **/
var validateUserCredentials = function (userCredentials){
	if(!userCredentials){
		 throw "You should inform the user credentials.";
	 }
	 var isAuthenticationUsingApiKeys = hasTheUserInformedApiKeys(userCredentials);
	 
	 if(!isAuthenticationUsingApiKeys){
		 throw "You should  inform the apiKey and secretKey.";
	 }
};

/**
* This method will append the URL sufix '/client' if needed to the given URL.
* The returned value is the given URL ending with '/client'
**/
var appendUrlSuffixIfNeeded = function (cloudStackUrl){
	if(cloudStackUrl.endsWith('client/')){
		return cloudStackUrl.substring(0, cloudStackUrl.length -1)
	}
	if(cloudStackUrl.endsWith('client')){
			return cloudStackUrl;
	}
	if(!cloudStackUrl.endsWith('/')){
			cloudStackUrl = cloudStackUrl + '/';
	}
	return cloudStackUrl + 'client';
};

 /**
 * This method creates an Apache CloudStack client with the given user credentials.
 **/
 var createApacheCloudStackClient = function (cloudStackUrl, userCredentials){
	validateUserCredentials(userCredentials);
	
	if(!cloudStackUrl || !Boolean(jQuery.trim(cloudStackUrl))){
		throw "You should inform a CloudStack URL.";
	}
	cloudStackUrl = appendUrlSuffixIfNeeded(cloudStackUrl);
	 return {
		 userCredentials: userCredentials,
		 cloudStackUrl: cloudStackUrl,
		 executeRequest: executeRequestToCloudSTack, 
		 executeRequestGetJson: executeRequestToCloudSTackGetJson,
		 shouldRequestsExpire: true,
		 requestValidity: 30
	 };
 };
 
 /**
 * This function creates an object that represents the Apache CloudStack API request.
 * It contains the command name and its parameters.
 **/
 var createApacheCloudStackRequest = function (commandName){
	 return {
		commandName:  commandName, 
		parameters: [],
		addParameter: function (paramName, paramValue){
			var numberOfParameters = this.parameters.length;
			this.parameters[numberOfParameters] = {name: paramName, value: paramValue};
			return this;
			}
	 };
 };
 
 /**
 * This function sorts the request parameters by their names.
 * The sort is in ascending order.
 **/
 var sortRequestParameters = function (param1, param2){
	 if(param1.name == param2.name){
		 return 0;
	 }
	 if(param1.name > param2.name){
		return 1;
	 }
	 return -1;
 };
 
	/** Exporting functions to Autonomiccs name space. **/
	autonomiccs.createApacheCloudStackRequest = createApacheCloudStackRequest;
	autonomiccs.createApacheCloudStackClient = createApacheCloudStackClient;
})();