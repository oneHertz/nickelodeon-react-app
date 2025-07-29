
import { loadImage, createCanvas } from 'canvas';
import Retricon from './retricon';
import blankVinyl from "./vinyl_blank.jpg";
import maskImage from "./vinyl_mask.png";
let maskImageRaw;
let blankVinylImg
let canvas;

(async () => {
  maskImageRaw = await loadImage(maskImage);
  blankVinylImg = await loadImage(blankVinyl);
  canvas = createCanvas(500, 500)
  const ctx = canvas.getContext('2d')
  ctx.drawImage(blankVinylImg, 0, 0);
  ctx.globalCompositeOperation = "destination-in";
  ctx.drawImage(maskImageRaw, 0, 0);
})();


export const printVinyl = async function (id) {
  const canvas2 = createCanvas(50, 50)
  const ctx = canvas2.getContext('2d')
  ctx.drawImage(canvas, 0, 0);
  const upperLayer = await loadImage(new Retricon().create(id, {imagePadding: 15, bgColor: "#EEF0EE", pixelSize: 4}).toDataURL());
  ctx.globalCompositeOperation = "destination-atop";
  ctx.drawImage(upperLayer, 0, 0);
  return canvas2.toDataURL();
};

