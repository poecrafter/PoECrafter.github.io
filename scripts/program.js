var masterModList;
var modsJSON = $.getJSON("../data/mods.json", function(data) {
  masterModList = data;
});
var masterEssenceList;
var essencesJSON = $.getJSON("../data/essences.json", function(data) {
  masterEssenceList = data;
});
var masterBaseList;
var basesJSON = $.getJSON("../data/bases.json", function(data) {
  masterBaseList = data;
});
var masterNameList;
var namesJSON = $.getJSON("../data/itemnameaffixes.json", function(data) {
  masterNameList = data;
});

var allJSON = $.when(modsJSON, essencesJSON, basesJSON, namesJSON)
allJSON.done(function() {
  run();
});

var domain = {
  "ITEM": 1,
  "FLASK": 2,
  "MONSTER": 3,
  "CHEST": 4,
  "AREA": 5,
  "UNKNOWN1": 6,
  "UNKNOWN2": 7,
  "UNKNOWN3": 8,
  "STANCE": 9,
  "MASTER": 10,
  "JEWEL": 11,
  "ATLAS": 12,
  "LEAGUESTONE": 13
};

var generationType = {
  "PREFIX": 1,
  "SUFFIX": 2,
  "UNIQUE": 3,
  "NEMESIS": 4,
  "CORRUPTED": 5,
  "BLOODLINES": 6,
  "TORMENT": 7,
  "TALISMAN": 8,
  "ENCHANTMENT": 9,
  "ESSENCE": 10
}

var rarity = {
  "NORMAL": 1,
  "MAGIC": 2,
  "RARE": 3,
  "UNIQUE": 4
}

var currency = {
  "WHETSTONE": 1,
  "ARMOURSCRAP": 2,
  "TRANSMUTE": 3,
  "ALTERATION": 4,
  "ANNULMENT": 5,
  "EXALTED": 6,
  "REGAL": 7,
  "ALCHEMY": 8,
  "CHAOS": 9,
  "BLESSED": 10,
  "AUGMENT": 11,
  "DIVINE": 12,
  "JEWELLER": 13,
  "FUSING": 14,
  "CHROMATIC": 15,
  "SCOURING": 16,
  "VAAL": 17,
  "ETERNAL": 18,
  "IMPRINT": 19
} 

var groupBy = function(xs, key) {
  return xs.reduce(function(rv, x) {
    (rv[x[key]] = rv[x[key]] || []).push(x);
    return rv;
  }, {});
};

var copyMods = function(mods) {
  var arr = [];
  if (mods !== undefined) {
    if (mods.id !== undefined) {
      arr.push(new Mod(mods));
    } else {
      for (var i = 0; i < mods.length; i++) {
        arr.push(new Mod(mods[i]));
      }
    }
  }
  return arr;
}

var copyStats = function(stats) {
  var arr = [];
  if (stats !== undefined) {
    for (var i = 0; i < stats.length; i++) {
      arr.push(new Stat(stats[i]));
    }
  }
  return arr;
}

String.prototype.formatUnicorn = String.prototype.formatUnicorn ||
function () {
    "use strict";
    var str = this.toString();
    if (arguments.length) {
        var t = typeof arguments[0];
        var key;
        var args = ("string" === t || "number" === t) ?
            Array.prototype.slice.call(arguments)
            : arguments[0];

        for (key in args) {
            str = str.replace(new RegExp("\\{" + key + "\\}", "gi"), args[key]);
        }
    }

    return str;
};

String.prototype.count = function(s1) { 
  return (this.length - this.replace(new RegExp(s1,"g"), '').length) / s1.length;
}

var currentBase = null;
var currentItem = null;
var selectedCurrency = null;
var shiftPressed = false;

var whetstoneCount = 0;
var armourScrapCount = 0;
var transmuteCount = 0;
var alterationCount = 0;
var annulmentCount = 0;
var exaltedCount = 0;
var regalCount = 0;
var alchemyCount = 0;
var chaosCount = 0;
var blessedCount = 0;
var augmentCount = 0;
var divineCount = 0;
var jewellerCount = 0;
var fusingCount = 0;
var chromaticCount = 0;
var scouringCount = 0;
var vaalCount = 0;
var eternalCount = 0;
var imprintCount = 0;

function Stat(stat) {
  this.id = stat.id;
  this.key = stat.key;
  this.description = stat.description;
  this.valueMin = stat.valueMin;
  this.valueMax = stat.valueMax;
  this.value = stat.value;
}

function Mod(mod) {
  this.id = mod.id;
  this.name = mod.name;
  this.level = mod.level;
  this.modType = mod.modType;
  this.group = mod.group;
  this.domain = mod.domain;
  this.generationType = mod.generationType;
  this.isEssenceOnlyModifier = mod.isEssenceOnlyModifier;
  this.tags = mod.tags;
  this.spawnWeightTags = mod.spawnWeightTags;
  this.spawnWeight_Values = mod.spawnWeight_Values;
  this.generationWeightTags = mod.generationWeightTags;
  this.generationWeight_Values = mod.generationWeight_Values;
  this.stats = copyStats(mod.stats);
}

function Base(id, name, type, category, tags, requirement, defence, implicitMod, weapon, artPath, maxSockets, verticalSockets) {
  this.id = id;
  this.name = name;
  this.type = type;
  this.category = category;
  this.tags = tags;
  this.requirement = requirement;
  this.defence = defence;
  this.implicitMod = implicitMod;
  this.weapon = weapon;
  this.artPath = artPath;
  this.maxSockets = maxSockets;
  this.verticalSockets = verticalSockets;
}

function Stat(stat) {
  this.id = stat.id;
  this.description = stat.description;
  this.key = stat.key;
  this.value = stat.value;
  this.valueMin = stat.valueMin;
  this.valueMax = stat.valueMax;
}

