# apache-cloudstack-javascript-client

This project facilitates the integration of Javascript applications with Apache CloudStack through its API.
It is a Javascript framework that enables the execution of requests to Apache CloudStack API. If you want to write only a simple script I recommend you using <a href="https://github.com/apache/cloudstack-cloudmonkey">CloudMonkey</a>, instead of this framework. However, if you have the need to write a Javascript application that has to consume Apache CloudStack API, you are welcome to use this framework.

You can find examples on how to use the framework at <a href="https://github.com/Autonomiccs/apache-cloudstack-javascript-client/tree/master/samples/">examples</a>. The usage is as simple as that:

```javascript

        var secretKey = 'secretKey';
		var apiKey = 'apiKey';
		var clientUrl = 'https://cloud.domain.com/client';
			
		
		var apacheCloudStackClient = autonomiccs.createApacheCloudStackClient(clientUrl, {apiKey: apiKey, secretKey: secretKey});
		
		var apacheCloudStackRequest = autonomiccs.createApacheCloudStackRequest('listClusters');
		apacheCloudStackRequest.addParameter('name', "clusterName");
		
		var result = apacheCloudStackClient.executeRequestGetJson(apacheCloudStackRequest);
```

The response is a JSON string. If you want, you can use the `JSON.parse` function to create a JSON object.

The framework uses the following libraries:
* <a href="https://code.jquery.com/jquery-3.1.0.min.js" >jquery-3.1.0</a>
* <a href="http://momentjs.com/downloads/moment-with-locales.min.js" >moment-2.14.1</a>
* <a href="https://github.com/Caligatio/jsSHA/releases/tag/v2.2.0" >jsSHA-2.2.0</a>

# License
 Apache CloudStack Javascript Client
 
 Copyright (C) 2016 Autonomiccs, Inc.

 Licensed to the Autonomiccs, Inc. under one
 or more contributor license agreements.  See the NOTICE file
 distributed with this work for additional information
 regarding copyright ownership. The Autonomiccs, Inc. licenses this file
 to you under the Apache License, Version 2.0 (the
 "License"); you may not use this file except in compliance
 with the License.  You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing,
 software distributed under the License is distributed on an
 "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 KIND, either express or implied.  See the License for the
 specific language governing permissions and limitations
 under the License.