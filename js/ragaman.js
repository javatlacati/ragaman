// constants
ROUND_LENGTH = 60;
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
STATE_GAME_ON = 0;
STATE_GAME_OVER = 1;

function Ragaman() {
    this.dom = {
        scores: document.getElementById("scores"),
        main: document.getElementById("main"),
        input: document.getElementById("inner-input"),
        score: document.getElementById("score"),
        pool: document.getElementById("current-pool"),
        missed: document.getElementById("missed"),
        missedContainer: document.getElementById("missed-container"),
        time: document.getElementById("time"),
        charScore: document.getElementById("char-score"),
        alreadyGuessed: document.getElementById("already-guessed"),
        sound: document.getElementById("sound"),
        soundoff: document.getElementById("mute"),
        soundon: document.getElementById("high")
    };
    this.init();
}

Ragaman.prototype.init = function() {
    this.alreadyGuessed = [];
    this.pool = "";
    this.setRandomPool();
    this.poolLeft = this.pool;
    this.currentGuess = "";
    this.gameState = STATE_GAME_ON;
    this.possibleWords = [];
    this.missedWords = [];
    this.timeLeft = ROUND_LENGTH;
    this.score = 0;
    this.scores = [];
    this.loadScores();

    this.dom.pool.textContent = this.pool;
    this.dom.alreadyGuessed.textContent = "";
    this.dom.pool.textContent = this.pool;
    this.dom.input.textContent = "";
    this.dom.missed.textContent = "";

    this.pressure(0);
    if (this.timer != null) {
        clearInterval(this.timer);
    }

    var myself = this;
    function callSecond() {
        myself.second();
    }
    this.second();
    this.timer = window.setInterval(function() {callSecond();}, 1000);
}

Ragaman.prototype.setRandomPool = function() {
    // get random 7 letter word from dict and scramble it
    var pl = "";
    while (pl.length != 7) {
        pl = ALL_WORDS[Math.floor(Math.random()*ALL_WORDS.length)];
    }
    this.pool = pl.shuffle();
}

Ragaman.prototype.second = function() {
    if (this.timeLeft == 0) {
        // game over
        // rebuild pool in case stuff was entered already
        this.pool += this.currentGuess;

        clearInterval(this.timer);
        this.dom.main.style.display = "none";
        this.dom.scores.style.display = "block";

        this.getPossibleWords(this.pool);
        this.getMissedWords();
        if (this.scores != null) {
            // add highscore if relevant
            var i = 0;
            while (i < this.scores.length && this.scores[i][1] > this.score) {
                i++;
            }
            if (this.score > 0 && i < 10) {
                this.scores.splice(i, 0, [this.pool, this.score]);
                if (this.scores.length > 10) {
                    this.scores.pop();
                }
            }
            this.buildScoreTable(this.scores, this.score > 0 ? i : 10);
            this.saveScores();
        }
        this.dom.pool.textContent = this.pool;
        this.gameState = STATE_GAME_OVER;
    } else {
        this.timeLeft--;
        this.dom.score.innerHTML = "Score: " + this.score + "<br>" + "Time left: " + this.timeLeft;
    }
}

Ragaman.prototype.handleKey = function(e) {
    var key = e.keyCode;
    if (this.gameState == STATE_GAME_OVER) {
        if (key == SPACE || key == TAB) {
            e.preventDefault();
            this.dom.main.style.display = "block";
            this.dom.scores.style.display = "none";
            this.dom.missedContainer.style.display = "none";
            this.init();
        } else {
            return;
        }
        return;
    } if (key == TAB) {
        e.preventDefault();
        this.init();
    }
    this.currentGuess = this.dom.input.textContent.toLowerCase();
    if (key == ENTER) {
        // submit
        if (this.alreadyGuessed.indexOf(this.currentGuess) === -1 && 
                this.currentGuess.length > 0 && 
                this.checkWord(this.currentGuess)) {
            soundOn && playSound("send");
            if (this.currentGuess.length == 6) {
                colorFade("header", "text", PRESSURE[6].substring(1), "FFFFFF", 25, 60);
            } if (this.currentGuess.length == 7) {
                colorFade("bg", "background", PRESSURE[6].substring(1), "FFFFFF", 25, 60);
            }
            var s = this.calculateScore(this.currentGuess);
            this.score += s;
            this.alreadyGuessed.push(this.currentGuess);
            this.dom.alreadyGuessed.appendChild(this.getWordNode(this.currentGuess, s));
        }
        this.pool += this.currentGuess;
        this.currentGuess = "";
        this.pressure(0);
    } else if (key == BACKSPACE) {
        e.preventDefault();
        if (this.dom.input.textContent.length > 0) {
            // delete
            this.pool += this.currentGuess.substr(this.currentGuess.length-1);
            this.currentGuess = this.currentGuess.substr(0, this.currentGuess.length-1);
            this.pressure(this.currentGuess.length);
        }
    } else if (key == SPACE) {
        // shuffle
        e.preventDefault();
        this.pool = this.pool.shuffle();
    } else {
        var character = String.fromCharCode(e.keyCode).toLowerCase();
        var index = this.pool.indexOf(character);
        if (index != -1) {
            // input
            soundOn && playSound("type");
            this.pressure(this.currentGuess.length);
            this.dom.charScore.innerHTML = "+" + (VALUES[character]+1);
            colorFade("char-score", "text", "888888", "FFFFFF", 25, 40);
            this.currentGuess += character;
            this.pool = this.pool.substring(0,index) + this.pool.substring(1+index);
        }
    }
    this.dom.pool.textContent = this.pool;
    this.dom.input.textContent = this.currentGuess;
    this.dom.score.innerHTML = "Score: " + this.score + "<br>" + "Time left: " + this.timeLeft;
}

