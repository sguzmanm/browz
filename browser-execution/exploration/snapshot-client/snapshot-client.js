// Post to image server

// Communication used in frameworks of automated testing
const fetch = require('node-fetch');
const fs = require('fs');

module.exports.sendSnapshot = async ([preSnapshot, postSnapshot], details) => {
  const { path: prePath } = preSnapshot;
  const { path: postPath } = postSnapshot;

  let preImage;
  let postImage;

  try {
    preImage = await fs.readFileSync(prePath);
    postImage = await fs.readFile(postPath);
  } catch (error) {
    console.error('Error reading images: ', error);
  }
};
