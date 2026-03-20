// ============================================================
// HScript Functions Template
// ============================================================


// ========================
//  Lifecycle Callbacks
// ========================

function onCreate()
{
	// Called when the HScript file is initialized (some variables may not exist yet)
}

function onCreatePost()
{
	// Called at the end of the creation phase (all variables are now available)
}

function onDestroy()
{
	// Called when the HScript file is being removed
}

// ========================
//  Gameplay / Song Timing
// ========================

function onSectionHit()
{
	// Called when the song advances to the next section
}

function onBeatHit()
{
	// Called 4 times per section (once per beat)
}

function onStepHit()
{
	// Called 16 times per section (once per step)
}

function onUpdate(elapsed:Float)
{
	// Called at the start of each frame update (some variables may not be refreshed yet)
	// Note: Also fires during the Game Over screen
}

function onUpdatePost(elapsed:Float)
{
	// Called at the end of each frame update
	// Note: Also fires during the Game Over screen
}

function onStartCountdown()
{
	// Called when the countdown is about to start
	// Return Function_Stop to prevent it (useful for triggering dialogues; resume with startCountdown())
	return Function_Continue;
}

function onCountdownStarted()
{
	// Called after the countdown has already begun
	// To prevent the countdown, use onStartCountdown() instead
}

function onCountdownTick(tick:Countdown, counter:Int)
{
	switch(tick)
	{
		case Countdown.THREE:
			// counter = 0
		case Countdown.TWO:
			// counter = 1
		case Countdown.ONE:
			// counter = 2
		case Countdown.GO:
			// counter = 3
		case Countdown.START:
			// counter = 4 (no visual; fires at roughly the same time as onSongStart)
	}
}

function onSpawnNote(note:Note)
{
	// Called when a note is spawned
}

function onSongStart()
{
	// Called when the instrumental and vocals begin playing (songPosition = 0)
}

function onEndSong()
{
	// Called when the song ends and the transition begins (delayed if an achievement is unlocking)
	// Return Function_Stop to prevent the transition (useful for cutscenes)
	return Function_Continue;
}

// ========================
//  Substate Interactions
// ========================

function onPause()
{
	// Called when the player presses Pause (outside of cutscenes)
	// Return Function_Stop to prevent pausing
	return Function_Continue;
}

function onResume()
{
	// Called when the game resumes (usually from the pause screen, but not guaranteed)
}

function onGameOver()
{
	// Called every frame while the player's health is at or below zero
	// Return Function_Stop to prevent entering the Game Over screen
	return Function_Continue;
}

function onGameOverStart()
{
	// Called when the Game Over screen is entered (only if onGameOver did not return Function_Stop)
}

function onGameOverConfirm(retry:Bool)
{
	// Called when the player confirms on the Game Over screen
	// retry = true if retrying, false if returning to menu
}

// ========================
//  Dialogue
// ========================
// (When dialogue finishes, startCountdown() is called automatically)

function onNextDialogue(line:Int)
{
	// Called when the next dialogue line starts (line index is 0-based; not triggered for line 0)
}

function onSkipDialogue(line:Int)
{
	// Called when the player presses Enter to skip a dialogue line still being typed (0-based index)
}

// ========================
//  Key Press / Release
// ========================
// Key values:  0 = Left,  1 = Down,  2 = Up,  3 = Right

function onKeyPressPre(key:Int)
{
	// Called before note key-press calculations
}

function onKeyReleasePre(key:Int)
{
	// Called before note key-release calculations
}

function onKeyPress(key:Int)
{
	// Called after note key-press calculations
}

function onKeyRelease(key:Int)
{
	// Called after note key-release calculations
}

function onGhostTap(key:Int)
{
	// Called when a key is pressed with no note to hit and Ghost Tapping is enabled
}

// ========================
//  Note Hit / Miss
// ========================

// Pre-hit (before hit calculations)
function goodNoteHitPre(note:Note)
{
	// Called before the player's note hit is processed
}

function opponentNoteHitPre(note:Note)
{
	// Called before the opponent's note hit is processed
}

// Post-hit (after hit calculations)
function goodNoteHit(note:Note)
{
	// Called after the player's note hit is processed
}

function opponentNoteHit(note:Note)
{
	// Called after the opponent's note hit is processed
}

function noteMissPress(direction:Int)
{
	// Called when the player presses a key but there is no note to hit (ghost miss)
}

function noteMiss(note:Note)
{
	// Called when a note goes offscreen without being hit
}

// ========================
//  Score / Rating
// ========================

function preUpdateScore(miss:Bool)
{
	// Called before the score text updates (miss = true if the player missed)
	// Return Function_Stop to prevent the score text from updating
	return Function_Continue;
}

function onUpdateScore(miss:Bool)
{
	// Called after the score text updates (miss = true if the player missed)
}

function onRecalculateRating()
{
	// Called before the rating is calculated
	// Return Function_Stop to use your own calculation with setRatingPercent() and setRatingString()
	return Function_Continue;
}

function onMoveCamera(focus:String)
{
	// Called when the camera focus shifts to a character
	if (focus == 'boyfriend')
	{
		// Camera focuses on Boyfriend
	}
	else if (focus == 'dad')
	{
		// Camera focuses on Dad
	}
	else if (focus == 'gf')
	{
		// Camera focuses on Girlfriend
	}
}

// ========================
//  Event Notes
// ========================

function onEvent(name:String, value1:String, value2:String, strumTime:Float)
{
	// Called when an event note is triggered
}

function onEventPushed(name:String, value1:String, value2:String, strumTime:Float)
{
	// Called for every event note during chart loading (ideal for precaching assets)
}

function eventEarlyTrigger(name:String, value1:String, value2:String, strumTime:Float)
{
	// Return a value in milliseconds to trigger an event early.
}

// ========================
//  Custom Substates
// ========================
// 'name' corresponds to the value passed to openCustomSubstate(name)

function onCustomSubstateCreate(name:String)
{
	// Called when the custom substate is created
}

function onCustomSubstateCreatePost(name:String)
{
	// Called after the custom substate finishes creation
}

function onCustomSubstateUpdate(name:String, elapsed:Float)
{
	// Called every frame while the custom substate is active
}

function onCustomSubstateUpdatePost(name:String, elapsed:Float)
{
	// Called at the end of each frame update for the custom substate
}

function onCustomSubstateDestroy(name:String)
{
	// Called when the custom substate is closed via closeCustomSubstate()
}
