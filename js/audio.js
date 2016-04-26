CHANNEL_MAX = 4;
audiochannels = new Array();

for (i = 0; i < CHANNEL_MAX; i++) {
	audiochannels[i] = new Array();
	audiochannels[i]['channel'] = new Audio();
	audiochannels[i]['finished'] = -1;
}

function playSound(s) {
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
