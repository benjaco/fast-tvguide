<?php
/**
 * Created by PhpStorm.
 * User: Benjamin
 * Date: 01-05-2017
 * Time: 11:39
 */
$images = json_decode(file_get_contents("../data/channels/dk_channels_auto.json"), true);

foreach ($images as $image) {
    if(file_exists("../data/images/".$image.".png")){
        continue;
    }
    file_put_contents("../data/images/".$image.".png", file_get_contents("http://logos.xmltv.se/".$image.".png"));
    echo 1;
}