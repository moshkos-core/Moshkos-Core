/*
    ragdoll_background.js
    Uses global THREE and CANNON libraries.
    Features: 
    - 3D Minecraft Ragdoll (Slim/Alex Model) with 2nd Layer
    - Human-like Physics: Joint Motors for standing, realistic limits
    - Interactive Physics
    - Screen Boundaries & Scroll Sync
    - "Living" behaviors: Wave, Dance, Look, Walk
*/

// --- Configuration ---
const DEFAULT_USERNAME = 'MoshkoThoughts_';
const PIXEL_SCALE = 0.1; // Slightly smaller to fix "too big"

// References to globals
const THREE = window.THREE;
const CANNON = window.CANNON;

var scene, camera, renderer, world;
var ragdolls = [];
var walls = [];
var boundaries = [];
var mouseConstraint;
var lastTime;
window.lastInteractionTime = Date.now();

// TNT grenade system globals
var grenades = [];
var draggedGrenade = null;
var tntBounds = { bottom: -10, top: 10, left: -20, right: 20 }; // updated in animate
var mouseVelocity = new (window.THREE ? window.THREE.Vector3 : Object)(); // velocity of mouseBody
var lastMousePos = { x: 0, y: 0, copy(v) { this.x = v.x; this.y = v.y; } };


function saveRagdollState() {
    if (ragdolls.length === 0) return;
    const doll = ragdolls[0];
    const state = {
        username: doll.username,
        parts: {}
    };
    for (const key in doll.parts) {
        const body = doll.parts[key].body;
        state.parts[key] = {
            pos: { x: body.position.x, y: body.position.y, z: body.position.z },
            quat: { x: body.quaternion.x, y: body.quaternion.y, z: body.quaternion.z, w: body.quaternion.w },
            vel: { x: body.velocity.x, y: body.velocity.y, z: body.velocity.z },
            angVel: { x: body.angularVelocity.x, y: body.angularVelocity.y, z: body.angularVelocity.z }
        };
    }
    sessionStorage.setItem('ragdoll_state', JSON.stringify(state));
}

window.addEventListener('beforeunload', saveRagdollState);
// Also save on clicks to catch navigation faster
window.addEventListener('click', (e) => {
    if (e.target.closest('a')) saveRagdollState();
});

// 1.8 Skin Mapping (64x64) - SLIM (Alex) Model
const SKIN_COORDS = {
    head: {
        base: { top: [8, 0, 8, 8], bottom: [16, 0, 8, 8], right: [0, 8, 8, 8], front: [8, 8, 8, 8], left: [16, 8, 8, 8], back: [24, 8, 8, 8] },
        overlay: { top: [40, 0, 8, 8], bottom: [48, 0, 8, 8], right: [32, 8, 8, 8], front: [40, 8, 8, 8], left: [48, 8, 8, 8], back: [56, 8, 8, 8] }
    },
    body: {
        base: { top: [20, 16, 8, 4], bottom: [28, 16, 8, 4], right: [16, 20, 4, 12], front: [20, 20, 8, 12], left: [28, 20, 4, 12], back: [32, 20, 8, 12] },
        overlay: { top: [20, 32, 8, 4], bottom: [28, 32, 8, 4], right: [16, 36, 4, 12], front: [20, 36, 8, 12], left: [28, 36, 4, 12], back: [32, 36, 8, 12] }
    },
    armRight: {
        base: { top: [44, 16, 3, 4], bottom: [47, 16, 3, 4], right: [40, 20, 4, 12], front: [44, 20, 3, 12], left: [47, 20, 4, 12], back: [51, 20, 3, 12] },
        overlay: { top: [44, 32, 3, 4], bottom: [47, 32, 3, 4], right: [40, 36, 4, 12], front: [44, 36, 3, 12], left: [47, 36, 4, 12], back: [51, 36, 3, 12] }
    },
    armLeft: {
        base: { top: [36, 48, 3, 4], bottom: [39, 48, 3, 4], right: [32, 52, 4, 12], front: [36, 52, 3, 12], left: [39, 52, 4, 12], back: [43, 52, 3, 12] },
        overlay: { top: [52, 48, 3, 4], bottom: [55, 48, 3, 4], right: [48, 52, 4, 12], front: [52, 52, 3, 12], left: [55, 52, 4, 12], back: [59, 52, 3, 12] }
    },
    legRight: {
        base: { top: [4, 16, 4, 4], bottom: [8, 16, 4, 4], right: [0, 20, 4, 12], front: [4, 20, 4, 12], left: [8, 20, 4, 12], back: [12, 20, 4, 12] },
        overlay: { top: [4, 32, 4, 4], bottom: [8, 32, 4, 4], right: [0, 36, 4, 12], front: [4, 36, 4, 12], left: [8, 36, 4, 12], back: [12, 36, 4, 12] }
    },
    legLeft: {
        base: { top: [20, 48, 4, 4], bottom: [24, 48, 4, 4], right: [16, 52, 4, 12], front: [20, 52, 4, 12], left: [24, 52, 4, 12], back: [28, 52, 4, 12] },
        overlay: { top: [4, 48, 4, 4], bottom: [8, 48, 4, 4], right: [0, 52, 4, 12], front: [4, 52, 4, 12], left: [8, 52, 4, 12], back: [12, 52, 4, 12] }
    }
};

