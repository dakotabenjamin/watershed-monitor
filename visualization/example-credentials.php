<?php

#connection to postgres db - where well data is
$postgres = pg_pconnect("host=localhost user=postgres password=password dbname=postgres");

// connection to drupal db - where metadata is
$drupal = pg_pconnect("host=localhost user=postgres password=password dbname=drupal");



?>
