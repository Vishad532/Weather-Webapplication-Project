var input, Name, Code, Latitude, Longitude, Distance, icons, tp, ds, j, k;
function fun() {
    input = document.getElementById("zip").value;
    Name = document.getElementById("name");
    Code = document.getElementById("code");
    Latitude = document.getElementById("latitude");
    Longitude = document.getElementById("longitude");
    Distance = document.getElementById("distance");
    icons = document.getElementById("i1");
    tp = document.getElementById("temp");
    ds = document.getElementById("desc");
    j;
    k = 1000;

    fetch("./file1.json")
        .then(response => response.json())
        .then(data => {
            for (var i = 0; i < data.WSData.length; i++) {
                var lat1 = data[input].lat;
                var lon1 = data[input].lon;
                var lat2 = data.WSData[i].WSlat;
                var lon2 = data.WSData[i].WSlon;

                var R = 6371; // Radius of the earth in km
                var dLat = deg2rad(lat2 - lat1);  // deg2rad below
                var dLon = deg2rad(lon2 - lon1);
                var a =
                    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
                    Math.sin(dLon / 2) * Math.sin(dLon / 2)
                    ;
                var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
                var d = R * c; // Distance in km

                if (d < k) {
                    k = d;
                    j = i;
                }
            }



            icons.setAttribute("src", "icons1/" + data.WSData[j].icon + ".png");
            tp.innerHTML = "Temprature : " + data.WSData[j].temprature + "°C";
            ds.innerHTML = "Description : " + data.WSData[j].description;


            Name.innerHTML = "WS_Name : " + data.WSData[j].name;
            Code.innerHTML = "WS_Code : " + data.WSData[j].code;
            Latitude.innerHTML = "WS_Latitude : " + data.WSData[j].WSlat;
            Longitude.innerHTML = "WS_Longitude : " + data.WSData[j].WSlon;
            Distance.innerHTML = "Distance : " + (k * 0.621371).toFixed(2) + "mi";

            var la2 = data.WSData[j].WSlat;
            var lo2 = data.WSData[j].WSlon;
            var n = data.WSData[j].name;
            var c = data.WSData[j].code;
            path(lat1, lon1, la2, lo2, n, c);




        })
        .catch(err => alert("Enter Valid Zipcode! or Please Check Your Internet Connection!"))

}
function deg2rad(deg) {
    return deg * (Math.PI / 180)
}

function initMap() {
    fetch("./file1.json")
        .then(response => response.json())
        .then(data => {
            var mapOptions = {
                center: new google.maps.LatLng(data.WSData[0].WSlat, data.WSData[0].WSlon),
                zoom: 8,
                mapTypeId: google.maps.MapTypeId.ROADMAP
            };
            var infoWindow = new google.maps.InfoWindow();
            var latlngbounds = new google.maps.LatLngBounds();
            var map = new google.maps.Map(document.getElementById("d4"), mapOptions);

            for (var i = 0; i < data.WSData.length; i++) {
                var Data = data.WSData[i];
                var myLatlng = new google.maps.LatLng(Data.WSlat, Data.WSlon);
                var marker = new google.maps.Marker({
                    position: myLatlng,
                    map: map,
                    title: Data.title
                });
                (function (marker, Data) {
                    google.maps.event.addListener(marker, "click", function (e) {
                        infoWindow.setContent("<div style = 'width:200px;min-height:40px'>WS_Name : " + Data.name + "<br>WS_Code : " + Data.code + "<br>WS_Latitude : " + Data.WSlat + "<br>WS_Longitude : " + Data.WSlon + "</div>");
                        infoWindow.open(map, marker);
                    });

                })(marker, Data);
                latlngbounds.extend(marker.position);
            }

            var bounds = new google.maps.LatLngBounds();
            map.setCenter(latlngbounds.getCenter());
            map.fitBounds(latlngbounds);


        })

}
function path(lat1, lon1, la2, lo2, n, c) {
    var directionsRenderer = new google.maps.DirectionsRenderer();
    var directionsService = new google.maps.DirectionsService();
    var mapOptions = {
        center: new google.maps.LatLng(lat1, lon1),
        zoom: 8,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    var infoWindow = new google.maps.InfoWindow();
    var map = new google.maps.Map(document.getElementById("d4"), mapOptions);
    directionsRenderer.setMap(map);
    var marker1 = new google.maps.Marker({
        position: new google.maps.LatLng(lat1, lon1),
        map: map,
        icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 10,
            fillColor: "Red",
            fillOpacity: 0.8,
            strokeWeight: 1
        },
        draggable: true,
    });
    var marker2 = new google.maps.Marker({
        position: new google.maps.LatLng(la2, lo2),
        map: map,
    });
    google.maps.event.addListener(marker1, "click", function (e) {
        infoWindow.setContent("<div style = 'width:200px;min-height:40px'>Your Location</div>");
        infoWindow.open(map, marker1);
    });
    google.maps.event.addListener(marker2, "click", function (e) {
        infoWindow.setContent("<div style = 'width:200px;min-height:40px'>WS_Name : " + n + "<br>WS_Code : " + c + "<br>WS_Latitude : " + la2 + "<br>WS_Longitude : " + lo2 + "</div>");
        infoWindow.open(map, marker2);
    });
    calculateRoute(directionsService, directionsRenderer, lat1, lon1, la2, lo2);


    // var route=new google.maps.Polyline({
    //     path:[
    //         new google.maps.LatLng(lat1, lon1),
    //         new google.maps.LatLng(la2, lo2)
    //     ],
    //     strokeColor:"blue",
    //     strokeOpacity:0.6,
    //     strokeWeight:2
    // })
    // route.setMap(map);
}

function calculateRoute(directionsService, directionsRenderer, lat1, lon1, la2, lo2) {
    var start = new google.maps.LatLng(lat1, lon1);
    var end = new google.maps.LatLng(la2, lo2);
    directionsService.route(
        {
            origin: start,
            destination: end,
            travelMode: google.maps.TravelMode.DRIVING,
        },
        (response, status) => {
            if (status === "OK") {
                directionsRenderer.setDirections(response);
            } else {
                window.alert("Directions request failed due to " + status);
            }
        }
    );
}