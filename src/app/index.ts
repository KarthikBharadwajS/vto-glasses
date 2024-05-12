import { Scene, PerspectiveCamera, WebGLRenderer, SpotLight, Vector3, PointLight } from "three";

import Webcam from "@/utils/webcam";
import { ac, did, dq, rc } from "@/utils/dom";
import { cameraStarted, cameraStopped, displayError } from "./utils";
import { parseCSSValue } from "@/utils/utils";

let OrbitControls: any,
  GLTFLoader: any = null;

export const loadThree = async () => {
  try {
    OrbitControls = (await import("three/examples/jsm/Addons.js")).OrbitControls;
    GLTFLoader = (await import("three/examples/jsm/Addons.js")).GLTFLoader;

    return true;
  } catch (err) {
    return false;
  }
};

const webcamElement = did("webcam") as HTMLVideoElement;
const canvasElement = did("vto-canvas") as HTMLCanvasElement;
const webcam = new Webcam(webcamElement, "user");
let selectedglasses = dq(".selected-glasses img");
let isVideo = false;
let model = null;
let cameraFrame: number = null;
let detectFace = false;
let clearglasses = false;
let glassesOnImage = false;
let glassesArray: Array<any> = [];
let scene: Scene, camera: PerspectiveCamera, renderer: WebGLRenderer, obControls: any;
let glassesKeyPoints = { midEye: 168, leftEye: 143, noseBottom: 2, rightEye: 372 };

export const onWebcamSwitch = (ev: Event) => {
  if ((ev.target as HTMLInputElement).checked) {
    ac(dq(".md-modal"), "md-show");
    webcam
      .start()
      .then((result) => {
        console.log("webcam started");
        isVideo = true;
        cameraStarted();
        console.log("Camera ;");
        switchSource();
        console.log("Switch source ;");
        glassesOnImage = false;

        var div1 = document.getElementById("vto-canvas");
        var div2 = document.getElementById("webcam-container");

        console.log(div1, div2);

        // Get position and dimensions of div1
        var top = div1.offsetTop;
        var left = div1.offsetLeft;
        var width = div1.offsetWidth;
        var height = div1.offsetHeight;

        // Assign them to div2
        div2.style.top = top + "px";
        div2.style.left = left + "px";
        div2.style.width = width + "px";
        div2.style.height = height + "px";
        startVTGlasses();
      })
      .catch((err) => {
        console.log("Error :", err);
        displayError();
      });
  } else {
    webcam.stop();
    if (cameraFrame !== null) {
      clearglasses = true;
      detectFace = false;
      cancelAnimationFrame(cameraFrame);
    }
    isVideo = false;
    switchSource();
    cameraStopped();
    console.log("webcam stopped");
  }
};

export const onArrowLeftClicked = (ev: Event) => {
  const listItem = dq("#glasses-list ul li");
  const itemWidth = parseCSSValue(listItem, "width") + parseCSSValue(listItem, "margin-left") + parseCSSValue(listItem, "margin-right");

  // Get the ul element inside #glasses-list
  const list = dq("#glasses-list ul");
  const marginLeft = parseCSSValue(list, "margin-left");

  // Set the new margin-left and transition
  (list as HTMLElement).style.marginLeft = `${marginLeft + itemWidth}px`;
  (list as HTMLElement).style.transition = "0.3s";
};

export const onArrowRightClicked = (ev: Event) => {
  const listItem = dq("#glasses-list ul li");
  const itemWidth = parseCSSValue(listItem, "width") + parseCSSValue(listItem, "margin-left") + parseCSSValue(listItem, "margin-right");

  // Get the ul element inside #glasses-list
  const list = dq("#glasses-list ul");
  const marginLeft = parseCSSValue(list, "margin-left");

  // Set the new margin-left and transition
  (list as HTMLElement).style.marginLeft = `${marginLeft - itemWidth}px`;
  (list as HTMLElement).style.transition = "0.3s";
};

