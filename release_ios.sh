#! /bin/bash
eval cp ./hooks/after_prepare/release_hooks/* ./hooks/after_prepare/

eval mkdir ./www/ionic/
eval mkdir ./www/ionic/fonts/
eval cp ./www/lib/ionic/fonts/* ./www/ionic/fonts/
eval mkdir ./www/dist/dist_css/
eval mkdir ./www/dist/dist_css/fonts/
eval cp ./www/css/fonts/* ./www/dist/dist_css/fonts/

eval gulp prerelease
eval ionic build ios

rm ./hooks/after_prepare/020_remove_sass_from_platforms.js
rm ./hooks/after_prepare/030_clean_dev_files_from_platforms.js
rm ./hooks/after_prepare/040_move_dist_files_to_platforms.js
rm ./hooks/after_prepare/050_clean_obfuscation.js
rm ./hooks/after_prepare/060_uglify.js