class MinecraftRagdoll {
    constructor(username, position) {
        this.username = username || DEFAULT_USERNAME;
        this.parts = {};
        this.constraints = [];
        this.motors = []; // Store joint motors
        this.rootPosition = position;
        this.isLiving = true;
        this.currentState = 'IDLE';
        this.stateTimer = 0;
        this.nextStateChange = 2000;
        this.recoveryTimer = 0;

        // Animation state
        this.walkCycle = 0;

        // Physics Controller
        this.physics = new RagdollPhysics(this);

        this.init();
    }

    async init() {
        // DO NOT WAIT. Spawn mesh immediately.
        this.createRagdoll();

        // Load skin in background
        this.loadSkin().then(() => {
            this.updateSkin(this.username);
        });
    }

    async loadSkin() {
        return new Promise((resolve) => {
            const img = new Image();
            img.crossOrigin = "Anonymous";
            img.src = `https://minotar.net/skin/${this.username}`;
            img.onload = () => {
                this.skinImage = img;
                resolve();
            };
            img.onerror = () => {
                console.warn("Skin failed to load. Using fallback.");
                this.skinImage = null; // Will trigger fallback grey/green
                resolve();
            };
        });
    }

    async updateSkin(username) {
        this.username = username || DEFAULT_USERNAME;
        await this.loadSkin();
        for (const key in this.parts) {
            const part = this.parts[key];
            const mesh = part.mesh;

            // Box materials: [+X, -X, +Y, -Y, +Z, -Z]
            // Standard Three.js Order correctly mapped to Minecraft Face Names
            const materialsBase = [
                this.getTexture(key, 'right', false),  // +X (Right)
                this.getTexture(key, 'left', false),   // -X (Left)
                this.getTexture(key, 'top', false),    // +Y
                this.getTexture(key, 'bottom', false), // -Y
                this.getTexture(key, 'front', false),  // +Z
                this.getTexture(key, 'back', false)    // -Z
            ];
            mesh.material = materialsBase;

            if (mesh.children.length > 0) {
                const materialsOverlay = [
                    this.getTexture(key, 'right', true),
                    this.getTexture(key, 'left', true),
                    this.getTexture(key, 'top', true),
                    this.getTexture(key, 'bottom', true),
                    this.getTexture(key, 'front', true),
                    this.getTexture(key, 'back', true)
                ];
                mesh.children[0].material = materialsOverlay;
            }
            mesh.visible = true; // Reveal after skin load
        }
    }

    getTexture(partName, face, isOverlay) {
        if (!this.skinImage) {
            return new THREE.MeshLambertMaterial({
                color: isOverlay ? 0x000000 : (partName === 'head' ? 0xFF0000 : 0x00FF00),
                transparent: true,
                opacity: isOverlay ? 0 : 1
            });
        }

        const layer = isOverlay ? SKIN_COORDS[partName].overlay : SKIN_COORDS[partName].base;
        const coords = layer[face];
        const [x, y, w, h] = coords;

        const canvas = document.createElement('canvas');
        canvas.width = w; canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, w, h);

