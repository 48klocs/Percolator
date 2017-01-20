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
                if(self.weaponMatchesBlessedWeapon(weapon, pveWeapon))
                {
                    $('#pveWeaponList').append("<li>{0}</li>".format(self.getInventoryWeaponName(weapon)));
                }
            })
        });
    },
    findBlessedPvp: function(weapons) {
        var self = this;

        $.each(weapons, function(n, weapon) {
            $.each(self.pvpWeapons, function(n, pvpWeapon) {
                if(self.weaponMatchesBlessedWeapon(weapon, pvpWeapon))
                {
                    $('#pvpWeaponList').append("<li>{0}</li>".format(self.getInventoryWeaponName(weapon)));
                }
            })
        });
    },
    getInventoryWeaponName: function(inventoryWeapon) {
        return inventoryWeapon[0];
    },
    weaponMatchesBlessedWeapon: function(inventoryWeapon, blessedWeapon) {
        return (this.getInventoryWeaponName(inventoryWeapon) == blessedWeapon.Name);
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