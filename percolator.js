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

        var rawCharacterWeaponData = $.csv.toArrays($("#characterInventory").val());

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
                return "Bad";
            case 1:
                return "Forgettable";
            case 2:
                return "Passable";
            case 3:
                return "Good";
            case 4:
                return "Excellent";
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
                    var hypeMessage = self.getHypeMessage(weapon, pveWeapon, matchAmount);

                    if (matchAmount > 3) {
                        $('#pveWeaponList').prepend("<li>{0}</li>".format(hypeMessage));
                    } else {
                        $('#pveWeaponList').append("<li>{0}</li>".format(hypeMessage));
                    }
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
                    var hypeMessage = self.getHypeMessage(weapon, pvpWeapon, matchAmount);

                    if (matchAmount > 3) {
                        $('#pvpWeaponList').prepend("<li>{0}</li>".format(hypeMessage));
                    } else {
                        $('#pvpWeaponList').append("<li>{0}</li>".format(hypeMessage));
                    }
                }
            })
        });
    },
    getHypeMessage: function(inventoryWeapon, blessedWeapon, matchAmount) {
        var matchGrade = this.getMatchGrade(matchAmount);
        var weaponName = this.getInventoryWeaponName(inventoryWeapon);
        var lightLevel = this.getInventoryWeaponLightLevel(inventoryWeapon);
        var weaponLocation = this.getWeaponLocation(inventoryWeapon);
        var perkNodes = [this.getBlessedWeaponPerkOne(blessedWeapon),
                         this.getBlessedWeaponPerkTwo(blessedWeapon),
                         this.getBlessedWeaponPerkThree(blessedWeapon),
                         this.getBlessedWeaponPerkFour(blessedWeapon)];
        var perkNodeDescription = perkNodes.join("</li><li>");

        return "<span class='grade {4}'>{4}</span>: <span class='ll'>{0}</span> <span class='name'>{1}</span> <span class='location'>{3}</span> <ul class='perks'><li>{2}</li></ul>".format(lightLevel, weaponName, perkNodeDescription, weaponLocation, matchGrade);
    },
    getInventoryWeaponName: function (inventoryWeapon) {
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
    getPerkNodes: function(inventoryWeapon, wantSelectedPerks) {
        var perkNames = [];

        for(var i = 20; i < 40; i++) {
            if(inventoryWeapon[i]) {
                var perkName = inventoryWeapon[i];

                if ((wantSelectedPerks) &&
                    (perkName.indexOf("*") == -1)) {
                    continue;
                }

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
    extractNewSourceItems: function() {
        var self = this;
        var newInventoryWeapons = $.csv.toArrays($("#dimSourceWeaponry").val());

        var newSourceItems = [];

        $.each(newInventoryWeapons, function(n, newInventoryWeapon) {
            var newWeaponName = self.getInventoryWeaponName(newInventoryWeapon);

            if(newWeaponName.length > 0) {
                var newSourceItem = []
                    .concat(newWeaponName)
                    .concat(self.getPerkNodes(newInventoryWeapon,
                                              true));

                newSourceItems.push(newSourceItem);
            }
        });

        return newSourceItems;
    },
    shouldAddToPvP: function() {
        return ($("#destinationList").val() == "PvP");
    },
    
    shouldAddToPvE: function() {
        return ($("#destinationList").val() == "PvE");
    },
    addAndTranslate: function() {
        var newSourceItems = this.extractNewSourceItems();

        $.each(newSourceItems, function(n, newSourceItem) {
            $("#percolatorSourceWeaponry").append("{0}\n\n".format(newSourceItem.join(",")));
        });

        if(this.shouldAddToPvE) {
            this.pveWeapons = this.pveWeapons.concat(newSourceItems);
        }

        if(this.shouldAddToPvP) {
            this.pvpWeapons = this.pvpWeapons.concat(newSourceItems);
        }
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

        $("#addAndTranslate").click(function() {
            self.addAndTranslate();
        });
    }
};