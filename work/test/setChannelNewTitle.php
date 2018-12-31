<?php
/**
 * Created by PhpStorm.
 * User: Benjamin
 * Date: 13-06-2017
 * Time: 22:27
 */

$channel = $_GET['c'];
$number = (int)$_GET['p'];

if (isset($_GET['d'])) {
    $date = $_GET['d'];
} else {
    $date = (new DateTime())->format("Y-m-d");
}

if (isset($_GET['t'])) {
    $new_title = $_GET['t'];
} else {
    $new_title =
        [
            "Abel",
            "Jackie",
            "Caleb",
            "Diana",
            "Matthew",
            "Cameron",
            "Frank",
            "Santos",
            "Lynda",
            "Leslie"
        ][rand(0, 9)];
}


$filename = "../server/data/full_schedule/" . $channel . "_" . $date . ".json";
$filename_schedule = "../server/data/schedule/" . $channel . "_" . $date . ".json";
$time = time();


if (file_exists($filename)) {
    echo $filename . " exist - set to: " . $new_title;

    $content = json_decode(file_get_contents($filename), true);
    $content['jsontv']['programme'][$number]['title']['da'] = $new_title;
    file_put_contents($filename, json_encode($content));

    $content_schedule = json_decode(file_get_contents($filename_schedule), true);
    $content_schedule[$number][0] = $new_title;
    file_put_contents($filename_schedule, json_encode($content_schedule));

    $update = json_decode(file_get_contents("../server/data/last_update.json"), true);
    $update[$channel][$date] = $time;
    file_put_contents("../server/data/last_update.json", json_encode($update));

}