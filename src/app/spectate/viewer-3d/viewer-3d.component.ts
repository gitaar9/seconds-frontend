import {Component, ElementRef, OnInit, Output, ViewChild, Input, NgZone} from '@angular/core';
import {Engine, AbstractMesh, HemisphericLight, Mesh, Scene, Vector3, SceneLoader, ArcRotateCamera, Color3, AmmoJSPlugin, PhysicsImpostor, MeshBuilder, DynamicTexture, StandardMaterial, CubeTexture, Texture} from '@babylonjs/core';
import "@babylonjs/loaders/glTF";
import Ammo from "ammojs-typed";
import {Game, Player, Team} from "../../_models/game";


let width = 0.06;
let length = 0.12;
let models_url = "https://raw.githubusercontent.com/gitaar9/seconds-frontend/master/src/assets/models/";


function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

class Pawn {
    mesh: AbstractMesh = null;
    collider: AbstractMesh = null;
    goal_position: number = getRandomInt(5);
    goal_hitbox = null;
    hitbox_goal_position: number = null;
    noLiftTimer: number = 0;
    teamId: null;
    name: null;
    completed_constructor: boolean = false;

    constructor(add_to_this_list_when_done, scene, position, name, team_id) {
        this.teamId = team_id;
        this.name = name;
        add_to_this_list_when_done.push(this);
        SceneLoader.ImportMesh(name, models_url, name + ".glb", scene, (meshes) => {
            this.mesh = meshes[0];
            this.mesh.position = position; //new BABYLON.Vector3(-0.16, 0.01, 0.15);
            // this.mesh.physicsImpostor = new BABYLON.PhysicsImpostor(this.mesh, BABYLON.PhysicsImpostor.MeshImpostor
            this.collider = MeshBuilder.CreateCylinder("cylinder", {diameterTop: 0.01, diameterBottom:0.024, height: 0.045,});
            this.collider.visibility = 0.0;
            this.collider.position = new Vector3(this.mesh.position.x, this.mesh.position.y + 0.0225, this.mesh.position.z);
            this.collider.physicsImpostor = new PhysicsImpostor(
                this.collider,
                PhysicsImpostor.CylinderImpostor,
                { mass: 1, friction: 1, restitution: 0.0}
            );
            this.mesh.setParent(this.collider);
            this.completed_constructor = true;
        });
    }

   destructor() {
       console.log(`${this.teamId}-${this.name} is destroyed`);
       this.mesh.dispose();
       this.collider.dispose();
   }

    getGoalHitbox(fields) {
        let goal_field = fields[(this.goal_position < 30) ? this.goal_position : 30];
        if (!this.goal_hitbox || this.goal_position != this.hitbox_goal_position) {
            if (this.goal_hitbox)
                this.goal_hitbox.dispose();
            let field_height = Math.abs(goal_field.getBoundingInfo().boundingBox.minimum.y - goal_field.getBoundingInfo().boundingBox.maximum.y);
            let hitbox_height = .15;
            let hitbox_depth = (this.goal_position === 0) ? width * 2 : width;
            this.goal_hitbox = MeshBuilder.CreateBox("box", { width:length-0.0125, height: hitbox_height + 0.01, depth: hitbox_depth-0.0125});
            this.goal_hitbox.position = new Vector3(goal_field.position.x, field_height + hitbox_height / 2, goal_field.position.z);
            this.goal_hitbox.visibility = 0.0;
            this.hitbox_goal_position = this.goal_position;
        }
        return this.goal_hitbox;
    }

