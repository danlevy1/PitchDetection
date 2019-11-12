import ml5 from "ml5";

class PitchDetection {
    audioContext;
    micStream;
    pitchDetectionModel;
    label;

    /**
     * Sets up pitch detection
     */
    static setupPitchDetection() {
        return new Promise((resolve, reject) => {
            // Create AudioContext instance
            this.audioContext = new AudioContext();

            // Starts microphone stream if available
            if (navigator.mediaDevices) {
                navigator.mediaDevices
                    .getUserMedia({ audio: true })
                    .then(micStream => {
                        this.micStream = micStream;

                        // Sets up ML5 pitch detection
                        this.ml5Setup()
                            .then(model => {
                                this.pitchDetectionModel = model;
                                resolve();
                            })
                            .catch(err => {
                                reject(`[error][PitchDetection] ${err}`);
                            });
                    })
                    .catch(err => {
                        reject();
                    });
            } else {
                reject("[warning][PitchDetection] Cannot access microphone");
            }
        });
    }

    /**
     * Sets up ML5 pitch detection
     */
    static ml5Setup() {
        // Label element to display frequency
        this.label = document.querySelector("#frequency");

        // Creates pitch detection model
        return ml5.pitchDetection("./model/", this.audioContext, this.micStream).ready;
    }

    /**
     * Continuously detects pitch and displays it on the screen
     * @returns The id of the current setInterval process (this can be used to stop the current setInterval process)
     */
    static startPitchDetection() {
        // Run nested anonymous function every 1 ms
        return setInterval(() => {
            console.log("CALL");
            // Gets the current pitch and sends it to displayMidi
            this.pitchDetectionModel.getPitch().then(frequency => {
                this.displayMidi(frequency);
            }).catch(err => {
                console.log(`[error][PitchDetection] ${err}`);
                this.displayMidi(-1);
            });
        }, 1);
    }

    /**
     * Stops the detection of the pitch
     * @param {number} setIntervalID The id of the setInterval process to stop
     */
    static stopPitchDetection(setIntervalID) {
        clearInterval(setIntervalID);
    }

    /**
     * Displays the frequency as a midi value on the piece of music
     * @param {number} frequency The frequency to convert and display
     */
    static displayMidi(frequency) {
        // TODO: I currently pass in a frequency >= 0 if there was no error, or -1 if there was an error
        // TODO: I keep getting -Infinity which is an error here. Why is that? I think it should be 0 for silence.
        if (frequency >= 0) {
            // Converts frequency to midi value
            let midiNum = (Math.log(frequency / 440) / Math.log(2)) * 12 + 69;
            
            // Displays the frequency
            this.label.textContent = frequency.toString();

            // this.noteList.addNote(this.midiNum);
            // this.drawer.updateNote(this.noteList.average);
        } else {
            // Displays error message
            this.label.textContent = "ERROR";

            // this.noteList.addNote(0);
            // this.drawer.updateNote(this.noteList.average);
        }
    }
}

export default PitchDetection;
