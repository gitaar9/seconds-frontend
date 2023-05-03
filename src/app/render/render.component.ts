import {Component, ElementRef, OnInit, Output, ViewChild} from '@angular/core';
import {Engine, FreeCamera, HemisphericLight, Mesh, Scene, Vector3, SceneLoader} from '@babylonjs/core';

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
  @Output() camera: FreeCamera;

  constructor() { }

  ngOnInit(): void {
    this.engine = new Engine(this.canvas.nativeElement, true);
    this.scene = new Scene(this.engine);

    // creating camera
    this.camera = this.createCamera(this.scene);

    // allow mouse deplacement
    this.camera.attachControl(this.canvas.nativeElement, true);

    // creating minimal scean
    this.createScene(this.scene, this.canvas.nativeElement);

    // running babylonJS
    this.engine.runRenderLoop(() => {
      this.scene.render();
    });
  }

  createCamera(scene: Scene) {
    const camera = new FreeCamera('camera1', new Vector3(-0.6, 0.6, 0.65), scene);
    camera.setTarget(Vector3.Zero());
    camera.minZ = 0.2
    return camera;
  }

createScene(scene: Scene, canvas: HTMLCanvasElement) {
    const light = new HemisphericLight('light', new Vector3(0, 2, 0), scene);
    light.intensity = 0.7;

    // const sphere = Mesh.CreateSphere('sphere', 16, 2, scene);
    // sphere.position.y = 1;
    //
    // Mesh.CreateGround('ground', 6, 6, 2, scene);
    SceneLoader.ImportMeshAsync('pion', "assets/models/", "pion.glb", scene).then((result) => {
        console.log(result.meshes);
        result.meshes.map((mesh) => {
            // mesh.scalingDeterminant = 6;
        })
        const pion = scene.getMeshByName("pion");
        pion.position.x = -0.16
        pion.position.y = 0.15
        pion.position.z = 0.0047
    });
    SceneLoader.ImportMeshAsync('board', "assets/models/", "board.glb", scene).then((result) => {
        console.log(result.meshes);
        result.meshes.map((mesh) => {
            // mesh.scalingDeterminant = 6;
        })
        // const board = scene.getMeshByName("board");
        // pion.scale.x = 4
        // pion.scale.x = 4
        // pion.scale.x = 4
        // pion.scale.x = 4
    });

}

}