        // Flip Fix: Side textures in Minecraft skins are often mirrored in 3D views
        if (face === 'left' || face === 'right') {
            ctx.save();
            ctx.translate(w, 0);
            ctx.scale(-1, 1);
            ctx.drawImage(this.skinImage, x, y, w, h, 0, 0, w, h);
            ctx.restore();
        } else {
            ctx.drawImage(this.skinImage, x, y, w, h, 0, 0, w, h);
        }

        const texture = new THREE.CanvasTexture(canvas);
        texture.magFilter = THREE.NearestFilter;
        texture.minFilter = THREE.NearestFilter;

        return new THREE.MeshLambertMaterial({
            map: texture,
            transparent: true,
            side: THREE.FrontSide,
            alphaTest: 0.5
        });
    }

    createRagdoll() {
        const createPart = (name, w, h, d, x, y, z, mass) => {
            const geo = new THREE.BoxGeometry(w * PIXEL_SCALE, h * PIXEL_SCALE, d * PIXEL_SCALE);
            const mat = new THREE.MeshLambertMaterial({ color: 0x888888 });
            const mesh = new THREE.Mesh(geo, mat);

            // 2nd Layer (Overlay)
            const oScale = 1.08;
            const overlayGeo = new THREE.BoxGeometry(w * PIXEL_SCALE * oScale, h * PIXEL_SCALE * oScale, d * PIXEL_SCALE * oScale);
            const overlayMat = new THREE.MeshLambertMaterial({ transparent: true, opacity: 1, alphaTest: 0.5 });
            const overlayMesh = new THREE.Mesh(overlayGeo, overlayMat);
            mesh.add(overlayMesh);

            mesh.castShadow = true;
            mesh.receiveShadow = true;
            mesh.visible = false; // Fix: Hide until skin loads
            scene.add(mesh);

            const shape = new CANNON.Box(new CANNON.Vec3(w * PIXEL_SCALE * 0.5, h * PIXEL_SCALE * 0.5, d * PIXEL_SCALE * 0.5));
            const body = new CANNON.Body({
                mass: mass,
                position: new CANNON.Vec3(x, y, z),
                material: new CANNON.Material({ friction: 0.8, restitution: 0.0 })
            });
            body.addShape(shape);
            body.linearDamping = 0.5;
            body.angularDamping = 0.7;
            world.addBody(body);

            return { mesh, body };
        };

        const pos = this.rootPosition;
        const START_Y = pos.y;
        const START_Z = 10; // Move it physically closer to the front

        this.parts.head = createPart('head', 8, 8, 8, pos.x, START_Y + 10 * PIXEL_SCALE, START_Z, 1.2);
        this.parts.body = createPart('body', 8, 12, 4, pos.x, START_Y, START_Z, 12);
        this.parts.armLeft = createPart('armLeft', 3, 12, 4, pos.x - 5.5 * PIXEL_SCALE, START_Y, START_Z, 2);
        this.parts.armRight = createPart('armRight', 3, 12, 4, pos.x + 5.5 * PIXEL_SCALE, START_Y, START_Z, 2);
        this.parts.legLeft = createPart('legLeft', 4, 12, 4, pos.x - 2.0 * PIXEL_SCALE, START_Y - 12 * PIXEL_SCALE, START_Z, 6);
        this.parts.legRight = createPart('legRight', 4, 12, 4, pos.x + 2.0 * PIXEL_SCALE, START_Y - 12 * PIXEL_SCALE, START_Z, 6);

        // --- JOINTS (Using STABLE PointToPointConstraint) ---
        const createJoint = (body1, body2, pivot1, pivot2) => {
            const constraint = new CANNON.PointToPointConstraint(body1, pivot1, body2, pivot2);
            constraint.collideConnected = false; // Disable self-collision to prevent high-speed explosions
            world.addConstraint(constraint);
            this.constraints.push(constraint);
            return constraint;
        };

        // HeadPivot - Top of body
        // HEAD JOINT REMOVED: Managed manually for perfect stillness
        /*
        createJoint(this.parts.body.body, this.parts.head.body,
            new CANNON.Vec3(0, 6.2 * PIXEL_SCALE, 0),
            new CANNON.Vec3(0, -4.2 * PIXEL_SCALE, 0));
        */

        // Arms
        this.jointArmL = createJoint(this.parts.body.body, this.parts.armLeft.body,
            new CANNON.Vec3(-4.0 * PIXEL_SCALE, 5.5 * PIXEL_SCALE, 0),
            new CANNON.Vec3(1.5 * PIXEL_SCALE, 6 * PIXEL_SCALE, 0));

        this.jointArmR = createJoint(this.parts.body.body, this.parts.armRight.body,
            new CANNON.Vec3(4.0 * PIXEL_SCALE, 5.5 * PIXEL_SCALE, 0),
            new CANNON.Vec3(-1.5 * PIXEL_SCALE, 6 * PIXEL_SCALE, 0));

        // Set initial resting pose (~5:50 and ~6:10) to prevent clipping at spawn
        // Right Arm (~5:50) -> 0.10 radians
        this.parts.armRight.body.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 0, 1), 0.10);
        // Left Arm (~6:10) -> -0.10 radians
        this.parts.armLeft.body.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 0, 1), -0.10);

        // Legs
        this.jointLegL = createJoint(this.parts.body.body, this.parts.legLeft.body,
            new CANNON.Vec3(-2.3 * PIXEL_SCALE, -6.2 * PIXEL_SCALE, 0),
            new CANNON.Vec3(0, 6.2 * PIXEL_SCALE, 0));

        this.jointLegR = createJoint(this.parts.body.body, this.parts.legRight.body,
            new CANNON.Vec3(2.3 * PIXEL_SCALE, -6.2 * PIXEL_SCALE, 0),
            new CANNON.Vec3(0, 6.2 * PIXEL_SCALE, 0));

        ragdolls.push(this);
        window.character = this; // Added character global alias
    }

    update(time, dt) {
        if (this.parts.body) {
            const b = this.parts.body.body;
            const pos = b.position;
            if (pos.length() > 200 || isNaN(pos.x) || pos.y < -50) {
                if (window.respawnRagdoll) window.respawnRagdoll();
            }
        }

        if (this.isLiving && this.parts.body) {
            this.physics.update(dt);
        }

        for (const key in this.parts) {
            const part = this.parts[key];
            part.mesh.position.copy(part.body.position);
            part.mesh.quaternion.copy(part.body.quaternion);
        }
    }
}

