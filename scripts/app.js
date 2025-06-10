// scripts/app.js
document.addEventListener("DOMContentLoaded", () => {
  // 1. Initialize the map
  const map = L.map("map").setView([34.0489, -111.0937], 6);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 18,
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  }).addTo(map);

  // 2. Create a marker cluster group
  const markersGroup = L.markerClusterGroup();
  map.addLayer(markersGroup);

  // 3. Grab search controls
  const zipInput = document.getElementById("zipcode");
  const careSelect = document.getElementById("level-of-care");
  const searchBtn  = document.getElementById("search-button");

  // 4. Load JSON
  let facilities = [];
  fetch("data/facilities.json")
    .then((r) => r.json())
    .then((data) => {
      facilities = data;
      plotMarkers(facilities);
    })
    .catch((err) => {
      console.error("Failed to load JSON:", err);
      alert("Could not load facility data.");
    });

  // 5. Plot helper using the cluster group
  function plotMarkers(list) {
  markersGroup.clearLayers();
  if (list.length === 0) {
    alert("No facilities match your search.");
    return;
  }

  list.forEach((f) => {
    const lat = parseFloat(f.N_LAT),
          lng = parseFloat(f.N_LON);
    if (isNaN(lat) || isNaN(lng)) return;

    // Create the marker
    const marker = L.marker([lat, lng]);

    // Prepare the popup content
    const popupHtml = `
      <strong>${f.FACILITY_NAME}</strong><br/>
      ${f.ADDRESS}, ${f.CITY}, AZ ${f.ZIP}<br/>
      ${f.SUBTYPE}
    `;
    marker.bindPopup(popupHtml);

    // On click, open the popup AND populate/expand the sidebar
    marker.on("click", () => {
      // 1) Show the popup over the marker
      marker.openPopup();

      // 2) Populate sidebar fields
      document.getElementById("sb-name").textContent     = f.FACILITY_NAME;
      document.getElementById("sb-type").textContent     = f.SUBTYPE;
      document.getElementById("sb-address").textContent  = `${f.ADDRESS}, ${f.CITY}, AZ ${f.ZIP}`;
      document.getElementById("sb-phone").textContent    = f.Telephone || "N/A";
      document.getElementById("sb-capacity").textContent = f.Capacity || "N/A";

      // 3) Expand the sidebar
      const sb = document.getElementById("sidebar");
      sb.classList.add("expanded");
      sb.classList.remove("collapsed");
      document.getElementById("sidebar-toggle").textContent = "◀";
    });

    // Add to the cluster group
    markersGroup.addLayer(marker);
  });

  // Zoom to fit
  if (markersGroup.getLayers().length) {
    map.fitBounds(markersGroup.getBounds().pad(0.2));
  }
}

  // 6. Filter & re-plot
  function filterFacilities() {
    const zip     = zipInput.value.trim().toLowerCase();
    const careVal = careSelect.value; // exact SUBTYPE or empty

    const filtered = facilities.filter((f) => {
      // ZIP match
      const fzip   = ("" + f.ZIP).toLowerCase();
      const zipOK  = !zip || fzip.startsWith(zip);

      // Care match: exact SUBTYPE match
      const careOK = !careVal || f.SUBTYPE === careVal;

      // Valid coords
      const lat    = parseFloat(f.N_LAT),
            lng    = parseFloat(f.N_LON);
      const coordsOK = !isNaN(lat) && !isNaN(lng);

      return zipOK && careOK && coordsOK;
    });

    plotMarkers(filtered);
  }

  // 7. Wire up the search button
  searchBtn.addEventListener("click", filterFacilities);

  // 8. Sidebar toggle logic
  const toggleBtn = document.getElementById("sidebar-toggle");
  toggleBtn.addEventListener("click", () => {
    const sb     = document.getElementById("sidebar");
    const isOpen = sb.classList.toggle("expanded");
    sb.classList.toggle("collapsed", !isOpen);
    toggleBtn.textContent = isOpen ? "▶" : "◀";
  });
});
