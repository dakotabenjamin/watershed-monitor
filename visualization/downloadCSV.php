<?php

include 'credentials.php';

error_reporting(E_ALL);
ini_set('display_errors',1);
//ini_set('log_errors',0);


// output headers so that the file is downloaded rather than displayed
header('Content-Type: text/csv; charset=utf-8');
header('Content-Disposition: attachment; filename=' . $_POST['wellname'] . '.csv');

// create a file pointer connected to the output stream
$output = fopen('php://output', 'w');

// output the column headings
fputcsv($output, array('datetime', 'level', 'calibration'));

// fetch the data
$result = pg_query($postgres,(string) $_POST['querystr']);
// loop over the rows, outputting them
while ($row = pg_fetch_assoc($result)) fputcsv($output, $row);
#$rows = pg_fetch_assoc($result);
#for ($i = 0; $i < pg_num_rows($result);$i++) fputcsv($output, $row);

?>
