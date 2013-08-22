<!DOCTYPE html>

<html>

<head>
        <meta charset="utf-8">
        <title>Water Monitor Visualization</title>
	<script src="http://ajax.googleapis.com/ajax/libs/jquery/1.8.2/jquery.min.js"></script>
	<script src="http://d3js.org/d3.v2.js"></script>
	<script src="http://netdna.bootstrapcdn.com/twitter-bootstrap/2.1.1/js/bootstrap.min.js"></script>
	<script src="http://cdnjs.cloudflare.com/ajax/libs/prettify/188.0.0/prettify.js"></script>
	<script src="http://cdn.leafletjs.com/leaflet-0.6.2/leaflet.js"></script>
	<script src="js/Leaflet.markercluster-master/dist/leaflet.markercluster.js "></script>
	<script src="js/vkbeautify.0.99.00.beta.js"></script>
	<script src="js/Leaflet.label-master/dist/leaflet.label.js"></script>
<!--	<script type="text/javascript"> var querys =  <?php //echo json_encode($querys);?>;</script>-->
	<script src="js/main.js"></script>
	<link rel="shortcut icon" href="favicon.ico" />
	<link rel="stylesheet" href="http://cdn.leafletjs.com/leaflet-0.6.2/leaflet.css" />
	<link href="http://netdna.bootstrapcdn.com/twitter-bootstrap/2.1.1/css/bootstrap-combined.min.css" rel="stylesheet">
	<link rel="stylesheet" href="js/Leaflet.markercluster-master/dist/MarkerCluster.css" />
	<link rel="stylesheet" href="js/Leaflet.markercluster-master/dist/MarkerCluster.Default.css" />
	<link rel="stylesheet" href="js/Leaflet.label-master/dist/leaflet.label.css" />

<style type="text/css" media="all">@import url("http://192.168.100.31/modules/system/system.base.css?mr1k9x");
@import url("http://192.168.100.31/modules/system/system.menus.css?mr1k9x");
@import url("http://192.168.100.31/modules/system/system.messages.css?mr1k9x");
@import url("http://192.168.100.31/modules/system/system.theme.css?mr1k9x");</style>
<!--<style type="text/css" media="all">@import url("http://192.168.100.31/modules/comment/comment.css?mr1k9x");
@import url("http://192.168.100.31/sites/all/modules/date/date_api/date.css?mr1k9x");
@import url("http://192.168.100.31/sites/all/modules/date/date_popup/themes/datepicker.1.7.css?mr1k9x");
@import url("http://192.168.100.31/modules/field/theme/field.css?mr1k9x");
@import url("http://192.168.100.31/modules/node/node.css?mr1k9x");
@import url("http://192.168.100.31/modules/search/search.css?mr1k9x");
@import url("http://192.168.100.31/modules/user/user.css?mr1k9x");
@import url("http://192.168.100.31/sites/all/modules/views/css/views.css?mr1k9x");</style>-->
<style type="text/css" media="all">@import url("http://192.168.100.31/sites/all/modules/ctools/css/ctools.css?mr1k9x");</style>
<style type="text/css" media="all">@import url("http://192.168.100.31/themes/bartik/css/layout.css?mr1k9x");
@import url("http://192.168.100.31/themes/bartik/css/style.css?mr1k9x");
@import url("http://192.168.100.31/sites/default/files/color/bartik-24c27a8e/colors.css?mr1k9x");</style>
<style type="text/css" media="print">@import url("http://192.168.100.31/themes/bartik/css/print.css?mr1k9x");</style>

	<link rel="stylesheet" href="css/main.css" />
<!--[if lte IE 7]>
<link type="text/css" rel="stylesheet" href="http://192.168.100.31/themes/bartik/css/ie.css?mr1k9x" media="all" />
<![endif]-->

<!--[if IE 6]>
<link type="text/css" rel="stylesheet" href="http://192.168.100.31/themes/bartik/css/ie6.css?mr1k9x" media="all" />
<![endif]--> 


<!--[if lte IE 8]
     <link rel="stylesheet" href="http://cdn.leafletjs.com/leaflet-0.5/leaflet.ie.css" />
     <link rel="stylesheet" href="/Leaflet.markercluster-master/dist/MarkerCluster.Default.ie.css" />
 <![endif]-->
