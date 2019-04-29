<?php
echo 'bedca php';
$url = 'http://www.bedca.net/bdpub/procquery.php';
$xml = "<?xml version=\"1.0\" encoding=\"utf-8\"?>    <foodquery>      <type level=\"3\"/>      <selection>        <atribute name=\"fg_id\"/>        <atribute name=\"fg_ori_name\"/>        <atribute name=\"fg_eng_name\"/>      </selection>      <order ordtype=\"ASC\">        <atribute3 name=\"fg_id\"/>      </order>    </foodquery>";

$context = stream_context_create(array('http' => array(
'method' => "POST",
'header' => "Content-Type: text/xml",
'content' => $xml
)));

$xml = simplexml_load_string( file_get_contents($url, false, $context) );

echo '<pre>';
print_r($xml);