// --- Initialization ---


let animationId = null;
let isInitialized = false;

async function init() {
    if (isInitialized) return;
    isInitialized = true;

    if (animationId) cancelAnimationFrame(animationId);
    if (ragdolls.length > 0) ragdolls = [];

    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 0, 40); // Moved back slightly to compensate for doll being at Z: 10
    camera.lookAt(0, 0, 10);

    renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.domElement.id = 'ragdollCanvas';
    renderer.domElement.style.position = 'fixed';
    renderer.domElement.style.top = '0';
    renderer.domElement.style.left = '0';
    renderer.domElement.style.width = '100vw';
    renderer.domElement.style.height = '100vh';
    renderer.domElement.style.zIndex = '2147483647';
    renderer.domElement.style.pointerEvents = 'none';
    renderer.domElement.style.display = 'block';

    // Direct Body Append to ensure no parent constraints
    document.body.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(10, 20, 10);
    dirLight.castShadow = true;
    scene.add(dirLight);

    world = new CANNON.World();
    world.gravity.set(0, -30, 0);
    world.broadphase = new CANNON.NaiveBroadphase();
    world.solver.iterations = 15; // Massive lag fix (was 100!)
    world.allowSleep = true; // Objects use 0% CPU when resting

    createBoundaries();
    updateWalls();
    initMouseInteraction();

    // REINFORCEMENT: Update walls multiple times as elements & layout settle
    [500, 1500, 3000, 6000].forEach(delay => {
        setTimeout(() => updateWalls(), delay);
    });

    // PERSISTENCE: Check for saved physical state first (for page transition)
    let savedPhysicalState = sessionStorage.getItem('ragdoll_state');
    let startUser = localStorage.getItem('ragdoll_username') || DEFAULT_USERNAME;

    // Update input field ONLY if a saved skin exists
    const skinInput = document.getElementById('skin-username');
    if (skinInput && localStorage.getItem('ragdoll_username')) skinInput.value = localStorage.getItem('ragdoll_username');

    window.lastInteractionTime = Date.now();

    if (savedPhysicalState) {
        try {
            const state = JSON.parse(savedPhysicalState);
            sessionStorage.removeItem('ragdoll_state'); // Clear so refresh resets him
            const doll = new MinecraftRagdoll(state.username, state.parts.body.pos);
            // Restore every part's full physics state
            for (const key in state.parts) {
                if (doll.parts[key]) {
                    const b = doll.parts[key].body;
                    const s = state.parts[key];
                    b.position.set(s.pos.x, s.pos.y, s.pos.z);
                    b.quaternion.set(s.quat.x, s.quat.y, s.quat.z, s.quat.w);
                    b.velocity.set(s.vel.x, s.vel.y, s.vel.z);
                    b.angularVelocity.set(s.angVel.x, s.angVel.y, s.angVel.z);
                }
            }
        } catch (e) {
            console.error("Failed to restore ragdoll state", e);
            spawnDefault(startUser);
        }
    } else {
        spawnDefault(startUser);
    }

    function spawnDefault(user) {
        const dist = Math.abs(camera.position.z - 10);
        const vFOV = THREE.MathUtils.degToRad(camera.fov);
        const height = 2 * Math.tan(vFOV / 2) * dist;
        const width = height * camera.aspect;
        const spawnX = (width / 2) * 0.5;
        new MinecraftRagdoll(user, { x: spawnX, y: 10, z: 10 });
    }

    window.updateRagdollWalls = updateWalls;
    window.addEventListener('resize', () => {
        onWindowResize();
        window.updateRagdollWalls();
    });
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);
    window.addEventListener('mouseleave', onMouseUp); // Safety for when mouse leaves window

    // Watch for DOM changes to update walls dynamically
    const observer = new MutationObserver(() => updateWalls());
    observer.observe(document.body, { childList: true, subtree: true });

    lastTime = performance.now();
    animate(lastTime);
}

