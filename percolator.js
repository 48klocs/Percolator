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

        $.getJSON('pveWeapons.json', function(data) {
            self.pveWeapons = data;
        });

        $.getJSON('pvpWeapons.json', function(data) {
            self.pvpWeapons = data;
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
        if(this.characterItems) {
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
    findBlessedPve: function(weapons) {
        var self = this;

        $.each(weapons, function(n, weapon) {
            $.each(self.pveWeapons, function(n, pveWeapon) {
                var matchAmount = self.weaponMatchesBlessedWeapon(weapon, pveWeapon);

                if(matchAmount > 2)
                {
                    $('#pveWeaponList').append("<li>{0} - {1}</li>".format(self.getInventoryWeaponName(weapon), matchAmount));
                }
            })
        });
    },
    findBlessedPvp: function(weapons) {
        var self = this;

        $.each(weapons, function(n, weapon) {
            $.each(self.pvpWeapons, function(n, pvpWeapon) {
                var matchAmount = self.weaponMatchesBlessedWeapon(weapon, pvpWeapon);

                if(matchAmount > 2)
                {
                    $('#pvpWeaponList').append("<li>{0} - {1}</li>".format(self.getInventoryWeaponName(weapon), matchAmount));
                }
            })
        });
    },
    getInventoryWeaponName: function(inventoryWeapon) {
        return inventoryWeapon[0];
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
            (this.getInventoryWeaponName(inventoryWeapon) != blessedWeapon.Name)) {
            return 0;
        }

        var matchCount = 0;
        matchCount += (this.weaponHasPerk(inventoryWeaponPerks, blessedWeapon.PerkOne));
        matchCount += (this.weaponHasPerk(inventoryWeaponPerks, blessedWeapon.PerkTwo));
        matchCount += (this.weaponHasPerk(inventoryWeaponPerks, blessedWeapon.PerkThree));
        matchCount += (this.weaponHasPerk(inventoryWeaponPerks, blessedWeapon.PerkFour));

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