-- ============================================================
-- Lua Functions Template
-- ============================================================


-- ========================
--  Lifecycle Callbacks
-- ========================

function onCreate()
	-- Called when the Lua script is initialized (some variables may not exist yet)
end

function onCreatePost()
	-- Called at the end of the creation phase (all variables are now available)
end

function onDestroy()
	-- Called when the Lua script is being removed
end

-- ========================
--  Gameplay / Song Timing
-- ========================

function onSectionHit()
	-- Called when the song advances to the next section
end

function onBeatHit()
	-- Called 4 times per section (once per beat)
end

function onStepHit()
	-- Called 16 times per section (once per step)
end

function onUpdate(elapsed)
	-- Called at the start of each frame update (some variables may not be refreshed yet)
	-- Note: Also fires during the Game Over screen
end

function onUpdatePost(elapsed)
	-- Called at the end of each frame update
	-- Note: Also fires during the Game Over screen
end

function onStartCountdown()
	-- Called when the countdown is about to start
	-- Return Function_Stop to prevent it (useful for triggering dialogues; resume with startCountdown())
	return Function_Continue;
end

function onCountdownStarted()
	-- Called after the countdown has already begun
	-- To prevent the countdown, use onStartCountdown() instead
end

function onCountdownTick(counter)
	-- counter = 0 -> "Three"
	-- counter = 1 -> "Two"
	-- counter = 2 -> "One"
	-- counter = 3 -> "Go!"
	-- counter = 4 -> (No visual; fires at roughly the same time as onSongStart)
end

function onSpawnNote(id, data, type, isSustainNote, strumTime)
	-- Called when a note is spawned
	-- Use 'id' to query note properties, e.g.: getPropertyFromGroup('notes', id, 'texture')
end

function onSongStart()
	-- Called when the instrumental and vocals begin playing (songPosition = 0)
end

function onEndSong()
	-- Called when the song ends and the transition begins (delayed if an achievement is unlocking)
	-- Return Function_Stop to prevent the transition (useful for cutscenes)
	return Function_Continue;
end

-- ========================
--  Substate Interactions
-- ========================

function onPause()
	-- Called when the player presses Pause (outside of cutscenes)
	-- Return Function_Stop to prevent pausing
	return Function_Continue;
end

function onResume()
	-- Called when the game resumes (usually from the pause screen, but not guaranteed)
end

function onGameOver()
	-- Called every frame while the player's health is at or below zero
	-- Return Function_Stop to prevent entering the Game Over screen
	return Function_Continue;
end

function onGameOverStart()
	-- Called when the Game Over screen is entered (only if onGameOver did not return Function_Stop)
end

function onGameOverConfirm(retry)
	-- Called when the player confirms on the Game Over screen
	-- retry = true if retrying, false if returning to menu
end

-- ========================
--  Dialogue
-- ========================
-- (When dialogue finishes, startCountdown() is called automatically)

function onNextDialogue(line)
	-- Called when the next dialogue line starts (line index is 0-based; not triggered for line 0)
end

function onSkipDialogue(line)
	-- Called when the player presses Enter to skip a dialogue line still being typed (0-based index)
end

-- ========================
--  Key Press / Release
-- ========================
-- Key values:  0 = Left,  1 = Down,  2 = Up,  3 = Right

function onKeyPressPre(key)
	-- Called before note key-press calculations
end

function onKeyReleasePre(key)
	-- Called before note key-release calculations
end

function onKeyPress(key)
	-- Called after note key-press calculations
end

function onKeyRelease(key)
	-- Called after note key-release calculations
end

function onGhostTap(key)
	-- Called when a key is pressed with no note to hit and Ghost Tapping is enabled
end

-- ========================
--  Note Hit / Miss
-- ========================
-- Parameters:
--   id            Note member ID (query properties via getPropertyFromGroup('notes', id, 'strumTime'))
--   noteData      0 = Left, 1 = Down, 2 = Up, 3 = Right
--   noteType      Note type string
--   isSustainNote true if this is a hold/sustain note

-- Pre-hit (before hit calculations)
function goodNoteHitPre(id, noteData, noteType, isSustainNote)
	-- Called before the player's note hit is processed
end

function opponentNoteHitPre(id, noteData, noteType, isSustainNote)
	-- Called before the opponent's note hit is processed
end

-- Post-hit (after hit calculations)
function goodNoteHit(id, noteData, noteType, isSustainNote)
	-- Called after the player's note hit is processed
end

function opponentNoteHit(id, noteData, noteType, isSustainNote)
	-- Called after the opponent's note hit is processed
end

function noteMissPress(direction)
	-- Called when the player presses a key but there is no note to hit (ghost miss)
end

function noteMiss(id, direction, noteType, isSustainNote)
	-- Called when a note goes offscreen without being hit
end

-- ========================
--  Score / Rating
-- ========================

function preUpdateScore(miss)
	-- Called before the score text updates (miss = true if the player missed)
	-- Return Function_Stop to prevent the score text from updating
	return Function_Continue
end

function onUpdateScore(miss)
	-- Called after the score text updates (miss = true if the player missed)
end

function onRecalculateRating()
	-- Called before the rating is calculated
	-- Return Function_Stop to use your own calculation with setRatingPercent() and setRatingString()
	return Function_Continue;
end

function onMoveCamera(focus)
	-- Called when the camera focus shifts to a character

	if focus == 'boyfriend' then
		-- Camera focuses on Boyfriend
	elseif focus == 'dad' then
		-- Camera focuses on Dad
	elseif focus == 'gf' then
		-- Camera focuses on Girlfriend
	end
end

-- ========================
--  Event Notes
-- ========================

function onEvent(name, value1, value2, strumTime)
	-- Called when an event note is triggered
end

function onEventPushed(name, value1, value2, strumTime)
	-- Called for every event note during chart loading (ideal for precaching assets)
end

function eventEarlyTrigger(name, value1, value2, strumTime)
	-- Return a value in milliseconds to trigger an event early.
end

-- ========================
--  Custom Substates
-- ========================
-- 'name' corresponds to the value passed to openCustomSubstate(name)

function onCustomSubstateCreate(name)
	-- Called when the custom substate is created
end

function onCustomSubstateCreatePost(name)
	-- Called after the custom substate finishes creation
end

function onCustomSubstateUpdate(name, elapsed)
	-- Called every frame while the custom substate is active
end

function onCustomSubstateUpdatePost(name, elapsed)
	-- Called at the end of each frame update for the custom substate
end

function onCustomSubstateDestroy(name)
	-- Called when the custom substate is closed via closeCustomSubstate()
end

-- ========================
--  Tween / Timer / Sound
-- ========================

function onTweenCompleted(tag, vars)
	-- Called when a tween finishes
	-- tag  = the tween's tag
	-- vars = the tag of the sprite that was tweened
end

function onTimerCompleted(tag, loops, loopsLeft)
	-- Called when a timer completes a loop
	-- tag       = the timer's tag
	-- loops     = total number of loops when fully complete
	-- loopsLeft = remaining loops
end

function onSoundFinished(tag)
	-- Called when a sound started with playSound() (using a tag) finishes playing
end
