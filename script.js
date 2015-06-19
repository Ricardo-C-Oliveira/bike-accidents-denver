     var map = L.map('map', {

       'zoomControl': false,

     }).setView([39.739800, -104.989276], 13);

     //zoom custom position
     L.control.zoom({

       position: 'topright'

     }).addTo(map);

     //the base map
     L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/toner/{z}/{x}/{y}.png', {

       attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, under <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a>. Data by <a href="http://openstreetmap.org">OpenStreetMap</a>, under <a href="http://creativecommons.org/licenses/by-sa/3.0">CC BY SA</a>.'

     }).addTo(map);

     //function to get color based on year field
     function getColor(d) {

       return d == 2010 ? "#ffffb2" :
         d == 2011 ? "#fed976" :
         d == 2012 ? "#feb24c" :
         d == 2013 ? "#fd8d3c" :
         d == 2014 ? "#fc4e2a" :
         d == 2015 ? "#e31a1c" :
         "#b10026";
     }

     //function that defines style for each point
     function Style(feature) {

       return {
         fillColor: getColor(feature.properties.year),
         stroke: false,
         opacity: 1,
         color: "#000",
         fillOpacity: 1,
         weight: 1,
         radius: 5
       };
     }


     //buffer style
     var myStyle = {
       "weight": 5,
       "color": "#999",
       "opacity": 1,
       "fillColor": "#CC0000",
       "fillOpacity": 0.5
     };

     //info box
     var info = L.control({
       position: 'bottomright'
     });

     info.onAdd = function(map) {
       this._div = L.DomUtil.create('div', 'info');
       this.update();
       return this._div;
     };

     info.update = function(props) {
       this._div.innerHTML = '<h1>Total Accidents Inside Area:</h1>' + (props ?
         '<h1><b>' + props.count + '</b></h1>' : '');
     };


     info.addTo(map);
     //end info box



     //legend section
     var legend = L.control({
       position: 'bottomright'
     });

     legend.onAdd = function(map) {

       var div = L.DomUtil.create('div', 'info legend'),
         grades = [2010, 2011, 2012, 2013, 2014, 2015],
         labels = [];

       div.innerHTML += '<h1> Accident Year </h1>';

       // loop through our getColor function intervals and generate a label with a colored square for each interval
       for (var i = 0; i < grades.length; i++) {
         div.innerHTML +=
           '<span style="background:' + getColor(grades[i]) + '"></span> ';
       }

       //a line breaK
       div.innerHTML += '<br>';

       //second loop for text
       for (var i = 0; i < grades.length; i++) {
         div.innerHTML +=
           '<label>' + grades[i] + '</label>';
       }

       div.innerHTML += '<div style="text-align: center;  padding-top: 5px;"> <br><button id="openChart">Chart Data</button></div>';

       return div;
     };

     legend.addTo(map);
     //end legend section



           //jquery selector to open modal and set modal content
             $("#openChart").click(function() {
             map.fire('modal', {
               content: '<h2 style="text-align: center; color: white;">Bike Accidents <hr> 2010 - April 2015</h2>' +
                 '<div id="chart"></div>',
               width: 500,
               height: 430
             });
             //and then chart!
             var chart = c3.generate({
               bindto: '#chart',
               padding: {
                 top: 20,
                 right: 40,
                 bottom: 20,
                 left: 40,
               },
               data: {
                 x: 'x',
                 xFormat: '%Y',
                 columns: [
                   ['x', '2010', '2011', '2012', '2013', '2014', '2015'],
                   ['data1', 234, 291, 289, 283, 263, 37],
                 ],
                 names: {
                   data1: "Total Accidents"
                 },
                 colors: {
                   data1: "#fc4e2a"
                 }
               },
               grid: {
                 y: {
                   show: true
                 },
               },
               legend: {
                 show: false
               },
               axis: {
                 x: {
                   type: 'timeseries',
                   // if true, treat x value as localtime (Default)
                   // if false, convert to UTC internally
                   tick: {
                     format: '%Y'
                   }
                 }
               }
             });
           });




           var marker = L.marker(new L.LatLng(39.739800, -104.989276), {
             icon: L.AwesomeMarkers.icon({
               icon: 'fa-exclamation-triangle',
               markerColor: 'red',
               prefix: 'fa'
             }),
             draggable: true
           });

           //geojson call for points
           var data = L.geoJson(traffacc, {
             pointToLayer: function(feature, latlgn) {
               var popupContect = "<b>Accident Year:</b>" + feature.properties.year_STR;
               return L.circleMarker(latlgn, Style(feature)).bindPopup(popupContect);
             },
           });



           //add marker popup
           marker.bindPopup('Drag me!');
           marker.addTo(map).openPopup();

           //remove old buffers (used when marker is dragged)
           function removeBuff() {
             map.removeLayer(buff);

           };

           //create buffer (used when the marker is dragged)
           function updateBuffer() {
             //Make the marker a feature
             var pointMarker = marker.toGeoJSON();
             //buffer the marker geoJSON feature
             buffered = turf.buffer(pointMarker, 0.5, 'miles');
             //add buffer to the map. Note: no "var" before "buff" makes it a global variable and usable within the removeBuff() function.
             buff = L.geoJson(buffered, {
               style: myStyle
             });
             buff.addTo(map);
             console.log(buffered);
             var pt = data.toGeoJSON();
             var countPt = turf.count(buffered, pt, 'count');
             //console.log(countPt);
             data.addTo(map).bringToFront();
             info.update(buffered.features[0].properties);
           };

           marker.on('drag', function() {
             removeBuff(), updateBuffer()
           });
           updateBuffer();
