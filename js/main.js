function loadDefaultImage() {
  document.getElementById("uploaded-image").src = "img/spongebob.jpg";
  document.querySelector(".uploaded-image").style.display = "flex";
  document.querySelector(".uploaded-image .no-image").style.display = "none";
  extractColors("img/spongebob.jpg");
}

document.getElementById("upload-form").addEventListener("submit", function (event) {
  event.preventDefault();
  let file = document.getElementById("image-upload").files[0];

  if (file) {
      let reader = new FileReader();
      reader.onload = function (event) {
          let imageUrl = event.target.result;
          document.getElementById("uploaded-image").src = imageUrl;
          document.querySelector(".uploaded-image").style.display = "flex";
          document.querySelector(".uploaded-image .no-image").style.display = "none";
          extractColors(imageUrl);
      };
      reader.readAsDataURL(file);
  } else {
      document.querySelector(".uploaded-image").style.display = "none";
      document.querySelector(".uploaded-image .no-image").style.display = "block";
  }
});

function extractColors(imageUrl) {
  let img = new Image();
  img.src = imageUrl;
  img.crossOrigin = "Anonymous";
  img.onerror = function () {
      alert("Error loading image. Please make sure the URL is correct and the image is CORS-enabled.");
  };

  img.onload = function () {
      let colorThief = new ColorThief();
      let preliminaryPalette = colorThief.getPalette(img, 100);

      const bucketSize = 360 / 6;
      let hueBuckets = {};
      for (let i = 0; i < 6; i++) {
          hueBuckets[i] = [];
      }

      preliminaryPalette.forEach(color => {
          const hue = chroma(color[0], color[1], color[2]).hsv()[0];
          const bucket = getHueBucket(hue, bucketSize);
          hueBuckets[bucket].push(color);
      });

      let finalPalette = [];
      let remainingColors = [...preliminaryPalette];

      for (let bucket in hueBuckets) {
          const colors = hueBuckets[bucket];
          if (colors.length === 0) continue;

          colors.sort((a, b) => {
              const satA = chroma(a[0], a[1], a[2]).hsv()[2];
              const satB = chroma(b[0], b[1], b[2]).hsv()[2];
              return satB - satA;
          });

          for (const color of colors) {
              if (isDistinct(color, finalPalette)) {
                  finalPalette.push(color);
                  const index = remainingColors.findIndex(col => JSON.stringify(col) === JSON.stringify(color));
                  if (index !== -1) {
                      remainingColors.splice(index, 1);
                  }
                  break;
              }
          }
      }

      while (finalPalette.length < 6 && remainingColors.length > 0) {
          finalPalette.push(remainingColors.shift());
      }

      displayColors(finalPalette);
  };
}

function getHueBucket(hue, bucketSize) {
  return Math.floor(hue / bucketSize);
}

function isDistinct(color, palette, threshold = 50) {
  return !palette.some(existingColor => euclideanDistance(color, existingColor) < threshold);
}

function euclideanDistance(color1, color2) {
  const dr = color2[0] - color1[0];
  const dg = color2[1] - color1[1];
  const db = color2[2] - color1[2];
  return Math.sqrt(dr * dr + dg * dg + db * db);
}

function displayColors(prevalentColors) {
  let prevalentColorList = document.getElementById("prevalent-color-list");
  prevalentColorList.innerHTML = "";

  for (let color of prevalentColors) {
      let listItem = document.createElement("li");
      let colorBox = document.createElement("div");
      colorBox.className = "color-box";
      colorBox.style.backgroundColor = `rgb(${Math.round(color[0])}, ${Math.round(color[1])}, ${Math.round(color[2])})`;
      listItem.appendChild(colorBox);
      prevalentColorList.appendChild(listItem);
  }
}

function changeBackgroundColor() {
  let chosenColor = document.getElementById("background-color-input").value;
  document.body.style.backgroundColor = chosenColor;
}
