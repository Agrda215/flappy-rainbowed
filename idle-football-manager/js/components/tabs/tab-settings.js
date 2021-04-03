app.component("tab-settings", {
    data(){
        return {
            saveString: "Your savegame will appear here. Keep it somewhere safe! Make sure to backup often."
        };
    },
    computed: {
        team(){
            return game.team;
        },
        settings(){
            return game.settings;
        }
    },
    methods: {
        restartTutorial(){
            game.restartedTutorial = true;
        },
        exportGame(){
            this.saveString = functions.getSaveString();
        },
        importGame(){
            functions.loadGame(this.saveString);
        },
        download(){
            this.saveString = functions.getSaveString();
            let a = document.createElement("a");
            a.href = "data:text/plain;charset=utf-8," + this.saveString;
            a.download = "idle-soccer-manager-" + Date.now() + ".txt";
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        },
        hardReset(){
            let t = 3;
            while(t > 0 && confirm("Are you sure you really want to erase EVERYTHING? There is no reward and no going back! Click " + t + " more time(s) to confirm")){
                t--;
            }
            if(t === 0){
                functions.loadGame(initalGame);
                initializeGame();
                functions.saveGame();
            }
        }
    },
    template: `<div class="tab-settings">
    <h3 class="big-heading">Team Settings</h3>
    <team-settings :team="team"></team-settings>
    <h3 class="big-heading">Game Settings</h3>
    <div class="card flex">
        <div>
            Term shown in Game Header<br/>
            <label><input type="radio" name="term" v-model="settings.term" value="Football"/> Football</label>
            <label><input type="radio" name="term" v-model="settings.term" value="Soccer"/> Soccer</label><br/>
        </div>
        <div>   
            <label>Match Autoplay <input type="checkbox" v-model="settings.match.autoPlay"/></label><br/>
            <label>Min Avg. Stamina required <input type="range" min="0" max="1" step="any" v-model.number="settings.match.minAutoPlayStamina"/></label>
            <notation-select></notation-select><br/>
        </div>
    </div>
    <button @click="restartTutorial()">Restart Tutorial</button><br/>
    <h3 class="big-heading">Save Management</h3>
    <div>
        <div>
            <button @click="exportGame()">Export Game</button>
            <button @click="importGame()">Import Game</button>
            <button @click="download()">Download Savegame</button>
            <button @click="hardReset()">HARD RESET</button>
        </div>
        <textarea v-model="saveString">
        </textarea>
    </div>
    <h3 class="big-heading">Social</h3>
    <a target="_blank" href="https://discord.gg/75d7Jj5" class="icon-flex"><img alt="" src="images/icons/discord.png"/> Join my Discord Server</a>
    <a target="_blank" href="https://cook1eegames.feedia.co" class="icon-flex"><img alt="" src="images/icons/website.png"/> Visit my Website</a>
</div>`
});