export const onItemClicked = (ev: Event) => {
  console.log("ITEM CLICKED :", ev);
  const key = "selected-glasses";
  rc(dq("." + key), key);
  ac(ev.target as HTMLElement, key);
  selectedglasses = dq(`.${key} img`);
  clearCanvas();

  if (!isVideo) {
    setup3dGlasses();
    setup3dAnimate();
  }
};

export const onCloseError = (ev: Event) => {
  // Get the element
  const webcamSwitch = did("webcam-switch") as HTMLInputElement;

  // Set the 'checked' property
  webcamSwitch.checked = false;

  // Trigger the 'change' event
  const event = new Event("change");
  webcamSwitch.dispatchEvent(event);
};

async function startVTGlasses() {
  return new Promise((resolve, reject) => {
    rc(dq(".loading"), "d-none");
    console.log("Starting");
    faceLandmarksDetection
      .load(faceLandmarksDetection.SupportedPackages.mediapipeFacemesh)
      .then((mdl) => {
        model = mdl;
        console.log("model loaded");
        if (isVideo && webcam.facingMode === "user") {
          detectFace = true;
        }

        cameraFrame = (detectFaces() as any).then(() => {
          ac(dq(".loading"), "d-none");
          resolve(true);
        });
      })
      .catch((err) => {
        console.error(err);
        reject(err);
      });
  });
}

async function detectFaces() {
  const inputElement = webcamElement;
  const flipHorizontal = !isVideo;

  await model
    .estimateFaces({
      input: inputElement,
      returnTensors: false,
      flipHorizontal: flipHorizontal,
      // predictIrises: false,
    })
    .then((faces) => {
      //console.log(faces);
      drawglasses(faces).then(() => {
        if (clearglasses) {
          clearCanvas();
          clearglasses = false;
        }
        if (detectFace) {
          //@ts-ignore
          cameraFrame = window.requestAnimFrame(detectFaces);
        }
      });
    });
}

async function drawglasses(faces) {
  if (isVideo && glassesArray.length != faces.length) {
    clearCanvas();
    for (let j = 0; j < faces.length; j++) {
      await setup3dGlasses();
    }
  }

  for (let i = 0; i < faces.length; i++) {
    const glasses = glassesArray[i];
    const face = faces[i];
    if (typeof glasses !== "undefined" && typeof face !== "undefined") {
      console.log(face);
      //@ts-ignore
      const pointMidEye = face.scaledMesh[glassesKeyPoints.midEye]; //@ts-ignore
      const pointleftEye = face.scaledMesh[glassesKeyPoints.leftEye]; //@ts-ignore
      const pointNoseBottom = face.scaledMesh[glassesKeyPoints.noseBottom]; //@ts-ignore
      const pointrightEye = face.scaledMesh[glassesKeyPoints.rightEye];

      glasses.position.x = pointMidEye[0];
      glasses.position.y = -pointMidEye[1] + parseFloat(selectedglasses.getAttribute("data-3d-up"));
      glasses.position.z = -camera.position.z + pointMidEye[2];

      glasses.up.x = pointMidEye[0] - pointNoseBottom[0];
      glasses.up.y = -(pointMidEye[1] - pointNoseBottom[1]);
      glasses.up.z = pointMidEye[2] - pointNoseBottom[2];
      const length = Math.sqrt(glasses.up.x ** 2 + glasses.up.y ** 2 + glasses.up.z ** 2);
      glasses.up.x /= length;
      glasses.up.y /= length;
      glasses.up.z /= length;

      const eyeDist = Math.sqrt((pointleftEye[0] - pointrightEye[0]) ** 2 + (pointleftEye[1] - pointrightEye[1]) ** 2 + (pointleftEye[2] - pointrightEye[2]) ** 2);
      glasses.scale.x = eyeDist * parseFloat(selectedglasses.getAttribute("data-3d-scale"));
      glasses.scale.y = eyeDist * parseFloat(selectedglasses.getAttribute("data-3d-scale"));
      glasses.scale.z = eyeDist * parseFloat(selectedglasses.getAttribute("data-3d-scale"));

      glasses.rotation.y = Math.PI;
      glasses.rotation.z = Math.PI / 2 - Math.acos(glasses.up.x);

      renderer.render(scene, camera);
    }
  }
}

