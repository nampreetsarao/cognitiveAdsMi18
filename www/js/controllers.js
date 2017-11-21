angular.module('app-constants', [])
.constant('apiUrl', 'https://api.enterprise.apigee.com/v1/organizations/ns00492379/apis')
.constant("server", "https://api.enterprise.apigee.com/v1/organizations/ns00492379/apis")
.constant("apigeeBaseURL", "https://api.enterprise.apigee.com/v1/organizations/")
.constant("apigeeapiurl", "/apis")
.constant("apigeeapirevisionurl", "/revisions")
.constant("wso2BaseURL", "http://localhost:9763/publisher/site/blocks/")
.constant("wso2fetchAPISurl","listing/ajax/item-list.jag?action=getAllAPIs")
.constant("wso2loginurl","user/login/ajax/login.jag")
.constant("wso2createAPIUrl","item-add/ajax/add.jag")
.constant("wso2getAPIUrl","listing/ajax/item-list.jag")
.constant("wso2deleteAPIUrl","item-add/ajax/remove.jag")
.constant("apigeeapirevisionurl", "/revisions")
.constant("port", "9763")
.constant("portForSignup", "9763")
.constant("baseURL","/cashewapi")
.constant("baseURLForOAuth","/bigoauth2server")
.constant("token","")

.factory('constantService', function ($http, server, port, baseURL,
  baseURLForOAuth, portForSignup,token,apigeeBaseURL,apigeeapiurl, apigeeapirevisionurl,
  wso2BaseURL,wso2fetchAPISurl,wso2loginurl,wso2createAPIUrl,wso2getAPIUrl,wso2deleteAPIUrl) {
    return {
        server:server,
        port: port,
        baseURL: baseURL,
        baseURLForOAuth: baseURLForOAuth,
        portForSignup: portForSignup,
        token: token,
        apigeeBaseURL: apigeeBaseURL,
        apigeeapiurl: apigeeapiurl,
        apigeeapirevisionurl: apigeeapirevisionurl,
        wso2BaseURL: wso2BaseURL,
        wso2fetchAPISurl: wso2fetchAPISurl,
        wso2loginurl: wso2loginurl,
        wso2createAPIUrl: wso2createAPIUrl,
        wso2getAPIUrl:wso2getAPIUrl,
        wso2deleteAPIUrl: wso2deleteAPIUrl

    }
})

