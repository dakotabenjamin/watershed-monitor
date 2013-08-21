
function leafletMap(arrmetadata, arrdata) {
        var map = L.map('map').setView([arrmetadata[1].lat, arrmetadata[1].lon],15);
        L.tileLayer('http://maps.clemetparks.com/tilestache/tilestache.cgi/basemap/{z}/{x}/{y}.jpg', {maxZoom: 18}).addTo(map);
        L.tileLayer('http://maps1.clemetparks.com/tilestache/tilestache.cgi/basemap/{z}/{x}/{y}.jpg', {maxZoom: 18}).addTo(map);
        L.tileLayer('http://maps2.clemetparks.com/tilestache/tilestache.cgi/basemap/{z}/{x}/{y}.jpg', {maxZoom: 18}).addTo(map);
        L.tileLayer('http://maps3.clemetparks.com/tilestache/tilestache.cgi/basemap/{z}/{x}/{y}.jpg', {maxZoom: 18}).addTo(map);

        var roads = new L.TileLayer.WMS("http://maps3.clemetparks.com/gwc", { id:'labels', layers:'group_overlays', format:'image/png', transparent:'TRUE' });
        roads.addTo(map);

        var markers = L.markerClusterGroup({
//              iconCreateFunction: function(cluster) {
//              return new L.DivIcon({ html:  cluster.getChildCount(), classname: 'mapcluster' });
//              }
        }).on('click', markerClick);
        for(var i=0;i<arrmetadata.length;i++){
                var title = arrmetadata[i].well_name;//console.log(title);
                var marker = new L.marker([arrmetadata[i].lat, arrmetadata[i].lon],5, {title: title});
                marker.bindLabel(title);
                markers.addLayer(marker);
        }

        map.addLayer(markers);

}

function markerClick(e) {
	//console.log(e);
	var cbox = document.getElementById(e.layer._label._content);
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
if(arrdata) {
        //display download div only if arrdata exists
        document.getElementById("download").style.display = "inline";
        for (var i=0;i < arrdata.length;i++) {

                var data = arrdata[i],
                    metadata = currmetadata[i];
		console.log(currmetadata[i]);
                svg.attr('height',height*(i+1));

                var x = d3.time.scale()
			.domain([new Date(data[0].datetime.replace(" ","T")), new Date(data[data.length - 1].datetime.replace(" ","T"))])
			.rangeRound([0, width - margin.left - margin.right]);

                var y = getY(metadata, data);
                
		var xAxis = d3.svg.axis()
                    .scale(x)
                    .orient('bottom')
                    //.ticks(10)
                    //.tickFormat(d3.time.format('%b %d %Y'))
                    .tickSize(4)
                    .tickPadding(8)
//                      .attr("class","axis");

                var yAxis = d3.svg.axis()
                    .scale(y)
                    .orient('left')
                    .tickPadding(8)
                    .tickSize(4);
		
		var cht = svg.append('g')
                    .attr('id', 'svg' + metadata.well_name)
                    .attr('transform', 'translate(' + margin.left + ', ' + (margin.top + height*i) + ')');
		
		if(metadata.welltype == 'RAIN') {rainChart(data, cht, x, y);}
		else {wellChart(data, cht, x, y);}
                
		cht.append('g')
                    .attr('class', 'x axis')
                    .attr('transform', 'translate(0, ' + (height - margin.top -  margin.bottom) + ')')
                    .call(xAxis)
                    .selectAll('text')
                        .style("text-anchor", "end")
                        .attr("dx", "-.8em")
                        .attr("dy", ".15em")
                        .attr('transform', function(d) {
                                return "rotate(-65)"
                        });

		cht.append('g')
                    .attr('class', 'y axis')
                    .call(yAxis);

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
                
		butt = d3.select("#chart-container").append("div")
                        .attr("class","dlcsv")
                        .style("top", 150 + (i * height) + "px");

                butt.append("button")
                        .attr("class", "btn btn-success save_as_csv")
                        .attr("id", metadata.well_name)
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
		.rangeRound([height - margin.top - margin.bottom, 0]);
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
		.attr("y", function(d) { return height - margin.top - margin.bottom - y(d.level) - .5; })
		.attr("width", (width / data.length))
		.attr("height", function(d) { return d.level; });

}

function dlCSV(wellname, querys) {
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
