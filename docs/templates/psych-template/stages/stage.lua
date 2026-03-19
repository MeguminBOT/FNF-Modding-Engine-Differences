-- Stage setup script for the default stage
-- This runs when the stage loads during gameplay

function onCreate()
    -- Background sky
    makeLuaSprite('stageback', 'stageback', -600, -200)
    setScrollFactor('stageback', 0.9, 0.9)
    addLuaSprite('stageback', false)

    -- Stage floor
    makeLuaSprite('stagefront', 'stagefront', -650, 600)
    setScrollFactor('stagefront', 0.9, 0.9)
    scaleObject('stagefront', 1.1, 1.1)
    addLuaSprite('stagefront', false)

    -- Stage curtains (foreground)
    makeLuaSprite('stagecurtains', 'stagecurtains', -500, -300)
    setScrollFactor('stagecurtains', 1.3, 1.3)
    scaleObject('stagecurtains', 0.9, 0.9)
    addLuaSprite('stagecurtains', true)
end