function Item(base) {
  Base.call(this, base.id, base.name, base.type, base.category, base.tags, base.requirement, base.defence, base.implicitMod, base.weapon, base.artPath, base.maxSockets, base.verticalSockets);

  this.itemName = base.itemName !== undefined ? base.itemName : null;
  this.itemLevel = base.itemLevel !== undefined ? base.itemLevel : 100;
  this.itemLevelRequirement = base.itemLevelRequirement !== undefined ? base.itemLevelRequirement : base.requirement.level;
  this.quality = base.quality !== undefined ? base.quality : 0;
  this.itemRarity = base.itemRarity !== undefined ? base.itemRarity : rarity.NORMAL;
  this.implicitMod = base.implicitMod !==  null ? copyMods(base.implicitMod)[0] : base.implicitMod;
  this.mods = base.mods !== undefined ? copyMods(base.mods) : [];
  this.modPool = base.modPool !== undefined ? copyMods(base.modPool) : [];
  this.prefixCount = base.prefixCount !== undefined ? base.prefixCount : 0;
  this.suffixCount = base.suffixCount !== undefined ? base.suffixCount : 0;
  this.maxPrefix = base.maxPrefix !== undefined ? base.maxPrefix : 1;
  this.savedState = base.savedState !== undefined ? base.savedState : null;
  this.socketInfo = base.socketInfo !== undefined ? base.socketInfo : null;
  this.linkInfo = base.linkInfo !== undefined ? base.linkInfo : null;

  this.generateName = function() {
    var prefixes = masterNameList.prefixes;
    var suffixes;
    if (this.category.includes("Weapon")) {
      if (this.type.includes("Axe")) {
        suffixes = masterNameList.axeSuffixes;
      } else if (this.type.includes("Mace")) {
        suffixes = masterNameList.maceSuffixes;
      } else if (this.type.includes("Sword")) {
        suffixes = masterNameList.swordSuffixes;
      } else if (this.type === "Sceptre") {
        suffixes = masterNameList.sceptreSuffixes;
      } else if (this.type === "Staff") {
        suffixes = masterNameList.staffSuffixes;
      } else if (this.type === "Dagger") {
        suffixes = masterNameList.daggerSuffixes;
      } else if (this.type === "Claw") {
        suffixes = masterNameList.clawSuffixes;
      } else if (this.type === "Bow") {
        suffixes = masterNameList.bowSuffixes;
      } else if (this.type === "Wand") {
        suffixes = masterNameList.wandSuffixes;
      }
    } else if (this.category === "Jewellery") {
      if (this.type === "Amulet") {
        suffixes = masterNameList.amuletSuffixes;
      } else if (this.type === "Ring") {
        suffixes = masterNameList.ringSuffixes;
      } else if (this.type === "Belt") {
        suffixes = masterNameList.beltSuffixes;
      }
    } else if (this.category === "Armor") {
      if (this.type === "Body Armour") {
        suffixes = masterNameList.bodyArmourSuffixes;
      } else if (this.type === "Helmet") {
        suffixes = masterNameList.helmetSuffixes;
      } else if (this.type === "Gloves") {
        suffixes = masterNameList.glovesSuffixes;
      } else if (this.type === "Boots") {
        suffixes = masterNameList.bootsSuffixes;
      }
    } else if (this.category === "Off-hand") {
      if (this.type === "Quiver") {
        suffixes = masterNameList.quiverSuffixes;
      } else if (this.type === "Shield" && this.name.includes("Spirit Shield")) {
        suffixes = masterNameList.spiritShieldSuffixes;
      } else if (this.type === "Shield") {
        suffixes = masterNameList.otherShieldSuffixes;
      } else if (this.type === "Quiver") {
        suffixes = masterNameList.quiverSuffixes;
      }
    } else if (this.category === "Other") {
      suffixes = masterNameList.jewelSuffixes;
    }
    this.itemName = prefixes[Math.floor(Math.random() * prefixes.length)] + " " + suffixes[Math.floor(Math.random() * suffixes.length)];
  }

  this.getMod = function() {
    var weightTotal = 0;
    for (var i = 0; i < this.modPool.length; i++) {
      var weightArr = this.modPool[i].spawnWeight_Values.filter(function(value) {
        return value > 0;
      });
      var modifier = 1;
      if (this.modPool[i].generationWeightTags.length > 0) {
        for (var j = 0; j < this.modPool[i].generationWeightTags.length; j++) {
          if (this.tags.filter(function(tag) {
            return tag === this.modPool[i].generationWeightTags[j];
          }.bind(this)).length > 0) {
            modifier = this.modPool[i].generationWeight_Values[j] / 100;
            break;
          }
        }
      }
      weightTotal += weightArr[0] * modifier;
    }
    var variate = Math.random() * weightTotal;
    var cumulative = 0;
    for (var i = 0; i < this.modPool.length; i++) {
      var modifier = 1;
      if (this.modPool[i].generationWeightTags.length > 0) {
        for (var j = 0; j < this.modPool[i].generationWeightTags.length; j++) {
          if (this.tags.filter(function(tag) {
            return tag === this.modPool[i].generationWeightTags[j];
          }.bind(this)).length > 0) {
            modifier = this.modPool[i].generationWeight_Values[j] / 100;
            break;
          }
        }
      }
      cumulative += this.modPool[i].spawnWeight_Values.filter(function(value) {
        return value > 0;
      })[0] * modifier;
      if (variate <= cumulative) {
        return this.modPool[i];
      }
    }
  }

  this.addMod = function(mod) {
    mod.stats.forEach(function(stat) {
      stat.value = Math.floor(Math.random() * (stat.valueMax - stat.valueMin + 1)) + stat.valueMin;
    });
    this.mods.push(mod);
    if (mod.generationType === generationType.PREFIX)
      this.prefixCount++;
    else if (mod.generationType === generationType.SUFFIX)
      this.suffixCount++;
    mod.tags.forEach(function(tag) {
      this.tags.push(tag);
    }.bind(this));
    this.updateModPool();
  }

  this.removeMod = function(mod) {
    this.mods.splice(this.mods.indexOf(mod), 1);
    if (mod.generationType === generationType.PREFIX)
      this.prefixCount--;
    else if (mod.generationType === generationType.SUFFIX)
      this.suffixCount--;
    mod.tags.forEach(function(tag) {
      if (this.tags.indexOf(tag) >= 0) {
        this.tags.splice(this.tags.indexOf(tag), 1);
      }
    }.bind(this));
    this.updateModPool();
  }

  this.reroll = function() {
    for (var i = 0; i < this.mods.length; i++) {
      for (var j = 0; j < this.mods[i].stats.length; j++) {
        if (this.mods[i].stats[j].valueMax - this.mods[i].stats[j].valueMin === 0) {
          this.mods[i].stats[j].value = this.mods[i].stats[j].valueMax;
          break;
        }
        var rnd = Math.floor(Math.random() * (this.mods[i].stats[j].valueMax - this.mods[i].stats[j].valueMin + 1)) + this.mods[i].stats[j].valueMin;
        while (rnd === this.mods[i].stats[j].value) {
          rnd = Math.floor(Math.random() * (this.mods[i].stats[j].valueMax - this.mods[i].stats[j].valueMin + 1)) + this.mods[i].stats[j].valueMin;
        }
        this.mods[i].stats[j].value = rnd;
      }
    }
  }

  this.rerollImplicit = function () {
    for (var i = 0; i < this.implicitMod.stats.length; i++) {
      if (this.implicitMod.stats[i].valueMax - this.implicitMod.stats[i].valueMin === 0) {
        this.implicitMod.stats[i].value = this.implicitMod.stats[i].valueMax;
        continue;
      }
      var rnd = Math.floor(Math.random() * (this.implicitMod.stats[i].valueMax - this.implicitMod.stats[i].valueMin + 1)) + this.implicitMod.stats[i].valueMin;
      while (rnd === this.implicitMod.stats[i].value) {
        rnd = Math.floor(Math.random() * (this.implicitMod.stats[i].valueMax - this.implicitMod.stats[i].valueMin + 1)) + this.implicitMod.stats[i].valueMin;
      }
      this.implicitMod.stats[i].value = rnd;
    }
  }

  this.updateModPool = function() {
    // filter mods to only include mods that share a tag with the base and has a spawn weight > 0
    // also removes mods that share a tag with the base and have a spawn weight of 0
    var newModPool = masterModList.filter(function(mod) {
      return (mod.spawnWeightTags.some(function(tag) {
        return this.tags.indexOf(tag) >= 0 && mod.spawnWeight_Values[mod.spawnWeightTags.indexOf(tag)] > 0;
      }.bind(this), mod));
    }.bind(this)).filter(function(mod) {
      for (var i = 0; i < mod.spawnWeightTags.length; i++) {
        if (this.tags.indexOf(mod.spawnWeightTags[i]) >= 0 && mod.spawnWeight_Values[i] > 0) {
          return true;
        } else if (this.tags.indexOf(mod.spawnWeightTags[i]) >= 0 && mod.spawnWeight_Values[i] === 0 && mod.spawnWeightTags[i] !== "default") {
          return false;
        }
      }
    }.bind(this)).filter(function(mod) {
      return (mod.generationType === generationType.PREFIX || mod.generationType === generationType.SUFFIX);
    }).filter(function(mod) {
      return !(this.mods.some(function(itemMod) {
        return itemMod.group === mod.group;
      }, mod))
    }.bind(this));
    // jewel mods are in a different domain
    if (this.category === "Other") {
      newModPool = newModPool.filter(function(mod) {
        return mod.domain === domain.JEWEL;
      });
    } else {
      newModPool = newModPool.filter(function(mod) {
        return mod.domain === domain.ITEM;
      });
    }
    // remove prefixes or suffixes from the mod pool if they are unable to spawn on the item
    if (this.prefixCount >= this.maxPrefix) {
      newModPool = newModPool.filter(function(mod) {
        return mod.generationType !== generationType.PREFIX;
      });
    }
    if (this.suffixCount >= this.maxPrefix) {
      newModPool = newModPool.filter(function(mod) {
        return mod.generationType !== generationType.SUFFIX;
      });
    }
    this.modPool = newModPool;
  }

  this.getBaseModPool = function () {
    // same as updateModPool, but only checks if the mod is available to the base
    var baseModPool = masterModList.filter(function(mod) {
      return (mod.spawnWeightTags.some(function(tag) {
        return this.tags.indexOf(tag) >= 0 && mod.spawnWeight_Values[mod.spawnWeightTags.indexOf(tag)] > 0;
      }.bind(this), mod));
    }.bind(this)).filter(function(mod) {
      for (var i = 0; i < mod.spawnWeightTags.length; i++) {
        if (this.tags.indexOf(mod.spawnWeightTags[i]) >= 0 && mod.spawnWeight_Values[i] > 0) {
          return true;
        } else if (this.tags.indexOf(mod.spawnWeightTags[i]) >= 0 && mod.spawnWeight_Values[i] === 0 && mod.spawnWeightTags[i] !== "default") {
          return false;
        }
      }
    }.bind(this)).filter(function(mod) {
      return (mod.generationType === generationType.PREFIX || mod.generationType === generationType.SUFFIX);
    });;

    if (currentItem.category === "Other") {
      baseModPool = baseModPool.filter(function(mod) {
        return mod.domain === domain.JEWEL;
      });
    } else {
      baseModPool = baseModPool.filter(function(mod) {
        return mod.domain === domain.ITEM;
      });
    }

    return baseModPool;
  }

  this.getImplicitStrings = function() {
    var outputStrings = [];
    var allStats = [];
    if (this.implicitMod === null) {
      return outputStrings;
    }
    // put each 'stat' from every implicit mod into an array (ex min phys, max phys are two stats)
    this.implicitMod.stats.forEach(function(stat) {
      if (stat.key > 0) {
        allStats.push(stat);
      }
    });
    // group stats by their display order
    allStats = groupBy(allStats, 'key');
    var combinedStats = [];
    // combine values of stats that have the same id
    Object.keys(allStats).forEach(function(key) {
      if (allStats[key].every(function(stat) {
        return stat.id === allStats[key][0].id;
      })) {      
        for (var i = 1; i < allStats[key].length; i++) {
          allStats[key][0].value += allStats[key][i].value;
          allStats[key].splice(1);
        }
      }
    });
    Object.keys(allStats).forEach(function(key) {
      combinedStats.push(allStats[key]);
    });
    // get plain text translation for each stat and format it into a string
    combinedStats.forEach(function(stats) {
      var translation = getTranslation(stats);
      var values = [];
      stats.forEach(function(stat) {
        values.push(stat.value);
      });
      for (var i = 0; i < values.length; i++) {
        var indexHandler = translation.indexHandlers[i] === undefined ? translation.indexHandlers[0] : translation.indexHandlers[i];
        var format = translation.formats[i] === undefined ? translation.formats[0] : translation.formats[i];
        values[i] = transformAndFormatValue(values[i], indexHandler, format);
      }
      outputStrings.push(translation.text.formatUnicorn(values));
    });
    return outputStrings;
  }

  this.getModsStrings = function() {
    var outputStrings = [];
    var allStats = [];
    // put each 'stat' from every implicit mod into an array (ex min phys, max phys are two stats)
    this.mods.forEach(function(mod) {
      mod.stats.forEach(function(stat) {
        if (stat.key > 0) {
          allStats.push(stat);
        }
      });
    });
    // group stats by their display order
    allStats = groupBy(allStats, 'key');
    var combinedStats = [];
    // combine values of stats that have the same id
    Object.keys(allStats).forEach(function(key) {
      if (allStats[key].every(function(stat) {
        return stat.id === allStats[key][0].id;
      })) {      
        allStats[key][0] = new Stat(allStats[key][0]);
        for (var i = 1; i < allStats[key].length; i++) {
          allStats[key][0].value += allStats[key][i].value;
          allStats[key].splice(1);
        }
      }
    });
    Object.keys(allStats).forEach(function(key) {
      combinedStats.push(allStats[key]);
    });
    // get plain text translation for each stat and format it into a string
    combinedStats.forEach(function(stats) {
      var translation = getTranslation(stats);
      var values = [];
      stats.forEach(function(stat) {
        values.push(stat.value);
      });
      for (var i = 0; i < values.length; i++) {
        var indexHandler = translation.indexHandlers[i] === undefined ? translation.indexHandlers[0] : translation.indexHandlers[i];
        var format = translation.formats[i] === undefined ? translation.formats[0] : translation.formats[i];
        values[i] = transformAndFormatValue(values[i], indexHandler, format);
      }
      outputStrings.push(translation.text.formatUnicorn(values));
    });
    return outputStrings;
  }

  this.reset = function() {
    var n = this.mods.length;
    for (var i = 0; i < n; i++) {
      this.removeMod(this.mods[n - i - 1]);
    }
  }

  this.calcLevel = function() {
    // item level requirement is 80% of highest requirement mod or base item level requirement
    this.itemLevelRequirement = this.requirement.level;
    this.mods.forEach(function(mod) {
      if (Math.floor(mod.level * 0.8) > this.itemLevelRequirement) {
        this.itemLevelRequirement = Math.floor(mod.level * 0.8);
      }
    }.bind(this));
  }

  this.calcDefence = function() {
    if (this.defence === null) {
      return null;
    }
    var output = {
      "armour": null,
      "evasion": null,
      "energyShield": null,
      "block": null,
      "flatArmour": null,
      "flatEvasion": null,
      "flatEnergyShield": null,
      "incArmour": null,
      "incEvasion": null,
      "incEnergyShield": null,
      "incBlock": null
    }
    // put total values for all stats from each mod into an object to be used later
    this.mods.forEach(function(mod) {
      mod.stats.forEach(function(stat) {
        switch(stat.id) {
          case "local_base_physical_damage_reduction_rating":
            output.flatArmour += stat.value;
            break;
          case "local_physical_damage_reduction_rating_+%":
            output.incArmour += stat.value;
            break;
          case "local_base_evasion_rating":
            output.flatEvasion += stat.value;
            break;
          case "local_evasion_rating_+%":
            output.incEvasion += stat.value;
            break;
          case "local_energy_shield":
            output.flatEnergyShield += stat.value;
            break;
          case "local_energy_shield_+%":
            output.incEnergyShield += stat.value;
            break;
          case "local_armour_and_evasion_+%":
            output.incArmour += stat.value;
            output.incEvasion += stat.value;
            break;
          case "local_armour_and_energy_shield_+%":
            output.incArmour += stat.value;
            output.incEnergyShield += stat.value;
            break;
          case "local_evasion_and_energy_shield_+%":
            output.incEvasion += stat.value;
            output.incEnergyShield += stat.value;
            break;
          case "local_armour_and_evasion_and_energy_shield_+%":
            output.incArmour += stat.value;
            output.incEvasion += stat.value;
            output.incEnergyShield += stat.value;
            break;
          case "local_additional_block_chance_%":
            output.incBlock += stat.value;
            break;
          default:
            break;
        }
      });
    });

    output.armour = ((this.defence.armour + output.flatArmour) * (1 + this.quality / 100)) * (1 + output.incArmour / 100);
    output.evasion = ((this.defence.evasion + output.flatEvasion) * (1 + this.quality / 100)) * (1 + output.incEvasion / 100);
    output.energyShield = ((this.defence.energyShield + output.flatEnergyShield) * (1 + this.quality / 100)) * (1 + output.incEnergyShield / 100);
    output.block = this.defence.block + output.incBlock;

    return output;
  }

  this.calcWeapon = function() {
    if (this.weapon === null) {
      return null;
    }
    var output = {
      "dps": null,
      "pdps": null,
      "edps": null,
      "cdps": null,
      "aps": null,
      "crit": null,
      "physMin": null,
      "physMax": null,
      "fireMin": null,
      "fireMax": null,
      "coldMin": null,
      "coldMax": null,
      "lightMin": null,
      "lightMax": null,
      "chaosMin": null,
      "chaosMax": null, 
      "incCrit": null,
      "incAS": null,
      "incPhys": null
    }

    // put total values for all stats from each mod into an object to be used later
    this.mods.forEach(function(mod) {
      mod.stats.forEach(function(stat) {
        switch(stat.id) {
          case "local_minimum_added_physical_damage":
            output.physMin += stat.value;
            break;
          case "local_maximum_added_physical_damage":
            output.physMax += stat.value;
            break;
          case "local_minimum_added_fire_damage":
            output.fireMin += stat.value;
            break;
          case "local_maximum_added_fire_damage":
            output.fireMax += stat.value;
            break;
          case "local_minimum_added_cold_damage":
            output.coldMin += stat.value;
            break;
          case "local_maximum_added_cold_damage":
            output.coldMax += stat.value;
            break;
          case "local_minimum_added_lightning_damage":
            output.lightMin += stat.value;
            break;
          case "local_maximum_added_lightning_damage":
            output.lightMax += stat.value;
            break;
          case "local_minimum_added_chaos_damage":
            output.chaosMin += stat.value;
            break;
          case "local_maximum_added_chaos_damage":
            output.chaosMax += stat.value;
            break;
          case "local_physical_damage_+%":
            output.incPhys += stat.value;
            break;
          case "local_critical_strike_chance_+%":
            output.incCrit += stat.value;
            break;
          case "local_attack_speed_+%":
            output.incAS += stat.value;
            break;
          default:
            break;
        }
      });
    });

    output.pdps = (Math.round((this.weapon.damageMin + output.physMin) * (1 + this.quality / 100) + (this.weapon.damageMax + output.physMax) * (1 + this.quality / 100)) / 2 * (1 + output.incPhys / 100) * 1000 / (this.weapon.speed / (1 + output.incAS / 100))).toFixed(2);
    output.edps = ((output.fireMin + output.fireMax + output.coldMin + output.coldMax + output.lightMin + output.lightMax) / 2 * 1000 / (this.weapon.speed / (1 + output.incAS / 100))).toFixed(2);
    output.cdps = ((output.chaosMin + output.chaosMax) / 2 * 1000 / (this.weapon.speed / (1 + output.incAS / 100))).toFixed(2);
    output.dps = (parseFloat(output.pdps) + parseFloat(output.edps) + parseFloat(output.cdps)).toFixed(2);

    output.crit = transformAndFormatValue((this.weapon.crit * (1 + output.incCrit / 100)), "weapon_crit", "2dp%");
    output.aps = transformAndFormatValue((this.weapon.speed / (1 + output.incAS / 100)), "weapon_speed", "2dp");

    return output;
  }

  this.rerollSockets = function() {
    var arr = [];
    if (this.maxSockets > 0) {
      var rnd = Math.random() * this.maxSockets;
      for (var i = 0; i < rnd; i++) {
        var colors = ["R", "G", "B"];
        arr.push(colors[Math.floor(Math.random() * colors.length)]);
      }
    }
    this.socketInfo = arr;
  }

  this.rerollLinks = function() {
    var links = ["LLLLL", "LLLLX", "LLLXX", "LLXXX", "LXXXX", "XXXXX"];
    links = links.filter(function(str) {
      return str.count("L") <= this.socketInfo.length - 1;
    }.bind(this));
    this.linkInfo = links[Math.floor(Math.random() * links.length)];
  }

  this.rerollColors = function() {
    var colors = ["R", "G", "B"];
    for (var i = 0; i < this.socketInfo.length; i++) {
      this.socketInfo[i] = colors[Math.floor(Math.random() * colors.length)];
    }
  }

  // initialize socketInfo
  if (this.socketInfo === null) {
    var arr = [];
    if (this.maxSockets > 0) {
      var rnd = Math.random() * this.maxSockets;
      for (var i = 0; i < rnd; i++) {
        var colors = ["R", "G", "B"];
        arr.push(colors[Math.floor(Math.random() * colors.length)]);
      }
    }
    this.socketInfo = arr;
  }
  // initialize linkInfo
  if (this.linkInfo === null) {
    var links = ["LLLLL", "LLLLX", "LLLXX", "LLXXX", "LXXXX", "XXXXX"];
    links = links.filter(function(str) {
      return str.count("L") <= this.socketInfo.length - 1;
    }.bind(this));
    var rnd = Math.floor(Math.random() * links.length);
    this.linkInfo = links[rnd];
  }
  // initialize implicit roll
  if (this.implicitMod !== null) {
    if (this.implicitMod.stats.filter(function(stat) {
      return stat.value === null;
    }).length > 0) {
      this.rerollImplicit();
    }
  }
  // initialize item name
  if (this.itemName === null) {
    this.generateName();
  }
  // initialize mod pool
  this.updateModPool();
}

