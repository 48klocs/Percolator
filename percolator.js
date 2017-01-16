var percolator = {
    membershipId: undefined,
    getBungieData: function() {

    },
    fetchMembershipIdFromBungie: function(apiKey, userName, networkId) {
        return "YOLO";
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
        return $("#apiKey").val();
    },
    getUserName: function() {
        return $("#userName").val();
    },
    getNetwork: function() {
        return $("#onlineNetwork").val();
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