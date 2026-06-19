// =============================================================================
// TNT GRENADE SYSTEM
// Physics: CANNON.js body â€” gravity, bouncing, drag identical to ragdoll limbs.
// Lifecycle: thrown from ragdoll â†’ flies â†’ lands â†’ Minecraft flash â†’ explode.
// =============================================================================

let tntPhysMat = null;
function getTntMaterial() {
    if (tntPhysMat) return tntPhysMat;
    tntPhysMat = new CANNON.Material({ friction: 0.1, restitution: 0.25 });
    return tntPhysMat;
}

class Grenade {
    static getSharedTextures() {
        if (!Grenade._tex) {
            const loader = new THREE.TextureLoader();
            const b64Side = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAl0lEQVQ4y2N45SzxH4Rv60v93yiq/p9UPgOIAeNM1BX8Typ/OBjwHwjOnTv3/+7Nm2AMYiPzcYmBMAiADQBxzM3CwFhaygbOh2lEFoOpAYmDDQBJ7Nu0Ga4QpgmmGMaGuQDERnYFiheQJWFsZIOQLQFZCjcA5k+YJDYvoHsH7gWQSZRgBlB0wKIEhEnlD4eUCPMTTIBUPgDuSGGtq/CnywAAAABJRU5ErkJggg==';
            const b64Top = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAv0lEQVQ4y5WTwQ1CMQxDu0IPSIgDV06IIdihY1ViFOZhA5YocqWHTGjh92ApbtI0ttL0uBza87rvULzKk4Jaa8d9d2qr/N2glNJu59yc53zsUKwz5TmDJ3URRFSoWAXiAnkuen1v4JoommlWbrMHvMb4Pt3UA0ADB5rxZugBmt1ATATRoxQ1xcsO5aNHXxIYbzTBXw/Yg9jEfXGfhh4wBXHU/XMPVAx3zeim4dQD3wPnjDziH4vkf2ErH+7BCn8BKYUBy/bJrtYAAAAASUVORK5CYII=';
            const b64Bottom = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAM0lEQVQ4y2PYKKr+/7a+FBiD2KTyGUCMvr4+MJ6oK/ifVD7lBoAISjDDaBiMhsFoGIAxAO5/Hd+A36XEAAAAAElFTkSuQmCC';
            
            const side = loader.load(b64Side);
            side.magFilter = THREE.NearestFilter;
            side.minFilter = THREE.NearestFilter;

            const top = loader.load(b64Top);
            top.magFilter = THREE.NearestFilter;
            top.minFilter = THREE.NearestFilter;

            const bottom = loader.load(b64Bottom);
            bottom.magFilter = THREE.NearestFilter;
            bottom.minFilter = THREE.NearestFilter;
            
            Grenade._tex = { side, top, bottom };
        }
        return Grenade._tex;
    }

    constructor(x, y, vx, vy) {
        this.exploded      = false;
        this.held          = false;
        this.countingDown  = false;
        this.countdownTimer = 0;
        this.HALF          = 0.65;
        this.COUNTDOWN     = 2.5;   // seconds of flash before boom
        this.airTime       = 0;     // time freely flying (not held, not counting)

        // â”€â”€ CANNON body â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
        this.body = new CANNON.Body({
            mass: 12, // Identical to Ragdoll for standard smooth heavy-throw physics
            position: new CANNON.Vec3(x, y, 0),
            material: getTntMaterial(),
            linearDamping:  0.50, // Matches ragdoll air resistance
            angularDamping: 0.70,
        });
        this.body.addShape(new CANNON.Box(new CANNON.Vec3(this.HALF, this.HALF, this.HALF)));
        this.body.allowSleep = false; // never sleep â€” sleeping bodies ignore gravity
        this.body.velocity.set(vx, vy, 0);
        this.body.angularVelocity.set(0, 0, (Math.random() - 0.5) * 4);
        world.addBody(this.body);

        this.dragConstraint = null; // PointToPointConstraint while held

        // â”€â”€ Three.js mesh â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
        const tex = Grenade.getSharedTextures();
        this.mats = [
            new THREE.MeshLambertMaterial({ map: tex.side }),
            new THREE.MeshLambertMaterial({ map: tex.side }),
            new THREE.MeshLambertMaterial({ map: tex.top }),
            new THREE.MeshLambertMaterial({ map: tex.bottom }),
            new THREE.MeshLambertMaterial({ map: tex.side }),
            new THREE.MeshLambertMaterial({ map: tex.side })
        ];
        this.mesh = new THREE.Mesh(
            new THREE.BoxGeometry(this.HALF * 2, this.HALF * 2, this.HALF * 2),
            this.mats
        );
        this.mesh.castShadow = false; // Performance: Disabled shadows for small dynamic items
        this.mesh.receiveShadow = false;
        this.mesh.position.set(x, y, 0);
        scene.add(this.mesh);
    }