function transformAndFormatValue(value, handler, format) {
  var final;
  switch (handler) {
    case "60%_of_value":
      value = value * 0.6;
      break;
    case "deciseconds_to_seconds":
      value = value * 10;
      break;
    case "divide_by_one_hundred":
      value = value / 100;
      break;
    case "divide_by_one_hundred_and_negate":
      value = -value / 100;
      break;
    case "divide_by_one_hundred_2dp":
      value = (value / 100).toFixed(2);
      break;
    case "milliseconds_to_seconds":
      value = value / 1000;
      break;
    case "milliseconds_to_seconds_0dp":
      value = (value / 1000).toFixed(0);
      break;
    case "milliseconds_to_Seconds_2dp":
      value = (value / 1000).toFixed(2);
      break;
    case "multiplicative_damage_modifier":
      value = value + 100;
      break;
    case "multiplicative_permyriad_damage_modifier":
      value = value / 100 + 100;
      break;
    case "negate":
      value = -value;
      break;
    case "old_leech_percent":
      value = value / 5;
      break;
    case "old_leech_permyriad":
      value = value / 500;
      break;
    case "per_minute_to_per_second":
      value = (value / 60).toFixed(1);
      break;
    case "per_minute_to_per_second_0dp":
      value = (value / 60).toFixed(0);
      break;
    case "per_minute_to_per_second_2dp":
      value = (value / 60).toFixed(2);
      break;
    case "per_minute_to_per_second_2dp_if_required":
      value = value % 60 != 0 ? (value / 60).toFixed(2) : value / 60;
      break;
    case "divide_by_ten_0dp":
      value = (value / 10).toFixed(0);
      break;
    case "divide_by_two_0dp":
      value = (value / 2).toFixed(0);
      break;
    case "divide_by_fifteen_0dp":
      value = (value / 15).toFixed(0);
      break;
    case "divide_by_twenty_then_double_0dp":
      value = ((value / 20) * 2).toFixed(0);
      break;
    case "canonical_line":
      break;
    case "weapon_crit":
      value = (value / 100).toFixed(2);
      break;
    case "weapon_speed":
      value = (1000 / value).toFixed(2);
      break;
    default:
      break;
  }
  switch (format) {
    case "#":
        final = value;
      break;
    case "+#":
      if (value > 0)
        final = "+" + value;
      break;
    case "#%":
      final = value + "%";
      break;
    case "+#%":
      if (value > 0)
        final = "+" + value + "%";
      else
        final = value + "%";
      break;
    case "2dp":
      final = parseFloat(value).toFixed(2);
      break;
    case "2dp%":
      final = parseFloat(value).toFixed(2) + "%";
      break;
    default:
      break;
  }
  return final;
}

