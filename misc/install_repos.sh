#!/bin/bash

repos=(
  "https://github.com/faviator/faviator.xyz.git"
  "https://github.com/egoist/docute.git"
  "https://github.com/ahfarmer/emoji-search.git"
  "https://github.com/RaulB-masai/react-image-compressor.git"
  "https://github.com/GermaVinsmoke/bmi-calculator.git"
  "https://github.com/tangram-js/json-schema-editor.git"
  "https://github.com/creativetimofficial/vue-paper-dashboard.git"
  "https://github.com/silent-lad/VueSolitaire.git"
  "https://github.com/msjaber/marked.cc.git"
)

# Create the project directory if it does not exist. Ignore output
mkdir test-projects &>/dev/null
cd test-projects

echo -e "\n----Cloning project repositories----\n"

for repo in "${repos[@]}"
do
  echo -e "Cloning $repo..."
  git clone $repo
  echo
done

echo -e "\n----Installing and building projects dependencies----\n"

for folder in */
do
  cd $folder
  echo -e "Installing dependencies for '$folder' \n"

  npm install
  echo

  echo -e "Building project '$folder' \n"
  npm run build

  # Rename react projects to "dist", to make things simpler
  mv build dist &>/dev/null

  echo
  cd ..
done

cd ..
echo -e "Finished project installation"