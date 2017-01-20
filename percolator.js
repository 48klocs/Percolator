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
    pveWeapons: undefined,
    pvpWeapons: undefined,
    getWeaponData: function() {
        var self = this;

        $.get('pveWeapons.csv', function(data) {
            self.pveWeapons = $.csv.toArrays(data);
        });

        $.get('pvpWeapons.csv', function(data) {
            self.pvpWeapons = $.csv.toArrays(data);
        });

        $.get('destinyWeapons.csv', function(data) {
            self.characterItems = $.csv.toArrays(data);
        });
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
        if(!($("#characterInventory").val())) {
            return this.characterItems;
        }

        var rawCharacterWeaponData = $.csv.toObjects($("#characterInventory").val());

        return rawCharacterWeaponData;
    },
    findBlessed: function() {
        var weapons = this.getItems();

        this.findBlessedPve(weapons);
        this.findBlessedPvp(weapons);
    },
    getMatchGrade: function(matchAmount) {
        switch(matchAmount) {
            case 0:
                return "bad";
            case 1:
                return "forgettable";
            case 2:
                return "passable";
            case 3:
                return "good";
            case 4:
                return "excellent";
            default:
                return "unknown";
        }
    },
    getWeaponLocation: function(weapon) {
        return weapon[6];
    },
    getInventoryWeaponLightLevel: function(weapon) {
        return weapon[4];
    },
    findBlessedPve: function(weapons) {
        var self = this;
        $('#pveWeaponList').empty();

        $.each(weapons, function(n, weapon) {
            $.each(self.pveWeapons, function(n, pveWeapon) {
                var matchAmount = self.weaponMatchesBlessedWeapon(weapon, pveWeapon);

                if(matchAmount > 2)
                {
                    var hypeMessage = self.getHypeMessage(weapon, matchAmount);

                    $('#pveWeaponList').append("<li>{0}</li>".format(hypeMessage));
                }
            })
        });
    },
    findBlessedPvp: function(weapons) {
        var self = this;
        $('#pvpWeaponList').empty();

        $.each(weapons, function(n, weapon) {
            $.each(self.pvpWeapons, function(n, pvpWeapon) {
                var matchAmount = self.weaponMatchesBlessedWeapon(weapon, pvpWeapon);

                if(matchAmount > 2)
                {
                    var hypeMessage = self.getHypeMessage(weapon, matchAmount);

                    $('#pvpWeaponList').append("<li>{0}</li>".format(hypeMessage));
                }
            })
        });
    },
    getHypeMessage: function(inventoryWeapon, matchAmount) {
        var matchGrade = this.getMatchGrade(matchAmount);
        var weaponName = this.getInventoryWeaponName(inventoryWeapon);
        var lightLevel = this.getInventoryWeaponLightLevel(inventoryWeapon);
        var weaponLocation = this.getWeaponLocation(inventoryWeapon);
        var perkNodeDescription = this.getPerkNodes(inventoryWeapon).join(", ");

        return "The LL {0} {1} ({2}) located on/in your {3} looks {4}.".format(lightLevel, weaponName, perkNodeDescription, weaponLocation, matchGrade);
    },
    getInventoryWeaponName: function(inventoryWeapon) {
        return inventoryWeapon[0];
    },
    getBlessedWeaponName: function(blessedWeapon) {
        return blessedWeapon[0];
    },
    getBlessedWeaponPerkOne: function(blessedWeapon) {
        return blessedWeapon[1];
    },
    getBlessedWeaponPerkTwo: function(blessedWeapon) {
        return blessedWeapon[2];
    },
    getBlessedWeaponPerkThree: function(blessedWeapon) {
        return blessedWeapon[3];
    },
    getBlessedWeaponPerkFour: function(blessedWeapon) {
        return blessedWeapon[4];
    },
    getPerkNodes: function(inventoryWeapon) {
        var perkNames = [];

        for(var i = 21; i < 40; i++) {
            if(inventoryWeapon[i]) {
                var perkName = inventoryWeapon[i];

                var strippedPerkName = perkName.replace(/\*/g , "");
                perkNames.push(strippedPerkName);
            }
        }

        return perkNames;
    },
    weaponMatchesBlessedWeapon: function(inventoryWeapon, blessedWeapon) {
        var inventoryWeaponPerks = this.getPerkNodes(inventoryWeapon);

        if ((inventoryWeaponPerks.length == 0)  ||
            (this.getInventoryWeaponName(inventoryWeapon) != this.getBlessedWeaponName(blessedWeapon))) {
            return 0;
        }

        var matchCount = 0;
        matchCount += (this.weaponHasPerk(inventoryWeaponPerks, this.getBlessedWeaponPerkOne(blessedWeapon)));
        matchCount += (this.weaponHasPerk(inventoryWeaponPerks, this.getBlessedWeaponPerkTwo(blessedWeapon)));
        matchCount += (this.weaponHasPerk(inventoryWeaponPerks, this.getBlessedWeaponPerkThree(blessedWeapon)));
        matchCount += (this.weaponHasPerk(inventoryWeaponPerks, this.getBlessedWeaponPerkFour(blessedWeapon)));

        return matchCount;
    },
    weaponHasPerk: function(inventoryWeaponPerks, particularPerk) {
        for(var i = 0; i < inventoryWeaponPerks.length; i++) {
            var inventoryWeaponPerk = inventoryWeaponPerks[i];

            if(particularPerk.indexOf(inventoryWeaponPerk) != -1) {
                return true;
            }
        }

        return false;
    },
    init: function() { 
        this.getWeaponData();
        this.initEvents();
    },
    initEvents: function() {
        var self = this;

        $("#findBlessed").click(function() {
            self.findBlessed();
        });
    }
};