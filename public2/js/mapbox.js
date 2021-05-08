const locations = JSON.parse(document.getElementById('map').dataset.locations);
// console.log(locations);
mapboxgl.accessToken =
  'pk.eyJ1IjoicmlzaGFiaG1hdGh1cjE5IiwiYSI6ImNra2dmcnY5bzBtZTIybm15Y3M3Z3ozOWkifQ.KKXmSd6k2OC0lmDqzoWinw';
var map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/rishabhmathur19/ckkguoxvu0ocx17qsqulsarl5',
  //centre: [-118.246281, 34.067879],
  // interactive: false,
});
const bounds = new mapboxgl.LngLatBounds();
locations.forEach((loc) => {
  //create marker
  const el = document.createElement('div');
  el.className = 'marker';
  //adding marker
  new mapboxgl.Marker({
    element: el,
    anchor: 'bottom',
  })
    .setLngLat(loc.coordinates)
    .addTo(map);
  new mapboxgl.Popup({
    offset: 30,
  })
    .setLngLat(loc.coordinates)
    .setHTML(`<p>Day ${loc.day}:${loc.description} </p>`)
    .addTo(map);
  bounds.extend(loc.coordinates);
});
map.fitBounds(bounds, {
  padding: {
    top: 200,
    bottom: 150,
    left: 100,
    right: 100,
  },
});
