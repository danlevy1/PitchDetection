// https://docs.alphatab.net/develop/  for development Documentation

import player from "./default.sf2";
import PitchDetection from "./PitchDetection";
import p5 from "./sketch";
import Drawer from "./Drawer";
import NoteList from "./NoteList";

/**
 * Runs AlphaTab including initialization and keeping a Drawer and NoteList instance
 */
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
        // TODO Pull from database on last loaded tracks
        // Specifies what tracks to render on load
        this.currentTracks = [0, 1, 2, 3, 4];

        // AlphaTab API settings
        let settings = {
            player: player,
            cursor: true,
            tracks: this.currentTracks,
            layout: "horizontal",
            scrollElement: "#wrapper"
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

    /**
     * Run when AlphaTab is rendered on the screen
     * TODO Fix so that it updates the variables on subsequent alphaTab renders besides the first one
     */
    static alphaTabRenderFinished() {
        // TODO: Get this from the database and base it on what part is being sung for
        // Retrieves staff lines using IDs attacked to elements generated by AlphaTab. Required editing AlphaTab.js directly
        let topLine = document.getElementById("rect_0");
        let nextLine = document.getElementById("rect_1");

        // We were getting an error where rect_0 or rect_1 were null even though AlphaTab said they were rendered
        // This sets up an interval to keep waiting for them to not be null before moving on with the render process
        const lineReadyID = setInterval(() => {
            // logs are for debugging purposes if this fix doesn't work as described above
            console.log("running",topLine);

            if (topLine !== null && nextLine !== null) {
                // stop interval from running
                clearInterval(lineReadyID);
                console.log("Done",topLine);

                // retrieves the height of the staff lines based on a relative offset to their wrapping contanier
                // used to setup the canvas so the canvas needs to be directly on top of the alphaTab container where these are stored
                const topLineHeight = topLine.y.animVal.value;
                const distanceBetweenLines = nextLine.y.animVal.value - topLineHeight;

                // TODO Update these values on subsequent renders since we just need to update their bounds
                // Creates a new drawer and noteList
                AlphaTabRunner.drawer = new Drawer(topLineHeight + 1, distanceBetweenLines);
                AlphaTabRunner.noteList = new NoteList(0);

                // TODO: Pull this from database
                AlphaTabRunner.noteList.updateBounds(55, 82);
                
                p5.setup(AlphaTabRunner.drawer);

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
            // TODO Consider moving this to clearing when starting. Will need to store performance so way because canvas currently
            // moves across the screen which would make the line making tricky...Consider how to solve this problem
            // Clears the canvas of performance upon stopping the music or when the music finishes playing
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
