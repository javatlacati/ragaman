// constants
CONSONANTS = "tttttnnnssshhrrddllcumwfgy";
VOWELS = "eeeeeeeaaaaaoooiii";
ALPHABET = "abcdefghijklmnopqrstuvwxyz";
// PRESSURE = ["#E0E0E0", "#E5C9C7", "#E1A29D", "#E88C82", "#F97D77", "#FF6B61", "#FF5938"];
PRESSURE = ["#3D0F00", "#521400", "#661A00", "#7A1F00", "#8F2400", "#A32900", "#B82E00"];
SPACE = 32;
ENTER = 13;
BACKSPACE = 8;

function init() {
    pool = "";
    possible_words = null;
    game_over = false;
    current_guess = "";
    score = 0;
    already_guessed = [];
    timeleft = 60;
    pool = CONSONANTS.shuffle().substring(0,4) + VOWELS.shuffle().substring(0,3);
    pool_left = pool;
    html_pool.innerText = pool.toLowerCase();
    timer = window.setInterval(function() {second();}, 1000);
    html_pool.innerText = pool;
    //html_input.innerText = current_guess;
    html_score.innerText = "Score: " + score;
    html_time.innerText = "Time left: " + timeleft;
    pressure(0);
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
    if (game_over) {
        init();
    }
    var key = e.keyCode;
    current_guess = input.innerText;
    if (key == ENTER) {
        // submit
        if (already_guessed.indexOf(current_guess) === -1 && checkWord(current_guess)) {
            score += current_guess.length * current_guess.length;
            already_guessed.push(current_guess);
            html_already_guessed.innerText += current_guess + "\n";
        }
        current_guess = "";
        pool_left = pool;
        pressure(0);
    } else if (key == BACKSPACE && input.innerText.length > 0) {
        // delete
        pool_left += current_guess.substr(current_guess.length-1);
        current_guess = current_guess.substr(0,current_guess.length-1);
        pressure(current_guess.length);
    } else if (key == SPACE) {
        // shuffle
        pool = pool.shuffle();
    } else {
        var character = String.fromCharCode(e.keyCode).toLowerCase();
        var index = pool_left.indexOf(character);
        if (index != -1) {
            // input
            pressure(current_guess.length);
            current_guess += character;
            pool_left = pool_left.substring(0,index) + pool_left.substring(1+index);
        }
    }
    html_pool.innerText = pool;
    html_input.innerText = current_guess;
    html_score.innerText = "Score: " + score;
};

function checkWord(word) {
    return all_words.indexOf(word) != -1;
}

function pressure(level) {
    html_input.style.color = PRESSURE[level];
}

function second() {
    if (timeleft == 0) {
        // game over
        clearInterval(timer);
        html_input.innerText = "";
        html_score.innerText = "";
        html_pool.innerText = "GAME OVER! SCORE: " + score;
        html_pool.innerText += "\npress any key to restart";
        html_time.innerText = "";
        html_already_guessed.innerText = "";
        game_over = true;
    } else {
        timeleft--;
        html_time.innerText = "Time left: " + timeleft;
    }
}

window.onload = function() {
    html_input = document.getElementById("input");
    html_score = document.getElementById("score");
    html_pool = document.getElementById("current-pool");
    html_time = document.getElementById("time");
    html_already_guessed = document.getElementById("already-guessed");
    all_words = document.getElementById("allwords").innerText.split("\n");
    init();
};
