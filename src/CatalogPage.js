import React, { useState, useEffect, useCallback} from 'react';
import { useParams, useNavigate} from 'react-router-dom';
import './Catalog.css';
import { requirementMapping } from './RequirementMap';

function CatalogPage() {
  const { semester, department, org, number} = useParams();
  const [data, setData] = useState(null);
  const [metadata, setMetadata] = useState(null);
  const navigate = useNavigate();

  const [tableExpansions, setTableExpansions] = useState({});
  const [allTablesExpanded, setAllTablesExpanded] = useState(false); // state for overall table expansion

  const [allSemesters, setAllSemesters] = useState([]);
  const [selectedSemester, setSelectedSemester] = useState(semester);

  const [noDataFound, setNoDataFound] = useState(false);

  const [showBackToTop, setShowBackToTop] = useState(false);
  const [isMobile, setIsMobile] = useState(false);


  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    let lastScrollY = window.scrollY;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > 0 && currentScrollY < lastScrollY) {
        setShowBackToTop(true);
      } else {
        setShowBackToTop(false);
      }
      lastScrollY = currentScrollY;
    };

    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    handleResize();

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
    };
  }, []);


    // Fetch all semesters
    useEffect(() => {
      async function fetchAllSemesters() {
        try {
          const response = await fetch('https://raw.githubusercontent.com/UVA-Course-Explorer/course-data/main/previousSemesters.json');
          const jsonData = await response.json();
          setAllSemesters(jsonData.reverse());
        } catch (error) {
          console.error('Error fetching semesters:', error);
        }
      }
      fetchAllSemesters();
    }, []);


  useEffect(() => {
    if (data) {
      const newTableExpansions = {};
      for (const [, courseArr] of Object.entries(data)) {
        for (const course of courseArr) {
          const tableKey = `${course.subject}${course.catalog_number}`;
          newTableExpansions[tableKey] = false;
        }
      }
      if (org && number) {
        newTableExpansions[`${org}${number}`] = true;
      }
      setTableExpansions(newTableExpansions);
      setAllTablesExpanded(false);
    }
  }, [data, org, number]);



  const fetchCatalogIndexData = useCallback(async () => {
    setNoDataFound(false);
    try {
      const response = await fetch(`https://raw.githubusercontent.com/UVA-Course-Explorer/course-data/main/data/${semester}/${department}.json`);
      if (!response.ok) {
        throw new Error('Data not found');
      }
      const jsonData = await response.json();
      setData(jsonData);
  
      const metadataResponse = await fetch(`https://raw.githubusercontent.com/UVA-Course-Explorer/course-data/main/data/${semester}/metadata.json`);
      if (metadataResponse.ok) {
        const metadata = await metadataResponse.json();
        setMetadata(metadata);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setData(null);
      setMetadata(null);
      setNoDataFound(true);
    } finally {
    }
  }, [department, semester]);




  useEffect(() => {
    fetchCatalogIndexData();
  }, [fetchCatalogIndexData]);

  useEffect(() => {
    // Check URL parameters and scroll to the desired table if present
    let scrollKey = null;
    if(org && number){
      scrollKey = org + number;
    }
    if (scrollKey) {
      setTimeout(() => {
      // Use JavaScript to scroll to the specified table
      const tableElement = document.getElementById(scrollKey);
      if (tableElement) {
        tableElement.scrollIntoView({ behavior: 'smooth' });
      }
      }, 750);
    }
  }, [number, org]);


  const toggleTableExpansion = (tableKey) => {
    setTableExpansions((prevTableExpansions) => {
      return { ...prevTableExpansions, [tableKey]: !prevTableExpansions[tableKey] };
    });
  };

  // Toggle the expansion state of all tables
  const toggleAllTablesExpansion = () => {
    setAllTablesExpanded(prev => {
      const newState = !prev;
      const newExpansionState = Object.keys(tableExpansions).reduce((state, tableKey) => {
        state[tableKey] = newState;
        return state;
      }, {});
      setTableExpansions(newExpansionState);
      return newState;
    });
  };


  const generateMeetingTable = (meetings) => {
    if (!meetings || meetings.length === 0) {
      return [
        <div className="meeting-row" key="meeting-tba">
          <span className="days">TBA</span>
          <span className="time">TBA</span>
        </div>
      ];
    }

    const rows = [];

    for (const [index, meeting] of meetings.entries()) {
      const meetingDays = meeting?.days === '-' ? 'TBA' : (meeting?.days || 'TBA');

      const hasTime =
        meeting?.start_time &&
        meeting?.end_time &&
        meeting.start_time !== '-' &&
        meeting.end_time !== '-';

      const meetingTimeString = hasTime
        ? `${meeting.start_time}-${meeting.end_time}`
        : 'TBA';

      rows.push(
        <div className="meeting-row" key={`meeting-${meetingDays}-${meetingTimeString}-${index}`}>
          <span className="days">{meetingDays}</span>
          <span className="time">{meetingTimeString}</span>
        </div>
      );
    }

    return rows;
  };

  const generateInstructorHTML = (instructors) => {
    return instructors.map((instructor, index) => {
      if (instructor.email.length > 0) {
        return (
          <p key={`${instructor.name}-${instructor.email}`}>
            <a href={`mailto:${instructor.email}`}>{instructor.name}</a>
          </p>
        );
      }

      return <p key={`${instructor.name}-${index}`}>{instructor.name}</p>;
    });
  }


  const getSisLink = (subject, catalog_number) => {
    return `https://sisuva.admin.virginia.edu/psp/ihprd/UVSS/SA/s/WEBLIB_HCX_CM.H_CLASS_SEARCH.FieldFormula.IScript_Main?catalog_nbr=${catalog_number}&subject=${subject}`;
}

  const getVAGradesLink = (subject, catalog_number) => {
    return `https://vagrades.com/uva/${subject}${catalog_number}`
  }


  const getCourseForumLink = (subject, catalog_number) => {
    return `https://thecourseforum.com/course/${subject}/${catalog_number}`
  }

  const handleSemesterChange = (event) => {
    const newSemester = event.target.value;
    setSelectedSemester(newSemester);
    navigate(`/catalog/${newSemester}/${department}`);
  };


  const elements = [];


  async function addRequirementName() {
    if (department.includes('-')) {
      elements.push(<h2 className="department-title">{requirementMapping[department]}</h2>);
    }
  }


  addRequirementName();



  if (metadata && metadata?.semester && metadata?.last_updated) {
        // Create a Date object from the UTC time string
        const utcDate = new Date(metadata.last_updated);

        // Get the user's current timezone
        const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    
        // Format the UTC time to the user's timezone
        const userTimeOptions = { timeZone: userTimezone, hour12: true, year: '2-digit', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric'};
        const userTime = utcDate.toLocaleTimeString(undefined, userTimeOptions);
    elements.push(<h3>Last Updated on {userTime}</h3>);
  }





  elements.push(
    <div>
    <select value={selectedSemester} onChange={handleSemesterChange}>
      {allSemesters.map((sem) => (
        <option key={sem.strm} value={sem.strm}>
          {sem.name}
        </option>
      ))}
    </select>
    </div>
  );



  if(data) {

    elements.push(        
      <button onClick={toggleAllTablesExpansion} className='toggle-button'>
        {allTablesExpanded ? 'Minimize' : 'Expand'} All Tables
      </button>);

    for (const [subject, courseArr] of Object.entries(data)) {
      elements.push(<h2 className="subject" key={`subject-${subject}`}>{subject}</h2>);
      for (const course of courseArr) {

        const tableKey = `${course.subject}${course.catalog_number}`;
        const isExpanded = tableExpansions[tableKey];

        const renderCourseSections = () => {
          if (!isExpanded) {
            return null;
          }

          if (isMobile) {
            return (
              <div className="section-cards">
                {course.sessions.map((section) => {
                  const classSectionString = section.topic !== null ? `${section.class_section} - ${section.topic}` : `${section.class_section}`;

                  return (
                    <div className="section-card" key={`${tableKey}-${classSectionString}`}>
                      <div className="section-card-row">
                        <span className="section-card-label">Section Type</span>
                        <div className="section-card-value">{section.section_type} ({section.units} units)</div>
                      </div>
                      <div className="section-card-row">
                        <span className="section-card-label">Section Number</span>
                        <div className="section-card-value">{classSectionString}</div>
                      </div>
                      <div className="section-card-row">
                        <span className="section-card-label">Instructor</span>
                        <div className="section-card-value">{generateInstructorHTML(section.instructors)}</div>
                      </div>
                      <div className="section-card-row">
                        <span className="section-card-label">Enrollment</span>
                        <div className="section-card-value">{`${section.enrollment_total}/${section.class_capacity}`}</div>
                      </div>
                      <div className="section-card-row">
                        <span className="section-card-label">Meetings</span>
                        <div className="section-card-value meeting-card">
                          {generateMeetingTable(section.meetings)}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          }

          return (
            <div className="table-wrapper">
              <table className="custom-table" aria-label={`${course.subject} ${course.catalog_number} sections`}>
                <thead>
                  <tr className="column-names">
                    <th className="section-type">Section Type</th>
                    <th className="section-number">Section Number</th>
                    <th className="instructor">Instructor</th>
                    <th className="enrollment">Enrollment</th>
                    <th className="meeting-table">
                      <div className='meeting-table-head'>
                        <span className='table-header'>Days</span>
                        <span className='table-header'>Time</span>
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {course.sessions.map((section) => {
                    const classSectionString = section.topic !== null ? `${section.class_section} - ${section.topic}` : `${section.class_section}`;

                    return (
                      <tr key={`${tableKey}-${classSectionString}`}>
                        <td className="section-type">{section.section_type} ({section.units} units)</td>
                        <td className="section-number">{classSectionString}</td>
                        <td className="instructor">{generateInstructorHTML(section.instructors)}</td>
                        <td className="enrollment">{`${section.enrollment_total}/${section.class_capacity}`}</td>
                        <td className='meeting-table'>
                          <div className='meeting-table-content'>
                            {generateMeetingTable(section.meetings)}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          );
        };

        const handleToggle = () => toggleTableExpansion(tableKey);

        elements.push(
          <div className="course-container" id={tableKey} key={`course-${tableKey}`}>
            <div
              className="course-header"
              role="button"
              tabIndex={0}
              aria-expanded={isExpanded}
              onClick={handleToggle}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  handleToggle();
                }
              }}
            >
              <div className='course-title'>
                {course.subject} {course.catalog_number}: {course.descr}
              </div>
              <div
                className="button-container"
                onClick={(event) => event.stopPropagation()}
                onKeyDown={(event) => event.stopPropagation()}
              >
                <a target="_blank" rel="noopener noreferrer" href={getSisLink(course.subject, course.catalog_number) }><button className="catalog-button">SIS</button></a>
                <a target="_blank" rel="noopener noreferrer" href={getCourseForumLink(course.subject, course.catalog_number)}><button className="catalog-button">theCourseForum</button></a>
                <a target="_blank" rel="noopener noreferrer" href={getVAGradesLink(course.subject, course.catalog_number)}> <button className="catalog-button hide-button">VA Grades</button></a>
              </div>
            </div>
            {renderCourseSections()}
          </div>
        );

      }
    }


  }




  return (
    <div className="catalogPage">
      <div>
        {elements}
        {noDataFound && <h4>No classes found for {department} in the semester.</h4>}
      </div>
      {showBackToTop && (
        <button onClick={scrollToTop} className="back-to-top show">
          ↑
        </button>
      )}
    </div>
  );







}







export default CatalogPage;
