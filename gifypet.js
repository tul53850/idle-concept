//+++ General Vars +++

//Settings
var stepSize = 15;

//System variables
var petX = 50;
var petY = 50;
var talk = '';
var mood = 50;
var belly = 50;
var coins = 10;
var movment = true;

//Owner configured variables
var date = new Date(getParameterByName('dob') * 1000);
var dob = date.getMonth() + 1 + '-' + date.getFullYear();

var petName = getParameterByName('name');
var element = getParameterByName('element');
var gender = getParameterByName('gender'); //f m b n

var tableColor = getParameterByName('tablecolor');
var textColor = getParameterByName('textcolor');

var mapImage = getParameterByName('map');
if (!mapImage.includes('://')) {
    //Map
    mapImage = 'maps/' + mapImage;
}

var petImage = getParameterByName('pet');
if (!petImage.includes('://')) {
    //Pet
    petImage = 'pets/' + petImage;
}

var bodyImage = getParameterByName('background');
if (!bodyImage.includes('://')) {
    //Pet
    bodyImage = 'backgrounds/' + bodyImage;
}

//DOM elements
var pet = document.getElementById('pet');
var map = document.getElementById('map');
var talkBox = document.getElementById('talk');
var petNameBox = document.getElementById('petName');
var elementBox = document.getElementById('element');
var dobBox = document.getElementById('dob');
var moodBox = document.getElementById('mood');
var bellyBox = document.getElementById('belly');
var coinsBox = document.getElementById('coins');
var petNameTag = document.getElementById('petName-tag');
var overlay = document.getElementById('overlay');
var underlay = document.getElementById('underlay');
var petInteract = document.getElementById('overlay-pet-interact');
var petTable = document.getElementById('petTable');

//+++ Game Loop +++
function loop() {
    //Belly
    belly = belly - 0.3;
    if (belly <= 10) {
        break;
    }
    if (belly > 100) {
        belly = 100;
    }
    var bellyHearts = '';
    for (var i = 0; i < belly / 10 / 2; i++) {
        bellyHearts += '<img class="uiicon" src="ui/meat.png"/>';
    }
    bellyBox.innerHTML = bellyHearts;

    //Mood
    mood = mood - 0.3;
    if (mood <= 10) {
        break;
    }
    if (mood > 100) {
        mood = 100;
    }
    var moodHearts = '';
    for (var i = 0; i < mood / 10 / 2; i++) {
        moodHearts += '<img class="uiicon" src="ui/heart.gif"/>';
    }
    moodBox.innerHTML = moodHearts;

    //Coins
    coins = coins + mood / 600;
    coinsBox.innerHTML = Math.floor(coins);

    //Function calls
    teMain();
    speakAnimator();
    rainFall();
    //movePet();
    petTalk();
    autoEat();
}

//+++ Main System Functions +++

//Timed event manager
var teTimer = -1;
var teEnd = 5;
var teFunction = null;

function teStart(functionPass, duration) {
    //Close any complex UI that may mess things up.
    closeSlots();

    //If the timer is already running, call a cancel on whatever function is active.
    if (teTimer != -1) {
        teFunction(false);
    }
    teTimer = 0;
    teEnd = duration;
    teFunction = functionPass;
}

function teMain() {
    if (teTimer == -1) {
        return;
    }

    //Ok ok, yes this could be run instantly in teStart, but theres a charm to the delay it adds.
    if (teTimer === 0) {
        teFunction(true);
        petInteract.style.zIndex = '-1'; //Disable pet interaction
    }

    teTimer++;

    if (teTimer == teEnd) {
        teFunction(false);
        teTimer = -1;
        petInteract.style.zIndex = '1'; //Enable pet interaction
    }
}

//+++ Actions +++

//General Pet chatter
var sayings = ['Im rooting for you!', 'I hope I never get uninstalled!'];
var lastPick = 0;
var speakDelay = 0;

function petTalk() {
    //Speak Delay adds a minimum delay between messages
    speakDelay++;
    if (speakDelay < 12) {
        return;
    }

    if (random100() < 8) {
        var pick = 0;
        do {
            pick = Math.floor(Math.random() * sayings.length);
        } while (pick == lastPick);

        speak(petName, sayings[pick]);
        speakDelay = 0;
    }
}
//Mood related actions
function moodCheck() {
    if (mood > 0 && mood < 20) {
        if (random100() < 4) {
            speak(petName, 'HUNGRY! HUNGRY!!!');
        }

        return;
    }

    if (mood > 20 && mood < 40) {
        if (random100() < 4) {
            speak(petName, 'Im getting peckish..');
        }

        return;
    }

    if (mood > 40 && mood < 100) {
        if (random100() < 4) {
            speak(petName, 'Mmmmmm');
        }

        return;
    }

    if (mood > 100 && mood < 150) {
        if (random100() < 4) {
            speak(petName, 'Im getting a bit fat!');
        }

        return;
    }

    if (mood > 150 && mood < 200) {
        if (random100() < 4) {
            speak(petName, 'FAT FAT FAT!');
        }

        return;
    }
}