function getTranslation(statArr) {
  for (var i = 0; i < statArr[0].description.translations.length; i++) {
    for (var j = 0; j < statArr.length; j++) {
      var min = statArr[0].description.translations[i].conditions[j].minValue === null ? -Infinity : statArr[0].description.translations[i].conditions[j].minValue;
      var max = statArr[0].description.translations[i].conditions[j].maxValue === null ? Infinity : statArr[0].description.translations[i].conditions[j].maxValue;
      if (statArr[j].valueMin >= min && statArr[j].valueMax <= max) {
        if (j === statArr.length - 1) {
          return statArr[0].description.translations[i];
        } else {
          continue;
        }
      } else {
        break;
      }
    }
  }
}

function run() {
  // filter list of bases
  var sortedBases = masterBaseList.filter(function(base) {
    if (base.category === "Fishing Rod" || base.category === "Flasks") {
      return false;
    } else {
      return true;
    }
  });
  // sort bases to put in dropdown
  sortedBases.sort(function(a, b) {
    if (a.name < b.name) {
      return -1;
    } else if (a.name > b.name) {
      return 1;
    } else {
      return 0;
    }
  });
  for (var i = 0; i < sortedBases.length; i++) {
    var base = $("<a class=\"dropdown-item\" href=\"#\" onclick=\"changeBase($(this).text())\"></a>").text(sortedBases[i].name);
    $("#bases-dropdown").append(base);
  }
  // select a random base to start
  currentBase = sortedBases[Math.floor(Math.random() * sortedBases.length)];
  changeBase(currentBase.name);
}

function changeBase(baseName) {
    currentBase = masterBaseList.filter(function(baseItem) {
    return baseItem.name === baseName;
  })[0];
  currentItem = new Item(currentBase);
  // get image of current base to find dimensions
  var img = new Image();
  img.src = "https://" + currentBase.artPath;
  // set item-slot-img attributes to center the image at the correct size in the item slot
  $(img).one("load", function() {
    $("#item-slot-img").attr("width", img.naturalWidth);
    $("#item-slot-img").attr("height", img.naturalHeight);
    $("#item-slot-img").attr("x", (638 - (img.naturalWidth / 2)));
    $("#item-slot-img").attr("y", (722 - (img.naturalHeight / 2)));
    $("#item-slot-img").attr("href", "https://" + currentBase.artPath);
    update();
  });
}