    move(fields): void {
        if (!this.completed_constructor)
            return;
        if (this.noLiftTimer > 0)
            this.noLiftTimer--;
        let pawnPosition = this.collider.getAbsolutePosition();
        let hit_box_bb = this.getGoalHitbox(fields).getBoundingInfo().boundingBox;
        let goalPosition = hit_box_bb.centerWorld;
        goalPosition.y = (goalPosition.y * 7 + hit_box_bb.minimumWorld.y) / 8;
        let direction = goalPosition.subtract(pawnPosition)
        let distance = Math.abs(pawnPosition.x - goalPosition.x) + Math.abs(pawnPosition.z - goalPosition.z);
        let distance_squared = (distance + Math.abs(pawnPosition.y - goalPosition.y)) ** 2;
        let speed_scalar = Math.max(Math.min(.4, distance_squared), 0.15);
        if (!hit_box_bb.intersectsPoint(pawnPosition)) {
            if (this.noLiftTimer === 0) {
                let force_direction = (this.collider.position.y < hit_box_bb.minimumWorld.y + 0.04) ? new Vector3(0, 0.85, 0) : direction.scale(speed_scalar).add(new Vector3(0, 0.81, 0));
                this.collider.physicsImpostor.applyForce(
                    force_direction,
                    pawnPosition
                );
                // Balance the pawn
                let currentAngularVelocity = this.collider.physicsImpostor.getAngularVelocity().scale(0.997);
                let rotation = this.collider.absoluteRotationQuaternion.scale(0.95);
                let angularVelocity = new Vector3(-rotation.x + currentAngularVelocity.x, -rotation.y + currentAngularVelocity.y, -rotation.z + currentAngularVelocity.z);
                this.collider.physicsImpostor.setAngularVelocity(angularVelocity);
            }

        } else {
            this.collider.physicsImpostor.setLinearVelocity(this.collider.physicsImpostor.getLinearVelocity().scale(0.98));
            this.collider.physicsImpostor.setAngularVelocity(this.collider.physicsImpostor.getAngularVelocity().scale(0.98));
            direction.y = 0;
            this.collider.physicsImpostor.applyForce(
                direction.scale(0.1),
                pawnPosition
            );
            this.noLiftTimer = 100;
        }
        this.collider.physicsImpostor.setLinearVelocity(this.collider.physicsImpostor.getLinearVelocity().scale(0.997));
        this.collider.physicsImpostor.setAngularVelocity(this.collider.physicsImpostor.getAngularVelocity().scale(0.997));

        if (this.collider.physicsImpostor.getAngularVelocity().length() > 10){
            this.collider.physicsImpostor.setAngularVelocity(Vector3.Zero());
        }
    }
}

@Component({
  selector: 'viewer-3d',
  templateUrl: './viewer-3d.component.html',
  styleUrls: ['./viewer-3d.component.css']
})
export class Viewer3dComponent implements OnInit {
    @ViewChild('canvas', {static: true}) canvas: ElementRef<HTMLCanvasElement>;
    @Output() engine: Engine;
    @Output() scene: Scene;
    @Output() camera: ArcRotateCamera;

    @Input() spectatedGame: Game;
    @Input() timeLeft: number;

    pawns: Pawn[] = [];
    fields: Mesh[] = [];
    clockWriteTexture: DynamicTexture = null;

    constructor(private ngZone: NgZone) { }

    ngOnInit(): void {
        this.engine = new Engine(this.canvas.nativeElement, true);

        // creating minimal scean
        this.scene = this.createScene(this.engine, this.canvas.nativeElement);

        // running babylonJS
        this.ngZone.runOutsideAngular( () => {
            // start the render loop and therefore start the Engine
            this.engine.runRenderLoop(() => this.scene.render())
        });
        // this.engine.runRenderLoop(() => {
        //     this.scene.render();
        // });
    }

    ngOnDestroy() {
    }

    createCamera(scene: Scene): ArcRotateCamera {
        const camera = new ArcRotateCamera(
            "camera",
            Math.PI - Math.PI / 5.5,
            Math.PI / 3.3,
            .8,
            Vector3.Zero(),
            scene
        );

        camera.attachControl(this.canvas.nativeElement, true);
        camera.wheelPrecision = 100;

        camera.minZ = 0.1;

        camera.lowerRadiusLimit = .3;
        camera.upperRadiusLimit = 2;

        camera.panningSensibility = 0;

        return camera;
    }

    create_field_collider(x: number, z: number, width: number, length: number, height: number) {
        let field = MeshBuilder.CreateBox("box", { width:length, height: height, depth: width});
        field.position = new Vector3(x, height/2, z);
        field.physicsImpostor = new PhysicsImpostor(
            field,
            PhysicsImpostor.BoxImpostor,
            { mass: 0, friction: 1, restitution: 0.1}
        );
        field.visibility = 0;
        return field;
    }

