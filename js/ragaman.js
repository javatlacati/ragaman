// sorry for the messy code

// constants
CONSONANTS = "ttttttnnnnsssshhhrrrdddlllccmwfgypbvkjxqz";
VOWELS = "eeeeaaaaaoooiii";
ALPHABET = "abcdefghijklmnopqrstuvwxyz";
PRESSURE = ["#000000", "#003322", "#005544", "#008866", "#00aa88", "#00ddaa", "#00eebb"];
SPACE = 32;
ENTER = 13;
BACKSPACE = 8;
TAB = 9;
VALUES = {
    "a": 1,
    "b": 3,
    "c": 3,
    "d": 2,
    "e": 1,
    "f": 4,
    "g": 2,
    "h": 4,
    "i": 1,
    "j": 8,
    "k": 5,
    "l": 1,
    "m": 3,
    "n": 1,
    "o": 1,
    "p": 3,
    "q": 10,
    "r": 1,
    "s": 1,
    "t": 1,
    "u": 1,
    "v": 4,
    "w": 4,
    "x": 8,
    "y": 4,
    "z": 10
};

channel_max = 4;
audiochannels = new Array();

for (i = 0; i < channel_max; i++) {
	audiochannels[i] = new Array();
	audiochannels[i]['channel'] = new Audio();
	audiochannels[i]['finished'] = -1;
}

function playSound(s) {
    if (!sound_on) {
        return;
    }
	for (i = 0; i < audiochannels.length; i++) {
		thistime = new Date();
		if (audiochannels[i]['finished'] < thistime.getTime()) { // is this channel finished?
			audiochannels[i]['finished'] = thistime.getTime() + document.getElementById(s).duration*1000;
			audiochannels[i]['channel'].src = document.getElementById(s).src;
			audiochannels[i]['channel'].load();
			audiochannels[i]['channel'].play();
			break;
		}
	}
}

function init() {
    dom_input.style.fontSize = "70pt";
    pool = "";
    possible_words = null;
    game_over = false;
    current_guess = "";
    score = 0;
    already_guessed = [];
    timeleft = 60;
    pool = "e" + CONSONANTS.shuffle().substring(0,4) + VOWELS.shuffle().substring(0,2);
    pool = pool.shuffle();
    pool_left = pool;
    dom_pool.textContent = pool;
    dom_already_guessed.textContent = "";
    second(timeleft);
    timer = window.setInterval(function() {second();}, 1000);
    dom_pool.textContent = pool;
    dom_input.textContent = "";
    pressure(0);
}

function supports_html5_storage() {
    try {
        return 'localStorage' in window && window['localStorage'] !== null;
    } catch (e) {
        return false;
    }
}

String.prototype.shuffle = function () {
    var a = this.split(""),
        n = a.length;

    for(var i = n - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var tmp = a[i];
        a[i] = a[j];
        a[j] = tmp;
    }
    return a.join("");
}

document.onkeydown = function(e) {
    var key = e.keyCode;
    if (game_over) {
        if (key == SPACE) {
            document.getElementById("main").style.display = "block";
            document.getElementById("scores").style.display = "none";
            init();
        } else {
            return;
        }
    }
    current_guess = dom_input.textContent.toLowerCase();
    if (key == TAB) {
        init();
    }
    if (key == ENTER) {
        // submit
        if (already_guessed.indexOf(current_guess) === -1 && current_guess.length > 0 && checkWord(current_guess)) {
            playSound("send");
            if (current_guess.length >= 6) {
                colorFade("header", "text", PRESSURE[6].substring(1), "FFFFFF", 25, 60);
            }
            var s = calculateScore(current_guess);
            score += s;
            already_guessed.push(current_guess);
            var guess_span = document.createElement("span");
            guess_span.innerHTML += current_guess + "<sup>" + s + "</sup> ";
            guess_span.style.color = PRESSURE[current_guess.length-1];
            dom_already_guessed.appendChild(guess_span);
        }
        pool += current_guess;
        current_guess = "";
        pressure(0);
    } else if (key == BACKSPACE && dom_input.textContent.length > 0) {
        // delete
        pool += current_guess.substr(current_guess.length-1);
        current_guess = current_guess.substr(0,current_guess.length-1);
        pressure(current_guess.length);
    } else if (key == SPACE) {
        // shuffle
        e.preventDefault();
        pool = pool.shuffle();
    } else {
        var character = String.fromCharCode(e.keyCode).toLowerCase();
        var index = pool.indexOf(character);
        if (index != -1) {
            // input
            playSound("type");
            pressure(current_guess.length);
            dom_char_score.innerHTML = "+" + VALUES[character];
            colorFade("char-score", "text", "888888", "FFFFFF", 25, 40);
            current_guess += character;
            pool = pool.substring(0,index) + pool.substring(1+index);
        }
    }
    dom_pool.textContent = pool;
    dom_input.textContent = current_guess;
    dom_score.innerHTML = "Score: " + score + "<br>" + "Time left: " + timeleft;
};