    update(dt) {
        if (this.exploded) return;
        const b = this.body;

        // â”€â”€ Enforce 2D plane (mirrors ragdoll_physics.js Glass-Pane trick) â”€
        b.position.z        = 0;
        b.velocity.z        = 0;
        b.angularVelocity.x = 0;
        b.angularVelocity.y = 0;
        const zRot = 2 * Math.atan2(b.quaternion.z, b.quaternion.w);
        b.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 0, 1), zRot);

        // â”€â”€ State machine â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

        if (this.held) {
            this.countingDown   = false;
            this.countdownTimer = 0;
            this.airTime        = 0;
            this._clearEmissive();

        } else if (this.countingDown) {
            // Lock body on floor during Minecraft flash animation
            b.position.set(this._cdX, tntBounds.bottom + this.HALF, 0);
            b.velocity.set(0, 0, 0);
            b.angularVelocity.set(0, 0, 0);

            this.countdownTimer += dt;
            const progress = Math.min(this.countdownTimer / this.COUNTDOWN, 1);

            // Flash rate: ~3 Hz at start â†’ ~18 Hz just before boom
            const hz = 3 + progress * progress * 15;
            const on = Math.sin(Date.now() * 0.001 * hz * Math.PI * 2) > 0;

            if (on) {
                const k = 0.55 + 0.45 * progress;
                this.mats.forEach(m => {
                    if (!m.emissive) m.emissive = new THREE.Color();
                    m.emissive.setRGB(k, k * 0.88, k * 0.75);
                });
                this.mesh.scale.setScalar(1.0 + 0.13 * progress);
            } else {
                this._clearEmissive();
                this.mesh.scale.setScalar(1.0);
            }

            if (this.countdownTimer >= this.COUNTDOWN) this.explode();

        } else {
            // Free flight
            this.airTime += dt;

            // Keep body awake — prevents physics engine from freezing it
            b.wakeUp();

            // Out-of-bounds guard
            if (!isFinite(b.position.x) || !isFinite(b.position.y) ||
                Math.abs(b.position.x) > 80 || b.position.y > 80) {
                b.position.set(0, 5, 0);
                b.velocity.set(0, 0, 0);
            }

            // Stuck detection: if velocity is near zero mid-air for too long, kick it down
            const speed = Math.sqrt(b.velocity.x * b.velocity.x + b.velocity.y * b.velocity.y);
            if (this.airTime > 1.5 && speed < 0.5 &&
                b.position.y - this.HALF > tntBounds.bottom + 1.5) {
                b.velocity.set(0, -8, 0);
                b.wakeUp();
            }

            // Max lifetime: auto-explode after 15 seconds of free flight
            if (this.airTime > 15) {
                this.explode();
                return;
            }

            // Land on floor â†’ start countdown
            // Requires 0.3 s of free flight to prevent triggering mid-throw
            if (this.airTime > 0.3 &&
                b.velocity.y <= 1.5 &&
                b.position.y - this.HALF <= tntBounds.bottom + 0.8) {
                this.countingDown   = true;
                this.countdownTimer = 0;
                this._cdX           = b.position.x;
                b.velocity.set(0, 0, 0);
                b.angularVelocity.set(0, 0, 0);
                b.position.set(this._cdX, tntBounds.bottom + this.HALF, 0);
            }
        }

        // Sync mesh
        if (!this.countingDown) this.mesh.scale.setScalar(this.held ? 1.12 : 1.0);
        this.mesh.position.copy(b.position);
        this.mesh.quaternion.copy(b.quaternion);
    }

    _clearEmissive() {
        this.mats.forEach(m => { if (m.emissive) m.emissive.setRGB(0, 0, 0); });
    }

    explode() {
        if (this.exploded) return;
        this.exploded = true;
        this._clearEmissive();

        const ex = this.body ? this.body.position.x : 0;
        const ey = this.body ? this.body.position.y : 0;

        // Optimized Explosion Manager
        if (!window.activeParticles) window.activeParticles = [];
        
        // Flash / Core Mesh Reuse logic
        const flash = new THREE.Mesh(Grenade.getFlashGeo(), new THREE.MeshBasicMaterial({ color: 0xffdd44, transparent: true }));
        const core  = new THREE.Mesh(Grenade.getCoreGeo(), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true }));
        flash.position.set(ex, ey, 0);
        core.position.set(ex, ey, 0);
        scene.add(flash);
        scene.add(core);

        const expData = {
            life: 0,
            LIFE: 1.2,
            flash, core,
            particles: []
        };

        const COLORS = [0xff6600, 0xff4400, 0x888888, 0x555555, 0xffaa00, 0x333333];
        for (let i = 0; i < 12; i++) {
            const sz = 0.2 + Math.random() * 0.3;
            const p = new THREE.Mesh(Grenade.getPartGeo(), new THREE.MeshBasicMaterial({
                color: COLORS[i % COLORS.length], transparent: true, opacity: 0.9,
            }));
            p.position.set(ex, ey, 0);
            const angle = Math.random() * Math.PI * 2;
            const spd   = 4 + Math.random() * 12;
            p.userData.vel = new THREE.Vector3(Math.cos(angle) * spd, 2 + Math.random() * spd, 0);
            p.userData.rot = new THREE.Vector3((Math.random()-0.5)*5, (Math.random()-0.5)*5, (Math.random()-0.5)*5);
            scene.add(p);
            expData.particles.push(p);
        }
        
        if (!window.globalExplosions) window.globalExplosions = [];
        window.globalExplosions.push(expData);

        if (window.MoshkoSounds?.playExplosionSound) window.MoshkoSounds.playExplosionSound();

        // Blast ragdoll
        const BLAST_R = 50, BLAST_F = 4500;
        ragdolls.forEach(doll => {
            Object.values(doll.parts).forEach(part => {
                const pb   = part.body;
                const dx   = pb.position.x - ex, dy = pb.position.y - ey;
                const dist = Math.hypot(dx, dy);
                if (dist < BLAST_R) {
                    const inv = 1 / Math.max(dist, 0.5);
                    const k   = Math.pow(1 - dist / BLAST_R, 1.4) * BLAST_F;
                    pb.applyImpulse(new CANNON.Vec3(dx * inv * k, dy * inv * k, 0), pb.position);
                    pb.wakeUp();
                    if (doll.physics) {
                        doll.physics.isStable = false;
                        doll.physics.standFactor = 0; // Prevent instant standup
                    }
                    window.lastInteractionTime = Date.now(); // Reset waving clock
                }
            });
        });

        this.destroy();
    }

    destroy() {
        if (this.dragConstraint) { world.removeConstraint(this.dragConstraint); this.dragConstraint = null; }
        if (this.body) { world.removeBody(this.body); this.body = null; }
        if (this.mesh) {
            scene.remove(this.mesh);
            this.mesh.geometry?.dispose();
            const seen = new Set();
            this.mats?.forEach(m => { if (!seen.has(m)) { seen.add(m); m.dispose(); } });
            this.mesh = null;
        }
    }

    static getFlashGeo() { if (!this._fG) this._fG = new THREE.SphereGeometry(1, 4, 4); return this._fG; }
    static getCoreGeo()  { if (!this._cG) this._cG = new THREE.SphereGeometry(0.5, 4, 4); return this._cG; }
    static getPartGeo()  { if (!this._pG) this._pG = new THREE.BoxGeometry(1, 1, 1); return this._pG; }
}

