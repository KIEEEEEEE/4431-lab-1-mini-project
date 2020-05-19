// The last played key number
var analyser, canvas, ctx;

var last_key_number = -1;
var selectedNotes = [];
var blackkeys = [1, 3, 6, 8, 10, 13, 15, 18, 20, 22];
var playing = false;
var playCurrent = 0;
var stopAt = 0;
var clockWorker;
var prevNote = [];
var tracks = [];
var contTrue = [];
var trackCont = [];
// Map the key with the key number
var key_mapping = {
    // White keys of the first octave
    "z": 0, "x": 2, "c": 4, "v": 5, "b": 7, "n": 9, "m": 11,
    // Black keys of the first octave
    "s": 1, "d": 3, "g": 6, "h": 8, "j": 10,
    // White keys of the second octave
    "w": 12, "e": 14, "r": 16, "t": 17, "y": 19, "u": 21, "i": 23,
    // Black keys of the second octave
    "3": 13, "4": 15, "6": 18, "7": 20, "8": 22
}

var note_mapping = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B", "C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"]


function handleNoteOn(key_number) {
    // Find the pitch
    var pitch = parseInt($("#pitch").val()) + key_number;
    console.log("pitch: " + pitch);
    /*
     * You need to use the slider to get the lowest pitch number above
     * rather than the hardcoded value
     */

    // Extract the amplitude value from the slider
    var amplitude = parseInt($("#amplitude").val());

    // Use the two numbers to start a MIDI note


    /*
     * You need to handle the chord mode here
     */

    var mode = $(":radio[name=play-mode]:checked").val();
    if (mode == "single") {
        MIDI.noteOn(0, pitch, amplitude);
    }
    else if (mode == "major") {
        MIDI.noteOn(0, pitch, amplitude);
        (pitch + 4) <= 108 ? MIDI.noteOn(0, pitch + 4, amplitude) : console.log("+4 on out of range");
        (pitch + 7) <= 108 ? MIDI.noteOn(0, pitch + 7, amplitude) : console.log("+7 on out of range");
    }
    else if (mode == "minor") {
        MIDI.noteOn(0, pitch, amplitude);
        (pitch + 3) <= 108 ? MIDI.noteOn(0, pitch + 3, amplitude) : console.log("+3 on out of range");
        (pitch + 7) <= 108 ? MIDI.noteOn(0, pitch + 7, amplitude) : console.log("+7 on out of range");
    }


}

function handleNoteOff(key_number) {
    // Find the pitch
    var pitch = parseInt($("#pitch").val()) + key_number;
    /*
     * You need to use the slider to get the lowest pitch number above
     * rather than the hardcoded value
     */

    // Send the note off message for the pitch
    MIDI.noteOff(0, pitch);


    /*
     * You need to handle the chord mode here
     */

    var mode = $(":radio[name=play-mode]:checked").val();
    if (mode == "single") {
        MIDI.noteOff(0, pitch);
    }
    else if (mode == "major") {
        MIDI.noteOff(0, pitch);
        (pitch + 4) <= 108 ? MIDI.noteOff(0, pitch + 4) : console.log("+4 off out of range");
        (pitch + 7) <= 108 ? MIDI.noteOff(0, pitch + 7) : console.log("+7 off out of range");
    }
    else if (mode == "minor") {
        MIDI.noteOff(0, pitch);
        (pitch + 3) <= 108 ? MIDI.noteOff(0, pitch + 3) : console.log("+3 off out of range");
        (pitch + 7) <= 108 ? MIDI.noteOff(0, pitch + 7) : console.log("+7 off out of range");
    }
}

function handlePianoMouseDown(evt) {
    // Determine which piano key has been clicked on
    // evt.target tells us which item triggered this function
    // The piano key number is extracted from the key id (0-23)
    var key_number = $(evt.target).attr("id").substring(4);
    key_number = parseInt(key_number);

    // Start the note
    handleNoteOn(key_number);

    // Show a simple message in the console
    console.log("Piano mouse down event for key " + key_number + "!");

    // Remember the key number
    last_key_number = key_number;
}

function handlePianoMouseUp(evt) {
    // last_key_number is used because evt.target does not necessarily
    // equal to the key that has been clicked on 
    if (last_key_number < 0) return;

    // Stop the note
    handleNoteOff(last_key_number);

    // Show a simple message in the console
    console.log("Piano mouse up event for key " + last_key_number + "!");

    // Reset the key number
    last_key_number = -1;
}

