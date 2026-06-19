/*
    sounds.js – Moshko's Core Sound System
    Pure Web Audio API synthesis, no external files needed.
    - Button click:   a crisp, satisfying UI tick
    - Ragdoll scream: a cartoon "AAAHH!" when thrown at speed
*/

(function () {
    'use strict';

    // ----------------------------------------
    // Mute & Global State
    // ----------------------------------------
    let _isMuted = localStorage.getItem('moshko_muted') === 'true'; // Default: false
    let _hasUnlocked = false;
    let _hitCooldown = false;
    let _screamCooldown = false;
    let _flyState = 'none';
    let _dragSynth = null;
    window.isRagdollGrabbed = false;

    // ----------------------------------------
    // Absolute Path Resolution
    // ----------------------------------------
    let projectRoot = '';
    const scriptTag = document.currentScript;
    if (scriptTag && scriptTag.src) {
        projectRoot = scriptTag.src.substring(0, scriptTag.src.lastIndexOf('/core/')) + '/';
    }
    const audioBase = projectRoot + 'sounds/';

    // ----------------------------------------
    // Audio Asset Preloading
    // ----------------------------------------
    const hitSound = new Audio(audioBase + 'hit.mp3');
    hitSound.volume = 0.8;
    hitSound.preload = 'auto';

    const helloVoice = new Audio(audioBase + 'hello2.mp3');
    helloVoice.volume = 1.0;
    helloVoice.preload = 'auto';

    const shalomVoice = new Audio(audioBase + 'shalom.mp3');
    shalomVoice.volume = 1.0;
    shalomVoice.preload = 'auto';

    const screamChannels = [];
    for (let i = 0; i < 5; i++) {
        let a = new Audio(audioBase + 'scream.mp3');
        a.volume = 1.0;
        a.preload = 'auto';
        screamChannels.push(a);
    }

    const fallChannels = [];
    for (let i = 0; i < 3; i++) {
        // Fix: using .wavee if that was the intended extension from previous code
        let a = new Audio(audioBase + 'falling.wavee');
        a.volume = 1.0;
        a.preload = 'auto';
        fallChannels.push(a);
    }

    // ----------------------------------------
    // Mute Logic
    // ----------------------------------------
    function toggleMute() {
        // Play feedback BEFORE switching state if muting, or AFTER if unmuting
        if (!_isMuted) playMuteFeedback(true); 

        _isMuted = !_isMuted;
        localStorage.setItem('moshko_muted', _isMuted);
        
        if (_isMuted) {
            const all = [hitSound, helloVoice, shalomVoice, ...screamChannels, ...fallChannels].filter(Boolean);
            all.forEach(a => { a.pause(); a.currentTime = 0; });
            stopDragLoop();
            if (_masterGain) _masterGain.gain.setValueAtTime(0, _ctx.currentTime);
        } else {
            if (_masterGain) _masterGain.gain.setValueAtTime(1, _ctx.currentTime);
            getCtx(); 
            playMuteFeedback(false);
        }
        return _isMuted;
    }

    // ----------------------------------------
    // Audio Context & Master Gain
    // ----------------------------------------
    let _ctx = null;
    let _masterGain = null;
    function getCtx() {
        if (!_ctx) {
            _ctx = new (window.AudioContext || window.webkitAudioContext)();
            _masterGain = _ctx.createGain();
            _masterGain.connect(_ctx.destination);
        }
        if (_ctx.state === 'suspended') _ctx.resume();
        if (_masterGain) _masterGain.gain.setValueAtTime(_isMuted ? 0 : 1, _ctx.currentTime);
        return _ctx;
    }

    // ----------------------------------------
    // Passive Unlocker (Mouse Movement)
    // ----------------------------------------
    function unlockAudio() {
        if (_hasUnlocked) return;
        const ctx = getCtx();
        ctx.resume().then(() => {
            if (ctx.state === 'running') {
                _hasUnlocked = true;
                cleanupUnlockListeners();
                console.log("Moshko's Core: Audio unlocked.");
            }
        }).catch(() => {});
    }

    function cleanupUnlockListeners() {
        ['mousemove', 'mousedown', 'touchstart', 'keydown', 'wheel'].forEach(ev => {
            document.removeEventListener(ev, unlockAudio);
        });
    }

    ['mousemove', 'mousedown', 'touchstart', 'keydown', 'wheel'].forEach(ev => {
        document.addEventListener(ev, unlockAudio, { passive: true });
    });

    // ----------------------------------------
    // Sound Trigger Functions
    // ----------------------------------------
    function playUISound(type) {
        if (_isMuted) return;
        try {
            const ctx = getCtx();
            const t = ctx.currentTime;
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(_masterGain || ctx.destination);

            if (type === 'hover') {
                osc.type = 'sine';
                osc.frequency.setValueAtTime(1000, t);
                osc.frequency.exponentialRampToValueAtTime(1400, t + 0.04);
                gain.gain.setValueAtTime(0.04, t);
                gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
                osc.start(t);
                osc.stop(t + 0.06);
            } else {
                osc.type = 'sine';
                osc.frequency.setValueAtTime(800, t);
                osc.frequency.exponentialRampToValueAtTime(100, t + 0.07);
                gain.gain.setValueAtTime(0.15, t);
                gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
                osc.start(t);
                osc.stop(t + 0.1);
            }
            console.log("MoshkoSounds: Playing UI sound:", type);
        } catch (e) { console.error("MoshkoSounds: UI Sound Error", e); }
    }

    function playMuteFeedback(isMuting) {
        try {
            const ctx = getCtx();
            const t = ctx.currentTime;
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(_ctx.destination); // Bypass master gain to ensure it plays during the mute transition

            if (isMuting) {
                // Descending "Power Down"
                osc.type = 'sine';
                osc.frequency.setValueAtTime(600, t);
                osc.frequency.exponentialRampToValueAtTime(300, t + 0.15);
                gain.gain.setValueAtTime(0.1, t);
                gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
                osc.start(t);
                osc.stop(t + 0.2);
            } else {
                // Ascending "Access Granted"
                osc.type = 'sine';
                osc.frequency.setValueAtTime(400, t);
                osc.frequency.exponentialRampToValueAtTime(800, t + 0.15);
                gain.gain.setValueAtTime(0.1, t);
                gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
                osc.start(t);
                osc.stop(t + 0.2);
            }
        } catch (e) { }
    }

    function isRagdollDisabled() {
        return document.body.classList.contains('ragdoll-disabled');
    }

    function playHitSound() {
        if (_isMuted || _hitCooldown || isRagdollDisabled()) return;
        if (helloVoice) { helloVoice.pause(); helloVoice.currentTime = 0; }
        _hitCooldown = true;
        setTimeout(() => { _hitCooldown = false; }, 300);
        try {
            const clone = hitSound.cloneNode();
            clone.volume = 0.8;
            clone.play().catch(e => { });
        } catch (e) { }
    }

    function playScream() {
        if (_isMuted || _screamCooldown || isRagdollDisabled()) return;
        _screamCooldown = true;
        setTimeout(() => { _screamCooldown = false; }, 800);
        try {
            for (let i = 0; i < 5; i++) {
                screamChannels[i].currentTime = 0;
                screamChannels[i].play().catch(e => { });
            }
        } catch (e) { }
    }

    function playGrabSound() {
        if (_isMuted || isRagdollDisabled()) return;
        if (helloVoice) { helloVoice.pause(); helloVoice.currentTime = 0; }
        try {
            const ctx = getCtx();
            const t = ctx.currentTime;
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(_masterGain);
            osc.type = 'sine';
            osc.frequency.setValueAtTime(300, t);
            osc.frequency.exponentialRampToValueAtTime(600, t + 0.1);
            gain.gain.setValueAtTime(0, t);
            gain.gain.linearRampToValueAtTime(0.2, t + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
            osc.start(t);
            osc.stop(t + 0.2);
        } catch (e) { }
    }

    function playSkinChangeSound() {
        if (_isMuted || isRagdollDisabled()) return;
        try {
            const ctx = getCtx();
            const t = ctx.currentTime;
            const gain = ctx.createGain();
            gain.connect(_masterGain);
            gain.gain.setValueAtTime(0.1, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.8);
            [1200, 1600, 2000].forEach((freq, i) => {
                const osc = ctx.createOscillator();
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(freq, t + i * 0.1);
                osc.frequency.exponentialRampToValueAtTime(freq * 1.5, t + i * 0.1 + 0.2);
                osc.connect(gain);
                osc.start(t + i * 0.1);
                osc.stop(t + 0.8);
            });
        } catch (e) { }
    }

    function playResetSound() {
        if (_isMuted || isRagdollDisabled()) return;
        try {
            const ctx = getCtx();
            const t = ctx.currentTime;
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(_masterGain);
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(800, t);
            osc.frequency.exponentialRampToValueAtTime(50, t + 0.4);
            gain.gain.setValueAtTime(0, t);
            gain.gain.linearRampToValueAtTime(0.2, t + 0.1);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
            const filter = ctx.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(2000, t);
            filter.frequency.exponentialRampToValueAtTime(100, t + 0.4);
            osc.disconnect(gain);
            osc.connect(filter);
            filter.connect(gain);
            osc.start(t);
            osc.stop(t + 0.5);
        } catch (e) { }
    }

    function playExplosionSound() {
        if (_isMuted) return;
        try {
            const ctx = getCtx();
            if (ctx.state === 'suspended') ctx.resume();
            const t = ctx.currentTime;
            
            // 1. Noise Buffer for the "boom"
            const sampleRate = ctx.sampleRate || 44100;
            const bufferSize = sampleRate * 1.5;
            const buffer = ctx.createBuffer(1, bufferSize, sampleRate);
            const data = buffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) {
                data[i] = Math.random() * 2 - 1;
            }
            const noise = ctx.createBufferSource();
            noise.buffer = buffer;

            const noiseFilter = ctx.createBiquadFilter();
            noiseFilter.type = 'lowpass';
            noiseFilter.frequency.setValueAtTime(800, t);
            noiseFilter.frequency.exponentialRampToValueAtTime(40, t + 0.4);

            const noiseGain = ctx.createGain();
            noiseGain.gain.setValueAtTime(1.0, t);
            noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 1.2);

            noise.connect(noiseFilter);
            noiseFilter.connect(noiseGain);
            noiseGain.connect(_masterGain || ctx.destination);
            noise.start(t);
            noise.stop(t + 1.2);

            // 2. Low Frequency Thump
            const osc = ctx.createOscillator();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(80, t);
            osc.frequency.exponentialRampToValueAtTime(20, t + 0.2);
            const oscGain = ctx.createGain();
            oscGain.gain.setValueAtTime(0.8, t);
            oscGain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
            osc.connect(oscGain);
            oscGain.connect(_masterGain || ctx.destination);
            osc.start(t);
            osc.stop(t + 0.3);
            console.log("MoshkoSounds: Explosion synthesized.");
        } catch (e) { console.error("MoshkoSounds: Explosion synthesis error", e); }
    }

    function playWaveSound() {
        if (_isMuted || isRagdollDisabled()) return;
        // In Hebrew mode — play shalom.mp3
        if (window.MoshkoLang && window.MoshkoLang.current === 'he') {
            try {
                setTimeout(() => {
                    if (_isMuted) return;
                    shalomVoice.currentTime = 0;
                    shalomVoice.play().catch(e => { });
                }, 1500);
            } catch (e) { }
            return;
        }
        // English mode — play the hello audio file
        try {
            setTimeout(() => {
                if (_isMuted) return;
                helloVoice.currentTime = 0;
                helloVoice.play().catch(e => { });
            }, 1500);
        } catch (e) { }
    }

    function playAirSound(type) {
        if (_isMuted || _flyState === type || isRagdollDisabled()) return;
        _flyState = type;
        if (type === 'fall') {
            try {
                for (let i = 0; i < 3; i++) {
                    fallChannels[i].currentTime = 0;
                    fallChannels[i].play().catch(e => { });
                }
            } catch (e) { }
        }
    }

    function stopAirSound() {
        if (_flyState === 'none') return;
        _flyState = 'none';
    }

    function startDragLoop() {
        window.isRagdollGrabbed = true;
        if (_isMuted || _dragSynth || isRagdollDisabled()) return;
        try {
            const ctx = getCtx();
            const t = ctx.currentTime;
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(_masterGain);
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(60, t);
            gain.gain.setValueAtTime(0, t);
            gain.gain.linearRampToValueAtTime(0.05, t + 0.2);
            osc.start(t);
            _dragSynth = { osc, gain, ctx };
        } catch (e) { }
    }

    function updateDragLoop(speed) {
        if (!_dragSynth) return;
        try {
            const t = _dragSynth.ctx.currentTime;
            _dragSynth.osc.frequency.setTargetAtTime(60 + speed * 12, t, 0.1);
            _dragSynth.gain.gain.setTargetAtTime(Math.min(0.02 + speed * 0.005, 0.15), t, 0.1);
        } catch (e) { }
    }

    function stopDragLoop() {
        window.isRagdollGrabbed = false;
        if (!_dragSynth) return;
        try {
            const t = _dragSynth.ctx.currentTime;
            _dragSynth.gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
            const ref = _dragSynth;
            _dragSynth = null;
            setTimeout(() => {
                ref.osc.stop();
                ref.osc.disconnect();
                ref.gain.disconnect();
            }, 150);
        } catch (e) { }
    }

    function attachButtonSounds() {
        const clickSelector = 'button, .btn, a, input, textarea, .game-card, .quick-link-card, .logo-link, select';
        const hoverSelector = clickSelector + ', .glass-card, .bio-card, .update-card, .gallery-item, .pack-img, .timeline-card, .timeline-item, .stat-card';
        document.addEventListener('click', function (e) {
            if (!e.target || typeof e.target.closest !== 'function') return;
            if (e.target.closest('.skin-control-panel')) return;
        }, true);
        let lastHovered = null;
        document.addEventListener('mouseover', function (e) {
            if (!e.target || typeof e.target.closest !== 'function') return;
            if (e.target.closest('.skin-control-panel')) { lastHovered = null; return; }
            const el = e.target.closest(hoverSelector);
            if (el && el !== lastHovered) {
                lastHovered = el;
                playUISound('hover');
            } else if (!el) {
                lastHovered = null;
            }
        }, true);
    }

    let _bounds = { floorY: -20, wallLeftX: -40, wallRightX: 40 };
    function updatePhysicsBounds() {
        const dist = 40;
        const vFOV = (45 * Math.PI) / 180;
        const fullHeight = 2 * Math.tan(vFOV / 2) * dist;
        const fullWidth = fullHeight * (window.innerWidth / window.innerHeight);
        _bounds.floorY = -(fullHeight * 0.95) / 2;
        _bounds.wallLeftX = -(fullWidth * 0.95) / 2;
        _bounds.wallRightX = (fullWidth * 0.95) / 2;
    }

    function hookRagdollScream() {
        updatePhysicsBounds();
        window.addEventListener('resize', updatePhysicsBounds);
        setInterval(() => {
            if (document.hidden) { stopAirSound(); return; }
            try {
                if (window.character && window.character.parts && window.character.parts.body) {
                    const body = window.character.parts.body.body;
                    if (!body._hasCollideHook) {
                        body._hasCollideHook = true;
                        window._isCurrentlyScreamingTrajectory = false;
                        body.addEventListener("collide", (e) => {
                            if (window.isRagdollGrabbed) return;
                            if (Math.abs(e.contact.getImpactVelocityAlongNormal()) > 3) {
                                window._isCurrentlyScreamingTrajectory = false;
                                playHitSound();
                            }
                        });
                    }
                    const vy = body.velocity.y;
                    const vx = body.velocity.x;
                    const speed = Math.sqrt(vx * vx + vy * vy);
                    if (!window.isRagdollGrabbed) {
                        if (vy < -6.0) playAirSound('fall');
                        else if (speed < 5.0) stopAirSound();

                        const px = body.position.x;
                        const py = body.position.y;
                        let tti_floor = (vy < -1) ? (_bounds.floorY - py) / vy : Infinity;
                        let tti_left = (vx < -1) ? (_bounds.wallLeftX - px) / vx : Infinity;
                        let tti_right = (vx > 1) ? (_bounds.wallRightX - px) / vx : Infinity;

                        const willImpact = (tti_floor > 0 && tti_floor < 0.9 && vy < -15) ||
                                           (tti_left > 0 && tti_left < 0.9 && vx < -15) ||
                                           (tti_right > 0 && tti_right < 0.9 && vx > 15);

                        if (willImpact) {
                            if (!window._isCurrentlyScreamingTrajectory) {
                                window._isCurrentlyScreamingTrajectory = true;
                                playScream();
                            }
                        } else if (speed < 5.0) {
                            window._isCurrentlyScreamingTrajectory = false;
                        }
                    } else {
                        window._isCurrentlyScreamingTrajectory = false;
                        stopAirSound();
                    }
                }
            } catch (e) { }
        }, 100);
    }

    function init() {
        attachButtonSounds();
        hookRagdollScream();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    window.MoshkoSounds = {
        toggleMute,
        playUISound,
        playScream,
        playHitSound,
        playGrabSound,
        playSkinChangeSound,
        playResetSound,
        playExplosionSound,
        playWaveSound,
        startDragLoop,
        updateDragLoop,
        stopDragLoop,
        getCtx
    };
    console.log("Moshko's Core: Sound engine initialized and waving hooks active.");
})();
