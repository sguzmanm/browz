const imgbbUploader = require("imgbb-uploader");

imgbbUploader(
  "1e75677e91c29adddfd31298730553cd",
  `../../screenshots/chromium/1280x720/fill_input.png`
)
  .then(response => console.log(response))
  .catch(error => console.error(error));
