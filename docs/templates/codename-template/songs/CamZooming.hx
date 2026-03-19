// Global song script — runs for ALL songs
// Place in the root of songs/ folder

function postCreate() {
    // Called after the gameplay state finishes setup
}

function beatHit(curBeat) {
    // Camera zoom on every 4th beat
    if (curBeat % 4 == 0) {
        camGame.zoom += 0.015;
        camHUD.zoom += 0.005;
    }
}
