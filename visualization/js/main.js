var map, markers;
function leafletMap(arrmetadata, arrdata) {
        map = L.map('map').setView([41.461002, -81.616880],10);
        L.tileLayer('http://maps.clemetparks.com/tilestache/tilestache.cgi/basemap/{z}/{x}/{y}.jpg', {maxZoom: 18}).addTo(map);
        L.tileLayer('http://maps1.clemetparks.com/tilestache/tilestache.cgi/basemap/{z}/{x}/{y}.jpg', {maxZoom: 18}).addTo(map);
        L.tileLayer('http://maps2.clemetparks.com/tilestache/tilestache.cgi/basemap/{z}/{x}/{y}.jpg', {maxZoom: 18}).addTo(map);
        L.tileLayer('http://maps3.clemetparks.com/tilestache/tilestache.cgi/basemap/{z}/{x}/{y}.jpg', {maxZoom: 18}).addTo(map);

        var roads = new L.TileLayer.WMS("http://maps3.clemetparks.com/gwc", { id:'labels', layers:'group_overlays', format:'image/png', transparent:'TRUE' });
        roads.addTo(map);

        markers = L.markerClusterGroup({
//              iconCreateFunction: function(cluster) {
//              return new L.DivIcon({ html:  cluster.getChildCount(), classname: 'mapcluster' });
//              }
        }).on('click', markerClick);
        for(var i=0;i<arrmetadata.length;i++){
                var title =  arrmetadata[i].well_name;
	//	marker.bindLabel(title);
                markers.addLayer( new L.marker([arrmetadata[i].lat, arrmetadata[i].lon],5, {title: title, id:"marker" + title}).bindLabel(title));
        }

        map.addLayer(markers);

}

function markerClick(e) {
	console.log(e);
	if (e.layer !== undefined) {
		var cbox = document.getElementById("check" + e.layer._label._content);
		//var marker
	} else { var cbox = this;}
	if (cbox.checked) {
		cbox.checked = false;
		e.layer.setOpacity(1);
	} else {
		cbox.checked = true;
		e.layer.setOpacity(0.5);
	}
}

//d3 stuff

var margin = {top: 40, right: 40, bottom: 150, left:40},
    width = 800,
    height = 400;


function buildChart(currmetadata, arrdata) {
var svg = d3.select('#chart-container')
    .append('svg')
    .attr('id','svgchart')
    .attr('width', width);
if(arrdata != null) {
	
	buttcontainer = d3.select("#chart-container").append("div")
		.attr("id","dlcontainer")
		.style("float","left")
		.style("position", "relative")
		;
        //console.log(arrdata);//display download div only if arrdata exists
        document.getElementById("download").style.display = "inline";
        for (var i=0;i < arrdata.length;i++) {

                var data = arrdata[i],
                    metadata = currmetadata[i];
		//console.log(currmetadata[i]);
                svg.attr('height',height*(i+1));

                var x = d3.time.scale()
			.domain([new Date(data[0].datetime.replace(" ","T")), new Date(data[data.length - 1].datetime.replace(" ","T")).setDate( new Date(data[data.length - 1].datetime.replace(" ","T")).getDate() + 1)])
			.rangeRound([0, width - margin.left - margin.right]);
//console.log(data[data.length-1]);
                var y = getY(metadata, data);
                
		var xAxis = d3.svg.axis()
                    .scale(x)
                    .orient('bottom')
                    //.ticks(10)
                    //.tickFormat(d3.time.format('%b %d %Y'))
                    .tickSize(6)
                    .tickPadding(8)
			;

                var yAxis = d3.svg.axis()
                    .scale(y)
                    .orient('left')
                    .tickSize(6);
                    //.tickPadding(8)
		
		var cht = svg.append('g')
                    .attr('id', 'svg' + metadata.well_name)
		    .style('float','none')
                    .attr('transform', 'translate(' + margin.left + ', ' + (margin.top + height*i) + ')');
		
		if(metadata.welltype == 'RAIN') {rainChart(data, cht, x, y);}
		else {wellChart(data, cht, x, y);}
                
		cht.append('g')
                    .attr('class', 'x axis')
		    .attr({'fill':'none','stroke':'black'})
                    .attr('transform', 'translate(0, ' + (height - margin.top -  margin.bottom) + ')')
		    .call(xAxis).selectAll('text')
                        .style("text-anchor", "end")
                        .attr("dx", "-.8em")
			.attr({'stroke':'none','fill':'black'})
                        .attr("dy", ".15em")
                        .attr('transform', function(d) {
                                return "rotate(-65)"
                        });

		cht.append('g')
                    .attr('class', 'y axis')
		    .attr({'width':'2px','fill':'none','stroke':'black'})
                    .call(yAxis)
			.selectAll('text').attr({'stroke':'none','fill':'black'});

		//cht.selectAll('.domain')
		//	.attr({'fill':'none','stroke':'black'});
               
		cht.selectAll('.tick')
			.style({'fill':'none','stroke':'black'});
			
 
		cht.append("text")
                    .attr("x", (width / 2))
                    .attr("y", 0 - (margin.top / 2))
                    .attr("text-anchor", "middle")
                    .style("font-size", "16px")
                    .style("text-decoration-line", "underline")
                    .text(metadata.well_name);

                cht.append("text")
                    .attr("class", "y label")
                    .attr("text-anchor", "end")
                    .attr("y", 5)
                    .attr("dy", ".75em")
                    .attr("transform", "rotate(-90)")
                    .text("Level (cm)");
                
		butt = d3.select("#dlcontainer").append("div")
			.attr("class","dlcsv")
                        .style("top", 150 + (i * height) + "px");

                butt.append("button")
                        .attr("class", "btn btn-success save_as_csv")
                        .attr("id",/* "butt_" +*/ metadata.well_name)
//			.attr("onclick", "function() { dlCSV(this.id, " + querys)
                        .append("text")
                        .text("Download this data as csv");
        } //end for loop
} //fi
}


