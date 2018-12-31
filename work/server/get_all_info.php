<?php
/**
 * Created by PhpStorm.
 * User: Benjamin
 * Date: 02-05-2017
 * Time: 18:17
 */
// url example
// get_all_info.php?channel=6-eren.dk&date=2017-05-03&no=28
# todo validate data, this is not safe
if (!isset($_GET['channel'], $_GET['date'], $_GET['no'])) {
    echo json_encode(["status" => "Invalid request, provide channels and dates get variables", "status_code" => 12]);
    die();
}
if (!is_string($_GET['channel']) || !is_string($_GET['date']) || !is_numeric($_GET['no'])) {
    echo json_encode(["status" => "Invalid request, must not be arrays", "status_code" => 13]);
    die();
}

function not_found(){
    echo json_encode(["status" => "Program not found", "status_code" => 14]);
    die();
}

$filename = __DIR__ . "/data/full_schedule/". $_GET['channel']."_". $_GET['date'].".json";
if(!file_exists($filename)){
    not_found();
}
$file_content = json_decode(file_get_contents($filename), true);

if (!isset($file_content['jsontv']['programme'][(int)$_GET['no']])) {
    not_found();
}
echo json_encode(["status" => "Success", "status_code" => 1, "program" => $file_content['jsontv']['programme'][(int)$_GET['no']]]);
