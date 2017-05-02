<?php
/**
 * Created by PhpStorm.
 * User: Benjamin
 * Date: 01-05-2017
 * Time: 14:14
 */


function clean_up($foldername) {

    $files = scandir($foldername);
    unset($files[0]);
    unset($files[1]);

    $now = new DateTime();
    $now->setTime(0,0,0);

    foreach ($files as $file) {

        $file_date = explode("_", $file)[1];
        $file_date = substr($file_date, 0, -5);

        $date = DateTime::createFromFormat("Y-m-d", $file_date);
        $date->setTime(0,0,0);

        if ($now > $date) {
            unlink($foldername . $file);
        }


    }


}

clean_up(__DIR__ . '/../data/full_schedule/');
clean_up(__DIR__ . '/../data/schedule/');


$last_update_file = json_decode(file_get_contents(__DIR__ . "/../data/last_update.json"), false);