function yScale (d,md) {
	var ret = 0;
		for(var i=0;i<d.length;i++) {ret += d[i].level;}
		return ret;
}

function getY(metadata, data) {
	if (metadata.welltype == "RAIN") {
	return y = d3.scale.linear()
		.domain([0,d3.max(data, function(d){return d.level;})])
		.range([height - margin.top - margin.bottom,0]);
	} else {
	return y = d3.scale.linear()
		.domain([d3.min(data, function(d){ return d.level + d.calibration;}),d3.max(data, function(d){ return d.level+d.calibration;})])
		.range([height - margin.top - margin.bottom, 0]);
	}
}

function wellChart(data, cht, x, y) {
	var line1 =  d3.svg.line()
		// assign the X function to plot our line as we wish
		.x(function(d) {
			// verbose logging to show what's actually being done
			//console.log('Plotting X value for data point: ' + d + ' using index: ' + i + ' to be at: ' + x(i) + ' using our xScale.');
			// return the X coordinate where we want to plot this datapoint
			return x(new Date(d.datetime.replace(" ","T")));
		})
		.y(function(d) {
			// verbose logging to show what's actually being done
			//console.log('Plotting Y value for data point: ' + d + ' to be at: ' + y(d) + " using our yScale.");
			// return the Y coordinate where we want to plot this datapoint
			return y(d.level + d.calibration);
	});

	cht.append("svg:path")
		.attr("d", line1(data))
		.attr("class", "data1")
		.attr("fill","none")
		.attr("stroke","black");

}

function rainChart(data, cht, x, y) {
	cht.selectAll("rect")
		.data(data)
		.enter()
		.append("svg:rect")
		.attr("x", function(d) { return x(new Date(d.datetime.replace(" ","T"))) - .5; })
		.attr("y", function(d) { return /*height - margin.top - margin.bottom - .5 - */y(d.level) + 0.5;  })
		.attr("width", ((width - margin.left - margin.right) / days_between(new Date(data[0].datetime.replace(" ","T")), new Date(data[data.length - 1].datetime.replace(" ","T")))) - .5)
		.attr("height", function(d) { return height - margin.top - margin.bottom - y(d.level) ; });

}

function dlCSV(wellname, querys) {
//	console.log(wellname + " //// " + querys[wellname]);
        var form = document.getElementById("csvform");
        form['querystr'].value = querys[wellname];
        form['wellname'].value = wellname;
        form.submit();
	


}

function dlmetadata(wellnames) {
        var form = document.getElementById("metadataform");
        form['metadata'].value = wellnames;
        form.submit();

}

function submit_download_form(output_format)
{
        // Get the d3js SVG element
        var tmp = document.getElementById("svgchart");
        var svg1 = tmp.getElementsByTagName("svg");
        // Extract the data as SVG text string
        var svg_xml = (new XMLSerializer).serializeToString(tmp);

        // Submit the <FORM> to the server.
        // The result will be an attachment file to download.
        var form = document.getElementById("svgform");
        form['output_format'].value = output_format;
        form['data'].value = svg_xml ;
        form.submit();
}

function days_between(date1, date2) {

    // The number of milliseconds in one day
    var ONE_DAY = 1000 * 60 * 60 * 24

    // Convert both dates to milliseconds
    var date1_ms = date1.getTime()
    var date2_ms = date2.getTime()

    // Calculate the difference in milliseconds
    var difference_ms = Math.abs(date1_ms - date2_ms)
    
    // Convert back to days and return
    return Math.round(difference_ms/ONE_DAY)

}

function getWeatherData(sd,ed) {
	var ONE_DAY = 1000 * 60 * 60 * 24
	var wdata = []
	//make sure we are working with dates
	if (!(sd instanceof Date) || !(ed instanceof Date)) {
		return -1
	} else {
		// Get date format for combinging data points
		if (days_between(sd,ed) <= 31) { //daily
			dateFormat = 0
		} else if (days_between(sd,ed) <= 365) { //weekly
			dateFormat = 1
		} else { //montly
			dateFormat = 2
		}
	
		//get the data
		for (i = sd; i < ed; i = new Date(i.getTime() + ONE_DAY)) {
			DD = i.getDate()
			MM = i.getMonth()
			YYYY = i.getYear()
			wdata.push(jQuery.ajax("http://api.wunderground.com/api/742844bfa2ef4100/history_" + YYYY + MM + DD + "/q/KCLE.json"))
		}//end for
	
	}	
}

