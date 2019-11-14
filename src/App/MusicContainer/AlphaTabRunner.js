// https://docs.alphatab.net/develop/  for development Documentation

import player from "./default.sf2";
import PitchDetection from "./PitchDetection";
import p5 from "./sketch";
import Drawer from "./Drawer";
import NoteList from "./NoteList";

class AlphaTabRunner {
    api;
    intervalID;
    drawer;
    noteList;

    /**
     * Initializes the AlphaTab API
     * Displays the piece of music on the screen
     */
    static initializeAPI() {
        // Specifies what tracks to render on load
        this.currentTracks = [0, 1, 2, 3, 4];

        // AlphaTab API settings
        let settings = {
            player: player,
            cursor: true,
            tracks: this.currentTracks,
            layout: "horizontal",
            scrollElement: "#alpha-tab-container"
        };

        // Creates the AlphaTab API
        this.api = new window.alphaTab.platform.javaScript.AlphaTabApi(
            document.querySelector("#alpha-tab-container"),
            settings
        );

        // Listener is executed when AlphaTab is rendered on the screen
        this.api.addPostRenderFinished(() => {
            this.alphaTabRenderFinished();
        });

        // Listener is executed when the player state changes (e.g. play, pause, and stop)
        AlphaTabRunner.api.addPlayerStateChanged(() => {
            this.alphaTabPlayerStateChanged(AlphaTabRunner.api.playerState);
        });
    }

    
    static alphaTabRenderFinished() {
        // TODO: Get this from the database and base it on what part is being sung for
        let topLine = document.getElementById("rect_0");
        let nextLine = document.getElementById("rect_1");

        const lineReadyID = setInterval(() => {
            console.log("running",topLine);
            if (topLine !== null && nextLine !== null) {
                clearInterval(lineReadyID);
                console.log("Done",topLine);
                const topLineHeight = topLine.y.animVal.value;
                const distanceBetweenLines = nextLine.y.animVal.value - topLineHeight;

                AlphaTabRunner.drawer = new Drawer(topLineHeight + 1, distanceBetweenLines);
                AlphaTabRunner.noteList = new NoteList(0);
                AlphaTabRunner.noteList.updateBounds(55, 82);

                p5.setup(AlphaTabRunner.drawer, AlphaTabRunner.noteList);

                // Prepares for microphone input sets up the pitch detection model
                PitchDetection.setupPitchDetection().then(() => {
                    console.log("[info][AlphaTabRunner] Pitch Detection is ready");
                }).catch(err => {
                    console.log(err);
                });
            } else {
                topLine = document.getElementById("rect_0");
                nextLine = document.getElementById("rect_1");
            }
        }, 3);
    }

    static alphaTabPlayerStateChanged(playerState) {
        if (AlphaTabRunner.api.playerState !== 1) {
            p5.background(255);
            PitchDetection.stopPitchDetection(this.intervalID);
        } else {
            // Runs the pitch detection model on microphone input and displays it on the screen
            // TODO: Don't show player controls (e.g. play and pause buttons) until AlphaTab and ML5 are ready
            this.intervalID = PitchDetection.startPitchDetection();
            console.log(this.intervalID);
        }
    }
}

export default AlphaTabRunner;