//Feed Pet
var foodTypeSayings = [
    ['Yum, That was realy filling!', 'Its good to eat!', 'ROMNOMNOMNOM', 'Mmmmmm <3', 'This is almost as nice as you!', 'For me :D', 'I WILL EAT IT!'],
    ['YAYAYAYAYAY', 'OMG YUM', 'Yumo', 'I like this very much!'],
    ['Thanks I guess..', 'I guess you cant afford anything better?', 'I can eat this..', 'You eat this stuff regularly?', 'Its food...'],
    ['Refreshing!', 'I was so thirsty!', 'TIME TO GET PEPSI DRUNK!', 'Glug glug glug', 'Drinkn a drink, ya ya ya, thats my song...', 'I can drink to that!'],
];

function feedPet(foodType) {
    //0-Main/Meat 1-Junk 2-Boring 3-Drink
    if (coins < 5) {
        speak('FoodShop', 'Food costs 5 coins!');
        errorSound.play();
        return;
    }

    if (belly > 80) {
        speak(petName, 'Im too full to eat more :(');
        errorSound.play();
        return;
    }

    coins -= 5;
    mood += 10;
    belly += 20;
    speak(petName, foodTypeSayings[foodType][randomArray(foodTypeSayings[foodType])]);
    teStart(teFeed, 2);
}

function teFeed(active) {
    if (active === true) {
        overlay.style.backgroundImage = "url('overlays/face.gif')";
        eatSound.play();
    } else {
        overlay.style.backgroundImage = 'none';
    }
}
//Pet auto eats to maintain mood
function autoEat() {
    if (mood < 20 && belly < 20) {
        speak('Friend', 'Here is some food ' + petName + ' ;)');
        speak(petName, foodTypeSayings[0][randomArray(foodTypeSayings[0])]);
        belly += 20;
        mood += 20;
    }
}

//Talk to pet
var talkSayings = ['Whos the best pet!', 'You should get a job in finance!', 'What time is it?', 'Who ya gonna call!', 'Do you know Ferris?', 'Are you a panda?'];
var talkResponces = ['Meeeeee :D', 'Ummmm... No...', 'Beats me!', 'GifyPets!', 'Hes a righteous dude!', 'Well what do you think..'];

function talkToPet() {
    var pick = Math.floor(Math.random() * talkSayings.length);

    talkSound.play();
    speak('You', talkSayings[pick]);
    speak(petName, talkResponces[pick]);
}

//Pett pet
function pettPet() {
    speak(petName, 'Yay, petts for ' + petName + '!!');
    mood += 20;
    teStart(tePett, 3);
}

function tePett(active) {
    if (active === true) {
        movment = false;
        pet.classList.add('pett');
        overlay.innerHTML = '<img src="overlays/heartrain.gif" />';
    } else {
        movment = true;
        pet.classList.remove('pett');
        overlay.innerHTML = '';
    }
}

//Shower
function showerPet() {
    if (coins < 10) {
        speak('MrShower', "You can't afford my services..");
        errorSound.play();
        return;
    }
    teStart(teShower, 6);
    speak(petName, 'Yay a bath time :D');
    mood += 20;
    coins -= 10;
}

function teShower(active) {
    if (active === true) {
        overlay.style.backgroundImage = "url('overlays/shower.gif')";
        overlay.innerHTML = '<img style="padding-top: 50px; width: 60%;" src="' + petImage + '" />';
        washSound.play();
    } else {
        overlay.style.backgroundImage = 'none';
        overlay.innerHTML = '';
    }
}

//Party
function petParty() {
    if (coins < 20) {
        speak('Pimp', "You can't afford my services..");
        errorSound.play();
        return;
    }
    teStart(teParty, 9);
    speak(petName, 'WOOOOOOT :D ;D');
    mood += 80;
    coins -= 20;
}
var partyGuests = ['robot.gif', 'dog.gif', 'flower.gif', 'frog.gif', 'cactus.gif'];

function teParty(active) {
    if (active === true) {
        overlay.style.backgroundImage = "url('overlays/party.gif')";
        partySound.play();

        var shuffeledGuests = shuffle(partyGuests);

        for (var i = 0; i < 4; i++) {
            var guestX = i * 40 + 15;
            var guestY = random100() / 2 + 105;
            overlay.innerHTML += '<img class="pet guest" style="top:' + guestY + 'px; left:' + guestX + 'px; position: fixed;" src="pets/' + shuffeledGuests[i] + '" />';
        }
    } else {
        overlay.style.backgroundImage = 'none';
        overlay.innerHTML = '';
    }
}