// Global Explosion Logic (Call this from main animate loop)
window.updateExplosions = (dt) => {
    if (!window.globalExplosions) return;
    for (let i = window.globalExplosions.length - 1; i >= 0; i--) {
        const e = window.globalExplosions[i];
        e.life += dt;
        const progress = e.life / e.LIFE;
        const ft = Math.min(e.life / 0.2, 1);

        e.flash.scale.setScalar(1 + ft * 16);
        e.flash.material.opacity = Math.max(0, 1 - ft);
        e.core.scale.setScalar(Math.max(0, 1 - e.life * 5));
        e.core.material.opacity = Math.max(0, 1 - e.life * 6);

        e.particles.forEach(p => {
            p.position.addScaledVector(p.userData.vel, dt);
            p.userData.vel.y -= 14 * dt;
            p.userData.vel.multiplyScalar(1 - 1.4 * dt);
            p.rotation.x += p.userData.rot.x * dt;
            p.rotation.y += p.userData.rot.y * dt;
            p.rotation.z += p.userData.rot.z * dt;
            p.material.opacity = Math.max(0, 0.9 * (1 - progress * 1.1));
        });

        if (e.life >= e.LIFE) {
            scene.remove(e.flash); e.flash.material.dispose();
            scene.remove(e.core); e.core.material.dispose();
            e.particles.forEach(p => { scene.remove(p); p.material.dispose(); });
            window.globalExplosions.splice(i, 1);
        }
    }
};

