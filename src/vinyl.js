
import { loadImage, createCanvas } from 'canvas';
import Retricon from './retricon';
import blankVinyl from "./vinyl_blank.jpg";
import maskImage from "./vinyl_mask.png";
let maskImageRaw;
let blankVinylImg
let baseCanvas = createCanvas(500, 500);

(async () => {
  maskImageRaw = await loadImage(maskImage);
  blankVinylImg = await loadImage(blankVinyl);
  const ctx = baseCanvas.getContext('2d')
  ctx.drawImage(blankVinylImg, 0, 0);
  ctx.globalCompositeOperation = "destination-in";
  ctx.drawImage(maskImageRaw, 0, 0);
})();


export const printVinyl = async function (id) {
  const canvas = createCanvas(500, 500)
  const ctx = canvas.getContext('2d')
  ctx.drawImage(baseCanvas, 0, 0);
  const upperLayer = await loadImage(new Retricon().create(id, {imagePadding: 150, bgColor: "#EEF0EE", pixelSize: 40}).toDataURL());
  ctx.globalCompositeOperation = "destination-atop";
  ctx.drawImage(upperLayer, 0, 0);
  return canvas.toDataURL();
};