function update() {
  clearHTML();

  if (currentItem.itemRarity === rarity.NORMAL) {
    $("#title").html(currentItem.name);
    $("#title").addClass("text--normal");
    $("#title-bar").addClass("title-bar--normal");
    $("#title-bar-left").addClass("title-bar-left--normal");
    $("#title-bar-right").addClass("title-bar-right--normal");
  } else if (currentItem.itemRarity === rarity.MAGIC) {
    var prefixName = "";
    var suffixName = "";
    currentItem.mods.forEach(function(mod) {
      if (mod.generationType === generationType.PREFIX) {
        prefixName = mod.name;
      } else if (mod.generationType === generationType.SUFFIX) {
        suffixName = mod.name;
      }
    });
    var name = prefixName + " " + currentItem.name + " " + suffixName;
    $("#title").html(name.trim());
    $("#title").addClass("text--magic");
    $("#title-bar").addClass("title-bar--magic");
    $("#title-bar-left").addClass("title-bar-left--magic");
    $("#title-bar-right").addClass("title-bar-right--magic");
  } else if (currentItem.itemRarity === rarity.RARE) {
    $("#title").html(currentItem.itemName);
    $("#title").addClass("text--rare");
    $("#title-2").html(currentItem.name);
    $("#title-2").addClass("text--rare");
    $("#title-bar").addClass("title-bar--rare");
    $("#title-bar-left").addClass("title-bar-left--rare");
    $("#title-bar-right").addClass("title-bar-right--rare");
  }

  currentItem.calcLevel();
  if (currentItem.itemLevelRequirement > 2) {
    $("#requirements").html("Requires ");
    $("#requirement-level").html("Level");
    $("#requirement-level-value").html(currentItem.itemLevelRequirement);
  }
  if (currentItem.requirement.reqStr > 14) {
    $("#requirement-str").html("Str");
    $("#requirement-str-value").html(currentItem.requirement.reqStr);
  }
  if (currentItem.requirement.reqDex > 14) {
    $("#requirement-dex").html("Dex");
    $("#requirement-dex-value").html(currentItem.requirement.reqDex);
  }
  if (currentItem.requirement.reqInt > 14) {
    $("#requirement-int").html("Int");
    $("#requirement-int-value").html(currentItem.requirement.reqInt);
  }
  if ((currentItem.itemLevelRequirement > 2 || currentItem.requirement.reqStr > 14 || currentItem.requirement.reqDex > 14 || currentItem.requirement.reqInt > 14) && (currentItem.weapon !== null || currentItem.defence !== null)) {
    if (currentItem.itemRarity === rarity.NORMAL) {
      $("#requirements-separator").addClass("item-separator--normal");  
    } else if (currentItem.itemRarity === rarity.MAGIC) {
      $("#requirements-separator").addClass("item-separator--magic");  
    } else if (currentItem.itemRarity === rarity.RARE) {
      $("#requirements-separator").addClass("item-separator--rare");  
    }
  }
  if (currentItem.itemLevelRequirement > 2 && (currentItem.requirement.reqStr > 14 || currentItem.requirement.reqDex > 14 || currentItem.requirement.reqInt > 14)) {
    $("#requirement-comma-1").html(", ");
  }
  if (currentItem.requirement.reqStr > 14 && (currentItem.requirement.reqDex > 14 || currentItem.requirement.reqInt > 14)) {
    $("#requirement-comma-2").html(", ");
  }
  if (currentItem.requirement.reqDex > 14 && currentItem.requirement.reqInt > 14) {
    $("#requirement-comma-3").html(", ");
  }

  var implicit = currentItem.getImplicitStrings();
  if (implicit.length > 0) {
    // in case of multiline implicits
    for (var i = 0; i < implicit.length; i++) {
      var newSpan = $("<span class=\"text--magic\"></span>").html(implicit[i] + "<br>");
      $("#item-implicit").append(newSpan);
    }
    if ((currentItem.itemLevelRequirement > 2 || currentItem.requirement.reqStr > 14 || currentItem.requirement.reqDex > 14 || currentItem.requirement.reqInt > 14) || currentItem.defence !== null || currentItem.weapon !== null)
    if (currentItem.itemRarity === rarity.NORMAL) {
      $("#implicit-separator").addClass("item-separator--normal");  
    } else if (currentItem.itemRarity === rarity.MAGIC) {
      $("#implicit-separator").addClass("item-separator--magic");  
    } else if (currentItem.itemRarity === rarity.RARE) {
      $("#implicit-separator").addClass("item-separator--rare");  
    }
  }

  var output = currentItem.getModsStrings();
  // some stats include newline characters
  for (var i = 0; i < output.length; i++) {
    output[i] = output[i].replace(/\\n/g, "<br>")
  }
  if (output.length > 0) {
    $("#item-stats-values").addClass("item-stats--values");
    $("#stat-1").html(output[0]);
    $("#stat-2").html(output[1]);
    $("#stat-3").html(output[2]);
    $("#stat-4").html(output[3]);
    $("#stat-5").html(output[4]);
    $("#stat-6").html(output[5]);
    if (currentItem.itemRarity === rarity.NORMAL) {
      $("#stats-separator").addClass("item-separator--normal");  
    } else if (currentItem.itemRarity === rarity.MAGIC) {
      $("#stats-separator").addClass("item-separator--magic");  
    } else if (currentItem.itemRarity === rarity.RARE) {
      $("#stats-separator").addClass("item-separator--rare");  
    }
  }

  if (currentItem.quality > 0) {
    $("#quality").html("Quality: ");
    $("#quality-value").html(currentItem.quality + "%<br>");
  }

  if (currentItem.defence !== null) {
    var defenceOutput = currentItem.calcDefence();
    if (currentItem.defence.block > 0) {
      $("#block").html("Chance to Block: ");
      $("#block-value").html(defenceOutput.block + "%<br>");
      if (defenceOutput.incBlock > 0) {
        $("#block-value").removeClass("text--normal").addClass("text--magic");
      } else {
        $("#block-value").removeClass("text--magic").addClass("text--normal");
      }
    }
    if (currentItem.defence.armour > 0) {
      $("#armour").html("Armour: ");
      $("#armour-value").html((defenceOutput.armour).toFixed(0) + "<br>");
      if (currentItem.quality > 0 || defenceOutput.incArmour > 0 || defenceOutput.flatArmour > 0) {
        $("#armour-value").removeClass("text--normal").addClass("text--magic");
      } else {
        $("#armour-value").removeClass("text--magic").addClass("text--normal");
      }
    }
    if (currentItem.defence.evasion > 0) {
      $("#evasion").html("Evasion Rating: ");
      $("#evasion-value").html((defenceOutput.evasion).toFixed(0) + "<br>");
      if (currentItem.quality > 0 || defenceOutput.incEvasion > 0 || defenceOutput.flatEvasion > 0) {
        $("#evasion-value").removeClass("text--normal").addClass("text--magic");
      } else {
        $("#evasion-value").removeClass("text--magic").addClass("text--normal");
      }
    }
    if (currentItem.defence.energyShield > 0) {
      $("#energy-shield").html("Energy Shield: ");
      $("#energy-shield-value").html((defenceOutput.energyShield).toFixed(0) + "<br>");
      if (currentItem.quality > 0 || defenceOutput.incEnergyShield > 0 || defenceOutput.flatEnergyShield > 0) {
        $("#energy-shield-value").removeClass("text--normal").addClass("text--magic");
      } else {
        $("#energy-shield-value").removeClass("text--magic").addClass("text--normal");
      }
    }
  }

  if (currentItem.weapon !== null) {
    var weaponOutput = currentItem.calcWeapon();
    $("#weapon-type").html(currentItem.type.replace("Thrusting ", "") + "<br>");
    $("#weapon-phys").html("Physical Damage: ");
    $("#weapon-crit").html("Critical Strike Chance: ");
    $("#weapon-aps").html("Attacks Per Second: ");
    if (currentItem.weapon.range > 0 && currentItem.weapon.range < 120) {
      $("#weapon-range").html("Weapon Range: ");
      $("#weapon-range-value").html(currentItem.weapon.range + "<br>");
    }
    $("#weapon-phys-value").html(Math.round((currentItem.weapon.damageMin + weaponOutput.physMin) * (1 + currentItem.quality / 100)) + "-" + Math.round((currentItem.weapon.damageMax + weaponOutput.physMax) * (1 + currentItem.quality / 100)) + "<br>")
    if (weaponOutput.incPhys > 0 || weaponOutput.physMin > 0 || weaponOutput.physMax > 0 || currentItem.quality > 0) {
      $("#weapon-phys-value").removeClass("text--normal").addClass("text--magic");
    } else {
      $("#weapon-phys-value").removeClass("text--magic").addClass("text--normal");
    }
    $("#weapon-crit-value").html(weaponOutput.crit + "<br>");
    if (weaponOutput.incCrit > 0) {
      $("#weapon-crit-value").removeClass("text--normal").addClass("text--magic");
    } else {
      $("#weapon-crit-value").removeClass("text--magic").addClass("text--normal");
    }
    $("#weapon-aps-value").html(weaponOutput.aps + "<br>");
    if (weaponOutput.incAS > 0) {
      $("#weapon-aps-value").removeClass("text--normal").addClass("text--magic");
    } else {
      $("#weapon-aps-value").removeClass("text--magic").addClass("text--normal");
    }
    if (weaponOutput.chaosMin > 0) {
      $("#weapon-chaos").html("Chaos Damage: ");
      $("#weapon-chaos-value").html(weaponOutput.chaosMin + "-" + weaponOutput.chaosMax + "<br>");
    }
    if (weaponOutput.fireMin > 0 || weaponOutput.coldMin > 0 || weaponOutput.lightMin > 0) {
      $("#weapon-ele").html("Elemental Damage: ");
      if (weaponOutput.fireMin > 0) {
        $("#weapon-fire-value").html(weaponOutput.fireMin + "-" + weaponOutput.fireMax);
      }
      if (weaponOutput.coldMin > 0) {
        $("#weapon-cold-value").html(weaponOutput.coldMin + "-" + weaponOutput.coldMax);
        if (weaponOutput.fireMin > 0) {
          $("#weapon-comma-1").html(", ");
        }
      }
      if (weaponOutput.lightMin > 0) {
        $("#weapon-light-value").html(weaponOutput.lightMin + "-" + weaponOutput.lightMax + "<br>");
        if (weaponOutput.fireMin > 0 || weaponOutput.coldMin > 0) {
          $("#weapon-comma-2").html(", ");
        }
      }
    }

    $("#dps").text("DPS " + weaponOutput.dps);
    $("#pdps").text("PDPS " + weaponOutput.pdps);
    $("#edps").text("EDPS " + weaponOutput.edps);
    $("#cdps").text("CDPS " + weaponOutput.cdps);
  }

  if (currentItem.maxSockets > 0) {
    if (currentItem.socketInfo.length === 1) {
      if (currentItem.socketInfo[0] !== undefined) {
        $("#socket-L1").attr("href", "./assets/images/socket" + currentItem.socketInfo[0] + ".png")
          .attr("x", 609)
          .attr("y", 692)
          .show();
      }
    } else if (currentItem.socketInfo.length === 2 && !currentItem.verticalSockets) {
      if (currentItem.socketInfo[0] !== undefined) {
        $("#socket-L1").attr("href", "./assets/images/socket" + currentItem.socketInfo[0] + ".png")
          .attr("x", 566)
          .attr("y", 692)
          .show();
      }
      if (currentItem.socketInfo[1] !== undefined) {
        $("#socket-R1").attr("href", "./assets/images/socket" + currentItem.socketInfo[1] + ".png")
          .attr("x", 652)
          .attr("y", 692)
          .show();
      }
      if (currentItem.linkInfo[0] === "L") {
        $("#socket-link1")
          .attr("x", 607)
          .attr("y", 709)
          .show();
      }
    } else if (currentItem.socketInfo.length === 2 && currentItem.verticalSockets) {
      if (currentItem.socketInfo[0] !== undefined) {
        $("#socket-L1").attr("href", "./assets/images/socket" + currentItem.socketInfo[0] + ".png")
          .attr("x", 609)
          .attr("y", 650)
          .show();
      }
      if (currentItem.socketInfo[1] !== undefined) {
        $("#socket-L2").attr("href", "./assets/images/socket" + currentItem.socketInfo[1] + ".png")
          .attr("x", 609)
          .attr("y", 734)
          .show();
      }
      if (currentItem.linkInfo[0] === "L") {
        $("#socket-link2")
          .attr("x", 622)
          .attr("y", 691)
          .show();
      }
    } else if (currentItem.socketInfo.length === 3 && !currentItem.verticalSockets) {
      if (currentItem.socketInfo[0] !== undefined) {
        $("#socket-L1").attr("href", "./assets/images/socket" + currentItem.socketInfo[0] + ".png")
          .attr("x", 566)
          .attr("y", 650)
          .show();
      }
      if (currentItem.socketInfo[1] !== undefined) {
        $("#socket-R1").attr("href", "./assets/images/socket" + currentItem.socketInfo[1] + ".png")
          .attr("x", 652)
          .attr("y", 650)
          .show();
      }
      if (currentItem.socketInfo[2] !== undefined) {
        $("#socket-L2").attr("href", "./assets/images/socket" + currentItem.socketInfo[2] + ".png")
          .attr("x", 652)
          .attr("y", 734)
          .show();
      }
      if (currentItem.linkInfo[0] === "L") {
        $("#socket-link1")
          .attr("x", 607)
          .attr("y", 664)
          .show();
      }
      if (currentItem.linkInfo[1] === "L") {
        $("#socket-link2")
          .attr("x", 665)
          .attr("y", 691)
          .show();
      }
    } else if (currentItem.socketInfo.length === 3 && currentItem.verticalSockets) {
      if (currentItem.socketInfo[0] !== undefined) {
        $("#socket-L1").attr("href", "./assets/images/socket" + currentItem.socketInfo[0] + ".png")
          .attr("x", 609)
          .attr("y", 608)
          .show();
      }
      if (currentItem.socketInfo[1] !== undefined) {
        $("#socket-L2").attr("href", "./assets/images/socket" + currentItem.socketInfo[1] + ".png")
          .attr("x", 609)
          .attr("y", 692)
          .show();
      }
      if (currentItem.socketInfo[2] !== undefined) {
        $("#socket-L3").attr("href", "./assets/images/socket" + currentItem.socketInfo[2] + ".png")
          .attr("x", 609)
          .attr("y", 776)
          .show();
      }
      if (currentItem.linkInfo[0] === "L") {
        $("#socket-link2")
          .attr("x", 622)
          .attr("y", 649)
          .show();
      }
      if (currentItem.linkInfo[1] === "L") {
        $("#socket-link4")
          .attr("x", 622)
          .attr("y", 733)
          .show();
      }
    } else if (currentItem.socketInfo.length <= 4) {
      if (currentItem.socketInfo[0] !== undefined) {
        $("#socket-L1").attr("href", "./assets/images/socket" + currentItem.socketInfo[0] + ".png")
          .attr("x", 566)
          .attr("y", 650)
          .show();
      }
      if (currentItem.socketInfo[1] !== undefined) {
        $("#socket-R1").attr("href", "./assets/images/socket" + currentItem.socketInfo[1] + ".png")
          .attr("x", 652)
          .attr("y", 650)
          .show();
      }
      if (currentItem.socketInfo[2] !== undefined) {
        $("#socket-L2").attr("href", "./assets/images/socket" + currentItem.socketInfo[2] + ".png")
          .attr("x", 652)
          .attr("y", 734)
          .show();
      }
      if (currentItem.socketInfo[3] !== undefined) {
        $("#socket-R2").attr("href", "./assets/images/socket" + currentItem.socketInfo[3] + ".png")
          .attr("x", 566)
          .attr("y", 734)
          .show();
      }
      if (currentItem.linkInfo[0] === "L") {
        $("#socket-link1")
          .attr("x", 607)
          .attr("y", 664)
          .show();
      }
      if (currentItem.linkInfo[1] === "L") {
        $("#socket-link2")
          .attr("x", 665)
          .attr("y", 691)
          .show();
      }
      if (currentItem.linkInfo[2] === "L") {
        $("#socket-link3")
          .attr("x", 607)
          .attr("y", 748)
          .show();
      }
    } else if (currentItem.socketInfo.length <= 6) {
      if (currentItem.socketInfo[0] !== undefined) {
        $("#socket-L1").attr("href", "./assets/images/socket" + currentItem.socketInfo[0] + ".png")
          .attr("x", 566)
          .attr("y", 608)
          .show();
      }
      if (currentItem.socketInfo[1] !== undefined) {
        $("#socket-R1").attr("href", "./assets/images/socket" + currentItem.socketInfo[1] + ".png")
          .attr("x", 652)
          .attr("y", 608)
          .show();
      }
      if (currentItem.socketInfo[2] !== undefined) {
        $("#socket-L2").attr("href", "./assets/images/socket" + currentItem.socketInfo[2] + ".png")
          .attr("x", 652)
          .attr("y", 692)
          .show();
      }
      if (currentItem.socketInfo[3] !== undefined) {
        $("#socket-R2").attr("href", "./assets/images/socket" + currentItem.socketInfo[3] + ".png")
          .attr("x", 566)
          .attr("y", 692)
          .show();
      }
      if (currentItem.socketInfo[4] !== undefined) {
        $("#socket-L3").attr("href", "./assets/images/socket" + currentItem.socketInfo[4] + ".png")
          .attr("x", 566)
          .attr("y", 776)
          .show();
      }
      if (currentItem.socketInfo[5] !== undefined) {
        $("#socket-R3").attr("href", "./assets/images/socket" + currentItem.socketInfo[5] + ".png")
          .attr("x", 652)
          .attr("y", 776)
          .show();
      }
      if (currentItem.linkInfo[0] === "L") {
        $("#socket-link1")
          .attr("x", 607)
          .attr("y", 622)
          .show();
      }
      if (currentItem.linkInfo[1] === "L") {
        $("#socket-link2")
          .attr("x", 666)
          .attr("y", 649)
          .show();
      }
      if (currentItem.linkInfo[2] === "L") {
        $("#socket-link3")
          .attr("x", 607)
          .attr("y", 709)
          .show();
      }
      if (currentItem.linkInfo[3] === "L") {
        $("#socket-link4")
          .attr("x", 580)
          .attr("y", 733)
          .show();
      }
      if (currentItem.linkInfo[4] === "L") {
        $("#socket-link5")
          .attr("x", 607)
          .attr("y", 792)
          .show();
      }
    }
  }

  if (whetstoneCount > 0) {
    $("#text-whetstone").text(whetstoneCount);
  }
  if (armourScrapCount > 0) {
    $("#text-armour-scrap").text(armourScrapCount);
  }
  if (transmuteCount > 0) {
    $("#text-transmute").text(transmuteCount);
  }
  if (alterationCount > 0) {
    $("#text-alteration").text(alterationCount);
  }
  if (annulmentCount > 0) {
    $("#text-annulment").text(annulmentCount);
  }
  if (exaltedCount > 0) {
    $("#text-exalted").text(exaltedCount);
  }
  if (regalCount > 0) {
    $("#text-regal").text(regalCount);
  }
  if (alchemyCount > 0) {
    $("#text-alchemy").text(alchemyCount);
  }
  if (chaosCount > 0) {
    $("#text-chaos").text(chaosCount);
  }
  if (blessedCount > 0) {
    $("#text-blessed").text(blessedCount);
  }
  if (augmentCount > 0) {
    $("#text-augment").text(augmentCount);
  }
  if (divineCount > 0) {
    $("#text-divine").text(divineCount);
  }  
  if (jewellerCount > 0) {
    $("#text-jeweller").text(jewellerCount);
  }  
  if (fusingCount > 0) {
    $("#text-fusing").text(fusingCount);
  }  
  if (chromaticCount > 0) {
    $("#text-chromatic").text(chromaticCount);
  }
  if (scouringCount > 0) {
    $("#text-scouring").text(scouringCount);
  }
  if (eternalCount > 0) {
    $("#text-eternal").text(eternalCount);
  }
  if (imprintCount > 0) {
    $("#text-imprint").text(imprintCount);
  }
  
  // set margin on item-box so that it doesn't clip above the top of the page
  $(".item-box").css("margin-top", (280 * $("#currency-tab-svg svg").height() / 632) + "px");
  if ($(".item-box").offset().top < 0) {
    $(".item-box").css("margin-top", ($(".item-box").height() - $("#currency-tab-svg").offset().top) + "px");
  }
}

