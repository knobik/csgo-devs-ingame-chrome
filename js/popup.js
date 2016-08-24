//chrome.tabs.create({ url: "http://steamcommunity.com/groups/Valve#members" });

var popup = {
    init: function () {
        var self = this;

        chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
            if (request.action == 'update-csgo-devs') {
                self.updateDevs();
            }
        });

        self.updateDevs();
    },

    updateDevs: function () {
        var list = chrome.extension.getBackgroundPage().background.devs;

        $('.js-list li:not(.js-none)').remove();

        $.each(list, function(_, dev){
            $('.js-list').append('<li class="list-group-item"><span class="glyphicon glyphicon-user"></span> <a href="'+ dev.profile +'" target="_blank">'+ dev.name +'</a></li>');
        });

        if (list.length > 0) {
            $('.js-none').hide();
        } else {
            $('.js-none').show();
        }
    }
};

popup.init();
