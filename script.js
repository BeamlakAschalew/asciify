let ASCII_CHARACTERS = "█▓▒░@%#*+=-:. ";
let originalImageData = null;
let resized = null;
const CHARACTER_ASPECT_RATIO = 2.7;
let brightness = 100;
let totalCharacters = 200;

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

  $("#output pre").text(asciiArt.join("\n"));
}

function brightnessToAscii(brightness) {
  const index = Math.floor((brightness / 255) * (ASCII_CHARACTERS.length - 1));
  return ASCII_CHARACTERS[index];
}
