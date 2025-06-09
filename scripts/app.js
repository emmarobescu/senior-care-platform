// scripts/app.js
document.addEventListener("DOMContentLoaded", () => {
  // 1. Initialize the map centered on Arizona
  const map = L.map("map").setView([34.0489, -111.0937], 6);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 18,
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  }).addTo(map);

  // 2. Grab search control elements
  const zipInput = document.getElementById("zipcode");
  const careSelect = document.getElementById("level-of-care");
  const searchBtn = document.getElementById("search-button");

  // 3. Load your JSON data
  let facilities = [];
  fetch("data/facilities.json")
    .then((res) => {
      if (!res.ok) throw new Error("Could not load facilities.json");
      return res.json();
    })
    .then((data) => {
      facilities = data;
      // Optional: plot all by default
      plotMarkers(facilities);
    })
    .catch((err) => {
      console.error(err);
      alert("Failed to load facility data.");
    });

  // 4. Helper to clear markers
  let currentMarkers = [];
  function clearMarkers() {
    currentMarkers.forEach((m) => map.removeLayer(m));
    currentMarkers = [];
  }

  // 5. Function to plot an array of facility objects
  function plotMarkers(list) {
    clearMarkers();
    if (list.length === 0) {
      alert("No facilities match your search.");
      return;
    }
    list.forEach((f) => {
      const lat = parseFloat(f.Latitude);
      const lng = parseFloat(f.Longitude);
      if (isNaN(lat) || isNaN(lng)) return;
      const marker = L.marker([lat, lng]).addTo(map);
      marker.bindPopup(`
        <strong>${f.FacilityName}</strong><br/>
        ${f.Address}, ${f.City}, ${f.State} ${f.Zip}<br/>
        ${f.ProgramType}
      `);
      currentMarkers.push(marker);
    });
    // Zoom to fit
    const group = new L.featureGroup(currentMarkers);
    map.fitBounds(group.getBounds().pad(0.2));
  }

  // 6. Filter function
  function filterFacilities() {
    const zip = zipInput.value.trim().toLowerCase();
    const care = careSelect.value.trim().toLowerCase();

    const filtered = facilities.filter((f) => {
      // ZIP match
      const fzip = ("" + f.Zip).toLowerCase();
      const zipOK = !zip || fzip.startsWith(zip);
      // Care match
      const prog = (f.ProgramType || "").toLowerCase();
      const careOK = !care || prog.includes(care.replace("_", " "));
      return zipOK && careOK;
    });

    plotMarkers(filtered);
  }

  // 7. Hook up the button
  searchBtn.addEventListener("click", filterFacilities);
});
