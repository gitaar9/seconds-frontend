import {Component, ElementRef, OnInit, Output, ViewChild} from '@angular/core';
import {Engine, FreeCamera, HemisphericLight, Mesh, Scene, Vector3, SceneLoader, ArcRotateCamera, Color3} from '@babylonjs/core';

import "@babylonjs/loaders/glTF";

@Component({
  selector: 'app-render',
  templateUrl: './render.component.html',
  styleUrls: ['./render.component.css']
})
export class RenderComponent implements OnInit {

    @ViewChild('canvas', {static: true}) canvas: ElementRef<HTMLCanvasElement>;

    @Output() engine: Engine;
    @Output() scene: Scene;
    @Output() camera: ArcRotateCamera;

    constructor() { }

    ngOnInit(): void {
        this.engine = new Engine(this.canvas.nativeElement, true);
        this.scene = new Scene(this.engine);

        // creating camera
        this.camera = this.createCamera(this.scene);

        // creating minimal scean
        this.createScene(this.scene, this.canvas.nativeElement);

        // running babylonJS
        this.engine.runRenderLoop(() => {
            this.scene.render();
        });
    }

    createCamera(scene: Scene): ArcRotateCamera {
        const camera = new ArcRotateCamera(
            "camera",
            Math.PI,
            Math.PI / 4,
            1,
            Vector3.Zero(),
            scene
        );
        camera.attachControl(this.canvas.nativeElement, true);
        camera.wheelPrecision = 100;

        camera.minZ = 0.3;

        camera.lowerRadiusLimit = .5;
        camera.upperRadiusLimit = 3;

        camera.panningSensibility = 0;

        camera.useAutoRotationBehavior = true;
        //
        camera.autoRotationBehavior.idleRotationSpeed = 0.1;
        camera.autoRotationBehavior.idleRotationSpinupTime = 1000;
        camera.autoRotationBehavior.idleRotationWaitTime = 10000;
        camera.autoRotationBehavior.zoomStopsAnimation = true;

        return camera;
    }


    createScene(scene: Scene, canvas: HTMLCanvasElement) {
        // const sphere = Mesh.CreateSphere('sphere', 16, 2, scene);
        // sphere.position.y = 1;

        SceneLoader.ImportMeshAsync('pion', "assets/models/", "pion.glb", scene).then((result) => {
            const pion = scene.getMeshByName("pion");
            pion.position.x = 0.16
            pion.position.y = 0.0047
            pion.position.z = 0.15
        });
        SceneLoader.ImportMeshAsync('board', "assets/models/", "board.glb", scene).then((result) => {
            console.log(result.meshes);
            result.meshes.map((mesh) => {
                // mesh.scalingDeterminant = 6;
            })
        });
        const light = new HemisphericLight('light', new Vector3(0, 2, 0), scene);
        light.intensity = 0.7;

        var options = {
            groundColor: Color3.White(),
            groundYBias: 0
        };

        let helper = scene.createDefaultEnvironment(options);
        helper.ground.dispose();
    }
}