function clearCanvas() {
  for (var i = scene.children.length - 1; i >= 0; i--) {
    var obj = scene.children[i];
    if (obj.type == "Group") {
      scene.remove(obj);
    }
  }
  renderer.render(scene, camera);
  glassesArray = [];
}

function switchSource() {
  clearCanvas();
  let containerElement;
  if (isVideo) {
    containerElement = did("webcam-container");
  } else {
    containerElement = did("image-container");
    setup3dGlasses();
  }
  setup3dCamera();
  did("vto-canvas").appendChild(containerElement);
  dq(".loading").appendChild(containerElement);
  did("glasses-slider").appendChild(containerElement);
}

export const setup3dScene = () => {
  scene = new Scene();
  renderer = new WebGLRenderer({
    canvas: canvasElement,
    alpha: true,
  });
  //light
  const frontLight = new SpotLight(0xffffff, 0.3);
  frontLight.position.set(10, 10, 10);
  scene.add(frontLight);
  const backLight = new SpotLight(0xffffff, 0.3);
  backLight.position.set(10, 10, -10);
  scene.add(backLight);
};

export const setup3dCamera = () => {
  if (isVideo) {
    camera = new PerspectiveCamera(45, 1, 0.1, 2000);
    const videoWidth = webcamElement.width;
    const videoHeight = webcamElement.height;
    camera.position.x = videoWidth / 2;
    camera.position.y = -videoHeight / 2;
    camera.position.z = -(videoHeight / 2) / Math.tan(45 / 2);
    camera.lookAt(new Vector3(videoWidth / 2, -videoHeight / 2, 0));
    renderer.setSize(videoWidth, videoHeight);
    renderer.setClearColor(0x000000, 0);
  } else {
    camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 0, 1.5);
    camera.lookAt(scene.position);
    renderer.setSize(window.innerWidth, window.innerHeight);
    // renderer.setClearColor(0x3399cc, 1);
    obControls = new OrbitControls(camera, renderer.domElement);
  }

  let cameraExists = false;
  scene.children.forEach(function (child) {
    if (child.type == "PerspectiveCamera") {
      cameraExists = true;
    }
  });
  if (!cameraExists) {
    camera.add(new PointLight(0xffffff, 0.8));
    scene.add(camera);
  }
  setup3dAnimate();
};

export const setup3dGlasses = async () => {
  return new Promise((resolve) => {
    const threeType = selectedglasses.getAttribute("data-3d-type");
    if (threeType == "gltf") {
      const gltfLoader = new GLTFLoader();
      gltfLoader.setPath(selectedglasses.getAttribute("data-3d-model-path"));
      gltfLoader.load(selectedglasses.getAttribute("data-3d-model"), function (object: any) {
        object.scene.position.set(selectedglasses.getAttribute("data-3d-x"), selectedglasses.getAttribute("data-3d-y"), selectedglasses.getAttribute("data-3d-z"));
        let scale = Number(selectedglasses.getAttribute("data-3d-scale"));
        if (window.innerWidth < 480) {
          scale = scale * 0.5;
        }
        object.scene.scale.set(scale, scale, scale);
        scene.add(object.scene);
        glassesArray.push(object.scene);
        resolve("loaded");
      });
    }
  });
};

const setup3dAnimate = () => {
  if (!isVideo) {
    requestAnimationFrame(setup3dAnimate);
    obControls.update();
  }
  renderer.render(scene, camera);
};
