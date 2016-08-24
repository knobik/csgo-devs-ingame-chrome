var background = {
    interval: 10, // minutes
    groupUrl: 'http://steamcommunity.com/groups/Valve/members?content_only=true&p=',
    devs: [],

    init: function() {
        chrome.alarms.create("Start", {
            periodInMinutes: this.interval
        });

        this.timer();
    },

    timer: function () {
        chrome.browserAction.setBadgeBackgroundColor({color: 'red'});
        chrome.browserAction.setBadgeText({text: '...'});

        this.devs = [];
        this.employesPlayingCsgo(0, 1, function(count){
            chrome.browserAction.setBadgeBackgroundColor({color: 'green'});
            chrome.browserAction.setBadgeText({text: count.toString()});

            chrome.extension.sendMessage({action: "update-csgo-devs"});
        });
    },

    employesPlayingCsgo: function(result, page, callback)
    {
        var self = this;

        this.employesOnPage(page, function(inCsgo, pageCount){
            result = result + inCsgo;

            if (page < pageCount) {
                self.employesPlayingCsgo(result, page+1, callback);
            } else {
                callback(result);
            }
        });
    },

    employesOnPage: function(page, callback)
    {
        var pageCount = 1,
            inCsgo = 0,
            self = this;

        this.request(this.groupUrl + page, function(response){

            var dom = $(response);

            $.each(dom.find('.member_block_content.in-game'), function(_, game){
                if ($(game).text().indexOf('Counter-Strike: Global Offensive') > -1) {
                    inCsgo++;
                    var link = $(game).find('a');
                    self.devs.push({
                        name: link.text(),
                        profile: link.attr('href')
                    });
                }
            });

            pageCount = parseInt(dom.find('.pagelink:last').text());

            callback(inCsgo, pageCount);
        });
    },

    request: function(url, loadCallback, failCallback)
    {
        var xhr = new XMLHttpRequest();
        xhr.responseType = 'text';
        xhr.onload = function() {
            if (this.status == 200) {
                loadCallback(xhr.response);

                return;
            }

            if (typeof failCallback !== 'undefined') {
                failCallback(this.status);
            }
        };
        xhr.open('GET', url);
        xhr.send();
    }
};

chrome.alarms.onAlarm.addListener(function(alarm){
    background.timer();
});

if (jQuery) {
    background.init();
} else {
    chrome.browserAction.setBadgeText({text: 'BUG'});
}