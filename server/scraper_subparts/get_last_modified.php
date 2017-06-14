<?php
/**
 * Created by PhpStorm.
 * User: Benjamin
 * Date: 02-05-2017
 * Time: 13:16
 */
$date_options = array('http' => array('user_agent' => 'project at school easj roskilde - fast tvguide - mail: benj3799@edu.easj.dk'));
$date_context = stream_context_create($date_options);

$date_filecontent = gzdecode(file_get_contents("http://xmltv.xmltv.se/datalist.xml.gz", false, $date_context));

$date_xml = simplexml_load_string($date_filecontent) or die("Error: Cannot create object");

$last_modified = [];

foreach ($date_xml as $channel) {
    /**
     * @var $channel SimpleXMLElement
     */

    $times = [];

    foreach ($channel->datafor as $date_row) {
        $times[(string)$date_row] = DateTime::createFromFormat("YmdHis O", $date_row->attributes()['lastmodified'])->getTimestamp();
    }

    $last_modified[ (string) $channel->attributes()['id']] = $times;
}