function clearHTML() {
  $("#title").html("");
  $("#title-2").html("");
  $("#item-implicit").html("");
  $("#item-stats-values").removeClass();
  $("#stat-1").html("");
  $("#stat-2").html("");
  $("#stat-3").html("");
  $("#stat-4").html("");
  $("#stat-5").html("");
  $("#stat-6").html("");
  $("#quality").html("");
  $("#quality-value").html("");  
  $("#block").html("");
  $("#block-value").html("");
  $("#armour").html("");
  $("#armour-value").html("");
  $("#evasion").html("");
  $("#evasion-value").html("");
  $("#energy-shield").html("");
  $("#energy-shield-value").html("");
  $("#requirement-level").html("");
  $("#requirement-level-value").html("");
  $("#requirement-str").html("");
  $("#requirement-str-value").html("");
  $("#requirement-dex").html("");
  $("#requirement-dex-value").html("");
  $("#requirement-int").html("");
  $("#requirement-int-value").html("");
  $("#requirements").html("");
  $("#requirement-comma-1").html("");
  $("#requirement-comma-2").html("");
  $("#requirement-comma-3").html("");
  $("#weapon-type").html("");
  $("#weapon-phys").html("");
  $("#weapon-phys-value").html("");
  $("#weapon-ele").html("");
  $("#weapon-fire-value").html("");
  $("#weapon-cold-value").html("");
  $("#weapon-light-value").html("");
  $("#weapon-chaos").html("");
  $("#weapon-chaos-value").html("");
  $("#weapon-crit").html("");
  $("#weapon-crit-value").html("");
  $("#weapon-aps").html("");
  $("#weapon-aps-value").html("");
  $("#weapon-range").html("");
  $("#weapon-range-value").html("");
  $("#weapon-comma-1").html("");
  $("#weapon-comma-2").html("");
  $("#title-bar").removeClass();
  $("#title-bar-left").removeClass();
  $("#title-bar-right").removeClass();
  $("#title").removeClass();
  $("#title-2").removeClass();
  $("#requirements-separator").removeClass();
  $("#implicit-separator").removeClass();
  $("#stats-separator").removeClass();

  $("#dps").text("");
  $("#pdps").text("");
  $("#edps").text("");
  $("#cdps").text("");  
  $("#text-whetstone").text("");
  $("#text-armour-scrap").text("");
  $("#text-transmute").text("");
  $("#text-alteration").text("");
  $("#text-annulment").text("");
  $("#text-exalted").text("");
  $("#text-regal").text("");
  $("#text-alchemy").text("");
  $("#text-chaos").text("");
  $("#text-blessed").text("");
  $("#text-augment").text("");
  $("#text-divine").text("");
  $("#text-jeweller").text("");
  $("#text-fusing").text("");
  $("#text-chrom").text("");
  $("#text-scouring").text("");
  $("#text-eternal").text("");
  $("#text-imprint").text("");
  
  $("#socket-L1").hide();
  $("#socket-R1").hide();
  $("#socket-L2").hide();
  $("#socket-R2").hide();
  $("#socket-L3").hide();
  $("#socket-R3").hide();
  $("#socket-link1").hide();
  $("#socket-link2").hide();
  $("#socket-link3").hide();
  $("#socket-link4").hide();
  $("#socket-link5").hide();
}

function whetstone() {
  if (currentItem.quality < 20 && currentItem.category.includes("Weapon")) {
    if (currentItem.itemRarity === rarity.NORMAL) {
      currentItem.quality += 5;
    } else if (currentItem.itemRarity === rarity.MAGIC) {
      currentItem.quality += 2;
    } else {
      currentItem.quality += 1;
    }
    if (currentItem.quality > 20) {
      currentItem.quality = 20;
    }
    whetstoneCount++;
    update();
  }
}

function armourScrap() {
  if (currentItem.quality < 20 && (currentItem.category === "Armor" || currentItem.type === "Shield")) {
    if (currentItem.itemRarity === rarity.NORMAL) {
      currentItem.quality += 5;
    } else if (currentItem.itemRarity === rarity.MAGIC) {
      currentItem.quality += 2;
    } else {
      currentItem.quality += 1;
    }
    if (currentItem.quality > 20) {
      currentItem.quality = 20;
    }
    armourScrapCount++;
    update();
  }
}

function divine() {
  if (currentItem.itemRarity !== rarity.NORMAL) {
    currentItem.reroll();
    divineCount++;
    update();
  }
}

function blessed() {
  if (currentItem.implicitMod !== null) {
    currentItem.rerollImplicit();
    blessedCount++;
    update();
  }
}

function alchemy() {
  if (currentItem.itemRarity === rarity.NORMAL) {
    currentItem.itemRarity = rarity.RARE;
    // jewels have a max of 4 mods
    if (currentItem.category === "Other") {
      currentItem.maxPrefix = 2;
    } else {
      currentItem.maxPrefix = 3;
    }
    currentItem.updateModPool();
    alchemyCount++;    
    var rndTimes;
    if (currentItem.maxPrefix === 2) {
      rndTimes = Math.floor(Math.random() * (4 - 3 + 1)) + 3;
    } else {
      rndTimes = Math.floor(Math.random() * (6 - 4 + 1)) + 4;
    }
    for (var i = 0; i < rndTimes; i++) {
      currentItem.addMod(currentItem.getMod());
    }
    update();
  }
}

function scouring() {
  if (currentItem.itemRarity !== rarity.NORMAL) {
    currentItem.itemRarity = rarity.NORMAL;
    currentItem.maxPrefix = 1;
    currentItem.reset();
    scouringCount++;
    update();
  }
}

function chaos() {
  if (currentItem.itemRarity === rarity.RARE) {
    currentItem.reset();
    var rndTimes;
    // jewels have a max of 4 mods
    if (currentItem.maxPrefix === 2) {
      rndTimes = Math.floor(Math.random() * (4 - 3 + 1)) + 3;
    } else {
      rndTimes = Math.floor(Math.random() * (6 - 4 + 1)) + 4;
    }
    for (var i = 0; i < rndTimes; i++) {
      currentItem.addMod(currentItem.getMod());
    }
    currentItem.generateName();
    chaosCount++;
    update();
  }
}

function annulment() {
  if (currentItem.mods.length > 0) {
    var rnd = Math.floor(Math.random() * currentItem.mods.length);
    currentItem.removeMod(currentItem.mods[rnd]);
    annulmentCount++;
    update();
  }
}

function exalted() {
  if (currentItem.itemRarity === rarity.RARE && currentItem.mods.length < currentItem.maxPrefix * 2) {
    currentItem.addMod(currentItem.getMod());
    exaltedCount++;
    update();
  }
}

function transmute() {
  if (currentItem.itemRarity === rarity.NORMAL) {
    currentItem.itemRarity = rarity.MAGIC;
    currentItem.addMod(currentItem.getMod());
    transmuteCount++;
    update();
  }
}

