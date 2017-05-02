<?php
/**
 * Created by PhpStorm.
 * User: Benjamin
 * Date: 02-05-2017
 * Time: 16:51
 */
// url example
// get_overview.php?channels[]=6-eren.dk&channels[]=tv2.dk&dates[]=2017-05-02&dates[]=2017-05-03
if (!isset($_GET['channels'], $_GET['dates'])) {
    echo json_encode(["status" => "Invalid request, provide channels and dates get variables", "status_code" => 10]);
    die();
}
if (!is_array($_GET['channels']) || !is_array($_GET['dates'])) {
    echo json_encode(["status" => "Invalid request, must be arrays", "status_code" => 11]);
    die();
}

# todo validate data, this is not safe

$output = [];

foreach ($_GET['channels'] as $channel) {
    $output[$channel] = [];
    foreach ($_GET['dates'] as $date) {
        $output[$channel][$date] = [];
        $filename = __DIR__ . "/data/schedule/".$channel."_".$date.".json";
        if(file_exists($filename)){
            $output[$channel][$date] = json_decode(file_get_contents($filename));
        }
    }
}

echo json_encode( [ "channels" => $output, "status"=>"Success", "status_code"=> 1 ]);