function createBoundaries() {
    boundaries.forEach(b => world.removeBody(b));
    boundaries = [];

    const dist = camera.position.z;
    const vFOV = THREE.MathUtils.degToRad(camera.fov);
    const fullHeight = 2 * Math.tan(vFOV / 2) * dist;
    const fullWidth = fullHeight * camera.aspect;

    const height = fullHeight * 0.95;
    const width = fullWidth * 0.95;
    const thickness = 200;

    createBoundary(new CANNON.Vec3(0, -height / 2 - thickness / 2, 0), new CANNON.Vec3(width * 2, thickness, 50), 0.8);
    createBoundary(new CANNON.Vec3(0, height / 2 + thickness / 2, 0), new CANNON.Vec3(width * 2, thickness, 50), 0.1);
    createBoundary(new CANNON.Vec3(-width / 2 - thickness / 2, 0, 0), new CANNON.Vec3(thickness, height * 2, 50), 0.1);
    createBoundary(new CANNON.Vec3(width / 2 + thickness / 2, 0, 0), new CANNON.Vec3(thickness, height * 2, 50), 0.1);
    createBoundary(new CANNON.Vec3(0, 0, -25), new CANNON.Vec3(width * 3, height * 3, 40), 0.1);
}

function createBoundary(pos, size, friction) {
    const shape = new CANNON.Box(new CANNON.Vec3(size.x / 2, size.y / 2, size.z / 2));
    const body = new CANNON.Body({
        mass: 0,
        type: CANNON.Body.STATIC,
        material: new CANNON.Material({ friction: friction, restitution: 0.1 })
    });
    body.position.copy(pos);
    body.addShape(shape);
    world.addBody(body);
    boundaries.push(body);
}

function updateWalls() {
    walls.forEach(body => world.removeBody(body));
    walls = [];
    // Dynamic walls (buttons, etc.) are now disabled as requested
}

let mouseBody;
let mouseConstraintConnection;
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

