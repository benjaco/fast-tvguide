<?php
/**
 * Created by PhpStorm.
 * User: Benjamin
 * Date: 01-05-2017
 * Time: 10:18
 */


$dates_to_scrape = [];
$channels_to_scrape = array_keys(json_decode(file_get_contents(__DIR__ . "/../data/channels/dk_channel_names_manuel.json"), true));

$date = new DateTime();
if ((int)$date->format("G") < 4) {
    $date->sub(new DateInterval("P1D"));
}

for ($i = 0; $i < 10; $i++) {
    $dates_to_scrape[] = $date->format("Y-m-d");
    $date->add(new DateInterval("P1D"));
}

include "get_last_modified.php";

$last_updated = json_decode(file_get_contents(__DIR__ . "/../data/last_update.json"), true);

$antal = count($dates_to_scrape) * count($channels_to_scrape);
$hentent = 0;

foreach ($channels_to_scrape as $channel) {
    foreach ($dates_to_scrape as $date) {
        $url = "http://json.xmltv.se/" . $channel . "_" . $date . ".js.gz";
        $save_url = __DIR__ . "/../data/full_schedule/" . $channel . "_" . $date . ".json";

        $hentent += 1;

        if (file_exists($save_url)) {
            echo "FINDES" . PHP_EOL;
            $sidst_opdateret = 0;
            if (isset($last_updated[$channel][$date])) {
                $sidst_opdateret = $last_updated[$channel][$date];
            }
            $sidst_modified = 0;
            if (isset($last_modified[$channel][$date])) {
                $sidst_modified = $last_modified[$channel][$date];
            }
            if ($sidst_modified <= $sidst_opdateret) {
                continue;
            }
            echo "MEN SKAL OPDATERES" . PHP_EOL;
        }

        $options  = array('http' => array('user_agent' => 'project at school easj roskilde - fast tvguide - mail: benj3799@edu.easj.dk'));
        $context  = stream_context_create($options);

        $content = @file_get_contents($url, false, $context);

        if ($content === false) {
            echo number_format(($hentent / $antal)*100, 2) .  "% - FAIL - $url".PHP_EOL;
        } else {
            echo number_format(($hentent / $antal)*100, 2) .  "% - OK - $url".PHP_EOL;

            file_put_contents($save_url, $content);

            $last_updated[$channel][$date] = time();

            // dette er kun så man kan stoppe scripted undervejs
            file_put_contents(__DIR__ . "/../data/last_update.json", json_encode($last_updated));
        }

        sleep(0.5);
    }
}

file_put_contents(__DIR__ . "/../data/last_update.json", json_encode($last_updated));