function augment() {
  if (currentItem.itemRarity === rarity.MAGIC && currentItem.mods.length < currentItem.maxPrefix * 2) {
    currentItem.addMod(currentItem.getMod());
    augmentCount++;
    update();
  }
}

function alteration() {
  if (currentItem.itemRarity === rarity.MAGIC) {
    currentItem.reset();
    var rndTimes = Math.floor(Math.random() * (2 - 1 + 1)) + 1;
    for (var i = 0; i < rndTimes; i++) {
      currentItem.addMod(currentItem.getMod());
    }
    alterationCount++;
    update();
  }
}

function regal() {
  if (currentItem.itemRarity === rarity.MAGIC) {
    currentItem.itemRarity = rarity.RARE;
    // jewels have a max of 4 mods
    if (currentItem.category === "Other") {
      currentItem.maxPrefix = 2;
    } else {
      currentItem.maxPrefix = 3;
    }
    currentItem.updateModPool();
    currentItem.addMod(currentItem.getMod());
    regalCount++;
    update();
  }
}

function eternal() {
  currentItem.savedState = new Item(currentItem);
  eternalCount++;
  update();
}

function imprint() {
  if (currentItem.savedState !== null) {
    currentItem = currentItem.savedState;
    imprintCount++;
    update();
  }
}

function jeweller() {
  if (currentItem.maxSockets > 1 && currentItem.socketInfo.length !== 6) {
    currentItem.rerollSockets();
    jewellerCount++;
    update();
  }
}

function fusing() {
  if (currentItem.socketInfo.length > 0 && currentItem.linkInfo !== "LLLLL") {
    currentItem.rerollLinks();
    fusingCount++;
    update();
  }
}

function chromatic() {
  if (currentItem.socketInfo.length > 0) {
    currentItem.rerollColors();
    chromaticCount++;
    update();
  }
}

function chaosUntilMod() {
  var text = $("#mod-input-area").val();
  if (text.length === 0) {
    var modStrings = text.split(",");
    modStrings.forEach(function(str) {
      str = str.trim().toLowerCase();
    });
    // get all possible mods for current base
    var baseModPool = currentItem.getBaseModPool();
    // check if any of the strings are in the text of any mods
    if (checkModAvailability(modStrings, baseModPool)) {
      currentItem.itemRarity = rarity.RARE;
      // jewels have a max of 4 mods
      if (currentItem.category === "Other") {
        currentItem.maxPrefix = 2;
      } else {
        currentItem.maxPrefix = 3;
      }
      // chaos until mod text is found
      var chaosLoop = setInterval(function() {
        chaosCount++;
        chaos();
        if (checkMods(modStrings)) {
          clearInterval(chaosLoop);
        }
      }, 100);
    } else {
      alert("Invalid mod(s)");
    }
  }
}

function checkMods(modStrings) {
  // for each mod, for each stat, if there is a description, for each translation -> check each string
  for (var i = 0; i < currentItem.mods.length; i++) {
    for (var j = 0; j < currentItem.mods[i].stats.length; j++) {
      if (currentItem.mods[i].stats[j].description === null) {
        continue;
      }
      for (var k = 0; k < currentItem.mods[i].stats[j].description.translations.length; k++) {
        for (var s = 0; s < modStrings.length; s++) {
          if (currentItem.mods[i].stats[j].description.translations[k].text.toLowerCase().includes(modStrings[s])) {
            return true;
          }
        }
      }
    }
  }
  return false;
}

function checkModAvailability(modStrings, baseModPool) {
  // for each mod, for each stat, if there is a description, for each translation -> check each string
  for (var i = 0; i < baseModPool.length; i++) {
    for (var j = 0; j < baseModPool[i].stats.length; j++) {      
      if (baseModPool[i].stats[j].description === null) {
        continue;
      }
      for (var k = 0; k < baseModPool[i].stats[j].description.translations.length; k++) {
        for (var s = 0; s < modStrings.length; s++) {
          if (baseModPool[i].stats[j].description.translations[k].text.toLowerCase().includes(modStrings[s])) {
            return true;
          }
        }
      }
    }
  }
  return false;
}

function useSelected() {
  switch(selectedCurrency) {
    case currency.WHETSTONE:
      whetstone();
      break;
    case currency.ARMOURSCRAP:
      armourScrap();
      break;
    case currency.TRANSMUTE:
      transmute();
      break;
    case currency.ALTERATION:
      alteration();
      break;
    case currency.ANNULMENT:
      annulment();
      break;
    case currency.EXALTED:
      exalted();
      break;
    case currency.REGAL:
      regal();
      break;
    case currency.ALCHEMY:
      alchemy();
      break;
    case currency.CHAOS:
      chaos();
      break;
    case currency.BLESSED:
      blessed();
      break;
    case currency.AUGMENT:
      augment();
      break;
    case currency.DIVINE:
      divine();
      break;
    case currency.JEWELLER:
      jeweller();
      break;
    case currency.FUSING:
      fusing();
      break;
    case currency.CHROMATIC:
      chromatic();
      break;
    case currency.SCOURING:
      scouring();
      break;
    case currency.ETERNAL:
      eternal();
      break;
    case currency.IMPRINT:
      imprint();
      break;
    default:
      break;
  }
}

function selectWhetstone() {
  selectedCurrency = currency.WHETSTONE;
}
function selectArmourScrap() {
  selectedCurrency = currency.ARMOURSCRAP;
}
function selectTransmute() {
  selectedCurrency = currency.TRANSMUTE;
}
function selectAlteration() {
  selectedCurrency = currency.ALTERATION;
}
function selectAnnulment() {
  selectedCurrency = currency.ANNULMENT;
}
function selectExalted() {
  selectedCurrency = currency.EXALTED;
}
function selectRegal() {
  selectedCurrency = currency.REGAL;
}
function selectAlchemy() {
  selectedCurrency = currency.ALCHEMY;
}
function selectChaos() {
  selectedCurrency = currency.CHAOS;
}
function selectBlessed() {
  selectedCurrency = currency.BLESSED;
}
function selectAugment() {
  selectedCurrency = currency.AUGMENT;
}
function selectDivine() {
  selectedCurrency = currency.DIVINE;
}
function selectJeweller() {
  selectedCurrency = currency.JEWELLER;
}
function selectFusing() {
  selectedCurrency = currency.FUSING;
}
function selectChromatic() {
  selectedCurrency = currency.CHROMATIC;
}
function selectScouring() {
  selectedCurrency = currency.SCOURING;
}
function selectEternal() {
  selectedCurrency = currency.ETERNAL;
}
function selectImprint() {
  selectedCurrency = currency.IMPRINT;
}

function resetCount() {
  whetstoneCount = 0;
  armourScrapCount = 0;
  transmuteCount = 0;
  alterationCount = 0;
  annulmentCount = 0;
  exaltedCount = 0;
  regalCount = 0;
  alchemyCount = 0;
  chaosCount = 0;
  blessedCount = 0;
  augmentCount = 0;
  divineCount = 0;
  jewellerCount = 0;
  fusingCount = 0;
  chromaticCount = 0;
  scouringCount = 0;
  eternalCount = 0;
  imprintCount = 0;
  update();
}

