// https://docs.alphatab.net/develop/  for development Documentation

import player from "./default.sf2";
import PitchDetection from "./PitchDetection";
import Drawer from "./Drawer";
import NoteList from "./NoteList";
import p5 from "./sketch";

class AlphaTabRunner {
    api;
    barCursor;
    alphaTabSurface;
    noteList = new NoteList(0);
    drawer;
    intervalID;

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
            layout: "horizontal"
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
        this.barCursor = document.getElementById("bC");
        this.alphaTabSurface = document.getElementById("aTS");
        this.setupCanvas();
        // TODO: Get this from the database and base it on what part is being sung for
        // this.noteList.updateBounds(55, 82);
        const topLine = document.getElementById("rect_0");
        const topLineHeight = topLine.y.animVal.value;
        const nextLine = document.getElementById("rect_1");
        const distanceBetweenLines = nextLine.y.animVal.value - topLineHeight;
        this.drawer = new Drawer(topLineHeight + 1, distanceBetweenLines);

        // Prepares for microphone input sets up the pitch detection model
        PitchDetection.setupPitchDetection().then(() => {
            console.log("[info][AlphaTabRunner] Pitch Detection is ready");
        }).catch(err => {
            console.log(err);
        });
    }

    static alphaTabPlayerStateChanged(playerState) {
        if (AlphaTabRunner.api.playerState !== 1) {
            this.canListen = false;
            p5.background(255);
            PitchDetection.stopPitchDetection(this.intervalID);
        } else {
            this.canListen = true;

            // Runs the pitch detection model on microphone input and displays it on the screen
            // TODO: Don't show player controls (e.g. play and pause buttons) until AlphaTab and ML5 are ready
            this.intervalID = PitchDetection.startPitchDetection();
            console.log(this.intervalID);
        }
    }

    static setupCanvas() {
        // if (this.alphaTabSurface.clientWidth === 0 || this.alphaTabSurface.clientHeight === 0 || this.canDraw) {
        //     return;
        // }
        // this.canvas = p5.createCanvas(this.alphaTabSurface.clientWidth, this.alphaTabSurface.clientHeight);
        // const x = 0;
        // const y = 0;
        // this.canvas.position(x, y);
        // this.canvas.parent("sketch-holder");
        // // textCoordinates = [window.width / 2, 30];
        // this.canDraw = true;
    }
}

export default AlphaTabRunner;
