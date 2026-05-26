import { loadImage, createCanvas } from 'canvas';

import Retricon from './retricon';

const blankVinylUrl = new URL('/vinyl_blank.jpg', import.meta.url).href;
const maskVinylUrl = new URL('/vinyl_mask.png', import.meta.url).href;

let baseCanvas = createCanvas(500, 500);

(async () => {
  const maskImg = await loadImage(maskVinylUrl);
  const blankVinylImg = await loadImage(blankVinylUrl);
  const ctx = baseCanvas.getContext('2d')
  ctx.drawImage(blankVinylImg, 0, 0);
  ctx.globalCompositeOperation = "destination-in";
  ctx.drawImage(maskImg, 0, 0);
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

