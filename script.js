let ASCII_CHARACTERS = "@%#WMH*+=-:. ";

let originalImageData = null;
let resized = null;
const CHARACTER_ASPECT_RATIO = 2.7;
let brightness = 100;
let totalCharacters = 200;
let generatedAscii = "";

$(document).ready(function () {
  $("#output-pre").hide();
  $("#upload-card").on("click", function () {
    $("#image-upload").click();
  });

  $("#image-upload").on("change", function (event) {
    const file = event.target.files[0];

    if (file) {
      const reader = new FileReader();
      reader.onload = function (e) {
        processImageWithJimp(e.target.result);
        $("#output-pre").show();
        $("#no-pre").hide();
      };
      reader.readAsDataURL(file);
    }
  });

  $("#brightness-range").on("input", function (e) {
    brightness = e.target.value;
    $("#brightness-label").text(`Brightness ${brightness}`);
    if (resized) {
      convertToAscii(resized, brightness);
    }
  });
  $("#reverse-box").on("change", function (e) {
    const isChecked = $(this).is(":checked");
    console.log(isChecked);

    if (resized) {
      ASCII_CHARACTERS = ASCII_CHARACTERS.split("").reverse().join("");

      processNewSize(totalCharacters);
    }
  });

  $("#characters-range").on("input", (e) => {
    totalCharacters = Number(e.target.value);
    $("#characters-label").text(`Total characters ${totalCharacters}`);
    if (resized) {
      processNewSize(totalCharacters);
    }
  });

  $("#copy-clipboard").on("click", copyToClipboard);

  $("#download-txt").on("click", downloadAsciiText);

  $("#download-png").on("click", downloadAsPng);
});

async function processImageWithJimp(imageSrc) {
  const img = await Jimp.read(imageSrc);
  originalImageData = await Jimp.read(imageSrc);

  const outputWidth = totalCharacters;
  const aspectRatio = img.bitmap.height / img.bitmap.width;
  const adjustedHeight = Math.floor(
    (outputWidth * aspectRatio) / CHARACTER_ASPECT_RATIO
  );
  img.resize(outputWidth, adjustedHeight).greyscale();
  resized = img;

  displayImage(originalImageData);

  convertToAscii(img, brightness);
}

async function processNewSize(newSize) {
  const img = await Jimp.read(originalImageData);
  originalImageData = await Jimp.read(originalImageData);

  const outputWidth = newSize;
  const aspectRatio = img.bitmap.height / img.bitmap.width;
  const adjustedHeight = Math.floor(
    (outputWidth * aspectRatio) / CHARACTER_ASPECT_RATIO
  );
  img.resize(outputWidth, adjustedHeight).greyscale();
  resized = img;

  convertToAscii(img, brightness);
}

function displayImage(jimpImage) {
  jimpImage.getBase64(Jimp.MIME_PNG, (err, src) => {
    if (!err) {
      $("#uploaded-image").attr("src", src);
      $(".no-image").hide();
    }
  });
}

function convertToAscii(jimpImage, brightness) {
  brightness = Number(brightness) / 100;

  const asciiArt = [];
  for (let y = 0; y < jimpImage.bitmap.height; y++) {
    let row = "";
    for (let x = 0; x < jimpImage.bitmap.width; x++) {
      const idx = jimpImage.getPixelIndex(x, y);

      let r = jimpImage.bitmap.data[idx] * brightness;

      r = Math.max(0, Math.min(255, r));

      row += brightnessToAscii(r);
    }
    asciiArt.push(row);
  }
  generatedAscii = asciiArt.join("\n");
  $("#output pre").text(generatedAscii);
}

function brightnessToAscii(brightness) {
  const index = Math.floor((brightness / 255) * (ASCII_CHARACTERS.length - 1));
  return ASCII_CHARACTERS[index];
}

function downloadAsciiText() {
  const text = generatedAscii;
  const asciiArt = $("#output pre").text().trim();

  const normalizedAscii = normalizeLineLengths(asciiArt);
  const blob = new Blob([normalizedAscii], {
    type: "text/plain;charset=utf-16",
  });

  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `${Date.now()}.txt`;

  link.click();

  URL.revokeObjectURL(link.href);
}

function normalizeLineLengths(asciiArt) {
  const lines = asciiArt.split("\n");
  const maxLength = Math.max(...lines.map((line) => line.length));
  return lines.map((line) => line.padEnd(maxLength, " ")).join("\n");
}

async function downloadAsPng() {
  const lines = generatedAscii.split("\n");
  const charWidth = 10;
  const maxWidth = Math.max(...lines.map((line) => line.length)) * charWidth;
  const imageHeight = lines.length * 28;

  const image = await new Jimp(maxWidth, imageHeight, 0xffffffff);
  const fontUrl = "../assets/hk.fnt";
  const font = await Jimp.loadFont(fontUrl);

  lines.forEach((line, index) => {
    image.print(font, 10, index * 28, line);
  });

  image.getBase64(Jimp.MIME_PNG, (err, src) => {
    if (err) {
      console.error("Error generating image:", err);
      return;
    }

    const link = document.createElement("a");
    link.href = src;
    link.download = `${Date.now()}-ascii-image.png`;
    link.click();
  });
}

function copyToClipboard() {
  navigator.clipboard
    .writeText(generatedAscii)
    .then(function () {
      $("#info-box").fadeIn();

      setTimeout(function () {
        $("#info-box").fadeOut();
      }, 3000);
    })
    .catch(function (error) {
      console.error("Error copying text: ", error);
    });
}
