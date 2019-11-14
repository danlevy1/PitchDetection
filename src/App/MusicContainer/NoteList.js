const MAX_SIZE = 5;

/**
 * Keeps a list of midi values to serve as a sample of the MAX_SIZE last midi values heard.
 */
class NoteList {

    /**
     * Creates a NoteList defaulting the lower pitch bound to 21 = A0 and the upper pitch bound to 127 = G9
     * @param {Number} element Initial midi value to be stored in the list of values
     */
    constructor(element) {
        this.elements = [element];
        this.pointer = 0;
        this.total = element;
        this.average = element;
        this.lowerPitchBound = 21;
        this.upperPitchBound = 127;
    }

    /**
     * Adds a midi value to the list of values overwriting the oldest value if full
     * @param {Number} element Midi value to be stored in the list of values
     */
    addNote(element) {
        // Adds element to the list overwriting the oldest value if full
        if (this.elements.length < MAX_SIZE) {
            this.elements.push(element);
        } else {
            this.total -= this.elements[this.pointer];
            this.elements[this.pointer] = element;
            this.pointer = (this.pointer + 1) % MAX_SIZE;
        }
        this.total += element;
        this.average = Math.round(this.total / this.elements.length);

        // if the provided midi value is 0, this is the special value for silence
        // Also display silence if the average is out of bounds
        if (
            element === 0 ||
            this.average < this.lowerPitchBound ||
            this.average > this.upperPitchBound
        ) {
            // -1 is the sential value for silence to be diplayed
            this.average = -1;
        }
    }

    /**
     * Updates the lower and upper bounds on the average in terms of midi values
     * @param {Number} lowerBound Averages less than this midi value will be ignored
     * @param {Number} upperBound Averages greater than this midi value will be ignored
     */
    updateBounds(lowerBound, upperBound) {
        this.lowerPitchBound = lowerBound;
        this.upperPitchBound = upperBound;
    }
}

export default NoteList;