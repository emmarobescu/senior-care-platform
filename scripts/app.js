// scripts/app.js
document.addEventListener("DOMContentLoaded", () => {
  // 1. Initialize the map
  const map = L.map("map").setView([34.0489, -111.0937], 6);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 18,
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  }).addTo(map);

  // 2. Grab your search controls
  const zipInput = document.getElementById("zipcode");
  const careSelect = document.getElementById("level-of-care");
  const searchBtn = document.getElementById("search-button");

  // 3. Load your static JSON
  let facilities = [];
  fetch("data/facilities.json")
    .then(r => r.json())
    .then(data => {
      facilities = data;
      plotMarkers(facilities);  // show all on load
    })
    .catch(err => {
      console.error("Failed to load facilities.json", err);
      alert("Could not load facility data.");
    });

  // 4. Marker management
  let currentMarkers = [];
  function clearMarkers() {
    currentMarkers.forEach(m => map.removeLayer(m));
    currentMarkers = [];
  }

  // 5. Plotting function
  function plotMarkers(list) {
    clearMarkers();
    if (list.length === 0) {
      alert("No facilities match your search.");
      return;
    }
    list.forEach(f => {
      const lat = parseFloat(f.N_LAT),
            lng = parseFloat(f.N_LON);
      if (isNaN(lat) || isNaN(lng)) return;
      const marker = L.marker([lat, lng]).addTo(map);
      marker.bindPopup(`
        <strong>${f.FACILITY_NAME}</strong><br/>
        ${f.ADDRESS}, ${f.CITY}, AZ ${f.ZIP}<br/>
        ${f.SUBTYPE}
      `);
      currentMarkers.push(marker);
    });
    const group = new L.featureGroup(currentMarkers);
    map.fitBounds(group.getBounds().pad(0.2));
  }

  // 6. Filter & re-plot
  function filterFacilities() {
    const zip = zipInput.value.trim().toLowerCase();
    const care = careSelect.value.trim().toLowerCase().replace("_", " ");
    const filtered = facilities.filter(f => {
      // ZIP match
      const fzip = ("" + f.ZIP).toLowerCase();
      const zipOK = !zip || fzip.startsWith(zip);
      // Care match using SUBTYPE
      const subtype = (f.SUBTYPE || "").toLowerCase();
      const careOK = !care || subtype.includes(care);
      return zipOK && careOK;
    });
    plotMarkers(filtered);
  }

  // 7. Wire up the button
  searchBtn.addEventListener("click", filterFacilities);
});