function initMouseInteraction() {
    const shape = new CANNON.Sphere(0.1);
    mouseBody = new CANNON.Body({ mass: 0 });
    mouseBody.type = CANNON.Body.KINEMATIC;
    mouseBody.addShape(shape);
    mouseBody.collisionFilterGroup = 0;
    world.addBody(mouseBody);
}

function onMouseMove(e) {
    mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
    window.mouseNormalized = mouse;

    raycaster.setFromCamera(mouse, camera);
    const planeZ = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
    const target = new THREE.Vector3();
    raycaster.ray.intersectPlane(planeZ, target);

    if (target) {
        const margin = 1.0;
        const cx = Math.max(tntBounds.left + margin, Math.min(tntBounds.right - margin, target.x));
        const cy = Math.max(tntBounds.bottom + margin, Math.min(tntBounds.top - margin, target.y));
        
        mouseBody.position.set(cx, cy, 0);
        if (mouseConstraintConnection) {
            mouseConstraintConnection.bodyB.wakeUp();
            window.lastInteractionTime = Date.now();
        }
    }
}

function onMouseDown(e) {
    if (e.button !== undefined && e.button !== 0) return;

    mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;

    // Purge old historical cursor velocities perfectly so picking up items far away doesn't math-spike tracking
    window.mousePosHistory = [];
    mouseVelocity.x = 0;
    mouseVelocity.y = 0;

    // Defensively sever absolutely all existing drag hooks so multi-touch can never bind 2 heavy bodies to 1 kinematic point simultaneously
    if (window.mouseConstraintConnection) {
        world.removeConstraint(window.mouseConstraintConnection);
        window.mouseConstraintConnection = null;
    }
    if (window.draggedGrenade) {
        if (window.draggedGrenade.dragConstraint) world.removeConstraint(window.draggedGrenade.dragConstraint);
        window.draggedGrenade.dragConstraint = null;
        window.draggedGrenade.held = false;
        window.draggedGrenade.body.wakeUp();
        window.draggedGrenade = null;
    }

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(scene.children, true);

    let hitBody = null;
    let hitPoint = null;

    for (let i = 0; i < intersects.length; i++) {
        const clickedMesh = intersects[i].object;

        // â”€â”€ Check grenades first â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
        let grenadeHit = false;
        for (let g = 0; g < grenades.length; g++) {
            const gren = grenades[g];
            if (clickedMesh === gren.mesh) {
                grenadeHit = true;
                if (!gren.exploded) {
                    draggedGrenade = gren;
                    gren.held = true;
                    gren.countingDown = false; // Defuse/Interrupt the floor-lock countdown if grabbed!
                    window.lastInteractionTime = Date.now();
                    if (!gren.dragConstraint) {
                        const hp = intersects[i].point;
                        mouseBody.position.set(hp.x, hp.y, 0);
                        lastMousePos.x = hp.x; 
                        lastMousePos.y = hp.y;
                        mouseVelocity.x = 0;
                        mouseVelocity.y = 0;
                        
                        const localPivot = gren.body.pointToLocalFrame(new CANNON.Vec3(hp.x, hp.y, 0));
                        gren.dragConstraint = new CANNON.PointToPointConstraint(
                            mouseBody, new CANNON.Vec3(0, 0, 0), gren.body, localPivot
                        );
                        world.addConstraint(gren.dragConstraint);
                    }
                }
                break;
            }
        }
        if (grenadeHit) return;

        // â”€â”€ Check ragdoll parts â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
        for (let r = 0; r < ragdolls.length; r++) {
            const doll = ragdolls[r];
            const parts = Object.values(doll.parts);
            for (let pIdx = 0; pIdx < parts.length; pIdx++) {
                const p = parts[pIdx];
                if (clickedMesh === p.mesh || clickedMesh.parent === p.mesh ||
                    (p.mesh.children && p.mesh.children.includes(clickedMesh))) {
                    hitBody = p.body;
                    if (p === doll.parts.head) hitBody = doll.parts.body.body;
                    hitPoint = intersects[i].point;
                    break;
                }
            }
            if (hitBody) break;
        }
        if (hitBody) break;
    }

    if (hitBody) {
        window.lastInteractionTime = Date.now();
        if (ragdolls.length > 0) ragdolls[0].isStable = false;
        if (walls.includes(hitBody)) return;
        mouseBody.position.copy(hitPoint);
        lastMousePos.x = hitPoint.x;
        lastMousePos.y = hitPoint.y;
        mouseVelocity.x = 0;
        mouseVelocity.y = 0;

        const cannonHitPoint = new CANNON.Vec3(hitPoint.x, hitPoint.y, hitPoint.z);
        const localPivot = hitBody.pointToLocalFrame(cannonHitPoint);
        mouseConstraintConnection = new CANNON.PointToPointConstraint(
            mouseBody, new CANNON.Vec3(0, 0, 0), hitBody, localPivot
        );
        world.addConstraint(mouseConstraintConnection);
        ragdolls.forEach(d => d.currentState = 'IDLE');
        if (window.MoshkoSounds?.playHitSound) window.MoshkoSounds.playHitSound();
        if (window.MoshkoSounds?.startDragLoop) window.MoshkoSounds.startDragLoop();
    }
}