    create_board_colliders(): void {
        let extra_height = 0.0;

        // The board itself
        this.create_field_collider(0, 0, .66, .66, 0.0001 + extra_height);

        // First row
        this.fields.push(this.create_field_collider(-0.18, 0.18, 2 * width, length, 0.005 + extra_height)); //0
        this.fields.push(this.create_field_collider(-0.18, 0.09 - (0.060 * 0), width, length, 0.01 + extra_height));
        this.fields.push(this.create_field_collider(-0.18, 0.09 - (0.060 * 1), width, length, 0.015 + extra_height));
        this.fields.push(this.create_field_collider(-0.18, 0.09 - (0.060 * 2), width, length, 0.02 + extra_height));
        this.fields.push(this.create_field_collider(-0.18, 0.09 - (0.060 * 3), width, length, 0.025 + extra_height));
        this.fields.push(this.create_field_collider(-0.18, 0.09 - (0.060 * 4), width, length, 0.03 + extra_height));
        this.fields.push(this.create_field_collider(-0.18, 0.09 - (0.060 * 5), width, length, 0.035 + extra_height));

        // Second row
        this.fields.push(this.create_field_collider(-0.06, 0.09 - (0.060 * 5), width, length, 0.04 + extra_height)); // 7
        this.fields.push(this.create_field_collider(-0.06, 0.09 - (0.060 * 4), width, length, 0.045 + extra_height));
        this.fields.push(this.create_field_collider(-0.06, 0.09 - (0.060 * 3), width, length, 0.05 + extra_height));
        this.fields.push(this.create_field_collider(-0.06, 0.09 - (0.060 * 2), width, length, 0.055 + extra_height));
        this.fields.push(this.create_field_collider(-0.06, 0.09 - (0.060 * 1), width, length, 0.06 + extra_height));
        this.fields.push(this.create_field_collider(-0.06, 0.09 - (0.060 * 0), width, length, 0.065 + extra_height));
        this.fields.push(this.create_field_collider(-0.06, 0.09 + (0.060 * 1), width, length, 0.07 + extra_height));
        this.fields.push(this.create_field_collider(-0.06, 0.09 + (0.060 * 2), width, length, 0.075 + extra_height));

        // Third row
        this.fields.push(this.create_field_collider(0.06, 0.09 + (0.060 * 2), width, length, 0.08 + extra_height)); // 15
        this.fields.push(this.create_field_collider(0.06, 0.09 + (0.060 * 1), width, length, 0.085 + extra_height));
        this.fields.push(this.create_field_collider(0.06, 0.09 - (0.060 * 0), width, length, 0.09 + extra_height));
        this.fields.push(this.create_field_collider(0.06, 0.09 - (0.060 * 1), width, length, 0.095 + extra_height));
        this.fields.push(this.create_field_collider(0.06, 0.09 - (0.060 * 2), width, length, 0.1 + extra_height));
        this.fields.push(this.create_field_collider(0.06, 0.09 - (0.060 * 3), width, length, 0.105 + extra_height));
        this.fields.push(this.create_field_collider(0.06, 0.09 - (0.060 * 4), width, length, 0.11 + extra_height));
        this.fields.push(this.create_field_collider(0.06, 0.09 - (0.060 * 5), width, length, 0.115 + extra_height));

        // Fourth row
        this.fields.push(this.create_field_collider(0.18, 0.09 - (0.060 * 5), width, length, 0.12 + extra_height)); // 23
        this.fields.push(this.create_field_collider(0.18, 0.09 - (0.060 * 4), width, length, 0.125 + extra_height));
        this.fields.push(this.create_field_collider(0.18, 0.09 - (0.060 * 3), width, length, 0.13 + extra_height));
        this.fields.push(this.create_field_collider(0.18, 0.09 - (0.060 * 2), width, length, 0.135 + extra_height));
        this.fields.push(this.create_field_collider(0.18, 0.09 - (0.060 * 1), width, length, 0.14 + extra_height));
        this.fields.push(this.create_field_collider(0.18, 0.09 - (0.060 * 0), width, length, 0.145 + extra_height));
        this.fields.push(this.create_field_collider(0.18, 0.09 + (0.060 * 1), width, length, 0.15 + extra_height));
        this.fields.push(this.create_field_collider(0.18, 0.09 + (0.060 * 2), width, length, 0.155 + extra_height));
    }

    buildClock(scene: Scene): DynamicTexture {
        let clockRotation = new Vector3(0, Math.PI, -Math.PI / 6);
        let clockPostion = new Vector3(-0.281, -0.004, 0);
        var writeTexture = new DynamicTexture("dynamic texture", 512, scene, true);
        var dynamicMaterial = new StandardMaterial('mat', scene);
        dynamicMaterial.diffuseTexture = writeTexture;
        dynamicMaterial.specularColor = new Color3(0, 0, 0);
        dynamicMaterial.backFaceCulling = true;

        let writeBox = MeshBuilder.CreateBox("box", { width:0.06, height: 0.06, depth: 0.06});

        writeBox.material = dynamicMaterial;
        writeBox.rotation = clockRotation;
        writeBox.position = clockPostion;

        writeBox.physicsImpostor = new PhysicsImpostor(
            writeBox,
            PhysicsImpostor.BoxImpostor,
            { mass: 0, friction: 1, restitution: 0.1}
        );

        writeTexture.drawText("00", 25, 375, "bold 330px Segoe UI", "red", "#555555");
        return writeTexture;
    }