Ragaman.prototype.getWordNode = function(word, score) {
    var guessSpan = document.createElement("span");
    guessSpan.innerHTML += word + "<sup>" + score + "</sup> ";
    guessSpan.style.color = PRESSURE[word.length-1];
    return guessSpan;
}

Ragaman.prototype.checkWord = function(word) {
    return ALL_WORDS.indexOf(word) != -1;
}

Ragaman.prototype.calculateScore = function(word) {
    var sc = 0;
    for (var i = 0; i < word.length; i++) {
        sc += VALUES[word[i]];
    }
    return sc + word.length;
}

Ragaman.prototype.getPossibleWords = function(pool) {
    pool = pool.split("").sort().join("");
    for (var i = 0; i < SORTED_WORDS.length; i++) {
        if (pool.indexOf(SORTED_WORDS[i][0]) !== -1) {
            this.possibleWords.push(ALL_WORDS[SORTED_WORDS[i][1]]);
        }
    }
}

Ragaman.prototype.getMissedWords = function() {
    for (var i = 0; i < this.possibleWords.length; i++) {
        if (this.alreadyGuessed.indexOf(this.possibleWords[i]) === -1) {
            this.missedWords.push(this.possibleWords[i]);
        }
    }
}

Ragaman.prototype.pressure = function(level) {
    this.dom.input.style.color = PRESSURE[level];
}

Ragaman.prototype.buildScoreTable = function(sc, pos) {
    this.dom.scores.innerHTML = "<h1>Your Highscores:</h1>";
    var tbl = document.createElement("table");
    for (var i = 0; i < sc.length; i++) {
        var tr = document.createElement("tr");
        var tblPool = document.createElement("td");
        var tblScore = document.createElement("td");
        var tblPlace = document.createElement("td");
        tblPlace.textContent = "#" + (i+1) + ":";
        tblPool.textContent = sc[i][0];
        tblPool.className = "pool";
        tblScore.textContent = sc[i][1] + " points";
        tr.appendChild(tblPlace);
        tr.appendChild(tblPool);
        tr.appendChild(tblScore);
        if (i == pos) {
            tr.style.color = PRESSURE[6];
            tr.style.fontWeight = "bold";
        }
        tbl.appendChild(tr);
    }
    this.dom.scores.appendChild(tbl);

    // display missed words
    if (this.missedWords.length == 0) {
        this.dom.missed.innerHTML = "None! Wow, you should consider a professional Scrabble career.";
    }
    for (var i = 0; i < this.missedWords.length; i++) {
        this.dom.missed.appendChild(this.getWordNode(
            this.missedWords[i], this.calculateScore(this.missedWords[i])));
    }
    this.dom.missedContainer.style.display = "block";
}

Ragaman.prototype.loadScores = function() {
    if (supports_html5_storage()) {
        if (localStorage["hasscores"] == "true") {
            for (var i = 0; i < 10; i++) {
                if (localStorage["score_" + i] == null) {
                    break;
                }
                var s = parseInt(localStorage["score_" + i]);
                var p = localStorage["pool_" + i];
                this.scores.push([p, s]);
            }
        }
    }
}

Ragaman.prototype.saveScores = function() {
    if (supports_html5_storage()) {
        for (var i = 0; i < this.scores.length; i++) {
            localStorage["pool_" + i] = this.scores[i][0];
            localStorage["score_" + i] = this.scores[i][1];
        }
        localStorage["hasscores"] = "true";
    }
}

window.onload = function() {
    ALL_WORDS = [];
    SORTED_WORDS = [];
    var game = null;

    // get words
    var wordsR = new XMLHttpRequest();
    wordsR.onreadystatechange = function() {
        if (wordsR.readyState == 4) {
            ALL_WORDS = wordsR.responseText.split("\n");
            game = new Ragaman();
        }
    }
    wordsR.open('GET', 'dicts/english.txt', true);
    wordsR.send(null);
    
    // get sorted words
    var sortedR = new XMLHttpRequest();
    sortedR.onreadystatechange = function() {
        if (sortedR.readyState == 4) {
            SORTED_WORDS = sortedR.responseText.split("\n");
            for (var i = 0; i < SORTED_WORDS.length - 1; i++) {
                SORTED_WORDS[i] = SORTED_WORDS[i].split(",");
            }
        }
    }
    sortedR.open('GET', 'dicts/english_sorted.txt', true);
    sortedR.send(null);

    soundOn = true;
    var domSound = document.getElementById("sound");
    var domSoundoff = document.getElementById("mute");
    var domSoundon = document.getElementById("high");
    domSound.onclick = function() {
        if (soundOn) {
            domSoundoff.style.display = "none";
            domSoundon.style.display = "block";
            soundOn = false;
            localStorage["sound"] = "false";
        }
        else {
            domSoundoff.style.display = "block";
            domSoundon.style.display = "none";
            soundOn = true;
            localStorage["sound"] = "true";
        }
    };
    if (localStorage["sound"] == "false") {
        domSound.onclick();
    }
    document.onkeydown = function(e) {
        game.handleKey(e);
    };
};
