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

$number_of_possible_requests = count($dates_to_scrape) * count($channels_to_scrape);
$number_of_processed_requests = 0;

foreach ($channels_to_scrape as $channel) {
    foreach ($dates_to_scrape as $date) {
        $url = "http://json.xmltv.se/" . $channel . "_" . $date . ".js.gz";
        $save_url = __DIR__ . "/../data/full_schedule/" . $channel . "_" . $date . ".json";

        $number_of_processed_requests += 1;

        if (file_exists($save_url)) {
            echo "FOUND" . PHP_EOL;
            $this_file_last_update = 0;
            if (isset($last_updated[$channel][$date])) {
                $this_file_last_update = $last_updated[$channel][$date];
            }
            $this_file_last_modification = 0;
            if (isset($last_modified[$channel][$date])) {
                $this_file_last_modification = $last_modified[$channel][$date];
            }
            if ($this_file_last_modification <= $this_file_last_update) {
                continue;
            }
            echo "MUST BE UPDATED" . PHP_EOL;
        }

        $options  = array('http' => array('user_agent' => 'project at school easj roskilde - fast tvguide - mail: benj3799@edu.easj.dk'));
        $context  = stream_context_create($options);

        $content = @file_get_contents($url, false, $context);

        if ($content === false) {
            echo number_format(($number_of_processed_requests / $number_of_possible_requests)*100, 2) .  "% - FAIL - $url".PHP_EOL;
        } else {
            echo number_format(($number_of_processed_requests / $number_of_possible_requests)*100, 2) .  "% - OK - $url".PHP_EOL;

            file_put_contents($save_url, $content);

            $last_updated[$channel][$date] = time();

            // dette er kun så man kan stoppe scripted undervejs
            file_put_contents(__DIR__ . "/../data/last_update.json", json_encode($last_updated));
        }

        sleep(0.5);
    }
}

file_put_contents(__DIR__ . "/../data/last_update.json", json_encode($last_updated));
