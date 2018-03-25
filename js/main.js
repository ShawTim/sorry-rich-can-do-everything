import images from "./images";
import positions from "./avatar-position";
import tippy from 'tippy.js';
import FileSaver from "file-saver";
import ProgressBar from "progressbar.js";

let progressbar;
let blob;
let blobURL;
let avatar = {};

const renderProgressBar = (container) => {
  container.classList.add("converting");
  progressbar = new ProgressBar.SemiCircle(container, {
    strokeWidth: 3,
    color: "black",
    trailColor: "#eee",
    trailWidth: 1,
    svgStyle: null,
    color: "black",
    text: {
      value: "0%",
      alignToBottom: false
    },
  });
};

const setProgressBar = (progress) => {
  if (progressbar) {
    progressbar.set(progress);
    progressbar.setText(`${parseInt(progress*100)}%`);
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

const fillSubtitle = (context, subtitle, scale) => {
  if (!!subtitle) {
    context.font = `${28*scale}px Arial`;
    context.textAlign = "center";
    context.shadowColor = "black";
    context.shadowOffsetX = 0;
    context.shadowOffsetY = 0;
    context.shadowBlur = 2 * scale;
    context.lineWidth = 3 * scale;
    context.fillStyle = "black";
    context.strokeText(subtitle, 570 * scale / 2, 300 * scale);
    context.fillStyle = "#d4d4d4";
    context.shadowBlur = 0;
    context.fillText(subtitle, 570 * scale / 2, 300 * scale);
  }
};

const fillImage = (context, image, scale, posX, posY, deg, width, height) => {
  const rad = deg * Math.PI/180;
  const x = posX * scale;
  const y = posY * scale;
  const originX = width * scale / 2;
  const originY = height * scale / 2;
  context.save();
  context.translate(x+originX, y+originY);
  context.rotate(rad);
  context.translate(-originX, -originY);
  context.drawImage(image, 0, 0, width * scale, height * scale);
  context.restore();
};

const fillLaiAvatar = (context, index, scale) => {
  const position = positions["avatar-lai"];
  return new Promise((resolve) => {
    if (!avatar["avatar-lai"]) {
      resolve();
    } else if (!position[index]) {
      resolve();
    } else if ((index < 116) || (index >= 130 && index < 163) || (index >= 177)) {
      resolve();
    } else {
      const [x, y, deg] = position[index];
      const img = new Image();
      img.src = avatar["avatar-lai"];
      img.onload = () => {
        fillImage(context, img, scale, x, y, deg, 300, 300);
        resolve();
      };
    }
  });
};

const fillChengAvatar = (context, index, scale) => {
  const position = positions["avatar-cheng"];
  return new Promise((resolve) => {
    if (!avatar["avatar-cheng"]) {
      resolve();
    } else if (!position[index]) {
      resolve();
    } else if ((index >= 116 && index < 130) || (index >= 163 && index < 177)) {
      resolve();
    } else {
      const [x, y, deg] = position[index];
      const img = new Image();
      img.src = avatar["avatar-cheng"];
      img.onload = () => {
        fillImage(context, img, scale, x, y, deg, 225, 225);
        resolve();
      };
    }
  });
};

const fillLeungAvatar = (context, index, scale) => {
  const position = positions["avatar-leung"];
  return new Promise((resolve) => {
    if (!avatar["avatar-leung"]) {
      resolve();
    } else if (!position[index]) {
      resolve();
    } else if ((index >= 116 && index < 130) || (index >= 163 && index < 177)) {
      resolve();
    } else {
      const [x, y, deg] = position[index];
      const img = new Image();
      img.src = avatar["avatar-leung"];
      img.onload = () => {
        fillImage(context, img, scale, x, y, deg, 200, 200);
        resolve();
      };
    }
  });
};

const convertGif = (encoder, container, rate, scale, renderBtn, downloadBtn) => {
  
  const canvas = document.createElement("canvas");
  canvas.setAttribute("width", 570 * scale);
  canvas.setAttribute("height", 320 * scale);
  const context = canvas.getContext("2d");

  encoder.setRepeat(0);
  encoder.setDelay(100 * rate);
  encoder.setSize(570 * scale, 320 * scale);
  encoder.setQuality(20);
  encoder.start();

  let index = 0;

  const addFrame = (callback) => {
    const img = new Image();
    img.src = images[index];
    img.onload = () => {
      setProgressBar(index/images.length);
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.drawImage(img, 0, 0, canvas.width, canvas.height);
      fillLaiAvatar(context, index, scale).then(() => {
        fillLeungAvatar(context, index, scale).then(() => {
          fillChengAvatar(context, index, scale).then(() => {
            fillSubtitle(context, getSubtitle(index), scale);
            encoder.addFrame(context);
            index += rate;
            callback();
          });
        });
      });
    };
  };

  const checkFinish = () => {
    if (index < images.length) {
      addFrame(checkFinish);
    } else {
      encoder.finish();

      const img = document.createElement("img");
      // TODO:
      // some browser does not support base64 encoded images with large size.
      // ... at least it doesnt work on my ipad
      //img.setAttribute("src", `data:image/gif;base64,${btoa(encoder.stream().getData())}`);
      const data = new Uint8Array(encoder.stream().bin);
      blob = new Blob([data], { type: "image/gif" });
      blobURL && window.URL.revokeObjectURL(blobURL);
      blobURL = URL.createObjectURL(blob);

      img.setAttribute("src", blobURL);
      img.setAttribute("alt", "瀏覽器不支援此圖片檔案大小，請調整運算設定");
      container.classList.remove("converting");
      container.innerHTML = "";
      container.appendChild(img);

      renderBtn.disabled = false;
      downloadBtn.disabled = false;
    }
  }

  addFrame(checkFinish);
};

const estimateSize = () => {
  const rateInput = document.querySelector(".options-container input[name=rate]:checked");
  const scaleInput = document.querySelector(".options-container input[name=scale]:checked");
  const fileSizeInput = document.getElementById("file-size");

  const rate = (rateInput.value || 1)-0;
  const scale = scaleInput.value || "1";
  const base = scale === "1" ? 19 : (scale === "0.7" ? 10.7 : (scale === "0.5" ? 6.3 : 0));

  const filesize = parseInt(base*10 / rate) / 10;
  fileSizeInput.value = `~${filesize}MB`;
};

document.addEventListener("DOMContentLoaded", (e) => {
  const container = document.getElementById("image-container");
  const renderBtn = document.getElementById("render-button");
  const downloadBtn = document.getElementById("download-button");
  const avatarInputs = document.querySelectorAll(".avatar-container input[type=file]");
  const rateInputs = document.querySelectorAll(".options-container input[name=rate]");
  const scaleInputs = document.querySelectorAll(".options-container input[name=scale]");
  const highRateInput = document.getElementById("high-rate");
  const scale70Input = document.getElementById("scale-70");

  downloadBtn.disabled = true;
  highRateInput.checked = true;
  scale70Input.checked = true;

  estimateSize();

  [...rateInputs].forEach((input) => input.addEventListener("change", estimateSize));
  [...scaleInputs].forEach((input) => input.addEventListener("change", estimateSize));
  [...avatarInputs].forEach((input) => input.addEventListener("change", (e) => {
    try {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = ((f) => {
        const id = e.target.id;
        const img = document.querySelector(`label[for=${id}] img`);
        return (e) => {
          img.setAttribute("src", e.target.result);
          avatar[id] = e.target.result;
        };
      })(file);
      reader.readAsDataURL(file);
    } catch (e) {
      console.error(e);
    }
  }));
  renderBtn.addEventListener("click", (e) => {
    const rateInput = document.querySelector(".options-container input[name=rate]:checked");
    const scaleInput = document.querySelector(".options-container input[name=scale]:checked");
    renderBtn.disabled = true;
    renderProgressBar(container);
    convertGif(new GIFEncoder(), container, (rateInput.value || 1)-0, (scaleInput.value || 1)-0, renderBtn, downloadBtn);
  });
  downloadBtn.addEventListener("click", (e) => {
    if (!!blob) {
      FileSaver.saveAs(blob, "sorry.gif");
    }
  });

  tippy(".subtitle-container, .avatar-container, .options-container", {
    placement: "left",
    arrow: true,
    size: "small",
    distance: 20,
  });
});