function onMouseUp() {
    // Release ragdoll
    if (mouseConstraintConnection) {
        world.removeConstraint(mouseConstraintConnection);
        mouseConstraintConnection = null;
        window.lastInteractionTime = Date.now();
        if (window.MoshkoSounds?.stopDragLoop) window.MoshkoSounds.stopDragLoop();
    }

    if (draggedGrenade) {
        if (draggedGrenade.dragConstraint) {
            world.removeConstraint(draggedGrenade.dragConstraint);
            draggedGrenade.dragConstraint = null;
        }
        
        // Inject ultra-smoothed momentum calculation to replicate the elastic whip-throw of the multi-chain ragdoll 
        draggedGrenade.body.velocity.set(mouseVelocity.x, mouseVelocity.y, 0);
        
        draggedGrenade.held = false;
        draggedGrenade.mesh.scale.setScalar(1.0);
        draggedGrenade.body.wakeUp();
        draggedGrenade = null;
        window.lastInteractionTime = Date.now();
        if (window.MoshkoSounds?.stopDragLoop) window.MoshkoSounds.stopDragLoop();
    }
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    createBoundaries();
}

function animate(time) {
    animationId = requestAnimationFrame(animate);
    const deltaTime = Math.min((time - lastTime) / 1000 || 1 / 60, 0.1);
    lastTime = time;

    if (ragdolls.length === 0) {
        window.respawnRagdoll();
    } else {
        const body = ragdolls[0].parts.body.body;
        
        // Update drag sound loop if dragging
        if (mouseConstraintConnection && window.MoshkoSounds && window.MoshkoSounds.updateDragLoop) {
            const speed = Math.sqrt(body.velocity.x * body.velocity.x + body.velocity.y * body.velocity.y);
            window.MoshkoSounds.updateDragLoop(speed);
        }

        if (isNaN(body.position.y) || !isFinite(body.position.y)) {
            ragdolls = [];
            window.respawnRagdoll();
        }
        if (body.position.y < -50 || body.position.y > 80 || Math.abs(body.position.x) > 80) {
            body.position.set(0, 5, 0);
            body.velocity.set(0, 0, 0);
        }
    }

    // Compute tntBounds from camera FOV each frame
    {
        const dist = camera.position.z;
        const vFOV = THREE.MathUtils.degToRad(camera.fov);
        const h = 2 * Math.tan(vFOV / 2) * dist * 0.95;
        const w = h * camera.aspect;
        tntBounds.bottom = -h / 2;
        tntBounds.top    =  h / 2;
        tntBounds.left   = -w / 2;
        tntBounds.right  =  w / 2;
    }

    // Track physical cursor history over 5 frames (approx 80ms) for flawless throw momentum.
    // Frame-by-frame deltaTime math fluctuates too wildly resulting in rocket-launches or dead-drops.
    if (!window.mousePosHistory) window.mousePosHistory = [];
    if (mouseBody && deltaTime > 0) {
        window.mousePosHistory.push({ x: mouseBody.position.x, y: mouseBody.position.y, t: time });
        if (window.mousePosHistory.length > 5) window.mousePosHistory.shift();

        const oldest = window.mousePosHistory[0];
        const newest = window.mousePosHistory[window.mousePosHistory.length - 1];
        const dt = (newest.t - oldest.t) / 1000;
        
        if (dt > 0.01) {
            mouseVelocity.x = (newest.x - oldest.x) / dt;
            mouseVelocity.y = (newest.y - oldest.y) / dt;
        } else {
            mouseVelocity.x = 0;
            mouseVelocity.y = 0;
        }
    }

    world.step(1 / 60, deltaTime, 10);
    ragdolls.forEach(doll => doll.update(time, deltaTime));

    // Update explosions (Unified high-perf manager)
    if (window.updateExplosions) window.updateExplosions(deltaTime);

    // Update grenades
    for (let i = grenades.length - 1; i >= 0; i--) {
        grenades[i].update(deltaTime);
        if (grenades[i].exploded) grenades.splice(i, 1);
    }

    // Force absolute front (Throttled check to save CPU)
    if (renderer.domElement && document.body.lastElementChild !== renderer.domElement) {
        renderer.domElement.style.position = 'fixed';
        renderer.domElement.style.top = '0';
        renderer.domElement.style.left = '0';
        renderer.domElement.style.zIndex = '2147483647';
        renderer.domElement.style.pointerEvents = 'none';
        document.body.appendChild(renderer.domElement);
    }

    renderer.render(scene, camera);
}

