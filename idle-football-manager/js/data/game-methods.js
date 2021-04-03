let functions = {
    formatNumber(n, prec = 2, prec1000 = 0, lim = 1e6){
        if(typeof n === "number"){
            n = new Decimal(n);
        }
        if(!["Standard", "Letters", "Scientific", "Engineering"].includes(game.numberFormatter.name)){
            lim = 0;
        }
        return n.lt(lim) ? n.toNumber().toLocaleString("en-US", {minimumFractionDigits: prec1000, maximumFractionDigits: prec1000})
            : game.numberFormatter.format(n, prec, prec1000);
    },
    formatTime(s){
        let times = [Math.floor(s / 60), Math.floor(s) % 60];
        return times.map(t => t.toString().padStart(2, "0")).join(":");
    },
    getSaveString(){
        let json = JSON.stringify(game, (key, value) => {
            if(key === "numberFormatter"){
                return value.name;
            }

            if(value instanceof Team){
                let isPlayerTeam = value === game.team;
                value = JSON.parse(JSON.stringify(value)); //clone
                if(isPlayerTeam){
                    value.isPlayerTeam = true;
                }
                else{
                    value.players = undefined;
                }
                return value;
            }
            else if(value instanceof Match){
                value.team1Idx = game.league.divisions[game.team.divisionRank].teams.findIndex(t => t === value.team1);
                value.team2Idx = game.league.divisions[game.team.divisionRank].teams.findIndex(t => t === value.team2);
            }
            else if(value instanceof AbstractUpgrade){
                return {level: value.level};
            }
            return value;
        });

        return btoa(unescape(encodeURIComponent(json)));
    },
    saveGame(){
        localStorage.setItem("idleSoccerManager", this.getSaveString());
    },
    loadGame(str){
        let loadVal = (v, alt) => v ? v : alt;

        str = str || localStorage.getItem("idleSoccerManager");
        if(str){
            let json = decodeURIComponent(escape(atob(str)));
            let obj = JSON.parse(json, (key, value) => {
                if(typeof value === "string" && !isNaN(value) && !isNaN(parseFloat(value)) && !isNaN(new Decimal(value))){
                    return new Decimal(value);
                }
                return value;
            });

            game.money = loadVal(obj.money, new Decimal(10000));
            game.country = loadVal(obj.country, 0);
            game.canEnterNextCountry = loadVal(obj.canEnterNextCountry, false);
            Vue.nextTick(() => {
                game.tab = "tab-player-market";
                game.init = true;
                Vue.nextTick(() => {
                    game.tab = loadVal(obj.tab, "tab-team");
                });
            });

            if(obj.league){
                for(let d = 0; d < obj.league.divisions.length; d++){
                    for(let t = 0; t < obj.league.divisions[d].teams.length; t++){
                        let tObj = obj.league.divisions[d].teams[t];
                        let team = new Team(tObj.name, [], tObj.divisionRank, tObj.country, tObj.seed);
                        team.load(tObj);
                        game.league.divisions[d].teams[t] = team;
                        if(tObj.isPlayerTeam){
                            game.team = team;
                        }
                    }
                    game.league.divisions[d].load(obj.league.divisions[d]);
                }

                if(obj.team){
                    game.team.logo.load(obj.team.logo);
                }
            }

            if(obj.playerMarket){
                game.playerMarket.load(obj.playerMarket);
            }

            if(obj.stadium){
                game.stadium.load(obj.stadium);
            }

            if(obj.currentMatch){
                game.currentMatch = new Match();
                game.currentMatch.load(obj.currentMatch);
            }
            if(obj.nextMatch){
                game.nextMatch = new Match();
                game.nextMatch.load(obj.nextMatch);
            }

            for(let k of Object.keys(obj.moneyUpgrades)){
                game.moneyUpgrades[k].level = obj.moneyUpgrades[k].level;
            }

            if(obj.achievements){
                for(let i = 0; i < obj.achievements.length; i++){
                    //keep working when achievement order changes
                    let ach = game.achievements.find(a => a.title === obj.achievements[i].title);
                    if(ach){
                        ach.completed = obj.achievements[i].completed;
                    }
                }
            }

            game.settings.match.speed = loadVal(obj.settings.match.speed, 1);
            game.settings.match.autoPlay = loadVal(obj.settings.match.autoPlay, false);
            game.settings.match.minAutoPlayStamina = loadVal(obj.settings.match.minAutoPlayStamina, 0);
            game.settings.term = loadVal(obj.settings.term, "Football");
            if(obj.numberFormatter){
                let notation = notations.find(n => n.name === obj.numberFormatter);
                if(notation){
                    game.numberFormatter = notation;
                }
            }
        }
    }
};