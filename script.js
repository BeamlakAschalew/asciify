$(document).ready(function () {
  $("#upload-card").on("click", function () {
    $("#image-upload").click(); // Trigger file input click
  });

  $("#image-upload").on("change", function (event) {
    const file = event.target.files[0];

    if (file) {
      const reader = new FileReader();

      reader.onload = function (e) {
        console.log("Image uploaded:", e.target.result);
      };

      reader.readAsDataURL(file);
    }
  });
});
