window.onload = function() {
    html_input = document.getElementById("input");
    html_pool = document.getElementById("current-pool");
    all_words = document.getElementById("allwords").innerText.split("\n");
    pool = "";
    possible_words = null;
    current_guess = "";
    ENGLISH = "EEEEEEETTTTTAAAAAOOOIIINNNSSSHHRRDDLLCUMWFGY";
    ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    ENTER = 13;
    BACKSPACE = 8;
    SPACE = 32;
    for (var i = 0; i < 7; i++) {
        pool += ENGLISH[Math.floor(Math.random() * ENGLISH.length)];
    }
    html_pool.innerText = pool;
};

document.onkeydown = function(e) {
    var key = e.keyCode;
    current_guess = input.innerText;
    if (key == ENTER) {
        // submit
        checkWord(input.innerText);
        current_guess = "";
    } else if (key == BACKSPACE && input.innerText.length > 0) {
        // delete
        current_guess = current_guess.substr(0,current_guess.length-1);
    } else if (key == SPACE) {
        // shuffle
    }
    var character = String.fromCharCode(e.keyCode);
    if (pool.indexOf(character) != -1) {
        // input
        current_guess += character;
    }
    html_input.innerText = current_guess;
};

function checkWord(word) {

}
