/**
 * Keeps track of current note and where to draw it on the screen along with special information such as number of extra ledger lines
 */
class Drawer {
    /**
     * Creates a new Drawer setting up storage of the most recent midi note and information about how to draw it on the screen
     * @param {Number} topLine Height of the top line of the selected part to sing
     * @param {Number} distanceBetweenLines Distance between lines in the staff
     */
    constructor(topLine, distanceBetweenLines) {
        this.topLine = topLine;
        this.distanceBetweenLines = distanceBetweenLines;
        // stores the height of the lowest line of the staff being sung
        this.firstLine = this.topLine + this.distanceBetweenLines * 5;
        // Values >= selected lower limit and <= selected upper limit don't need extra ledger lines
        this.lowerLimit = 61; // 61 = C4#
        this.upperLimit = 81; // 81 = A5
        this.lowerLimit2 = 40; // 40 = E2
        this.upperLimit2 = 60; // 60 = C4
        this.note = new Note(60);
        this.belowOrAbove = 0;
        this.noteHeight = 0;
        this.updateNote(this.note.midiVal);
    }

    /**
     * Updates the Drawer to the new provided note
     * @param {Number} note New midi value to store. Provide a -1 as a sentinel value for silence 
     */
    updateNote(note) {
        this.note.updateNote(note);
        this.getHeightOfNote();
        this.getExtraFeatures();
    }

    /**
     * Updates the height of the note based on its midi value
     */
    getHeightOfNote() {
        // -1 is a sentinel value for silence which is assigned a default height
        if (this.note.midiVal === -1) {
            this.noteHeight = this.firstLine;
            return;
        }
        // Calculating the height of a note relies on the cycle in musical notes that occurs between octaves
        // This calculates what the height of the note should be based on the first line
        const heightMod = [0, 0, 1, 1, 2, 3, 3, 4, 4, 5, 5, 6];

        // C4 is the starting note so subtract 4 to get base octave
        let octaveMod = this.note.octave - 4;
        let value = heightMod[this.note.midiVal % heightMod.length];

        // Includes bump to jump between octaves
        let totalMod = value + octaveMod * 7;

        // final height includes division by 2 because each value in the totalMod is distanceBetweenLines/2 
        this.noteHeight = this.firstLine - (totalMod * this.distanceBetweenLines) / 2;      
    }

    /**
     * Gets the extra features of a note including how many ledger lines to add
     */
    getExtraFeatures() {
        // -1 is a sentinel value for silence which has no ledger lines
        if (this.note.midiVal === -1) {
            this.belowOrAbove = 0;
            return;
        }

        // similar to note height, there's a cycle between octaves for ledger lines
        const aboveBelowMod = [1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 4, 4, 4, 4];

        // sets up base if ledger lines are even needed. base == 0 means no ledger lines
        // base < 0 means they go below the staff, base > 0 means they go above the staff
        // TODO Ensure this works with Bass clef
        let base = 0;
        if (this.note.midiVal >= this.upperLimit) {
            base = this.upperLimit;
        } else if (this.note.midiVal <= this.lowerLimit) {
            base = -1 * this.lowerLimit;
        }

        // If need ledger lines, then calculate how many are required
        if (base !== 0) {
            let difference = Math.abs(Math.abs(base) - this.note.midiVal);
            let loopAdd = 4 * Math.floor(difference / aboveBelowMod.length);
            let modAmount = difference % aboveBelowMod.length;
            modAmount = aboveBelowMod[modAmount];
            this.belowOrAbove = loopAdd + modAmount;

            // Signals to draw ledger lines below staff
            if (base < 0) {
                this.belowOrAbove *= -1;
            }
        } else {
            this.belowOrAbove = 0;
        }
    }
}

/**
 * Stores midi value as its character representation including its octave and if it is sharp
 */
class Note {
    /**
     * Constructs a Note from a provided a given midiVal and converts it to a string which can be accessed
     * @param {Number} midiVal Midi value of note to store
     */
    constructor(midiVal) {
        this.updateNote(midiVal);
    }

    /**
     * Updates the note stored to the new note
     * @param {Number} note New midi value to store
     */
    updateNote(note) {
        // No point in updating if the midi value matches the current one
        if (this.midiVal && note === this.midiVal) {
            return;
        }

        this.midiVal = note;
        const noteText = this.numToNote();
        this.charPart = noteText.charPart;
        this.octave = noteText.octave;

        // relies on the char part with being a single letter like G or two letters which is the note and # for sharp
        this.isSharp = this.charPart.length === 2;
    }

    /**
     * Gets the octave of the current note
     * @returns The octave of the current note
     */
    getOctave() {
        return Math.floor(this.midiVal / 12) - 1;
    }

    /**
     * Converts the stored midi value to its character representation
     * @returns A tuple with the character part and the octave
     */
    numToNote() {
        let charPart;
        let octave;

        // -1 is a sentinel value for silence which has no char part or octave
        if (this.midiVal === -1) {
            charPart = "-";
            octave = "";
        } else {
            const letters = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
            charPart = letters[this.midiVal % letters.length];
            octave = this.getOctave(this.midiVal);
        }
        return { charPart, octave };
    }
}

export default Drawer;