$(document).ready(function(e) {
  // set art after so it isn't shown before load
  $("#socket-link1").attr("href", "./assets/images/socketLink.png").hide();
  $("#socket-link2").attr("href", "./assets/images/socketLinkVertical.png").hide();
  $("#socket-link3").attr("href", "./assets/images/socketLink.png").hide();
  $("#socket-link4").attr("href", "./assets/images/socketLinkVertical.png").hide();
  $("#socket-link5").attr("href", "./assets/images/socketLink.png").hide();
  $("#rect-item-slot-capture").mouseenter(function() { 
      $(".item-box").show(); 
      // update item-box margins to prevent clipping through the top of the page when the item slot is moused over
      $(".item-box").css("margin-top", (280 * $("#currency-tab-svg svg").height() / 632) + "px");
      if ($(".item-box").offset().top < 0) {
        $(".item-box").css("margin-top", ($(".item-box").height() - $("#currency-tab-svg").offset().top) + "px");
      }
      $("#rect-item-slot").attr("fill", "#041E04"); 
    })
    .mouseleave(function(e) {
      $(".item-box").hide(); 
      $("#rect-item-slot").attr("fill", "#04041E"); 
    }).click(function(e) {
      useSelected();
      if (!e.shiftKey) {
        $("#currency-cursor").hide()
        selectedCurrency = null;
      }
    })
    // prevent double clicks to stop accidentl selections of other elements when spam clicking
    .dblclick(function(e) { e.preventDefault() });
  $("#rect-whetstone-capture").mouseenter(function() { $("#rect-whetstone").attr("fill", "#041E04"); })
    .mouseleave(function() { $("#rect-whetstone").attr("fill", "#04041E"); })
    .click(function() { 
      if (selectedCurrency === currency.WHETSTONE) {
        $("#currency-cursor").hide()
        selectedCurrency = null;
      } else {
        selectWhetstone();
        $("#currency-cursor").attr("src", "https://web.poecdn.com/image/Art/2DItems/Currency/CurrencyWeaponQuality.png").show();
      }
    });
  $("#rect-armour-scrap-capture").mouseenter(function() { $("#rect-armour-scrap").attr("fill", "#041E04"); })
    .mouseleave(function() { $("#rect-armour-scrap").attr("fill", "#04041E"); })
    .click(function() { 
      if (selectedCurrency === currency.ARMOURSCRAP) {
        $("#currency-cursor").hide()
        selectedCurrency = null;
      } else {
        selectArmourScrap();
        $("#currency-cursor").attr("src", "https://web.poecdn.com/image/Art/2DItems/Currency/CurrencyArmourQuality.png").show();
      }
    });
  $("#rect-bauble-capture").mouseenter(function() { $("#rect-bauble").attr("fill", "#041E04"); })
    .mouseleave(function() { $("#rect-bauble").attr("fill", "#04041E"); })
    .click(function() { 
      if (selectedCurrency === currency.BAUBLE) {
        $("#currency-cursor").hide()
        selectedCurrency = null;
      } else {
        selectBauble();
        $("#currency-cursor").attr("src", "https://web.poecdn.com/image/Art/2DItems/Currency/CurrencyFlaskQuality.png").show(); 
      }
    });
  $("#rect-transmute-capture").mouseenter(function() { $("#rect-transmute").attr("fill", "#041E04"); })
    .mouseleave(function() { $("#rect-transmute").attr("fill", "#04041E"); })
    .click(function() { 
      if (selectedCurrency === currency.TRANSMUTE) {
        $("#currency-cursor").hide()
        selectedCurrency = null;
      } else {
        selectTransmute();
        $("#currency-cursor").attr("src", "https://web.poecdn.com/image/Art/2DItems/Currency/CurrencyUpgradeToMagic.png").show();
      }
    });
  $("#rect-alteration-capture").mouseenter(function() { $("#rect-alteration").attr("fill", "#041E04"); })
    .mouseleave(function() { $("#rect-alteration").attr("fill", "#04041E"); })
    .click(function() { 
      if (selectedCurrency === currency.ALTERATION) {
        $("#currency-cursor").hide()
        selectedCurrency = null;
      } else {
        selectAlteration();
        $("#currency-cursor").attr("src", "https://web.poecdn.com/image/Art/2DItems/Currency/CurrencyRerollMagic.png").show();
      }
    });
  $("#rect-annulment-capture").mouseenter(function() { $("#rect-annulment").attr("fill", "#041E04"); })
    .mouseleave(function() { $("#rect-annulment").attr("fill", "#04041E"); })
    .click(function() { 
      if (selectedCurrency === currency.ANNULMENT) {
        $("#currency-cursor").hide()
        selectedCurrency = null;
      } else {
        selectAnnulment();
        $("#currency-cursor").attr("src", "https://web.poecdn.com/image/Art/2DItems/Currency/AnnullOrb.png").show();
      }
    });
  $("#rect-exalted-capture").mouseenter(function() { $("#rect-exalted").attr("fill", "#041E04"); })
    .mouseleave(function() { $("#rect-exalted").attr("fill", "#04041E"); })
    .click(function() { 
      if (selectedCurrency === currency.EXALTED) {
        $("#currency-cursor").hide()
        selectedCurrency = null;
      } else {
        selectExalted();
        $("#currency-cursor").attr("src", "https://web.poecdn.com/image/Art/2DItems/Currency/CurrencyAddModToRare.png").show();
      }
    });
  $("#rect-regal-capture").mouseenter(function() { $("#rect-regal").attr("fill", "#041E04"); })
    .mouseleave(function() { $("#rect-regal").attr("fill", "#04041E"); })
    .click(function() { 
      if (selectedCurrency === currency.REGAL) {
        $("#currency-cursor").hide()
        selectedCurrency = null;
      } else {
        selectRegal();
        $("#currency-cursor").attr("src", "https://web.poecdn.com/image/Art/2DItems/Currency/CurrencyUpgradeMagicToRare.png").show();
      }
    });
  $("#rect-alchemy-capture").mouseenter(function() { $("#rect-alchemy").attr("fill", "#041E04"); })
    .mouseleave(function() { $("#rect-alchemy").attr("fill", "#04041E"); })
    .click(function() { 
      if (selectedCurrency === currency.ALCHEMY) {
        $("#currency-cursor").hide()
        selectedCurrency = null;
      } else {
        selectAlchemy();
        $("#currency-cursor").attr("src", "https://web.poecdn.com/image/Art/2DItems/Currency/CurrencyUpgradeToRare.png").show();
      }
    });
  $("#rect-chaos-capture").mouseenter(function() { $("#rect-chaos").attr("fill", "#041E04"); })
    .mouseleave(function() { $("#rect-chaos").attr("fill", "#04041E"); })
    .click(function() { 
      if (selectedCurrency === currency.CHAOS) {
        $("#currency-cursor").hide()
        selectedCurrency = null;
      } else {
        selectChaos();
        $("#currency-cursor").attr("src", "https://web.poecdn.com/image/Art/2DItems/Currency/CurrencyRerollRare.png").show();
      }
    });
  $("#rect-blessed-capture").mouseenter(function() { $("#rect-blessed").attr("fill", "#041E04"); })
    .mouseleave(function() { $("#rect-blessed").attr("fill", "#04041E"); })
    .click(function() { 
      if (selectedCurrency === currency.BLESSED) {
        $("#currency-cursor").hide()
        selectedCurrency = null;
      } else {
        selectBlessed();
        $("#currency-cursor").attr("src", "https://web.poecdn.com/image/Art/2DItems/Currency/CurrencyImplicitMod.png").show();
      }
    });
  $("#rect-augment-capture").mouseenter(function() { $("#rect-augment").attr("fill", "#041E04"); })
    .mouseleave(function() { $("#rect-augment").attr("fill", "#04041E"); })
    .click(function() { 
      if (selectedCurrency === currency.AUGMENT) {
        $("#currency-cursor").hide()
        selectedCurrency = null;
      } else {
        selectAugment();
        $("#currency-cursor").attr("src", "https://web.poecdn.com/image/Art/2DItems/Currency/CurrencyAddModToMagic.png").show(); 
      }
    });
  $("#rect-divine-capture").mouseenter(function() { $("#rect-divine").attr("fill", "#041E04"); })
    .mouseleave(function() { $("#rect-divine").attr("fill", "#04041E"); })
    .click(function() { 
      if (selectedCurrency === currency.DIVINE) {
        $("#currency-cursor").hide()
        selectedCurrency = null;
      } else {
        selectDivine();
        $("#currency-cursor").attr("src", "https://web.poecdn.com/image/Art/2DItems/Currency/CurrencyModValues.png").show();
      }
    });
  $("#rect-jeweller-capture").mouseenter(function() { $("#rect-jeweller").attr("fill", "#041E04"); })
    .mouseleave(function() { $("#rect-jeweller").attr("fill", "#04041E"); })
    .click(function() { 
      if (selectedCurrency === currency.JEWELLER) {
        $("#currency-cursor").hide()
        selectedCurrency = null;
      } else {
        selectJeweller();
        $("#currency-cursor").attr("src", "https://web.poecdn.com/image/Art/2DItems/Currency/CurrencyRerollSocketNumbers.png").show();
      }
    });
  $("#rect-fusing-capture").mouseenter(function() { $("#rect-fusing").attr("fill", "#041E04"); })
    .mouseleave(function() { $("#rect-fusing").attr("fill", "#04041E"); })
    .click(function() { 
      if (selectedCurrency === currency.FUSING) {
        $("#currency-cursor").hide()
        selectedCurrency = null;
      } else {
        selectFusing();
        $("#currency-cursor").attr("src", "https://web.poecdn.com/image/Art/2DItems/Currency/CurrencyRerollSocketLinks.png").show();
      }
    });
  $("#rect-chromatic-capture").mouseenter(function() { $("#rect-chromatic").attr("fill", "#041E04"); })
    .mouseleave(function() { $("#rect-chromatic").attr("fill", "#04041E"); })
    .click(function() { 
      if (selectedCurrency === currency.CHROMATIC) {
        $("#currency-cursor").hide()
        selectedCurrency = null;
      } else {
        selectChromatic();
        $("#currency-cursor").attr("src", "https://web.poecdn.com/image/Art/2DItems/Currency/CurrencyRerollSocketColours.png").show();
      }
    });
  $("#rect-scouring-capture").mouseenter(function() { $("#rect-scouring").attr("fill", "#041E04"); })
    .mouseleave(function() { $("#rect-scouring").attr("fill", "#04041E"); })
    .click(function() { 
      if (selectedCurrency === currency.SCOURING) {
        $("#currency-cursor").hide()
        selectedCurrency = null;
      } else {
        selectScouring();
        $("#currency-cursor").attr("src", "https://web.poecdn.com/image/Art/2DItems/Currency/CurrencyConvertToNormal.png").show();
      }
    });
  $("#rect-eternal-capture").mouseenter(function() { $("#rect-eternal").attr("fill", "#041E04"); })
    .mouseleave(function() { $("#rect-eternal").attr("fill", "#04041E"); })
    .click(function() { 
      if (selectedCurrency === currency.ETERNAL) {
        $("#currency-cursor").hide()
        selectedCurrency = null;
      } else {
        selectEternal();
        $("#currency-cursor").attr("src", "https://web.poecdn.com/image/Art/2DItems/Currency/CurrencyImprintOrb.png").show();
      }
    });
  $("#rect-imprint-capture").mouseenter(function() { $("#rect-imprint").attr("fill", "#041E04"); })
    .mouseleave(function() { $("#rect-imprint").attr("fill", "#04041E"); })
    .click(function() { 
      if (selectedCurrency === currency.IMPRINT) {
        $("#currency-cursor").hide()
        selectedCurrency = null;
      } else {
        selectImprint();
        $("#currency-cursor").attr("src", "https://web.poecdn.com/image/Art/2DItems/Currency/CurrencyImprint.png").show();
      }
    });
  // set item-box margins once on load
  $(".item-box").css("margin-top", (280 * $("#currency-tab-svg svg").height() / 632) + "px");
  // update item-box margins on page resize
  $(window).resize(function() {
    $(".item-box").css("margin-top", (280 * $("#currency-tab-svg svg").height() / 632) + "px");
    if ($(".item-box").offset().top < 0) {
      $(".item-box").css("margin-top", ($(".item-box").height() - $("#currency-tab-svg").offset().top) + "px");
    }
  });
  $("#currency-tab-svg").mouseleave(function(e) {     
      $("#currency-cursor").hide(); 
      selectedCurrency = null; 
    })
    // releasing shift will deselect the current currency
    .mousemove(function(e) {
      if (!e.shiftKey && shiftPressed) {
        shiftPressed = false;
        $("#currency-cursor").hide()
        selectedCurrency = null;
      } else if (e.shiftKey) {
        shiftPressed = true;
      }
    });
  $("#currency-cursor").hide();
  // workaround for chrome bug mousemove event during clicks
  $(document).mousemove(function(e) {
    $("#currency-cursor").css({ left:e.pageX - 12, top:e.pageY - 12 });
    var x, y;
    return function(evt) {
      if (evt.screenX === x && evt.screenY === y) {
        return;
      }
      x = evt.screenX;
      y = evt.screenY;
    }
  });
});