//Rain
var rainDelay = 0;

function rainFall() {
    rainDelay++;
    if (rainDelay < 15) {
        return;
    }

    if (random100() < 2) {
        teStart(teRain, 10);
        speak(petName, 'Oh great, its raining...');
        mood -= 20;
        rainDelay = 0;
    }
}

function teRain(active) {
    if (active === true) {
        underlay.innerHTML = '<img src="overlays/rain.gif" />';
        underlay.style.backgroundColor = '#1b3a63';
        underlay.style.opacity = '0.4';
    } else {
        underlay.innerHTML = '';
        underlay.style.backgroundColor = null;
        underlay.style.opacity = null;
    }
}
//+++ Helpers +++

//Outputs text to the talk box.
function speak(from, message) {
    if (from == petName) {
        speakTimer = 0;
        pet.classList.add('jump');
    }

    talk = talk + '\n' + from + ': ' + message;
    talkBox.value = talk;
    talkBox.scrollTop = talkBox.scrollHeight;
}
//Mini version of et system to allow speach animation
var speakTimer = -1;

function speakAnimator() {
    if (speakTimer == -1) {
        return;
    }
    if (speakTimer < 1) {
        speakTimer++;
    }
    if (speakTimer >= 1) {
        pet.classList.remove('jump');
        speakTimer = -1;
    }
}

//Checks if the pet is within map bounds
function moveCheck(petX, petY) {
    if (petX > 0 && petX < 100) {
        if (petY > 40 && petY < 95) {
            return true;
        }
    }
    return false;
}

//Retruns a random number with in an arrays size
function randomArray(inputArray) {
    return Math.floor(Math.random() * inputArray.length);
}

//Returns a random number 0 to 100
function random100() {
    return Math.floor(Math.random() * 100 + 1);
}

//Inverts a boolean
function invertB(boolIn) {
    if (boolIn === true) {
        return false;
    } else {
        return true;
    }
}

//Gets URL parameters
function getParameterByName(name, url) {
    if (!url) {
        url = window.location.href;
    }
    name = name.replace(/[\[\]]/g, '\\$&');
    var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

function shuffle(array) {
    var currentIndex = array.length,
        temporaryValue,
        randomIndex;

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {
        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;

        // And swap it with the current element.
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }

    return array;
}

//+++ GifyPet Startup and Render +++

//Master game loop
var mainInterval = setInterval(function () {
    loop();
}, 1000);

//Apply colour to the table
for (var i = 0, row; (row = petTable.rows[i]); i++) {
    row.style.borderColor = tableColor;

    for (var j = 0, col; (col = row.cells[j]); j++) {
        col.style.borderColor = tableColor;
    }
}
petTable.style.borderColor = tableColor;

//Pick gender icon
var genderRender = '';
if (gender == 'f') {
    genderRender = '<img class="uiicon" src="ui/girl.png"/>';
} else if (gender == 'm') {
    genderRender = '<img class="uiicon" src="ui/boy.png"/>';
} else if (gender == 'b') {
    genderRender = '<img class="uiicon" src="ui/both.png"/>';
}

//General render settings
pet.style.backgroundImage = "url('" + petImage + "')";
map.style.backgroundImage = "url('" + mapImage + "')";
petNameTag.innerHTML = petName;
petNameBox.innerHTML = petName + genderRender;
dobBox.innerHTML = dob;
elementBox.innerHTML = element;
document.body.style.backgroundImage = "url('" + bodyImage + "')";
document.body.style.color = textColor;
document.title = petName;

//Register interaction events
petInteract.addEventListener('pointerover', function () {
    pet.style.animation = 'wiggle 0.2s linear infinite';
});
petInteract.addEventListener('pointerout', function () {
    pet.style.animation = null;
});

//Welcome function calls
speak(petName, "Hello, I'm " + petName + " and you're awesome!");

//Load sounds
var eatSound = new Audio('audio/ommnom.mp3');
var partySound = new Audio('audio/song.mp3');
var washSound = new Audio('audio/shower.mp3');
var talkSound = new Audio('audio/hello.mp3');
var errorSound = new Audio('audio/ohno.mp3');
var slotSoundClick = new Audio('slots/click.mp3');
var slotSoundPull = new Audio('slots/lever.mp3');
var slotSoundWin = new Audio('slots/win.mp3');
var slotSoundLoose = new Audio('slots/loose.mp3');
