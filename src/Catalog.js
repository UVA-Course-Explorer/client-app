import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

function Catalog() {
  const [data, setData] = useState(null);
  const [expandedSections, setExpandedSections] = useState({});
  const [metadata, setMetadata] = useState(null);

  let userTime;


  async function fetchCatalogIndexData() {
    try {
      const response = await fetch("https://raw.githubusercontent.com/UVA-Course-Explorer/course-data/main/json/latest_sem.json");
      const jsonData = await response.json();
      setData(jsonData);

      const metadataResponse = await fetch(`https://raw.githubusercontent.com/UVA-Course-Explorer/course-data/main/json/metadata.json`);
      const metadata = await metadataResponse.json();
      setMetadata(metadata);

      // Initialize the expandedSections state to have all sections collapsed initially
      const initialExpandedState = {};
      Object.keys(jsonData).forEach(school => {
        initialExpandedState[school] = false;
      });
      setExpandedSections(initialExpandedState);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  }

  useEffect(() => {
    fetchCatalogIndexData();
  }, []);

  // Function to toggle the expansion state of a section
  const toggleSection = (school) => {
    setExpandedSections({
      ...expandedSections,
      [school]: !expandedSections[school],
    });
  };

  if (metadata && metadata?.semester && metadata?.last_updated) {

    // Create a Date object from the UTC time string
    const utcDate = new Date(metadata.last_updated);

    // Get the user's current timezone
    const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    // Format the UTC time to the user's timezone
    const userTimeOptions = { timeZone: userTimezone, hour12: true, month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric'};
    userTime = utcDate.toLocaleTimeString(undefined, userTimeOptions);

}

  return (
    <div className="catalog">
      <div>
        {metadata && metadata?.semester && metadata?.last_updated && <h5>{metadata.semester} - Last Updated on {userTime}</h5>}
        {data &&
          Object.entries(data).map(([school, departments]) => (
            <div key={school}>
              <h3 onClick={() => toggleSection(school)}>
                {school}
                {expandedSections[school] ? ' -' : ' +'}
              </h3>
              {expandedSections[school] && (
                <ul className="department-table">
                  {departments.map((department, index) => (
                    <li key={index} className="department-item">
                      <Link to={`/catalog/${department.abbr}`}>
                        <strong className="department-name">{department.name}</strong>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
      </div>
    </div>
  );
}

export default Catalog;
