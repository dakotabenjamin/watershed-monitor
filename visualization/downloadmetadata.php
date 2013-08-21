<?php

include 'credentials.php'

// output headers so that the file is downloaded rather than displayed
header('Content-Type: text/csv; charset=utf-8');
header('Content-Disposition: attachment; filename=metadata.csv');

// create a file pointer connected to the output stream
$output = fopen('php://output', 'w');

// output the column headings
fputcsv($output, array('Well Name', 'Well Serial', 'Reservation', 'Latitude', 'Longitude', 'Elevation'));

// fetch the data
$rows = pg_query($drupal,"SELECT DISTINCT node.field_gis_code_value as well_name, field_data_field_serial.field_serial_value as serial, field_data_field_reservation.field_reservation_value as reservation, field_data_field_latitude.field_latitude_lat as lat,field_data_field_latitude.field_latitude_lon as lon, field_data_field_elevation.field_elevation_value as elevation FROM field_data_field_reservation, field_data_field_elevation, field_data_field_gis_code as node, field_data_field_latitude, field_data_field_serial WHERE node.entity_id=field_data_field_latitude.entity_id AND node.entity_id=field_data_field_serial.entity_id  AND node.entity_id=field_data_field_latitude.entity_id AND node.entity_id=field_data_field_elevation.entity_id AND node.entity_id=field_data_field_reservation.entity_id ORDER BY well_name") or die("query");
 
// loop over the rows, outputting them
while ($row = pg_fetch_assoc($rows)) fputcsv($output, $row);

?>

