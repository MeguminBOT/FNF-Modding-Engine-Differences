// Companion script for myStage.xml
// This script runs alongside the XML stage definition

function postCreate() {
    // Stage has loaded — sprites from the XML are accessible via stage.stageSprites
    // Example: adjust a sprite's transparency
    // var bg = stage.stageSprites["bg"];
    // bg.alpha = 0.8;
}

function beatHit(curBeat) {
    // Fires every beat — use for beat-synced effects
    if (curBeat % 4 == 0) {
        camGame.zoom += 0.03;
        camHUD.zoom += 0.01;
    }
}

function stepHit(curStep) {
    // Fires every step (4 steps per beat by default)
}
