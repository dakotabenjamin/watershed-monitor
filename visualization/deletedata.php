<html><head></head><body>

<?php

include 'credentials.php'; 

$input= $_POST['deletedd'];

$id = explode(",",$input);


$results = pg_query($drupal, "
SELECT field_serial_value serial FROM field_data_field_serial WHERE entity_id = $id[0] LIMIT 1");
if (!$results) {
  echo "No results";
  exit;
}
 
$tablename = pg_fetch_all($results);
$tablename= $tablename[0]['serial'];
$delresults = pg_delete($postgres, "well_$tablename", array("retrieval_date"=>"$id[1]"));
if(!$delresults){ echo "nothing was deleted"; }
else {
echo "Records deleted, you should also <a href='../?q=node/$id[2]/delete'>delete the entry.</a>"; 
}

?>
</body></html>
