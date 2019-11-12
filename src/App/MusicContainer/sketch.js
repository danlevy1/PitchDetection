import p5 from "p5";

const p5Sketch = p => {
    let barCursor;
    let canDraw = false;
    let canListen = false;
    let drawer;
    const EXTRA_BAR_VARIANCE = 7;
    let circleSize = 10;

    p.setup = function() {};

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
};

export default new p5(p5Sketch);