    movePawns(): void {
        if (!this.spectatedGame)
            return;
        // console.log(this.clockWriteTexture, this.timeLeft);
        // If we have a pawn with a team.id that does not exist remove the pawn
        let team_ids: number[] = this.spectatedGame.teams.map((team: Team) => team.id);
        this.pawns.filter((pawn: Pawn) => !team_ids.includes(pawn.teamId)).map((pawn: Pawn) => pawn.destructor());  // Call destructor on the pawn that have to be removed
        this.pawns = this.pawns.filter((pawn: Pawn) => team_ids.includes(pawn.teamId));  // Filter the to be removed pawns out of the list

        // Move all the pawn to their goal_position if they are not there.
        this.pawns.forEach((pawn) => {
            pawn.move(this.fields);
        });
        // Update the clock texture
        this.drawTime();

        // Update or create the 3D pawns according to the team bound by team.id
        this.spectatedGame.teams.forEach((team: Team): void => {
            let team_pawn: Pawn = (this.pawns.find((pawn: Pawn): boolean => pawn.teamId == team.id));
            if (team_pawn)
                team_pawn.goal_position = team.score;
            else {
                let position = new Vector3(
                    -0.18 + (Math.random() * 0.04 - 0.02),
                    0.01,
                    0.17 + (Math.random() * 0.04 - 0.02)
                )
                new Pawn(this.pawns, this.scene, position, team.pion_filename, team.id);
            }
        });
    }

    createImposters(scene) {
        this.create_board_colliders();
        this.clockWriteTexture = this.buildClock(scene);
        // console.log(this.clockWriteTexture);

        this.ngZone.runOutsideAngular(() => scene.registerBeforeRender(() => this.movePawns()));
    }

    async createPhysics(scene): Promise<void> {
        const ammo = await Ammo.bind(window)();
        const physicsPlugin = new AmmoJSPlugin(true, ammo);
        scene.enablePhysics(new Vector3(0, -0.81, 0), physicsPlugin);

        this.createImposters(scene);
    }

    createScene(engine: Engine, canvas: HTMLCanvasElement) {
        var scene = new Scene(engine);

        this.createPhysics(scene);

        const camera = this.createCamera(scene);

        let result = SceneLoader.ImportMesh('board', models_url, "board.glb", scene);
        let table = SceneLoader.ImportMesh('round_wooden_table_01', models_url, "table.glb", scene);

        const light = new HemisphericLight('light', new Vector3(0, 2, 0), scene);
        light.intensity = 0.5;

        // var options = {
        //     groundColor: Color3.White(),
        //     groundYBias: 0,
        //     environmentTexture: models_url + "background.env"
        // };
        // let helper = scene.createDefaultEnvironment(options);
        // helper.ground.dispose();
        // helper.setMainColor(Color3.FromHexString("#CFD8DC"));
        const hdrTexture = CubeTexture.CreateFromPrefilteredData(models_url + "background.env", scene);
        scene.environmentTexture = hdrTexture;

        var skybox = MeshBuilder.CreateBox("skyBox", {size:1000.0}, scene);
        var skyboxMaterial = new StandardMaterial("skyBox", scene);
        skyboxMaterial.backFaceCulling = false;
	    skyboxMaterial.reflectionTexture = CubeTexture.CreateFromPrefilteredData(models_url + "background.env", scene);
        skyboxMaterial.reflectionTexture.coordinatesMode = Texture.SKYBOX_MODE;
        skyboxMaterial.diffuseColor = new Color3(0, 0, 0);
        skyboxMaterial.specularColor = new Color3(0, 0, 0);
        skybox.material = skyboxMaterial;

        return scene;
    }

    drawTime(): void {
        let x_offset: number = (this.timeLeft < 10) ? 150 : 25;
        this.clockWriteTexture.drawText(this.timeLeft.toString(), x_offset, 375, "bold 330px Segoe UI", "red", "#555555");
    }
}