window.changeSkin = (username) => {
    const finalUser = username || DEFAULT_USERNAME;
    localStorage.setItem('ragdoll_username', finalUser); // Save for page navigation
    if (ragdolls.length > 0) ragdolls[0].updateSkin(finalUser);
    else window.respawnRagdoll();
    
    // Play magical skin change sound
    if (window.MoshkoSounds && window.MoshkoSounds.playSkinChangeSound) {
        window.MoshkoSounds.playSkinChangeSound();
    }
};

window.respawnRagdoll = () => {
    // Standard respawn: check storage first
    let savedSkin = localStorage.getItem('ragdoll_username');
    let inputUser = savedSkin || document.getElementById('skin-username')?.value || DEFAULT_USERNAME;

    // Logic to calculate spawn
    const dist = camera.position.z;
    const vFOV = THREE.MathUtils.degToRad(camera.fov);
    const height = 2 * Math.tan(vFOV / 2) * dist;
    const width = height * camera.aspect;
    const spawnX = (width / 2) * 0.5;

    // DESTROY EXISTING
    if (ragdolls.length > 0) {
        ragdolls.forEach(doll => {
            // Remove Meshes
            Object.values(doll.parts).forEach(p => {
                if (p.mesh) scene.remove(p.mesh);
                if (p.body) world.removeBody(p.body);
            });
            // Remove Constraints
            if (doll.constraints) {
                doll.constraints.forEach(c => world.removeConstraint(c));
            }
            // Remove Head if manually managed? 
            // In my code head is just a part.
        });
        ragdolls = [];
    }

    // Remove walls (reset UI positions might change?)
    // Usually walls update themselves.

    // CREATE NEW - DROP FROM TOP
    new MinecraftRagdoll(inputUser, { x: spawnX, y: 10, z: 10 });
};

// Explicit RESET Button Action
window.resetRagdoll = () => {
    // 1. Reset Input Field
    const input = document.getElementById('skin-username');
    if (input) input.value = "";
    localStorage.removeItem('ragdoll_username'); // Clear saved skin

    // 2. Force Skin Update to Default
    if (ragdolls.length > 0) {
        ragdolls[0].updateSkin(DEFAULT_USERNAME);
    }

    // 3. Respawn Position
    window.respawnRagdoll();
    
    // Play digital respawn reset sound
    if (window.MoshkoSounds && window.MoshkoSounds.playResetSound) {
        window.MoshkoSounds.playResetSound();
    }
};

// Also handle SPA page load
window.addEventListener('page-load', () => {
    isInitialized = true; // Ensure we don't re-init fully
    updateWalls();
    console.log('Walls updated for new page, ragdoll undisturbed.');
});

if (document.readyState === 'complete' || document.readyState === 'interactive') {
    setTimeout(init, 1);
} else {
    document.addEventListener('DOMContentLoaded', init);
}
