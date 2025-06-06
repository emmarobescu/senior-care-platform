console.log("Senior Care Finder loaded");
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("assessment-form");
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    // For now, just log the values
    const location = document.getElementById("location").value;
    const careType = document.getElementById("care-type").value;
    const budget = document.getElementById("budget").value;
    console.log("Assessment submitted:", { location, careType, budget });
    alert(`Searching for facilities near ${location} needing ${careType} within $${budget}/mo.`);
    // Later: call a function to fetch/filter data
    fetch("data/facilities.json")
  .then(r => r.json())
  .then(facilities => {
    // filter & map exactly as before
  });

  });
});
