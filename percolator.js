//http://stackoverflow.com/questions/1038746/equivalent-of-string-format-in-jquery
String.prototype.format = String.prototype.f = function() {
    var s = this,
        i = arguments.length;

    while (i--) {
        s = s.replace(new RegExp('\\{' + i + '\\}', 'gm'), arguments[i]);
    }
    return s;
};

var percolator = {
    membershipId: undefined,
    getBungieData: function() {

    },
    fetchMembershipIdFromBungie: function(apiKey, userName, networkId) {
        var bungieUrl = 'http://www.bungie.net/Platform/Destiny/{0}/Stats/GetMembershipIdByDisplayName/{1}/'.format(networkId, userName);

        $.ajax({
            url: bungieUrl,
            type: 'get',
            headers: {
                'X-API-Key': apiKey
            },
            success: function(data) {
                console.info(data);
            }
        });
    },
    getMembershipId: function() {
        if(this.membershipId) {
            return this.membershipId;
        }

        var apiKey = this.getApiKey();
        var userName = this.getUserName();
        var networkId = this.getNetwork();

        var membershipId = this.fetchMembershipIdFromBungie(apiKey, userName, networkId);

        $("#membershipId").text(membershipId);
    },
    getApiKey: function() {
        var apiKey = $("#apiKey").val();

        if(!apiKey) {
            throw "Missing API Key.";
        }

        return apiKey;
    },
    getUserName: function() {
        var userName = $("#userName").val();

        if(!userName) {
            throw "Missing user name.";
        }

        return userName;
    },
    getNetwork: function() {
        var networkId = $("#onlineNetwork").val();

        if(!networkId) {
            throw "Missing network selection.";
        }

        return networkId;
    },
    setMembershipId: function(membershipId) {

    },
    getAccountSummary: function(membershipId) {

    },
    initEvents: function() {
        var self = this;
        $('#fetchMembership').click(function() {
            self.getMembershipId();
        });
    }
};