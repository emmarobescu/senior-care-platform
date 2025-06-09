document.addEventListener("DOMContentLoaded", () => {
  // 1) Initialize the map centered on Arizona
  const map = L.map("map").setView([34.0489, -111.0937], 6);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 18,
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  }).addTo(map);

  // 2) Load the JSON file you created
  let facilities = [];
  fetch("data/facilities.json")
    .then((r) => r.json())
    .then((data) => {
      facilities = data;
      plotMatches(); // optional: show all on load
    })
    .catch((err) => console.error("Error loading JSON:", err));

  // 3) Marker management
  let markers = [];
  function clearMarkers() {
    markers.forEach((m) => map.removeLayer(m));
    markers = [];
  }

  // 4) Plot function with optional filters
  function plotMatches(zipFilter = "", careFilter = "") {
    clearMarkers();
    const zip = zipFilter.trim().toLowerCase();
    const care = careFilter.trim().toLowerCase();

    const matches = facilities.filter((f) => {
      const fzip = ("" + f.Zip).toLowerCase();
      const prog = (f.ProgramType || "").toLowerCase();
      const lat = parseFloat(f.Latitude),
        lng = parseFloat(f.Longitude);
      return (
        (!zip || fzip.startsWith(zip)) &&
        (!care || prog.includes(care)) &&
        !isNaN(lat) &&
        !isNaN(lng)
      );
    });

    if (matches.length === 0 && (zip || care)) {
      alert("No facilities match your search.");
      return;
    }

    matches.forEach((f) => {
      const lat = parseFloat(f.Latitude),
        lng = parseFloat(f.Longitude);
      const marker = L.marker([lat, lng]).addTo(map);
      marker.bindPopup(`
        <strong>${f.FacilityName}</strong><br/>
        ${f.Address}, ${f.City}, ${f.State} ${f.Zip}<br/>
        ${f.ProgramType}
      `);
      markers.push(marker);
    });

    if (markers.length) {
      const group = new L.featureGroup(markers);
      map.fitBounds(group.getBounds().pad(0.2));
    }
  }

  // 5) Wire up the search controls
  const zipInput = document.getElementById("zipcode");
  const careSelect = document.getElementById("level-of-care");
  document
    .getElementById("search-button")
    .addEventListener("click", () =>
      plotMatches(zipInput.value, careSelect.value)
    );
});
