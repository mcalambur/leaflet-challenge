// Query to get all earthquakes from the past week: 
var allWeekURL = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"

// // Grab the data with d3 for all week earthquake data
d3.json(allWeekURL, function(response) {
  // Once we get a response, send the data.features object to the createVisualization function
  createVisualization(response.features);
});

function createVisualization(earthquakeData) {

  // Process the features array on the earthquakeData object using a GeoJSON function 
  // Use the onEachFeature function
  var earthquakes = L.geoJSON(earthquakeData, {
  // Pop-up information
    onEachFeature: function(feature, layer) {
        layer.bindPopup("<h3>Magnitude: " + feature.properties.mag +"</h3><h3>Location: "+ feature.properties.place +
          "</h3><hr><p>" + new Date(feature.properties.time) + "</p>");
  },
  // Location of each quake
  pointToLayer: function (feature, latlng) {
    return new L.circle(latlng,
      {radius: getRadius(feature.properties.mag),
        fillColor: getColor(feature.properties.mag),
        fillOpacity: .9,
        stroke: true,
        color: "black",
        weight: .5
    })
  }
});


  // Sending our earthquakes layer to the createMap function
  createMap(earthquakes);
}

function createMap(earthquakes) {

  // Add streetmap
  var streetmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 25,
    id: "mapbox.streets",
    accessToken: API_KEY
  });

  // Define a baseMaps object to hold the base layer
  var baseMaps = {
    "Street Map": streetmap
     };

  // Create overlay object to hold the overlay layer
  var overlayMaps = {
    Earthquakes: earthquakes
  };

  // Create the map, giving it the streetmap and earthquakes layers to display on load
  var myMap = L.map("map", {
    center: [
      40.09, -105.71
    ],
    zoom: 5,
    layers: [streetmap, earthquakes]
  });
  

    //  add legends
    // Add layer control
    var legend = L.control({position: "bottomright"}); 
    
    legend.onAdd = function (map) {
      var div = L.DomUtil.create("div", "magnitude legend"),
        magnScale = [0, 1, 2, 3, 4, 5];
        var legendInfo = "<h4><center>Magnitude</center></h4>"
  
      div.innerHTML = legendInfo;
        for (var i=0; i<magnScale.length; i++) {
          div.innerHTML += '<i style="background:' + getColor(magnScale[i]) + '"></i>' + 
                            magnScale[i] + (magnScale[i+1] ? '&ndash;' + magnScale[i+1] + '<br>' : '+'); 
        }
  
        return div;
    };
   
    legend.addTo(myMap);
 

}

// the color function
function getColor(Magnitude) {
  return Magnitude < 1 ? "green":
  Magnitude < 2 ? "yellowgreen":
  Magnitude < 3 ? "yellow":
  Magnitude < 4 ? "orange":
  Magnitude < 5 ? "darkorange":
             "red";
};


function getRadius(Magnitude){
return Magnitude*20000
}