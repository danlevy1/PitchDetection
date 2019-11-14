import p5 from "p5";

const p5Sketch = p => {
    let barCursor;
    let alphaTabContainer;
    let drawer;
    let canvas;
    const EXTRA_BAR_VARIANCE = 7;
    let circleSize = 10;
    let noteList;

    p.updateNoteList = function(midiNum) {
        noteList.addNote(this.midiNum);
    }

    p.setup = function(drawerGiven, noteListGiven) {
        if (drawerGiven === undefined || noteListGiven === undefined) {
            p.noLoop();
            return;
        }
        drawer = drawerGiven;
        noteList = noteListGiven;
        barCursor = document.getElementById("bC");
        alphaTabContainer = document.getElementById("alpha-tab-container");
        canvas = p.createCanvas(alphaTabContainer.clientWidth, alphaTabContainer.clientHeight);
        const x = 0;
        const y = 0;
        canvas.position(x, y);
        canvas.parent("sketch-holder");
    };

    p.draw = function() {       
        // sets the background color to grey
        //background(255, 255, 255, 1);
        p.background(245);
        //p.background(255);
        // dont draw the outline of the shape, note: you need to turn stroke on to draw lines as we do below.
        p.noStroke();

        let currentHeight;
        let sharpPos;
        if (drawer) {
            currentHeight = drawer.noteHeight;

            console.log(drawer.note.midiVal);

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
            // draws text
            //text(drawer.note.charPart + " " + drawer.note.octave, posX - 5, height / 2);
        }
        p.fill(255);
    };
};

export default new p5(p5Sketch);