// Throw TNT from the ragdoll with a natural lob. No auto-drag.
// User can click the flying TNT to grab it, same as grabbing the ragdoll.
window.throwGrenade = () => {
    // Hard Limit: Max 10 active grenades to prevent physics/GPU lag death
    if (grenades.length >= 10) {
        const oldest = grenades.shift();
        if (oldest) oldest.explode();
    }

    let x = 0, y = 6;
    if (ragdolls.length > 0) {
        const rb = ragdolls[0].parts.body.body;
        x = rb.position.x;
        y = rb.position.y + 1.5;
    }
    const g = new Grenade(x, y, (Math.random() - 0.5) * 12, 9 + Math.random() * 5);
    grenades.push(g);
    if (window.MoshkoSounds?.playUISound) window.MoshkoSounds.playUISound('throw');
    return g;
};
// Spawn from UI click: start dragging immediately from cursor position
window.spawnAndDragGrenade = e => { 
    if (e && e.preventDefault) e.preventDefault(); 
    if (e && e.stopPropagation) e.stopPropagation();
    
    // Sever existing interactions safely to prevent infinite stacking dragConstraints freezing CANNON memory loops
    if (window.mouseConstraintConnection) {
        world.removeConstraint(window.mouseConstraintConnection);
        window.mouseConstraintConnection = null;
    }
    if (window.draggedGrenade) {
        if (window.draggedGrenade.dragConstraint) {
            world.removeConstraint(window.draggedGrenade.dragConstraint);
            window.draggedGrenade.dragConstraint = null;
        }
        window.draggedGrenade.held = false;
        window.draggedGrenade.body.wakeUp();
        window.draggedGrenade = null;
    }

    if (!e || (e.clientX === undefined && !(e.touches && e.touches.length > 0))) {
        return window.throwGrenade();
    }

    const clientX = e.clientX !== undefined ? e.clientX : e.touches[0].clientX;
    const clientY = e.clientY !== undefined ? e.clientY : e.touches[0].clientY;

    const mousePos = new THREE.Vector2();
    mousePos.x = (clientX / window.innerWidth) * 2 - 1;
    mousePos.y = -(clientY / window.innerHeight) * 2 + 1;
    window.mouseNormalized = mousePos;

    raycaster.setFromCamera(mousePos, camera);
    const planeZ = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
    const target = new THREE.Vector3();
    raycaster.ray.intersectPlane(planeZ, target);

    const margin = 1.2;
    const xRaw = target ? target.x : 0;
    const yRaw = target ? target.y : 5;
    // 0.01 randomized anti-overlap noise completely stops CANNON solver NaN explosions if blocks spawn simultaneously via macros
    const clampedX = Math.max(tntBounds.left + margin, Math.min(tntBounds.right - margin, xRaw)) + (Math.random() - 0.5) * 0.1;
    const clampedY = Math.max(tntBounds.bottom + margin, Math.min(tntBounds.top - margin, yRaw)) + (Math.random() - 0.5) * 0.1;

    // Hard Limit: Max 10 active grenades to prevent physics/GPU lag death
    if (grenades.length >= 10) {
        const oldest = grenades.shift();
        if (oldest) oldest.explode();
    }

    const g = new Grenade(clampedX, clampedY, 0, 0);
    grenades.push(g);

    mouseBody.position.set(clampedX, clampedY, 0);
    window.mousePosHistory = [];
    lastMousePos.x = clampedX;
    lastMousePos.y = clampedY;
    mouseVelocity.x = 0;
    mouseVelocity.y = 0;

    g.held = true;
    draggedGrenade = g;
    window.lastInteractionTime = Date.now();
    
    // Offset the anchor point slightly off-center (top-left) so the block organically dangles and swings when dragged from UI
    const pivotOffsetX = -0.4;
    const pivotOffsetY = 0.4;
    const localPivot = new CANNON.Vec3(pivotOffsetX, pivotOffsetY, 0);
    g.dragConstraint = new CANNON.PointToPointConstraint(
        mouseBody, new CANNON.Vec3(0, 0, 0), g.body, localPivot
    );
    world.addConstraint(g.dragConstraint);

    if (window.MoshkoSounds?.startDragLoop) window.MoshkoSounds.startDragLoop();
};

