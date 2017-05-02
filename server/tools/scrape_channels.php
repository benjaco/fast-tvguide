<?php
/**
 * Created by PhpStorm.
 * User: Benjamin
 * Date: 01-05-2017
 * Time: 10:50
 */

$channels = [];

$handle = fopen("../scrape_this/all_channels.txt", "r");
if ($handle) {
    while (($line = fgets($handle)) !== false) {
        // process the line read.
        $line = trim($line);

        if (endsWith($line, ".dk")) {
            $channels[] = $line;
        }


    }

    fclose($handle);
} else {
    // error opening the file.
}

file_put_contents("../data/channels/dk_channels_auto.json", json_encode($channels));


function startsWith($haystack, $needle)
{
    $length = strlen($needle);
    return (substr($haystack, 0, $length) === $needle);
}

function endsWith($haystack, $needle)
{
    $length = strlen($needle);
    if ($length == 0) {
        return true;
    }

    return (substr($haystack, -$length) === $needle);
}
