var game = {
    version: "1.0",
    timeSaved: Date.now(),
    layers: [],
    highestLayer: 0,
    automators: {
        autoMaxAll: new Automator("Auto Max All", "Automatically buys max on all Layers", () =>
        {
            for(let i = Math.max(0, game.volatility.autoMaxAll.apply().toNumber()); i < game.layers.length; i++)
            {
                game.layers[i].maxAll();
            }
        }, new DynamicLayerUpgrade(level => Math.floor(level / 3) + 1, () => null, () => "Decrease the Automator interval",
            level => Decimal.pow(10, PrestigeLayer.getPrestigeCarryOverForLayer(level.toNumber()) * [0.2, 0.5, 0.8][level.toNumber() % 3]),
            level => level.gt(0) ? Math.pow(0.8, level.toNumber() - 1) * 10 : Infinity, null, {
                getEffectDisplay: effectDisplayTemplates.automator()
            })),
        autoPrestige: new Automator("Auto Prestige", "Automatically prestiges all Layers", () =>
        {
            for(let i = 0; i < game.layers.length - 1; i++)
            {
                if(game.layers[game.layers.length - 2].canPrestige() && !game.settings.autoPrestigeHighestLayer)
                {
                    break;
                }
                if(game.layers[i].canPrestige() && !game.layers[i].isNonVolatile())
                {
                    game.layers[i].prestige();
                }
            }
        }, new DynamicLayerUpgrade(level => Math.floor(level / 2) + 2, () => null, () => "Decrease the Automator interval",
            level => Decimal.pow(10, PrestigeLayer.getPrestigeCarryOverForLayer(level.add(2).toNumber()) * (level.toNumber() % 2 === 0 ? 0.25 : 0.75)),
            level => level.gt(0) ? Math.pow(0.6, level.toNumber() - 1) * 30 : Infinity, null, {
                getEffectDisplay: effectDisplayTemplates.automator()
            })),
        autoAleph: new Automator("Auto Aleph", "Automatically Max All Aleph Upgrades", () =>
        {
            game.alephLayer.maxAll();
        }, new DynamicLayerUpgrade(level => level + 3, () => null, () => "Decrease the Automator interval",
            level => Decimal.pow(10, PrestigeLayer.getPrestigeCarryOverForLayer(level.add(3).toNumber()) * 0.7),
            level => level.gt(0) ? Math.pow(0.6, level.toNumber() - 1) * 60 : Infinity, null, {
                getEffectDisplay: effectDisplayTemplates.automator()
            })),
    },
    volatility: {
        layerVolatility: new DynamicLayerUpgrade(level => level + 1, level => level,
            function()
            {
                return "Make the next Layer non-volatile";
            }, level => Decimal.pow(10, PrestigeLayer.getPrestigeCarryOverForLayer(level.add(1).toNumber())), level => level.sub(1), null, {
                getEffectDisplay: function()
                {
                    let val1 = this.level.eq(0) ? "None" : PrestigeLayer.getNameForLayer(this.apply().toNumber());
                    let val2 = PrestigeLayer.getNameForLayer(this.getEffect(this.level.add(1)).toNumber());
                    return val1 + " ??? " + val2;
                }
            }),
        prestigePerSecond: new DynamicLayerUpgrade(level => Math.round(level * 1.3) + 3, level => null,
            () => "Boost the Prestige Reward you get per second",
            function(level)
            {
                let max = PrestigeLayer.getPrestigeCarryOverForLayer(Math.round(level.toNumber() * 1.3) + 3);
                return Decimal.pow(10, new Random(level.toNumber() * 10 + 10).nextDouble() * max).round();
            }, level => new Decimal(0.5 + 0.1 * level), null, {
                getEffectDisplay: effectDisplayTemplates.percentStandard(0)
            }),
        autoMaxAll: new DynamicLayerUpgrade(level => level + 2, level => level,
            function()
            {
                return "The next Layer is maxed automatically each tick";
            }, level => Decimal.pow(10, PrestigeLayer.getPrestigeCarryOverForLayer(level.add(2).toNumber()) * 0.125), level => level.sub(1), null, {
                getEffectDisplay: function()
                {
                    let val1 = this.level.eq(0) ? "None" : PrestigeLayer.getNameForLayer(this.apply().toNumber());
                    let val2 = PrestigeLayer.getNameForLayer(this.getEffect(this.level.add(1)).toNumber());
                    return val1 + " ??? " + val2;
                }
            }),
    },
    alephLayer: new AlephLayer(),
    restackLayer: new ReStackLayer(),
    metaLayer: new MetaLayer(),
    achievements: [
        new Achievement("Starting Out", "Reach 10 ??", "??", () => game.layers[0] && game.layers[0].resource.gt(10)),
        new Achievement("The beginning of Idling", "Have 1 <span>??<sub>1</sub></span> Generator", "<span>??<sub>1</sub></span>", () => game.layers[0] && game.layers[0].generators[0].bought.gt(0)),
        new Achievement("Polynomial Growth", "Have 1 <span>??<sub>2</sub></span> Generator", "<span>??<sub>2</sub></span>", () => game.layers[0] && game.layers[0].generators[1].bought.gt(0)),
        new Achievement("Still Polynomial Growth", "Have 1 <span>??<sub>3</sub></span> Generator", "<span>??<sub>3</sub></span>", () => game.layers[0] && game.layers[0].generators[2].bought.gt(0)),
        new Achievement("A Square of Generators", "Have 1 <span>??<sub>4</sub></span> Generator", "<span>??<sub>4</sub></span>", () => game.layers[0] && game.layers[0].generators[3].bought.gt(0)),
        new Achievement("Pentagen", "Have 1 <span>??<sub>5</sub></span> Generator", "<span>??<sub>5</sub></span>", () => game.layers[0] && game.layers[0].generators[4].bought.gt(0)),
        new Achievement("Power of Six", "Have 1 <span>??<sub>6</sub></span> Generator", "<span>??<sub>6</sub></span>", () => game.layers[0] && game.layers[0].generators[5].bought.gt(0)),
        new Achievement("Seven Heaven", "Have 1 <span>??<sub>7</sub></span> Generator", "<span>??<sub>7</sub></span>", () => game.layers[0] && game.layers[0].generators[6].bought.gt(0)),
        new Achievement("Octacore", "Have 1 <span>??<sub>8</sub></span> Generator", "<span>??<sub>8</sub></span>", () => game.layers[0] && game.layers[0].generators[7].bought.gt(0)),
        new Achievement("Upgradalicious", "Buy your first ?? Upgrade", "<span>??<sub>UP</sub></span>", () => game.layers[0] && game.layers[0].upgrades[0].level.gt(0)),
        new Achievement("Stonks", "Reach 1e18 ??", "??", () => game.layers[0] && game.layers[0].resource.gte(1e18)),
        new Achievement("Other Times Await", "Go ??", "??", () => game.layers[1] && game.layers[1].timesReset > 0),
        new Achievement("POW", "Have 1 <span>??<sub>P<sub>1</sub></sub></span> Generator", "<span>??<sub>P<sub>1</sub></sub></span>", () => game.layers[1] && game.layers[1].powerGenerators[0].bought.gt(0)),
        new Achievement("Polynomial POW", "Have 1 <span>??<sub>P<sub>2</sub></sub></span> Generator", "<span>??<sub>P<sub>2</sub></sub></span>", () => game.layers[1] && game.layers[1].powerGenerators[1].bought.gt(0)),
        new Achievement("In thousands", "Have over 1,000 <span>??<sub>1</sub></span> Generators", "<span>??<sub>1</sub></span>", () => game.layers[0] && game.layers[0].generators[0].bought.gte(1000)),
        new Achievement("Other Times Arrived", "Go ?? 10 Times", "??", () => game.layers[1] && game.layers[1].timesReset >= 10),
        new Achievement("Automatic!", "Enable the \"Max All\" Automator", "<img src=\"images/hardware-chip.svg\" alt=\"A\">", () => game.automators.autoMaxAll.upgrade.level.gte(1)),
        new Achievement("Exploding Numbers", "Reach 1e6 ??", "??", () => game.layers[1] && game.layers[1].resource.gte(1e6)),
        new Achievement("A big Boost", "Reach 1e9 ??-Power", "<span>??<sub>P</sub></span>", () => game.layers[1] && game.layers[1].power.gte(1e9)),
        new Achievement("A Square of Power", "Have 1 <span>??<sub>P<sub>4</sub></sub></span> Generator", "<span>??<sub>P<sub>4</sub></sub></span>", () => game.layers[1] && game.layers[1].powerGenerators[3].bought.gt(0)),
        new Achievement("Another Layer?!", "Reach 1e20 ??", "??", () => game.layers[1] && game.layers[1].resource.gte(1e20)),
        new Achievement("Other Times Await... Again", "Go ??", "??", () => game.layers[2] && game.layers[2].timesReset > 0),
        new Achievement("PO????", "Have 1 <span>??<sub>P<sub>1</sub></sub></span> Generator", "<span>??<sub>P<sub>1</sub></sub></span>", () => game.layers[2] && game.layers[2].powerGenerators[0].bought.gt(0)),
        new Achievement("The True Time", "Go ?? 42 Times", "??", () => game.layers[2] && game.layers[2].timesReset >= 42),
        new Achievement("More Gamma, more Boost", "Reach 1e6 ??", "??", () => game.layers[2] && game.layers[2].resource.gte(1e6)),
        new Achievement("Huge Numbers", "Reach 1e100,000 ??", "??", () => game.layers[0] && game.layers[0].resource.gte("1e100000")),
        new Achievement("How Challenging", "Beat Challenge y-01 at least once", "??", () => game.layers[2] && game.layers[2].challenges[0].level > 0),
        new Achievement("Persistence", "Make Layer ?? Non-Volatile", '<img src="images/save.svg" alt="S">', () => game.volatility.layerVolatility.level.gt(0)),
        new Achievement("Other Times Await... Yet Again", "Go ??", "??", () => game.layers[3] && game.layers[3].timesReset > 0),
        new Achievement("Aleph-0", "Reach 1,000 ???", '<span class="aleph">???</span>', () => game.alephLayer.aleph.gte(1000)),
        new Achievement("Aleph-1", "Reach 1e30 ???", '<span class="aleph">???</span>', () => game.alephLayer.aleph.gte(1e30)),
        new Achievement("Aleph-2", "Reach 1.8e308 ???", '<span class="aleph">???<sub>???</sub></span>', () => game.alephLayer.aleph.gte(INFINITY)),
        new Achievement("It all runs by itself", "Enable the Aleph Automator", "<img src=\"images/hardware-chip.svg\" alt=\"A\">", () => game.automators.autoAleph.upgrade.level.gte(1)),
        new Achievement("How many are there?!", "Go ??", "??", () => game.layers[4] && game.layers[4].timesReset > 0),
        new Achievement("It's time to stop! (not)", "Go ??", "??", () => game.layers[5] && game.layers[5].timesReset > 0),
        new Achievement("End Game?", "Reach 1e1,000,000,000 ??", "??", () => game.layers[0] && game.layers[0].resource.gte("1ee9")),
        new Achievement("Temperature", "Go ??", "??", () => game.layers[7] && game.layers[7].timesReset > 0),
        new Achievement("Stack A-New!", "ReStack", "<img alt=\"LC\" class=\"inline\" src=\"images/layercoin.svg\"/>", () => game.restackLayer.timesReset > 0),
        new Achievement("H ?? l f L i f e", "Go ??", "??", () => game.layers[10] && game.layers[10].timesReset > 0),
        new Achievement("One for Everyone", "Have 7,800,000,000 Layer Coins", "<img alt=\"LC\" class=\"inline\" src=\"images/layercoin.svg\"/>", () => game.restackLayer.layerCoins.gte(7.8e9)),
        new Achievement("What's the Point of Layers?", "Buy the Meta Upgrade", "<img alt=\"LC\" class=\"inline\" src=\"images/layercoin.svg\"/>", () => game.restackLayer.metaUpgrade.level.gt(0)),
        new Achievement("Wake Up", "Go Meta", "<img alt=\"LC\" class=\"inline\" src=\"images/layercoin.svg\"/>", () => game.metaLayer.active),
        new Achievement("??-Layers", "Reach Layer ??", "??", () => game.metaLayer.layer.gte(47)),
        new Achievement("One for each Second", "Advance 1 Layer per second", "??", () => game.metaLayer.getLayersPS().gte(1)),
        new Achievement("The Ladder is Infinite", "Reach Layer 1000", "???????", () => game.metaLayer.layer.gte(1000)),
        new Achievement("Stupidly fast", "Advance 10 Layer per second", "????", () => game.metaLayer.getLayersPS().gte(10)),
        new Achievement("What are Layer resets?", "Buy the ReStack Tree Upgrade in Row 5", "<img alt=\"LC\" class=\"inline\" src=\"images/layercoin.svg\"/>", () => game.restackLayer.upgradeTreeNames.substractLayers.apply()),
        new Achievement("Faster than Light", "Advance ~300e9 Layers per second", "??????", () => game.metaLayer.getLayersPS().gte(299792458)),
        new Achievement("It never Ends", "Reach Layer 1e10", "<span style='font-size: 30%;'><span>??<sub>??</sub></span><sup>??</sup>???<span>??<sub>??</sub></span><sup>??</sup>???<span>??<sub>??</sub></span><sup>??</sup>???<span>??</span><sup>??</sup></span>", () => game.metaLayer.layer.gte(1e10)),
        new Achievement("Inf-Infinity", "Reach Layer ~1.8e308", "<span class='flipped-v'>??</span>", () => game.metaLayer.layer.gte(INFINITY))
    ],
    currentLayer: null,
    currentChallenge: null,
    notifications: [],
    timeSpent: 0,
    settings: {
        tab: "Layers",
        showAllLayers: true,
        showMinLayers: 5,
        showMaxLayers: 5,
        showLayerOrdinals: false,
        layerTickSpeed: 1,
        buyMaxAlways10: true,
        disableBuyMaxOnHighestLayer: false,
        resourceColors: true,
        resourceGlow: true,
        newsTicker: true,
        autoMaxAll: true,
        autoPrestigeHighestLayer: true,
        notifications: true,
        saveNotifications: true,
        confirmations: true,
        offlineProgress: true,
        titleStyle: 2,
        theme: "dark.css"
    }
};

let initialGame = functions.getSaveString();