function checkWord(word) {
    return all_words.indexOf(word) != -1;
}

function calculateScore(word) {
    var sc = 0;
    for (var i = 0; i < word.length; i++) {
        sc += VALUES[word[i]];
    }
    return sc + word.length;
}

function pressure(level) {
    dom_input.style.color = PRESSURE[level];
}


function second() {
    if (timeleft == 0) {
        // game over
        // rebuild pool in case stuff was entered already
        clearInterval(timer);
        pool += current_guess;
        document.getElementById("main").style.display = "none";
        document.getElementById("scores").style.display = "block";
        if (scores != null) {
            // add highscore if relevant
            var i = 0;
            while (i < scores.length && scores[i][1] > score) {
                i++;
            }
            if (score > 0 && i < 10) {
                scores.splice(i, 0, [pool, score]);
                if (scores.length > 10) {
                    scores.pop();
                }
            }
            build_score_table(scores, score > 0 ? i : 10);
            save_scores();
        }
        dom_input.textContent = "";
        //dom_time.textContent = "";
        game_over = true;
    } else {
        timeleft--;
        //dom_time.textContent = "Time left: " + timeleft;
        dom_score.innerHTML = "Score: " + score + "<br>" + "Time left: " + timeleft;
    }
}

function build_score_table(sc, pos) {
    dom_scores.innerHTML = "<h1>"
    if (pos < 10) {
        dom_scores.innerHTML += "<b>New Highscore!</b> ";
    }
    dom_scores.innerHTML += "Your Highscores:</h1>";
    var tbl = document.createElement("table");
    for (var i = 0; i < sc.length; i++) {
        var tr = document.createElement("tr");
        var tbl_pool = document.createElement("td");
        var tbl_score = document.createElement("td");
        var tbl_place = document.createElement("td");
        tbl_place.textContent = (i+1);
        tbl_pool.textContent = sc[i][0];
        tbl_score.textContent = sc[i][1];
        tr.appendChild(tbl_place);
        tr.appendChild(tbl_score);
        tr.appendChild(tbl_pool);
        if (i == pos) {
            tr.style.color = PRESSURE[6];
            tr.style.fontWeight = "bold";
        }
        tbl.appendChild(tr);
    }
    dom_scores.appendChild(tbl);
    dom_scores.innerHTML += "Press space to start a new game.";
}

function load_scores() {
    scores = [];
    if (supports_html5_storage()) {
        if (localStorage["hasscores"] == "true") {
            for (var i = 0; i < 10; i++) {
                if (localStorage["score_" + i] == null) {
                    break;
                }
                var s = parseInt(localStorage["score_" + i]);
                var p = localStorage["pool_" + i];
                scores.push([p, s]);
            }
        }
    }
}

function save_scores() {
    if (supports_html5_storage()) {
        for (var i = 0; i < scores.length; i++) {
            localStorage["pool_" + i] = scores[i][0];
            localStorage["score_" + i] = scores[i][1];
        }
        localStorage["hasscores"] = "true";
    }
}

window.onload = function() {
    sound_on = true;
    load_scores();
    dom_scores = document.getElementById("scores");
    dom_input = document.getElementById("inner-input");
    dom_score = document.getElementById("score");
    dom_pool = document.getElementById("current-pool");
    dom_time = document.getElementById("time");
    dom_char_score = document.getElementById("char-score");
    dom_already_guessed = document.getElementById("already-guessed");
    all_words = document.getElementById("allwords").textContent.split("\n");
    dom_sound = document.getElementById("sound");
    dom_soundoff = document.getElementById("mute");
    dom_soundon = document.getElementById("high");
    dom_sound.onclick = function() {
        if (sound_on) {
            dom_soundoff.style.display = "none";
            dom_soundon.style.display = "block";
            sound_on = false;
            localStorage["sound"] = "false";
        }
        else {
            dom_soundoff.style.display = "block";
            dom_soundon.style.display = "none";
            sound_on = true;
            localStorage["sound"] = "true";
        }
    };
    if (localStorage["sound"] == "false") {
        dom_sound.onclick();
    }
    init();
};
