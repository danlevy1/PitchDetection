import p5 from "p5";
import "p5/lib/addons/p5.sound";
import ml5 from "ml5";
import Drawer from "./Drawer";
import NoteList from "./NoteList";
import AlphaTabState from "./AlphaTabState";

function sketch(p) {
    // Pitch variables
    let canvas;

    // Circle variables
    let circleSize = 10;
    // const scale = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

    // Text variables
    // let textCoordinates;
    let canDraw = false;
    let canListen = false;
    let drawer = undefined;
    let midiNum;
    const EXTRA_BAR_VARIANCE = 7;
    let noteList = new NoteList(0);
    let audioContext;
    let mic;
    let pitch;

    let barCursor;
    let alphaTabSurface;

    p.setup = function() {
        audioContext = p.getAudioContext();
        mic = new p5.AudioIn();
        mic.start(startPitch);
    };

    function startPitch() {
        pitch = ml5.pitchDetection("model", audioContext, mic.stream, modelLoaded);
    }

    function modelLoaded() {
        console.log("[sketch.js] ml5 model loaded");
        pitch.getPitch(getFrequency);
    }

    function getFrequency(err, frequency) {
        if (frequency) {
            midiNum = p.freqToMidi(frequency);
            noteList.addNote(midiNum);
            if (drawer) {
                drawer.updateNote(noteList.average);
            }
        } else {
            noteList.addNote(0);
            if (drawer) {
                drawer.updateNote(noteList.average);
            }
        }
        pitch.getPitch(getFrequency);
    }

    function setupCanvas() {
        if (alphaTabSurface.clientWidth === 0 || alphaTabSurface.clientHeight === 0 || canDraw) {
            return;
        }
        canvas = p.createCanvas(alphaTabSurface.clientWidth, alphaTabSurface.clientHeight);
        const x = 0;
        const y = 0;
        canvas.position(x, y);
        canvas.parent("sketch-holder");
        // textCoordinates = [window.width / 2, 30];
        canDraw = true;
    }

    function alphaTabRenderFinished() {
        barCursor = document.getElementById("bC");
        alphaTabSurface = document.getElementById("aTS");
        setupCanvas();
        // TODO: Get this from the database and base it on what part is being sung for
        noteList.updateBounds(55, 82);
        const topLine = document.getElementById("rect_0");
        const topLineHeight = topLine.y.animVal.value;
        const nextLine = document.getElementById("rect_1");
        const distanceBetweenLines = nextLine.y.animVal.value - topLineHeight;
        drawer = new Drawer(topLineHeight + 1, distanceBetweenLines);
    }

    function alphaTabPlayerStateChanged(alphaTabState) {
        if (alphaTabState === AlphaTabState.STOPPED) {
            canListen = false;
            p.background(255);
            // document.querySelector("#button-play-img").src = "img/Play.png";
        } else {
            canListen = true;
        }
    }

    function x() {
        console.log(p.getAudioContext());
        if (p.getAudioContext().state !== "running") {
            p.getAudioContext().resume();
        }
    }

    p.myCustomRedrawAccordingToNewPropsHandler = function(props) {
        if (props.alphaTabState === AlphaTabState.RENDERED) {
            alphaTabRenderFinished();
        } else if (
            props.alphaTabState === AlphaTabState.PLAYING ||
            props.alphaTabState === AlphaTabState.STOPPED
        ) {
            alphaTabPlayerStateChanged(props.alphaTabState);
        }
        x();
    };

    p.draw = function() {
        if (!canDraw || !canListen) {
            return;
        }
        // sets the background color to grey
        //background(255, 255, 255, 1);
        p.background(140);
        //background(255);
        // dont draw the outline of the shape, note: you need to turn stroke on to draw lines as we do below.
        p.noStroke();

        let currentHeight;
        let sharpPos;
        if (drawer) {
            currentHeight = drawer.noteHeight;

            // fills with pink
            p.fill(255, 0, 255);
            // draws ellipse //barCursor.getClientRects()[0].left.valueOf();
            let posX = barCursor.getClientRects()[0].left.valueOf() + window.scrollX;
            sharpPos = [posX - 14, currentHeight + 3.5];
            p.ellipse(posX, currentHeight, circleSize, circleSize);
            if (drawer.note.midiVal < 0) {
                p.stroke(0);
                p.line(
                    posX - EXTRA_BAR_VARIANCE,
                    currentHeight + EXTRA_BAR_VARIANCE,
                    posX + EXTRA_BAR_VARIANCE,
                    currentHeight - EXTRA_BAR_VARIANCE
                );
                p.line(
                    posX + EXTRA_BAR_VARIANCE,
                    currentHeight + EXTRA_BAR_VARIANCE,
                    posX - EXTRA_BAR_VARIANCE,
                    currentHeight - EXTRA_BAR_VARIANCE
                );
                p.noStroke();
            }
            if (drawer.note.isSharp) {
                p.text("#", sharpPos[0], sharpPos[1]);
            }

            if (drawer.belowOrAbove !== 0) {
                let isIncreasing = drawer.belowOrAbove > 0;
                p.stroke(0);
                let height = isIncreasing
                    ? drawer.topLine
                    : drawer.firstLine - drawer.distanceBetweenLines;
                for (let i = 0; i < Math.abs(drawer.belowOrAbove); i++) {
                    if (isIncreasing) {
                        height -= drawer.distanceBetweenLines;
                    } else {
                        height += drawer.distanceBetweenLines;
                    }
                    p.line(posX - EXTRA_BAR_VARIANCE, height, posX + EXTRA_BAR_VARIANCE, height);
                }
                p.noStroke();
            }

            // fills with white
            p.fill(255);
            // draws text
            //text(drawer.note.charPart + " " + drawer.note.octave, posX - 5, height / 2);
        }
    };
}

export default sketch;
