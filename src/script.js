import modelCuration from "./modelCuration";
const canvas = document.querySelector("canvas.webgl");

const FlightHelmet = "models/FlightHelmet/glTF/FlightHelmet.gltf";
const Duck = "models/Duck/glTF/Duck.gltf";
const Card = "models/card.glb";
const envMap = [
  "textures/environmentMaps/0/px.jpg",
  "textures/environmentMaps/0/nx.jpg",
  "textures/environmentMaps/0/py.jpg",
  "textures/environmentMaps/0/ny.jpg",
  "textures/environmentMaps/0/pz.jpg",
  "textures/environmentMaps/0/nz.jpg",
];

modelCuration(Card, canvas, 500, 500, "Z", true, false, envMap);
