import html2canvas from "html2canvas";
import images from "./images";

let time;

const renderCanvas = (canvas) => {

  canvas.className = "frame-0001";

  if (time) {
    clearInterval(time);
  }

  let index = 2;
  time = setInterval(() => {
    canvas.className = "frame-" + `${(index % 208) || 208}`.padStart(4, "0");
    index++;
  }, 100);
};

const initCanvas = (container) => {
  for (let i=1; i<=208; i++) {
    const canvas = document.createElement("canvas");
    canvas.setAttribute("id", `canvas_${i}`);
    canvas.classList.add("frame-" + `${i}`.padStart(4, "0"));
    const context = canvas.getContext("2d");
    context.fillStyle = "red";
    context.fillRect(0, 0, 570, 320);
    container.appendChild(canvas);
  }
};

const getSubtitle = (index) => {
  let id;

  if (index >= 10 && index <= 15) id = "subtitle01";
  else if (index >= 31 && index <= 44) id = "subtitle02";
  else if (index >= 51 && index <= 72) id = "subtitle03";
  else if (index >= 72 && index <= 99) id = "subtitle04";
  else if (index >= 100 && index <= 115) id = "subtitle05";
  else if (index >= 116 && index <= 129) id = "subtitle06";
  else if (index >= 136 && index <= 162) id = "subtitle07";
  else if (index >= 180 && index <= 196) id = "subtitle08";
  else if (index >= 196 && index <= 208) id = "subtitle09";

  if (!!id) {
    const subtitle = document.getElementById(id);
    return subtitle.value || subtitle.placeholder;
  } else {
    return null;
  }
};

const fillSubtitle = (context, subtitle) => {
  if (!!subtitle) {
    context.font = "28px Arial";
    context.textAlign = "center";
    context.shadowColor = "black";
    context.shadowOffsetX = 0;
    context.shadowOffsetY = 0;
    context.shadowBlur = 2;
    context.lineWidth = 3;
    context.fillStyle = "black";
    context.strokeText(subtitle, 285, 300);
    context.fillStyle = "#d4d4d4";
    context.shadowBlur = 0;
    context.fillText(subtitle, 285, 300);
  }
};

const convertGif = (encoder, container) => {
  
  const canvas = document.createElement("canvas");
  canvas.setAttribute("width", 570);
  canvas.setAttribute("height", 320);
  const context = canvas.getContext("2d");

  encoder.setRepeat(0);
  encoder.setDelay(100);
  encoder.setSize(570, 320);
  encoder.start();

  let index = 0;

  const addFrame = (callback) => {
    console.log(index);
    const img = new Image();
    img.src = images[index++];
    img.onload = () => {
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.drawImage(img, 0, 0, canvas.width, canvas.height);
      fillSubtitle(context, getSubtitle(index));
      encoder.addFrame(context);
      callback();
    };
  };

  const checkFinish = () => {
    if (index < images.length) {
      addFrame(checkFinish);
    } else {
      encoder.finish();

      const img = document.createElement("img");
      img.setAttribute("src", `data:image/gif;base64,${btoa(encoder.stream().getData())}`);
      container.innerHTML = "";
      container.appendChild(img);
    }
  }

  addFrame(checkFinish);
};

document.addEventListener("DOMContentLoaded", (e) => {
  const container = document.getElementById("image-container");
  const btn = document.getElementById("render-button");
  btn.addEventListener("click", (e) => convertGif(new GIFEncoder(), container));
});
