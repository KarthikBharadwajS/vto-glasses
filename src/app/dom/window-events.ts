import { loadThree, setup3dCamera, setup3dGlasses, setup3dScene } from "@/app";

export const onLoad = (): void => {
  // Initialize WebGL and create the application instance
  loadThree()
    .then((_) => {
      setup3dScene();
      setup3dCamera();
      setup3dGlasses();
    })
    .catch(console.error);
};
