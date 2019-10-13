// Query to get all earthquakes from the past week: 
var allWeekURL = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

//Get plates URL 
var platesUrl = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_plates.json";

// Grab the data with d3 for all week earthquake data
d3.json(allWeekURL, function(response) {
    d3.json(platesUrl, function(plates_data) {
  // Once we get a response, send the data.features object to the createVisualization function
    createVisualization(response.features, plates_data.features);
  });
});

function createVisualization(earthquakeData, platesData) {

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
  // Define plates layer
  var faultLines = {
    "fillColor": "brown",
    "weight": 2,
    "color": "brown",
    "fillOpacity": 0
  }
  var plates = L.geoJSON(platesData, {style: faultLines})

  // Sending our earthquakes layer to the createMap function
  createMap(earthquakes, plates);
}

function createMap(earthquakes, plates) {

  // Define streetmap
  var streetmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 25,
    id: "mapbox.streets",
    accessToken: API_KEY
  });

  //Define satellite map 
  var satelliteMap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 25,
    id: "mapbox.satellite",
    accessToken: API_KEY
  });

  //Define light map
  var lightMap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    maxZoom: 25,
    id: "mapbox.light",
    accessToken: API_KEY
  });

  
  // Define a baseMaps object to hold the base layer
  var baseMaps = {
    "Satellite": satelliteMap,
    "Grey Scale": lightMap,
    "Outdoors": streetmap
     };

  // Create overlay object to hold the overlay layer
  var overlayMaps = {
    Earthquakes: earthquakes, 
    Faultlines: plates
  };

  // Create the map, giving it the streetmap and earthquakes layers to display on load
  var myMap = L.map("map", {
    center: [
      40.09, -105.71
    ],
    zoom: 5,
    layers: [streetmap, plates, earthquakes]
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
    
      // Create a layer control
  // Pass in our baseMaps and overlayMaps
  // Add the layer control to the map
  L.control
  .layers(baseMaps, overlayMaps, {
      collapsed: false
  }).addTo(myMap);

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