# Fast tv guide

The goal of this project is to make a tv guide there loads within 500ms on a mobile device (my personal high-end phone).

The project includes a slow normal example of a tv guide in the angular1 folder.

The fast version will be made in the PWA folder and only on enhancement will be add on the plain version at a time, so check the different  branches, it will first be merged when all the different enhancement is made.

Chapters

- precondtions: promise, rendering pipline
- Script execution on mobile 
- Long frames 
    - Animation in css / js - whitch properties 
    - Trigger layout in loop 
    - Write to dom in loop
- Idle callback 
- Web worker 

- 101 minify js and css
- Service worker 
- App shell model 
- Data caching in local storage and index db 
- Progressive loading
- Http 2
- Streams

- Progressive webapp 




# To get up and running (sorry the complicated setup)
the api endpoint is only for testing

replace {{insert user agent here}} in server\scraper_subparts\get_last_modified.php and server\scraper_subparts\scraper.php

install npm-run globally "npm install -g npm-run"

install developer dependencies "npm install"

add a folder called "images", "full_schedule" and "schedule"" inside "server/data"

run php "download_images.php" inside "server/tools"

add "last_update.json" inside "server" with "[]" as content

run php "download_images.php" inside "server/tools"

run php "server/update_data.php" to update channel data


run "npm run build" to build the pwa app