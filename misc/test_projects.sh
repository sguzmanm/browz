dateFolder=$(date)
mkdir test-runs &>/dev/null
mkdir "test-runs/$dateFolder"

echo -e "Tests logs will be stored in test-runs/$dateFolder/ \n"

echo -e "\n----Testing each project----\n"

cd ..

for folder in misc/test-projects/*
do
  project=`basename $folder`
  echo -e "Running: $project"

  npm run browz -- "./$folder/dist/" --skip-report --verbose > "./misc/test-runs/$dateFolder/$project.log"
done

echo "Finished testing :)"
