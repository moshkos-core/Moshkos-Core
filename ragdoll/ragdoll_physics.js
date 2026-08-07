/*
    ragdoll_physics.js - ACTIVE RAGDOLL ENGINE v35 (SMOOTHER PHYSICS)
    Features: 
    - Fixed Explosion: Smoothed settlement forces and added safety caps.
    - 3-Second Rule: Waving triggers exactly 3s after fully standing up.
    - Stable Ground: Dynamically detects floor from Cannon world.
    - Reset Logic: Interaction or instability restarts the 3s clock.
*/

class RagdollPhysics {
    constructor(ragdoll) {
        this.ragdoll = ragdoll;
        this.animTime = 0;
        this.wavePhase = 'IDLE';
        this.waveCount = 0;
        this.waveTimer = 0;
        this.lastWaveCompleteTime = 0;

        this.isStable = false;
        this.stableStartTime = 0;
        this.homePosition = null;
        this.groundY = -50; // Dynamic Floor Check Needed (Initialized safely low)
    }

    update(dt) {
        if (!this.ragdoll || !this.ragdoll.parts.body) return;

        const ragdoll = this.ragdoll;
        const body = ragdoll.parts.body.body;
        const p = ragdoll.parts;

        // 1. ENFORCE 2D PLANE (The "Glass Pane" effect)
        // This is non-negotiable for a 2D ragdoll.
        [body, p.head?.body, p.armLeft?.body, p.armRight?.body, p.legLeft?.body, p.legRight?.body].forEach(part => {
            if (part) {
                part.position.z = 0;
                part.velocity.z = 0;
                part.angularVelocity.x = 0;
                part.angularVelocity.y = 0;
                // Force quaternion to be only Z-rotation
                const zRot = 2 * Math.atan2(part.quaternion.z, part.quaternion.w);
                part.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 0, 1), zRot);
            }
        });

        // ANGULAR LIMITS (Simulate Collision)
        // This prevents limbs from passing through the body or each other
        const bodyRot = Math.atan2(body.quaternion.z, body.quaternion.w) * 2;

        const constrainAngle = (part, min, max, stiffness) => {
            if (!part) return;
            let current = Math.atan2(part.body.quaternion.z, part.body.quaternion.w) * 2;
            let relative = current - bodyRot;
            while (relative > Math.PI) relative -= Math.PI * 2;
            while (relative < -Math.PI) relative += Math.PI * 2;

            let correction = 0;
            if (relative < min) correction = min - relative;
            else if (relative > max) correction = max - relative;

            if (correction !== 0) {
                // 1. Soft Limit (Torque)
                const torque = correction * stiffness - part.body.angularVelocity.z * 10;
                part.body.torque.z += torque;

                // 2. HARD CLAMP (Prevent clipping / Flip)
                // If angle goes beyond limit, SNAP it back.
                const clampAngle = relative < min ? min : max;
                const targetAbs = bodyRot + clampAngle;
                // Reset Z rotation immediately
                part.body.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 0, 1), targetAbs);
                // Kill angular velocity in the direction of the error
                part.body.angularVelocity.z *= 0.1;
            }
        };

        // Arms: Prevent swinging INSIDE body
        // Right Arm: 0 is down. Positive is OUT. Negative is IN.
        // Limit: -0.2 (Slightly in) to 2.8 (Full Up)
        constrainAngle(p.armRight, -0.2, 2.8, 800);

        // Left Arm: 0 is down. Negative is OUT. Positive is IN.
        // Limit: -2.8 (Full Up) to 0.2 (Slightly in)
        constrainAngle(p.armLeft, -2.8, 0.2, 800);

        // Legs: Prevent Splitting too wide or crossing
        // Was 0.6, now 1.0 (approx 57 degrees)
        constrainAngle(p.legLeft, -1.0, 1.0, 800);
        constrainAngle(p.legRight, -1.0, 1.0, 800);

        // ENFORCE JOINTS (Prevent limbs from falling apart or stretching)
        const enforceJoints = () => {
            const PIXEL_SCALE = 0.1;
            const snapPart = (part, bx, by, px, py) => {
                if (!part) return;
                // Use fresh vectors to avoid mutation drift
                const bPivot = new CANNON.Vec3(bx * PIXEL_SCALE, by * PIXEL_SCALE, 0);
                const pPivot = new CANNON.Vec3(px * PIXEL_SCALE, py * PIXEL_SCALE, 0);

                const rBPivot = body.quaternion.vmult(bPivot);
                const socket = body.position.vadd(rBPivot);
                const rPPivot = part.body.quaternion.vmult(pPivot);

                const dist = socket.vsub(part.body.position.vadd(rPPivot)).length();
                if (dist > 0.4) { // Balanced threshold to prevent stretching without jitter
                    part.body.position.copy(socket.vsub(rPPivot));
                    part.body.velocity.copy(body.velocity);
                    part.body.angularVelocity.copy(body.angularVelocity);
                }
            };

            // Values MUST EXACTLY match createJoint(...) in ragdoll_background.js
            snapPart(p.armLeft, -4.0, 5.5, 1.5, 6.0);
            snapPart(p.armRight, 4.0, 5.5, -1.5, 6.0);
            snapPart(p.legLeft, -2.3, -6.2, 0, 6.2);
            snapPart(p.legRight, 2.3, -6.2, 0, 6.2);
        };
        enforceJoints();

        // HEAD LOCK (Manual Position & Rotation Snap)
        const lockHead = () => {
            if (!p.head) return;
            const PIXEL_SCALE = 0.1;
            // Socket on Body
            const bOff = new CANNON.Vec3(0, 6.2 * PIXEL_SCALE, 0);
            const rBOff = body.quaternion.vmult(bOff);
            const socket = body.position.vadd(rBOff);

            // Offset on Head
            const hOff = new CANNON.Vec3(0, -4.2 * PIXEL_SCALE, 0);
            const rHOff = body.quaternion.vmult(hOff);

            p.head.body.position.copy(socket.vsub(rHOff));
            p.head.body.quaternion.copy(body.quaternion);
            p.head.body.velocity.copy(body.velocity);
            p.head.body.angularVelocity.copy(body.angularVelocity);
        };
        lockHead();


        // Detect Ground
        if (window.boundaries && window.boundaries[0]) {
            this.groundY = window.boundaries[0].position.y + 25;
        }

        // Interaction Check
        const inactiveTime = Date.now() - (window.lastInteractionTime || 0);
        const isInteracting = inactiveTime < 200;

        if (isInteracting) {
            this.isStable = false;
            this.stableStartTime = 0;
            this.homePosition = null;
            this.homeQuaternion = null;
            this.wavePhase = 'IDLE';
            ragdoll.currentState = 'IDLE';
            // Even when interacting, we apply gentle pose forces so he doesn't loop limp
            this.applyActivePose(dt, false);
            lockHead(); // Ensure head lock during interaction too
            return;
        }

        // --- STABLE STATE (Statue / Wave) ---
        if (this.isStable) {
            // Wave Trigger Logic...
            const timeStable = Date.now() - this.stableStartTime;
            // Much shorter time idle to start waving (1.5 seconds)
            if (timeStable > 1500 && ragdoll.currentState !== 'WAVE') {
                const sinceLastWave = Date.now() - this.lastWaveCompleteTime;
                if (this.lastWaveCompleteTime === 0 || sinceLastWave > 4000) {
                    if (typeof window.MoshkoSounds !== 'undefined' && window.MoshkoSounds.playWaveSound) {
                        window.MoshkoSounds.playWaveSound();
                    }
                    ragdoll.currentState = 'WAVE';
                    this.wavePhase = 'RAISING';
                    this.waveCount = 0;
                    this.waveTimer = 0;
                }
            }

            if (ragdoll.currentState === 'WAVE') {
                this.poseWave(dt);
            } else {
                this.poseStatue();
            }
            lockHead(); // Ensure head lock during stable too
            return;
        }

        // --- FALLING / STANDING STATE ---
        // SMOOTHER STAND UP LOGIC
        // We track a 'standFactor' that ramps from 0 to 1 when he is successfully getting upright
        const vel = body.velocity.length();
        const rotZ = Math.atan2(body.quaternion.z, body.quaternion.w) * 2;
        const isUpright = Math.abs(rotZ) < 0.4; // Generous upright check

        if (vel < 15.0 && isUpright) {
            this.standFactor = (this.standFactor || 0) + dt; // Ramp up over ~1 second
            if (this.standFactor > 1) this.standFactor = 1;
        } else {
            this.standFactor = (this.standFactor || 0) - dt * 2; // Decay faster if falling
            if (this.standFactor < 0) this.standFactor = 0;
        }

        // Apply forces to stand up and hold shape
        this.applyActivePose(dt, this.standFactor);
        lockHead(); // Ensure head lock always

        // Check for Stability (Transition to Statue)
        const angVel = Math.abs(body.angularVelocity.z);
        // More forgiving stability check (25.0 vel instead of 15.0) to ignore floor jitter
        if (vel < 25.0 && angVel < 10.0 && Math.abs(rotZ) < 0.4 && this.standFactor >= 1.0) {
            if (!this.standingTimer) this.standingTimer = Date.now();
            if (Date.now() - this.standingTimer > 200) {
                this.isStable = true;
                this.stableStartTime = Date.now();
                this.homePosition = new CANNON.Vec3().copy(body.position);
                this.homeQuaternion = new CANNON.Quaternion().copy(body.quaternion);
                // Removed hard-snapping which caused "jumping" due to floor height mismatch
                // If we need a floor snap, it should be calculated from real collision data.

                // Capture limb start rotations for blending
                this.limbStartQuats = {};
                Object.keys(p).forEach(key => {
                    if (p[key] && p[key].body) {
                        this.limbStartQuats[key] = new CANNON.Quaternion().copy(p[key].body.quaternion);
                    }
                });
            }
        } else {
            this.standingTimer = null;
        }
    }

    // Main Active Logic (Standing + Flying)
    applyActivePose(dt, standFactor = 0) {
        const rag = this.ragdoll;
        const body = rag.parts.body.body;
        const p = rag.parts;

        // STRONG STIFFNESS ALWAYS (to ensure he gets up)
        // Ramp slightly for "lock in" feel, but base must be strong.
        const MIN_KP = 2500; // Super Strong to lift from flat
        const MAX_KP = 3500; // Rock solid
        const KP_BODY = MIN_KP + (MAX_KP - MIN_KP) * standFactor;

        const KD_BODY = 250; // Reduce damping to allow faster rise

        const KP_LIMB = (300 + 200 * standFactor) * 0.8; // Slightly softer to prevent micro-jitter
        const KD_LIMB = (20 + 130 * standFactor) * 1.2;  // Higher damping for stability

        // 1. BODY UPRIGHT
        // Target: 0 (Upright)
        this.applyPDTorque(body, 0, KP_BODY, KD_BODY);

        // 2. HEAD: Handled by lockHead()

        // 3. LIMBS (Resting Angles)
        const breathe = Math.sin(Date.now() / 600) * 0.05;
        const bodyAngle = Math.atan2(body.quaternion.z, body.quaternion.w) * 2;

        if (p.armRight) this.applyPDTorque(p.armRight.body, bodyAngle + 0.10 - breathe, KP_LIMB, KD_LIMB);
        if (p.armLeft) this.applyPDTorque(p.armLeft.body, bodyAngle - 0.10 + breathe, KP_LIMB, KD_LIMB);

        // Keep legs stiff to stand
        const KP_LEG = 800;
        if (p.legLeft) this.applyPDTorque(p.legLeft.body, bodyAngle + 0, KP_LEG, KD_LIMB);
        if (p.legRight) this.applyPDTorque(p.legRight.body, bodyAngle + 0, KP_LEG, KD_LIMB);
    }

    applyPDTorque(body, target, kP, kD) {
        let current = Math.atan2(body.quaternion.z, body.quaternion.w) * 2;
        let err = target - current;
        while (err > Math.PI) err -= Math.PI * 2;
        while (err < -Math.PI) err += Math.PI * 2;
        const torque = (err * kP) - (body.angularVelocity.z * kD);
        body.torque.z += Math.max(-1500, Math.min(1500, torque));
    }

    poseStatue() {
        const rag = this.ragdoll;
        const body = rag.parts.body.body;
        const p = rag.parts;
        const PIXEL_SCALE = 0.1;

        // FULLY KINEMATIC: Set all positions directly, no physics forces
        if (this.homePosition) {
            body.position.copy(this.homePosition);
        }
        body.velocity.set(0, 0, 0);
        body.angularVelocity.set(0, 0, 0);

        // Smooth Rotation Blend
        const timeStable = Date.now() - this.stableStartTime;
        let blendAlpha = 1.0;

        if (timeStable < 6000 && this.homeQuaternion) {
            const t = timeStable / 6000;
            // Ease In-Out Sine for ultra-smooth start and end
            blendAlpha = -(Math.cos(Math.PI * t) - 1) / 2;

            // Body Blend
            const targetQ = new CANNON.Quaternion(0, 0, 0, 1);
            body.quaternion.copy(this.homeQuaternion);
            body.quaternion.slerp(targetQ, blendAlpha, body.quaternion);
        } else {
            body.quaternion.set(0, 0, 0, 1);
        }

        // Breathing Effect
        const breathe = Math.sin(Date.now() / 600) * 0.05;

        const config = [
            { name: 'head', bOff: [0, 6.2], pOff: [0, -4.2], rot: 0 },
            { name: 'armLeft', bOff: [-4.0, 5.5], pOff: [1.5, 6.0], rot: -0.10 + breathe },  // Breathing ~6:10
            { name: 'armRight', bOff: [4.0, 5.5], pOff: [-1.5, 6.0], rot: 0.10 - breathe },  // ~5:50 + Mirrored Breathing
            { name: 'legLeft', bOff: [-2.3, -6.2], pOff: [0, 6.2], rot: 0 },
            { name: 'legRight', bOff: [2.3, -6.2], pOff: [0, 6.2], rot: 0 }
        ];

        config.forEach(j => {
            const part = p[j.name]?.body;
            if (!part) return;

            // Target Rotation
            const targetQuat = new CANNON.Quaternion();
            targetQuat.setFromAxisAngle(new CANNON.Vec3(0, 0, 1), j.rot);

            if (blendAlpha < 1.0 && this.limbStartQuats && this.limbStartQuats[j.name]) {
                // Blend from start rotation
                part.quaternion.copy(this.limbStartQuats[j.name]);
                part.quaternion.slerp(targetQuat, blendAlpha, part.quaternion);
            } else {
                // Direct set
                part.quaternion.copy(targetQuat);
            }

            // Calculate position from body anchor (RESPECTING BODY ROTATION)
            const offsetBody = new CANNON.Vec3(j.bOff[0] * PIXEL_SCALE, j.bOff[1] * PIXEL_SCALE, 0);
            const rotatedOffsetBody = body.quaternion.vmult(offsetBody);
            const bAnchor = body.position.vadd(rotatedOffsetBody);

            const offsetPart = new CANNON.Vec3(j.pOff[0] * PIXEL_SCALE, j.pOff[1] * PIXEL_SCALE, 0);
            const rotatedOffsetPart = part.quaternion.vmult(offsetPart);

            part.position.copy(bAnchor.vsub(rotatedOffsetPart));

            // Zero velocity
            part.velocity.set(0, 0, 0);
            part.angularVelocity.set(0, 0, 0);
        });
    }

    poseWave(dt) {
        const rag = this.ragdoll;
        const body = rag.parts.body.body;
        const p = rag.parts;
        const PIXEL_SCALE = 0.1;
        if (!body) return;
        this.waveTimer += dt * 1000;

        // FULLY KINEMATIC: Set all positions directly
        if (this.homePosition) {
            body.position.copy(this.homePosition);
        }
        body.velocity.set(0, 0, 0);
        body.angularVelocity.set(0, 0, 0);
        body.quaternion.set(0, 0, 0, 1);

        // Animation Curve for Right Arm
        const START = 0.10; // 5:50
        const TOP = 2.7;
        const LOW = 2.1;
        let armRightTarget = START;

        switch (this.wavePhase) {
            case 'RAISING':
                let pr = Math.min(this.waveTimer / 800, 1);
                armRightTarget = START + (TOP - START) * pr;
                if (this.waveTimer > 800) { this.wavePhase = 'WAVE_DOWN'; this.waveTimer = 0; }
                break;
            case 'WAVE_DOWN':
                let pd = Math.min(this.waveTimer / 300, 1);
                armRightTarget = TOP - (TOP - LOW) * pd;
                if (this.waveTimer > 300) { this.wavePhase = 'WAVE_UP'; this.waveTimer = 0; }
                break;
            case 'WAVE_UP':
                let pu = Math.min(this.waveTimer / 300, 1);
                armRightTarget = LOW + (TOP - LOW) * pu;
                if (this.waveTimer > 300) {
                    this.waveCount++;
                    if (this.waveCount >= 5) { this.wavePhase = 'LOWERING'; this.waveTimer = 0; }
                    else { this.wavePhase = 'WAVE_DOWN'; this.waveTimer = 0; }
                }
                break;
            case 'LOWERING':
                let pl = Math.min(this.waveTimer / 800, 1);
                armRightTarget = TOP - (TOP - START) * pl;
                if (this.waveTimer > 800) {
                    this.wavePhase = 'IDLE';
                    rag.currentState = 'IDLE';
                    this.lastWaveCompleteTime = Date.now();
                }
                break;
        }

        // Breathing Effect
        const breathe = Math.sin(Date.now() / 600) * 0.05;

        const waveConfig = [
            { name: 'head', bOff: [0, 6.2], pOff: [0, -4.2], rot: 0 },
            { name: 'armLeft', bOff: [-4.0, 5.5], pOff: [1.5, 6.0], rot: -0.10 + breathe },
            { name: 'armRight', bOff: [4.0, 5.5], pOff: [-1.5, 6.0], rot: armRightTarget },
            { name: 'legLeft', bOff: [-2.3, -6.2], pOff: [0, 6.2], rot: 0 },
            { name: 'legRight', bOff: [2.3, -6.2], pOff: [0, 6.2], rot: 0 }
        ];

        waveConfig.forEach(j => {
            const part = p[j.name]?.body;
            if (!part) return;
            // Set rotation
            part.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 0, 1), j.rot);
            // Calculate position from body anchor
            const bAnchor = body.position.vadd(new CANNON.Vec3(j.bOff[0] * PIXEL_SCALE, j.bOff[1] * PIXEL_SCALE, 0));
            const pOffset = part.quaternion.vmult(new CANNON.Vec3(j.pOff[0] * PIXEL_SCALE, j.pOff[1] * PIXEL_SCALE, 0));
            part.position.copy(bAnchor.vsub(pOffset));
            // Zero velocity
            part.velocity.set(0, 0, 0);
            part.angularVelocity.set(0, 0, 0);
        });
    }
}
