import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

function Catalog() {
  const [data, setData] = useState(null);
  const [expandedSections, setExpandedSections] = useState({});

  async function fetchCatalogIndexData() {
    try {
      const response = await fetch("https://uva-course-explorer.github.io/json/latest_sem.json");
      const jsonData = await response.json();
      setData(jsonData);
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

  return (
    <div className="catalog">
      <div>
        {data &&
          Object.entries(data).map(([school, departments]) => (
            <div key={school}>
              <h3 onClick={() => toggleSection(school)}>
                {school}
                {expandedSections[school] ? ' -' : ' +'}
              </h3>
              {expandedSections[school] && (
                <ul>
                  {departments.map((department, index) => (
                    <li key={index}>
                      <Link to={`/catalog/department/${department.abbr}`}><strong>{department.full_name}</strong></Link>
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
