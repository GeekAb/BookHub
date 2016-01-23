// Application Class
// Constructor
var App = {

    appBase : null,
    appMode : null,
    apiBase : 'https://capillary.0x10.info/api/',
    authToken : null,
    
    globalPollTime : 30000,
    ajaxRequestArray : {},
    
    lastVisited : '',
    totalBooks : 0,
    bookmarked : 0,
    bookmarkedList : [],
    
    monthNames : [
          "January", "February", "March",
          "April", "May", "June", "July",
          "August", "September", "October",
          "November", "December"
        ],
    
    /*API Url endpoints*/
    apiURLs : {
        'book' : {
            'list' : {
                'url' : 'books',
                'method' : 'GET'
            }
        }
    },

    /*Initialize values and parameters*/
    init: function( options ) {
        App.setupLocalStorage();
    },
    
    setupLocalStorage : function () {
        
        if(typeof window.localStorage['bookmarked'] != 'undefined' && window.localStorage['bookmarked'] != 0)
            App.bookmarked = parseInt(window.localStorage['bookmarked']);
        else
            window.localStorage['bookmarked'] = App.bookmarked;
        
        if(typeof window.localStorage['lastVisited'] != 'undefined' && window.localStorage['lastVisited'] != '')
            $('.lastvisited small').html('Last visited on '+window.localStorage['lastVisited']);
        
        var temp = new Date();
        window.localStorage['lastVisited'] = temp.getDate() + ' ' + App.monthNames[temp.getMonth()]+ ' ' + temp.getFullYear();
        
        if(typeof window.localStorage['bookmarkedList'] != 'undefined' && window.localStorage['bookmarkedList'] != '')
            App.bookmarkedList = window.localStorage['bookmarkedList'].split(',');
        
        
        console.log(App.bookmarkedList);
    },
    
    buildUrl: function (caller) {
        var temp = caller.split('-');
        if(temp.length > 1) {
            return App.apiURLs[temp[0]][temp[1]];
        } else {
            return App.apiURLs[caller];
        }
    },

    /*base function for Calling api using AJAX*/
    callAPI: function(caller, queryString, params){

        var urlData = App.buildUrl(caller);
        var additionalUrl = '';

        var url = App.apiBase+urlData.url;

        /*Add query string to URL if its a get request and query string is not null*/
        if(queryString != '' && urlData.method === 'GET' || urlData.method === 'DELETE') {
            url = url + queryString;
        }
        
        /*Url Structure break at ? anything before ? will go with url and anything after that will go as data*/
        if(queryString != '' && urlData.method === 'PATCH' || urlData.method === 'POST') {
            if(typeof queryString == 'string') {
                var temp = queryString.split('?');
                console.table(temp);
                if(temp.length > 1) {
                    url = url + temp[0];
                    queryString = temp[1];
                } else {
                    url = url + temp[0];
                    console.log(params);
                    queryString = (typeof params.data != 'undefined')?params.data:{};
                }
            }
        }

        // Using the core $.ajax() method
        var newRequest = $.ajax({
            // the URL for the request
            url: url,
         
            // the data to send (will be converted to a query string)
            data: (urlData.method === 'GET' || urlData.method === 'DELETE')?'':queryString,
         
            // whether this is a POST or GET request
            type: urlData.method,
         
            // the type of data we expect back
            dataType : (typeof params.dataType != 'undefined')?params.dataType:'JSON',

            // Before sending the request
            beforeSend: function (request) {
                if(params !== undefined && params.authCheck !== undefined && params.authCheck)
                    App.setHeader(request);
            },
         
            // code to run if the request succeeds;
            // the response is passed to the function
            success: function( result ) {
                // If callback is present, call that function
                if(params !== undefined && params.successCallback !== undefined)
                        params.successCallback(result)
                else if(caller === ''){
                }
            },
         
            // code to run if the request fails; the raw request and
            // status codes are passed to the function
            error: function( xhr, status, errorThrown ) {
                
                if(xhr.status == 403 && xhr.statusText == "FORBIDDEN") {
                    window.location = App.appUrls.login;
                }
                else if(xhr.status == 401 && xhr.statusText == "UNAUTHORIZED") {
                    params.errorCallback(xhr);
                }
                else if(params !== undefined && params.errorCallback !== undefined)
                    params.errorCallback(xhr.responseJSON, xhr.status)
            },
         
            // code to run regardless of success or failure
            complete: function( xhr, status ) {
                if(params !== undefined && params.completeCallback !== undefined)
                    params.completeCallback(caller, queryString, params);
            },
            timeout : 600000
        });
        
        
        if(params.requestName) {
            App.ajaxRequestArray[params.requestName] = newRequest;
        }
    },

    // Setting up header for request where token is required
    setHeader: function(request) {
        request.withCredentials = true;
        request.setRequestHeader("Authorization", "Token  "+window.localStorage['token']);
    },

    // Emulate local storage if its not available
    // Useful for older browsers where localstorage is not supported
    createLocalStorage : function() {

        window.localStorage = {

            length: 0,

            key: function (nKeyId) {
              return unescape(document.cookie.replace(/\s*\=(?:.(?!;))*$/, "").split(/\s*\=(?:[^;](?!;))*[^;]?;\s*/)[nKeyId]);
            },

            getItem: function (sKey) {
              if (!sKey || !this.hasOwnProperty(sKey)) { return null; }
              return unescape(document.cookie.replace(new RegExp("(?:^|.*;\\s*)" + escape(sKey).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=\\s*((?:[^;](?!;))*[^;]?).*"), "$1"));
            },           

            setItem: function (sKey, sValue) {
              if(!sKey) { return; }
              document.cookie = escape(sKey) + "=" + escape(sValue) + "; expires=Tue, 19 Jan 2038 03:14:07 GMT; path=/";
              this.length = document.cookie.match(/\=/g).length;
            },

            removeItem: function (sKey) {
              if (!sKey || !this.hasOwnProperty(sKey)) { return; }
              document.cookie = escape(sKey) + "=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
              this.length--;
            },

            hasOwnProperty: function (sKey) {
              return (new RegExp("(?:^|;\\s*)" + escape(sKey).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=")).test(document.cookie);
            }
        };
        
        window.localStorage.length = (document.cookie.match(/\=/g) || window.localStorage).length;
    },
};