function handlePageKeyDown(evt) {
    // Exit the function if the key is not a piano key
    // evt.key tells us the key that has been pressed
    if (!(evt.key in key_mapping)) return;

    // Find the key number of the key that has been pressed
    var key_number = key_mapping[evt.key];

    // Avoid playing a note with the key repeat
    if (key_number == last_key_number) return;

    // Start the note
    handleNoteOn(key_number);

    // Select the key
    $("#key-" + key_number).focus();

    // Show a simple message in the console
    console.log("Page key down event for key " + key_number + "!");

    // Remember the key number
    last_key_number = key_number;
}

function handlePageKeyUp(evt) {
    // Exit the function if the key is not a piano key
    // evt.key tells us the key that has been released
    if (!(evt.key in key_mapping)) return;

    // Find the key number of the key that has been released
    var key_number = key_mapping[evt.key];

    // Stop the note
    handleNoteOff(key_number);

    // Show a simple message in the console
    console.log("Page key up event for key " + key_number + "!");

    // Reset the key number
    last_key_number = -1;
}


/*
 * You need to write an event handling function for the instrument
 */

function handleInstrumentEvent() {
    var instrument = parseInt($("#instruments").val());
    console.log("instrument: " + instrument);
    MIDI.programChange(0, instrument);
}

function saveRecord() {
    console.log("SaveRecordSelectedNotes", selectedNotes);
    document.getElementById("tracks").value = "";
    var option = document.createElement("option");
    option.text = "Track " + (tracks.length + 1);
    option.value = tracks.length;
    option.setAttribute('instrument', parseInt($("#instruments").val()));
    option.setAttribute('tempo', parseFloat($("#tempo").val()));
    option.id = 'track' + (tracks.length + 1);
    var select = document.getElementById("tracks");
    console.log(option);
    select.appendChild(option);
    var newRecord = [...selectedNotes];
    var newCont = [...contTrue];
    tracks.push(newRecord);
    trackCont.push(newCont);
    console.log(tracks[tracks.length - 1] === selectedNotes);
    console.log(trackCont[tracks.length - 1] === contTrue);
    clearTable();
    generateTable();
}

function playRecord() {
    console.log("playRecordSelectedNotes", selectedNotes);

    if (!playing) {
        document.getElementById("play").innerHTML = "Reset";
        playing = true;
        console.log(selectedNotes);
        console.log(contTrue);
        var timeLength = parseInt($("#time").val());
        var tempo = parseFloat($("#tempo").val());
        console.log("got tempo: " + $("#tempo").val());
        if (window.Worker) {
            if (clockWorker == undefined)
                clockWorker = new Worker("clock_worker.js");
            var message = { startClock: { tempo, timeLength } }
            clockWorker.postMessage(message);
            clockWorker.onmessage = function (event) {
                document.getElementById("result").innerHTML = "t = " + event.data;
                console.log(selectedNotes[event.data]);
                for (var i = 0; i < 24; i++) {
                    if (event.data == timeLength) {
                        handleNoteOff(i);
                    }
                    else {
                        if (prevNote == null) {
                            for (var i = 0; i < selectedNotes[event.data].length; i++) {
                                handleNoteOn(selectedNotes[event.data][i]);
                            }
                            prevNote = selectedNotes[event.data];
                        }

                        else {
                            if ((prevNote.includes(i) || contTrue[event.data].includes(i)) && selectedNotes[event.data].includes(i)) {
                                console.log("yy");
                                var index = prevNote.indexOf(selectedNotes[event.data][i]);
                                var note = document.getElementById('key-' + i + '-' + (event.data - 1));
                                if (!contTrue[event.data].includes(i)) {
                                    console.log("not cont");
                                    handleNoteOff(i);
                                    prevNote.splice(index, 1);
                                }
                            }
                            if (prevNote.includes(i) && !contTrue[event.data].includes(i) && !selectedNotes[event.data].includes(i)) {
                                console.log("yn note off")
                                handleNoteOff(i);
                            }
                            if ((!prevNote.includes(i) || !contTrue[event.data].includes(i)) && selectedNotes[event.data].includes(i)) {
                                console.log("ny note on");
                                handleNoteOn(i);
                            }
                        }
                    }

                }
                for (var i = 0; i < selectedNotes[event.data].length; i++) {
                    prevNote[i] = selectedNotes[event.data][i];
                }
            }

        };
    }
    else {
        stopRecord();
        playing = false;
        document.getElementById("play").innerHTML = "Play";
    }

}