angular.module('app.controllers', ['app-constants'])
  .controller('avaialbleAPIsCtrl', function ($scope, $stateParams,$state,$http,$ionicPopup,
    $ionicLoading,constantService,StorageService,$httpParamSerializer,$cookies, $sce,$ionicScrollDelegate,$timeout,
    elasticClient,toaster,$cordovaGeolocation) {

      //Videogular specific code - play video code
      var alternate, isIOS = true;
      var controller  = this;
			controller.API = null;
      controller.onPlayerReady = function(API) {
				controller.API = API;
			};

      controller.videos = [
				{
					sources: [
						{src: $sce.trustAsResourceUrl("img/VW_TIGUAN_2017_A_look_at_the_Volkswagen_Tiguan.mp4"), type: "video/mp4"},
						{src: $sce.trustAsResourceUrl("img/VW_TIGUAN_2017_A_look_at_the_Volkswagen_Tiguan.mp4"), type: "video/webm"},
						{src: $sce.trustAsResourceUrl("img/VW_TIGUAN_2017_A_look_at_the_Volkswagen_Tiguan.mp4"), type: "video/ogg"}
					]
				}
			];

			controller.config = {
				autoHide: false,
				autoHideTime: 3000,
				autoPlay: false,
				sources: controller.videos[0].sources,
				theme: "lib/videogular-themes-default/videogular.css",
				plugins: {
					poster: ""
				}
			};

      controller.setVideo = function(index) {
				controller.API.stop();
				controller.config.sources = controller.videos[index].sources;
			};
      $scope.hideTime = true;



//search elastic to retrieve suggested results
$scope.searchElastic = function() {
  //toaster.pop('', "", "4 wheel drive");
  var currentVideoTime = controller.API.currentTime/10000;
  console.log("Current Video time: "+currentVideoTime/10000);
  zone=Math.ceil(currentVideoTime);
  console.log("Current zone: "+zone);
  var response="";
  elasticClient.search({
    index: 'zonequestions',
    type: 'zone',
    body: {
      "query": {
      		"match": {
      			"zone":zone

      		}
      	}
    }
  }).then(function (resp) {
      console.log(resp);
      response=resp.hits.hits;
      $scope.searchData=response;
  }, function (err) {
      console.log(err.message);
  });
}

//Function used to display the features of car as per time in the video (this is divided into time zone of 10 seconds each)
$scope.getFeatures = function($currentTime,$duration){

  var currentVideoTime = $currentTime;
  zone=Math.ceil(currentVideoTime/10);
  // console.log("@@@Current time: "+$currentTime);
  // console.log("@@@Total video time: "+$duration);
  var endofvideoreached="false";
  if($currentTime==$duration & endofvideoreached=="false"){
     var endofvideoreached="true";
      console.log("@@@ End of video reached");
      var myPopup = $ionicPopup.show({
            template: '<input type="text" ng-model="data.name" placeholder="Name"><input type="text" placeholder="Email" ng-model="data.email"><input type="text" placeholder="Number" ng-model="data.mobile">',
            title: 'Liked what you saw?',
            subTitle: 'Please share your details to schedule a test drive',
            scope: $scope,
            buttons: [
              { text: 'Cancel' },
              {
                text: '<b>Save</b>',
                type: 'button-positive',
                onTap: function(e) {
                //  if (!$scope.data.name && !$scope.data.mobile && !$scope.data.email) {
                    //don't allow the user to close unless he enters wifi password
                    e.preventDefault();

                    //Fetch the GPS location of the device
                    var lat  = "";
                    var long ="";
                    var posOptions = {timeout: 10000, enableHighAccuracy: false};
                    $cordovaGeolocation.getCurrentPosition(posOptions)

                   .then(function (position) {
                      var lat  = position.coords.latitude
                      var long = position.coords.longitude
                      console.log(lat + '   ' + long)
                   }, function(err) {
                      console.log(err)
                   });

                   var watchOptions = {timeout : 3000, enableHighAccuracy: false};
                   var watch = $cordovaGeolocation.watchPosition(watchOptions);

                   watch.then(
                      null,

                      function(err) {
                         console.log(err)
                      },

                      function(position) {
                          lat  = position.coords.latitude
                         long = position.coords.longitude
                         console.log(lat + '' + long)
                      }
                   );

                   watch.clearWatch();

                    //submit the data to elastic search
                    elasticClient.index({
                      index: 'userdata',
                      id: '2',
                      type: 'user',
                      body: {
                          "name":$scope.data.name,
                          "emailid":$scope.data.email,
                          "mobile":$scope.data.mobile,
                          "geolocation":lat+" "+long
                        }
                    }).then(function (resp) {
                        console.log(resp);
                        response=resp.hits.hits;
                        $scope.searchData=response;
                    }, function (err) {
                        console.log(err.message);
                    });



                  // } else {
                  //   return $scope.data.wifi;
                  // }
                }
              }
            ]
          });
  }

  console.log("@@@Current zone: "+zone);
  if($scope.currentZone!=zone){
    $scope.currentZone=zone;
    elasticClient.search({
      index: 'zonesuggestions',
      type: 'zone',
      body: {
        "query": {
            "match": {
              "zone":zone

            }
          }
      }
    }).then(function (resp) {
        //console.log(resp);
        response=resp.hits.hits;
        let promise = $timeout();
        angular.forEach(resp.hits.hits, function(item, index) {

           promise = promise.then(function() {
             toaster.pop('', "", item._source.suggestion);
             console.log("##########"+item._source.suggestion+ "index value:"+index  );
             return $timeout(2000);
           });
        });
    }, function (err) {
        console.log(err.message);
    });
  }
}

//When the autocomplete search item is selected.
$scope.searchSelectedItem =function(searchData){
    console.log("Inside search selected!!"+searchData);
    $scope.data.message=searchData._source.question;
    this.sendMessage();
}

 //send message to IBM Bluemix conversation
 $scope.sendMessage = function() {
      //make the search list empty
       $scope.searchData="";
       alternate,
         isIOS = ionic.Platform.isWebView() && ionic.Platform.isIOS();
       controller.API.pause();
       var currentVideoTime = controller.API.currentTime;
       zone=currentVideoTime;

       $ionicLoading.show();
       alternate = !alternate;
       var d = new Date();
       d = d.toLocaleTimeString().replace(/:\d+ /, ' ');
       $scope.messages.push({
         userId:  '54321',
         text: $scope.data.message,
         time: d
       });


       var config = {headers:  {
                  'Content-Type': 'application/json',
                  'Authorization': 'Basic YWRkZjg2ZjYtMjRhZS00ZjIyLWFmOWYtYzEzNDIzZWFkNWQ2Ok1DSnFTdndpQmYzNw=='
              }
       };
       //Backup
       //var url= "https://gateway.watsonplatform.net/conversation/api/v1/workspaces/5d328154-2bfb-4ac9-afa0-7bd8a44bf02d/message?version=2017-05-26";
       var url= "https://gateway.watsonplatform.net/conversation/api/v1/workspaces/796b4d1f-2d3d-4544-a408-30ed9b1e2a1c/message?version=2017-05-26";
       var body={"input": {"text":$scope.data.message },
                           "context": {"conversation_id": "Conversation-b3", "system": {"dialog_stack":[{"dialog_node":"root"}], "dialog_turn_counter": 1, "dialog_request_counter": 1}}}
       //Calling Bluemix convesation api
       $http.post(url, body,config ).then(function(resp){
            $ionicLoading.hide();
            $scope.wsodeleteapidetails=resp.data.output.text;
            var origin="http://localhost:8100";
            //resp.header("Access-Control-Allow-Origin", origin);
            console.log('Response from bluemix:', resp); // JSON object
            $scope.messages.push({
              userId: alternate ? '12345' : '54321',
              text: resp.data.output.text[0],
              time: d
            });
          }, function(err){
            $ionicLoading.hide();
            console.error('ERR', err);
            var alertPopup = $ionicPopup.alert({
              title: 'Error fetching the details from Watson API',
              template:'Error occured while calling the API:'+JSON.stringify(err)
            });
          });

       delete $scope.data.message;
       $ionicScrollDelegate.scrollBottom(true);
 };

 //For chat
 $scope.inputUp = function() {
   if (isIOS) $scope.data.keyboardHeight = 216;
   $timeout(function() {
     $ionicScrollDelegate.scrollBottom(true);
   }, 300);

 };

 $scope.inputDown = function() {
   if (isIOS) $scope.data.keyboardHeight = 0;
   $ionicScrollDelegate.resize();
 };

 $scope.closeKeyboard = function() {
   // cordova.plugins.Keyboard.close();
 };
 $scope.data = {};
 $scope.myId = '12345';
 $scope.messages = [];
})


