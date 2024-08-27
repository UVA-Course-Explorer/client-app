import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import './Catalog.css';

function Catalog() {
  const { semester } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [expandedSections, setExpandedSections] = useState({});
  const [metadata, setMetadata] = useState(null);

  const [allSemesters, setAllSemesters] = useState([]);
  const [selectedSemester, setSelectedSemester] = useState(semester);

  let userTime;

  useEffect(() => {
    fetchAllSemesters();
    if (selectedSemester) {
      fetchCatalogIndexData(selectedSemester);
    }
  }, [selectedSemester]);

  async function fetchAllSemesters() {
    try {
      const response = await fetch('https://raw.githubusercontent.com/UVA-Course-Explorer/course-data/main/previousSemesters.json');
      const jsonData = await response.json();
      setAllSemesters(jsonData.reverse());
    } catch (error) {
      console.error('Error fetching semesters:', error);
    }
  }

  async function fetchCatalogIndexData(sem) {
    try {
      const response = await fetch(`https://raw.githubusercontent.com/UVA-Course-Explorer/course-data/main/data/${sem}/latest_sem.json`);
      const jsonData = await response.json();
      setData(jsonData);

      const metadataResponse = await fetch(`https://raw.githubusercontent.com/UVA-Course-Explorer/course-data/main/data/${sem}/metadata.json`);
      const metadata = await metadataResponse.json();
      setMetadata(metadata);

      const initialExpandedState = {};
      Object.keys(jsonData).forEach(school => {
        initialExpandedState[school] = false;
      });
      setExpandedSections(initialExpandedState);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  }

  const toggleSection = (school) => {
    setExpandedSections({
      ...expandedSections,
      [school]: !expandedSections[school],
    });
  };

  const handleSemesterChange = (event) => {
    const newSemester = event.target.value;
    setSelectedSemester(newSemester);
    navigate(`/catalog/${newSemester}`);
  };

  if (metadata && metadata?.semester && metadata?.last_updated) {
    const utcDate = new Date(metadata.last_updated);
    const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const userTimeOptions = { timeZone: userTimezone, hour12: true, year: '2-digit', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric'};
    userTime = utcDate.toLocaleTimeString(undefined, userTimeOptions);
  }

  return (
    <div className="catalog">
      <div>
        <select value={selectedSemester} onChange={handleSemesterChange}>
          {allSemesters.map((sem) => (
            <option key={sem.strm} value={sem.strm}>
              {sem.name}
            </option>
          ))}
        </select>

        {metadata && metadata?.semester && metadata?.last_updated && (
          <h3>{metadata.semester} - Last Updated on {userTime}</h3>
        )}

{data &&
          Object.entries(data).map(([school, departments]) => (
            <div key={school} className='catalog-section'>
              <div onClick={() => toggleSection(school)} className='section-title'>
                {school}
                {expandedSections[school] ? ' -' : ' +'}
              </div>
              <div className={`department-container ${expandedSections[school] ? 'expanded' : ''}`}>
                <ul className="department-table">
                  {departments.map((department, index) => (
                    <li key={index} className="department-item">
                      <Link to={`/catalog/${selectedSemester}/${department.abbr}`}>
                        <strong className="department-name">{department.name}</strong>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}

export default Catalog;
