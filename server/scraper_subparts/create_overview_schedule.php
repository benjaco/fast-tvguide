<?php
/**
 * Created by PhpStorm.
 * User: Benjamin
 * Date: 01-05-2017
 * Time: 13:18
 */

$files = scandir(__DIR__ . '/../data/full_schedule/');
unset($files[0]);
unset($files[1]);

foreach ($files as $file) {
    $filecontent = json_decode(file_get_contents(__DIR__ . '/../data/full_schedule/' . $file), true);
    $shotfile = [];

    foreach ($filecontent['jsontv']['programme'] as $program) {
        $title = "Title ikke fundet";
        if (isset($program['title']['da'])) {
            $title = $program['title']['da'];
        } elseif (isset($program['title']['en'])) {
            $title = $program['title']['en'];
        }

        $shotfile[] = [
            $title,
            (int)$program['start'],
            (int)$program['stop']
        ];
    }

    file_put_contents(__DIR__ . '/../data/schedule/' . $file, json_encode($shotfile));

}