//Chat window directives
// All this does is allow the message
// to be sent when you tap return
.directive('input', function($timeout) {
  return {
    restrict: 'E',
    scope: {
      'returnClose': '=',
      'onReturn': '&',
      'onFocus': '&',
      'onBlur': '&'
    },
    link: function(scope, element, attr) {
      element.bind('focus', function(e) {
        if (scope.onFocus) {
          $timeout(function() {
            scope.onFocus();
          });
        }
      });
      element.bind('blur', function(e) {
        if (scope.onBlur) {
          $timeout(function() {
            scope.onBlur();
          });
        }
      });
      element.bind('keydown', function(e) {
        if (e.which == 13) {
          if (scope.returnClose) element[0].blur();
          if (scope.onReturn) {
            $timeout(function() {
              scope.onReturn();
            });
          }
        }
      });
    }
  }
})


.controller('settingsCtrl', function ($scope, $stateParams,$state,$http,$ionicPopup,$ionicLoading,constantService,StorageService,$httpParamSerializer) {
})

.controller('menuCtrl', ['$scope', '$stateParams', // The following is the constructor function for this page's controller. See https://docs.angularjs.org/guide/controller
// You can include any angular dependencies as parameters for this function
// TIP: Access Route Parameters for your page via $stateParams.parameterName
function ($scope, $stateParams) {


}])
