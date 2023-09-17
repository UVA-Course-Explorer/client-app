import React, { useState, useEffect } from 'react';
import { BrowserRouter as Link } from 'react-router-dom';

function Catalog() {
  const [data, setData] = useState(null);

  async function fetchCatalogIndexData() {
    try {
      const response = await fetch("https://uva-course-explorer.github.io/json/latest_sem.json");
      const jsonData = await response.json();
      setData(jsonData);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  }

  useEffect(() => {
    fetchCatalogIndexData();
  }, []);

  return (
    <div className="catalog">
      <div>
        {data &&
          Object.entries(data).map(([school, departments]) => (
            <div key={school}>
              <h2>{school}</h2>
              <ul>
                {departments.map((department, index) => (
                  <li key={index}>
                    <Link to={`/catalog/${department.abbr}`}><strong>{department.full_name}</strong></Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
      </div>
    </div>
  );
}

export default Catalog;
