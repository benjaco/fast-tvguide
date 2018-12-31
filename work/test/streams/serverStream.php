<?php
/**
 * Created by PhpStorm.
 * User: Benjamin
 * Date: 06-05-2017
 * Time: 12:13
 */
set_time_limit(3600);

date_default_timezone_set("America/New_York");

$counter = rand(1, 10);
while (1) {
    // Every second, send a "ping" event.


    $curDate = date(DATE_ISO8601);
    echo '{"time": "' . $curDate . '"}';
    echo "\n\n";

    // Send a simple message at random intervals.

    $counter--;


    if (ob_get_contents()) ob_end_clean();

    flush();
    sleep(1);
}