function stopRecord() {
    clockWorker.terminate();
    clockWorker = undefined;
    prevNote = [];
    document.getElementById("result").innerHTML = "t = " + 0;
}

// visualize the notes in the selected track in the table
function updateVisualize(track) {
    // clearButton();
    var e = document.getElementById("tracks");
    var value = e.options[e.selectedIndex].value;
    var table = document.querySelector("table");
    var rowNum = table.rows.length;
    var colNum = table.rows[0].cells.length;

    for (var i = 0; i < rowNum; i++) {
        for (var j = 0; j < colNum - 1; j++) {
            var button = table.rows[rowNum - 1 - i].cells[j + 1].firstElementChild;
            if (tracks[value][j] != null && tracks[value][j].includes(i)) {
                // console.log("trackCont: " + trackCont[value][j]);
                if (trackCont[value][j] != null && trackCont[value][j].includes(i)) {
                    console.log("update to red");
                    button.style.backgroundColor = "red";
                }
                else {
                    button.style.backgroundColor = "green";
                }



            }
        }
    }
}


// Generate a table with 24 keys (matching the keyboard) and the input time length
// The table size is 24 rows x (timeLength) columns
function generateTable() {
    var timeLength = parseInt($("#time").val());
    // console.log("timeLength: " + timeLength);
    var table = document.querySelector("table");
    clearTable();

    // Each box in the table will contain a button, with an id (key-(key_number)-timestamp) and an onclick function
    // The button id is similar to the keyboard buttons in lab01.html, can refer to it
    // The onclick function is noteSelected, which can be found below
    for (var i = 0; i < 24; i++) {
        let row = table.insertRow();
        for (var j = 0; j <= timeLength; j++) {
            let cell = row.insertCell();
            let button = document.createElement("button");
            button.id = 'key-' + (23 - i) + '-' + (j - 1);

            button.addEventListener("mousedown", handlePianoMouseDown);
            button.addEventListener("mouseup", handlePianoMouseUp);
            button.style.width = "100px";
            button.style.height = "16px";
            cell.appendChild(button);
            cell.style["line-height"] = "0px";

            if (j == 0) {
                button.innerHTML = note_mapping[23 - i];
                button.style.textAlign = "right";
                if (blackkeys.includes(i)) {
                    button.style.backgroundColor = "black";
                    button.style.color = "white";
                    button.style.border = "1px solid gray";
                }
                else {
                    button.style.backgroundColor = "white";
                    button.style.color = "black";
                    button.style.border = "1px solid black";
                }

            }
            else {
                button.addEventListener("click", noteSelected);
                button.setAttribute('cont', false);
                selectedNotes[j - 1] = [];
                contTrue[j - 1] = [];
            }
        }
    }
    table.style.marginLeft = "65px";
}

function clearTable() {
    var Parent = document.querySelector("table");;
    while (Parent.hasChildNodes()) {
        Parent.removeChild(Parent.firstChild);
    }
    selectedNotes = [];
    prevNote = [];
    contTrue = [];
}

function clearButton() {
    clearTable();
    generateTable();
}

function changeTrack() {
    selectedNotes = [];
    prevNote = [];
    contTrue = [];
    var e = document.getElementById("tracks");
    var value = e.options[e.selectedIndex].value;
    var instrument = e.options[e.selectedIndex].getAttribute('instrument');
    var tempo = e.options[e.selectedIndex].getAttribute('tempo');
    document.getElementById("instruments").value = instrument;
    document.getElementById("tempo").value = tempo;
    // selectedNotes = tracks[value].slice();
    // contTrue = trackCont[value].slice();

    clearButton();

    if (tracks.length != 0 && $("#tracks").val() != "") {
        console.log(tracks);
        var e = document.getElementById("tracks");
        var value = e.options[e.selectedIndex].value;
        var instrument = e.options[e.selectedIndex].getAttribute('instrument');
        for (var i = 0; i < tracks[value].length; i++) {
            selectedNotes[i] = [];
            for (var j = 0; j < tracks[value][i].length; j++) {
                if (tracks[value][i][j] != null)
                    selectedNotes[i][j] = tracks[value][i][j];
            }
        }

        for (var i = 0; i < trackCont[value].length; i++) {
            contTrue[i] = [];
            for (var j = 0; j < trackCont[value][i].length; j++) {
                if (trackCont[value][i][j] != null)
                    contTrue[i][j] = trackCont[value][i][j];
            }
        }

        console.log("changeTrackselectedNotes" + selectedNotes);
        console.log("changeTrackcontTrue" + contTrue);

        handleInstrumentEvent();
        updateVisualize();
    }


}

