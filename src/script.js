import modelCuration from "./modelCuration";

const canvas = document.querySelector("canvas.webgl");

const FlightHelmet = "/models/FlightHelmet/glTF/FlightHelmet.gltf";
const Duck = "/models/Duck/glTF/Duck.gltf";

modelCuration(Duck, canvas, 500, 500, "Z", true, false);