</head>

<body class="html front not-logged-in no-sidebars page-metadata footer-columns">

<?php

include 'credentials.php';

error_reporting(E_ALL);
//ini_set('display_errors',1);
ini_set('log_errors',0);


//get metadata
$arrmetadata = pg_fetch_all(pg_query($drupal,"SELECT DISTINCT field_data_field_model.field_model_value as welltype, field_data_field_elevation.field_elevation_value as elevation, node.field_gis_code_value as well_name,field_data_field_latitude.field_latitude_lat as lat,field_data_field_latitude.field_latitude_lon as lon,field_data_field_latitude.field_latitude_wkt as location, field_data_field_serial.field_serial_value as serial FROM field_data_field_model, field_data_field_elevation, field_data_field_gis_code as node, field_data_field_latitude, field_data_field_serial WHERE node.entity_id=field_data_field_model.entity_id AND node.entity_id=field_data_field_latitude.entity_id AND node.entity_id=field_data_field_serial.entity_id  AND node.entity_id=field_data_field_latitude.entity_id AND node.entity_id=field_data_field_elevation.entity_id ORDER BY well_name"));

$row=0;

//input from form
$wellnames = $_POST['wellnames'];
$startdate = $_POST['startdate'];
$enddate = $_POST['enddate'];

if ($wellnames) {
	if ($startdate <= $enddate) {
//gets the serial that has the wellname from the array of wellnames
foreach($wellnames as $wellname) {
                foreach($arrmetadata as $value) {
                        if($value['well_name'] == $wellname) {
                                $wellserial = strtolower($value['serial']);
				$welltype = $value['welltype'];
                                $currentmetadata[] = $value;
                        }//endif
                }//endforeach
	if ($welltype == 'WM40' | $welltype == 'WM20') {
        //all date or specific date selection changes the wording in the sql query
        	if (!$startdate && !$enddate) {
        	        $querystr = "SELECT DISTINCT datetime, level, calibration FROM well_$wellserial ORDER BY datetime asc";
        	}       elseif (!$enddate) {
        	                $querystr = "SELECT DISTINCT datetime, level, calibration FROM well_$wellserial WHERE datetime::date > '$startdate' ORDER BY datetime asc";
        	}               elseif (!$startdate) {
        	                        $querystr = "SELECT DISTINCT datetime, level, calibration FROM well_$wellserial WHERE datetime::date < '$enddate' ORDER BY datetime asc";
        	}                       else {
        	                        $querystr="SELECT DISTINCT datetime, level, calibration FROM well_$wellserial WHERE datetime::date BETWEEN '$startdate' AND '$enddate' ORDER BY datetime asc";
        	                        }
	} elseif ($welltype == 'RAIN') {
		if (!$startdate && !$enddate) {
                	$querystr = "SELECT DISTINCT date_col as datetime, sum(rainfall) as level FROM rain_$wellserial  GROUP BY date_col, rainfall ORDER BY date_col asc";
        }       elseif (!$enddate) {
                        $querystr = "SELECT DISTINCT date_col as datetime, sum(rainfall) as level FROM rain_$wellserial WHERE date_col > '$startdate' GROUP BY date_col, rainfall ORDER BY datetime asc";
        }               elseif (!$startdate) {
                                $querystr = "SELECT DISTINCT date_col as datetime, sum(rainfall) as level FROM rain_$wellserial WHERE date_col < '$enddate' GROUP BY date_col, rainfall ORDER BY datetime asc";
        }                       else {
                                $querystr="SELECT DISTINCT date_col as datetime, sum(rainfall) as level FROM rain_$wellserial WHERE date_col BETWEEN '$startdate' AND '$enddate' GROUP BY date_col, rainfall ORDER BY datetime asc";
                                }
	} else { exit; }
	//save the query string for data dl
	$querys[$wellname] = $querystr;

        //query for data
        $result = pg_query($postgres,$querystr);
        if ($result) {
		$arrdata[] = pg_fetch_all($result);
        }
}//endfor
}else { echo "There was an error in the query. ";}
}//endif
?>
<div id="page-wrapper"><div id="page">
<div id="header" class="without-secondary-menu"><div class="section clearfix">
	<div id="name-and-slogan">
		<div id="site-name">
			<strong>
				<a href="/" title="Home" rel="home"><span>Water Monitor</span></a>
			</strong>
		</div>
	</div> <!-- /#name-and-slogan -->
    
	<div id="main-menu" class="navigation">
		<h2 class="element-invisible">Main menu</h2>
		<ul id="main-menu-links" class="links clearfix">
			<li class="menu-218 first"><a href="/">Home</a></li>
			<li class="menu-575 last active"><a href="#" class="active" title="">Visualization</a></li>
		</ul>
	</div> <!-- /#main-menu -->