function updateTrack() {
    console.log("updateTrack");
    var trackNumber = $("#tracks").val();
    var time = $("#time").val();
    var e = document.getElementById("tracks");
    // var value = e.options[e.selectedIndex].value;
    e.options[e.selectedIndex].setAttribute('instrument', parseInt($("#instruments").val()));
    e.options[e.selectedIndex].setAttribute('tempo', parseFloat($("#tempo").val()));
    console.log(selectedNotes);
    console.log(contTrue);
    tracks[trackNumber] = selectedNotes.slice();
    trackCont[trackNumber] = contTrue.slice();
    console.log(tracks[trackNumber] === selectedNotes);
    console.log(trackCont[trackNumber] === contTrue);
    // console.log("updated track: " + tracks[trackNumber]);
    // console.log("updated contTrue: " + trackCont[trackNumber]);

}

// Change the color of the buttons on the table when clicked and store/remove the clicked button's id in the selectedNotes array
// Initial : white ; clicked once : green ; clicked twice : red ; clicked again : return to white
function noteSelected(e) {
    //get the element that is clicked
    var ele = e.target;

    //get the element id of the element that is clicked
    var eleId = ele.id;

    //get the cont attribute to see whether the note is a cont note
    var eleCont = ele.getAttribute('cont');

    // console.log(eleId);

    var key_number = $(e.target).attr("id").substring(4, 6);
    key_number = parseInt(key_number);

    var timestamp = $(e.target).attr("id").substring(6);
    timestamp = parseInt(timestamp);

    if (timestamp == '-0') {
        timestamp = 0;
        timestamp = parseInt(timestamp);
    }

    if (timestamp < 0)
        timestamp *= -1;

    // console.log(key_number,timestamp);


    if (ele.style.backgroundColor == "green") {
        ele.style.backgroundColor = "red";
        ele.setAttribute('cont', true);
        // selectedNotes[timestamp].push(key_number);
        contTrue[timestamp].push(key_number);
        console.log(selectedNotes);
    }
    else if (ele.style.backgroundColor == "red") {
        var remove = selectedNotes[timestamp].indexOf(key_number);
        selectedNotes[timestamp].splice(remove, 1);
        var contIndex = contTrue[timestamp].indexOf(key_number);
        contTrue[timestamp].splice(contIndex, 1);
        ele.style.backgroundColor = "white";
        ele.setAttribute('cont', false);
    }
    else {
        ele.style.backgroundColor = "green";
        ele.setAttribute('cont', false);
        selectedNotes[timestamp].push(key_number);
        console.log(selectedNotes);
    }

    // console.log(ele.getAttribute('cont'));
}



$(document).ready(function () {
    // Show a loading window
    $("#loading").modal({ backdrop: "static", keyboard: false, show: true });

    MIDI.loadPlugin({
        soundfontUrl: "./midi-js/soundfont/",
        instruments: [
            "trumpet"
            /*
             * You can preload the instruments here if you add the instrument
             * name in the list here
             */
        ],
        onprogress: function (state, progress) {
            // console.log(state, progress);
        },
        onsuccess: function () {
            // Resuming the AudioContext when there is user interaction
            $("body").click(function () {
                if (MIDI.getContext().state != "running") {
                    MIDI.getContext().resume().then(function () {
                        console.log("Audio Context is resumed!");
                    });
                }
            });

            // Finish loading the page
            $("#loading").modal("hide");

            // At this point the MIDI system is ready
            MIDI.setVolume(0, 127);     // Set the volume level
            MIDI.programChange(0, 56);  // Use the General MIDI 'trumpet' number

            // Set up the event handlers for all the buttons
            // $("button").on("mousedown", handlePianoMouseDown);
            // $("button").on("mouseup", handlePianoMouseUp);

            // Set up key events
            // $(document).keydown(handlePageKeyDown);
            // $(document).keyup(handlePageKeyUp);

            $("#play").on("click", playRecord);
            $("#clear").on("click", clearButton);
            $("#save").on("click", saveRecord);
            $("#update").on('click', updateTrack);

            /*
             * You need to set up the event for the instrument 
             */

            $("#instruments").on('change', handleInstrumentEvent);
            $("#time").on('change', generateTable);
            $("#tracks").on('change', changeTrack);
            $("#update").on('change', changeTrack);


            generateTable();

        }
    });
});
