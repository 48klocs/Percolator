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
    characterItems: undefined,
    pveWeapons: undefined,
    pvpWeapons: undefined,
    getWeaponData: function() {
        var self = this;
        $.getJSON('pveWeapons.json', function(data) {
            self.pveWeapons = data;
        });

        $.getJSON('pvpWeapons.json', function(data) {
            self.pvpWeapons = data;
        });

        $.getJSON('characterItems.json', function(data) {
            self.characterItems = data;
        });
    },
    fetchMembershipIdFromBungie: function(apiKey, userName, networkId) {
        var bungieUrl = 'https://www.bungie.net/Platform/Destiny/{0}/Stats/GetMembershipIdByDisplayName/{1}/'.format(networkId, userName);

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

        this.setMembershipId(membershipId);
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
        $("#membershipId").text(membershipId);
    },
    fetchAccountSummary: function(apiKey, networkId, membershipId)
    {
        var bungieUrl = 'https://www.bungie.net/Platform/Destiny/{0}/Account/{1}/Summary/'.format(networkId, membershipId);

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
    getAccountSummary: function(membershipId) {
        var networkId = this.getNetwork();
        var apiKey = this.getApiKey();

        var accountSummary = this.fetchAccountSummary(apiKey, networkId, membershipId);

        $("#accountSummary").append(accountSummary);

        this.extractCharacters();
    },
    extractCharacters: function() {
        var self = this;
        var accountSummary = JSON.parse($("#accountSummary").val());

        var characterList = [];

        $.each(accountSummary.Response.data.characters, function(i, character) {
            var classHash = character.characterBase.classHash;
            var characterId = character.characterBase.characterId;
            var translatedClass = self.translateClassHash(classHash);

            $("#characterList").append("<li>{0}</li>".format(translatedClass));

            var outputCharacter = {};
            outputCharacter.className = translatedClass;
            outputCharacter.characterId = characterId;

            characterList.push(outputCharacter);
        });

        return characterList;
    },
    translateClassHash: function(classHash) {
        // https://github.com/sebastianbarfurth/destiny-php/blob/master/src/Destiny/Support/Translators/HashTranslator.php
        switch(classHash)
        {
            case 3655393761:
                return 'Titan';
            case 671679327:
                return 'Hunter';
            case 2271682572:
                return 'Warlock';
            default:
                return 'Unknown';
        }
    },
    getWeaponName: function(itemHash, items) {
        var weaponName = "Unknown Weapon";

        $.each(items, function(n, item) {
            if(item.itemHash == itemHash) {
                weaponName = item.itemName;
                return false;
            }
        });

        return weaponName;
    },
    getItems: function() {
        if(this.characterItems) {
            return this.characterItems;
        }

        var rawCharacterWeaponData = JSON.parse($("#characterInventory").val());

        return rawCharacterWeaponData;
    },
    translateWeapons: function() {
        var self = this;
        var items = this.getItems();
        
        var translatedWeapons = [];

        $.each(items.Response.data.items, function(i, rawItem) {
            if(!rawItem.damageType) {
                return true;
            }

            var weaponName = self.getWeaponName(rawItem.itemHash, items.Response.definitions.items);

            var translatedWeapon = {};
            translatedWeapon.weaponName = weaponName;

            translatedWeapons.push(translatedWeapon);
        });

        return translatedWeapons;
    },
    findBlessed: function() {
        var weapons = this.translateWeapons();

        this.findBlessedPve(weapons);
        this.findBlessedPvp(weapons);
    },
    findBlessedPve: function(weapons) {
        $.each(weapons, function(n, weapon) {
            $('#pveWeaponList').append("<li>{0}</li>".format(weapon.weaponName));
        });
    },
    findBlessedPvp: function(weapons) {
        $.each(weapons, function(n, weapon) {
            $('#pvpWeaponList').append("<li>{0}</li>".format(weapon.weaponName));
        });
    },
    init: function() { 
        this.getWeaponData();
        this.initEvents();
    },
    initEvents: function() {
        var self = this;
        $('#fetchMembership').click(function() {
            self.getMembershipId();
        });

        $("#extractCharacters").click(function() {
            self.extractCharacters();
        });

        $("#findBlessed").click(function() {
            self.findBlessed();
        });
    }
};