</div></div> <!-- /.section, /#header -->

<div id="main-wrapper" class="clearfix">
	<div id="row1" class="row">
		<div id="selectbox">
			<form action="<?=$_SERVER['PHP_SELF']?>" method="post">
			<?php //add each well as a check box to the form 
			while($row<count($arrmetadata)) {
				$md =$arrmetadata[$row]['well_name'];
#				echo "<input type='checkbox' name='wellnames[]' id='$md' value='$md'>$md<br/>";
				echo "<input type='checkbox' name='wellnames[]' value='$md'>$md<br/>";
				$row=$row+1;
				}	
			?>
			<br>Start Date: <input type="date" id="startdate" name="startdate" >
			<br> End Date: <input type="date" id="enddate" name="enddate" >
			<br><input type="submit" name="formbut" class="btn btn-success" value="Go!">
			</form>
		</div>
		<div id="map"></div>
	</div> <!-- end row1 -->
	<div id="row2" class="row">
		<div class="chart">
			<div class="span12" id="download">
				<button class="btn btn-success" id="save_as_svg" value="">
					Save as SVG</button>
				<button class="btn btn-success" id="save_as_pdf" value="">
					Save as PDF</button>
				<button class="btn btn-success" id="save_as_png" value="">
					Save as High-Res PNG</button>
				<button class="btn btn-success" id="save_metadata" value="">
					Download Metadata as CSV </button>
				<br>
			</div>
		</div>
		<div id="chart-container"></div>
	</div> <!-- endq row 2 -->

</div><!--</div>  end of main -->


<div class="container">


<!-- Hidden <FORM> to submit the SVG data to the server, which will convert it to SVG/PDF/PNG downloadable file.
     The form is populated and submitted by the JavaScript below. -->
<form id="svgform" method="post" action="../cgi-bin/download.pl">
 <input type="hidden" id="output_format" name="output_format" value="">
 <input type="hidden" id="data" name="data" value="">
</form>


<form id="csvform" method="post" action="downloadCSV.php">
 <input type="hidden" id="querystr" name="querystr" value="">
 <input type="hidden" id="wellname" name="wellname" value="">
</form>

<form id="metadataform" method="post" action="downloadmetadata.php">
 <input type="hidden" id="metadata" name="metadata" value="">
</form>

</div> <!--container, end of Bootstrap-->

<script type="text/javascript">

/*
    One-time initialization
*/
$(document).ready(function() {
	
        // Attached actions to the buttons
        $("#save_as_svg").click(function() { submit_download_form("svg"); });

        $("#save_as_pdf").click(function() { submit_download_form("pdf"); });

        $("#save_as_png").click(function() { submit_download_form("png"); });

	$("#save_metadata").click(function() {dlmetadata(<?=$wellnames?>);});
	

	var arrmetadata = <?php echo json_encode($arrmetadata,JSON_NUMERIC_CHECK); ?>;
	
	leafletMap(arrmetadata);
	<?php if ($arrdata): ?>
		var arrdata = <?php echo json_encode($arrdata,JSON_NUMERIC_CHECK); ?>,
		    currmetadata = <?php echo json_encode($currentmetadata,JSON_NUMERIC_CHECK); ?>;
		//console.log(arrdata);
		buildChart(currmetadata,arrdata);
		$(".chart").show();
	<?php endif; ?>
	
	$("#LTL01").click(function() { dlCSV(this.id, <?php echo json_encode($querys);?>);});

});



</script>



</body>
</html>
