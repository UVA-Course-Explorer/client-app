import React, { useState, useEffect, useCallback} from 'react';
import { useParams, useNavigate} from 'react-router-dom';
import './Catalog.css'
import './Catalog.css'
import { requirementMapping } from './RequirementMap';

function CatalogPage() {
  const { semester, department, org, number} = useParams();
  const [data, setData] = useState(null);
  const [metadata, setMetadata] = useState(null);
  const navigate = useNavigate();

  const [tableExpansions, setTableExpansions] = useState({});
  const [allTablesExpanded, setAllTablesExpanded] = useState(true); // state for overall table expansion

  const [allSemesters, setAllSemesters] = useState([]);
  const [selectedSemester, setSelectedSemester] = useState(semester);

  const [noDataFound, setNoDataFound] = useState(false);

  const [showBackToTop, setShowBackToTop] = useState(false);


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

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
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
          newTableExpansions[tableKey] = allTablesExpanded;
        }
      }
      setTableExpansions(newTableExpansions);
    }
  }, [data, allTablesExpanded]);



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
    setAllTablesExpanded((prev) => !prev);
    const newExpansionState = Object.keys(tableExpansions).reduce((state, tableKey) => {
      state[tableKey] = !allTablesExpanded;
      return state;
    }, {});
    setTableExpansions(newExpansionState);
  };


  const generateMeetingTable = (meetings) => {
    if(!meetings){
        return "TBA";
    }
    const table = [];
    
    for (const meeting of meetings){
      if(meeting.days === '-'){
        meeting.days = 'TBA';
      }

      if(meeting.facility_descr === '-'){
        meeting.facility_descr = 'TBA';
      }

      const meetingTimeString = meeting.start_time !== '' && meeting.end_time !== ''
      ? `${meeting.start_time}-${meeting.end_time}`
      : 'TBA';

        table.push(<tr className='meeting-table'>
          <td className="days">{meeting.days}</td>
          <td className="time">{meetingTimeString}</td>
          <td className="location">{meeting.facility_descr}</td>
        </tr>);
    }
    return table;
  }

  const generateInstructorHTML = (instructors) => {
    const elements = [];
    for (const instructor of instructors){
      if(instructor.email.length > 0){
        elements.push(<p><a href={`mailto:${instructor.email}`}>{instructor.name}</a></p>);
      }
      else{
        elements.push(<p>{instructor.name}</p>);
      }
    }
    return elements;
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
      elements.push(<h2 className="subject">{subject}</h2>);
      for (const course of courseArr) {

        const tableKey = `${course.subject}${course.catalog_number}`;
        const isExpanded = tableExpansions[tableKey];

        const trClassName = `${isExpanded ? 'expanded' : 'collapsed'} animate-expansion`;

        // console.log(`Rendering table ${tableKey}: ${isExpanded ? 'expanded' : 'collapsed'}`);
        // const trClassName = isExpanded ? 'expanded' : 'collapsed';
        const table = [];
        table.push(
          <tr className="title-header">
          <th colSpan="4" className='course-title' onClick={() => toggleTableExpansion(tableKey)}>{course.subject} {course.catalog_number}: {course.descr}</th> 
          
          <th className="external-buttons">
            <div className = "button-container">
            <th className="sis-button"><a target="_blank" rel="noopener noreferrer" href={getSisLink(course.subject, course.catalog_number) }><button className="catalog-button">SIS</button></a></th>
            <th><a target="_blank" rel="noopener noreferrer" href={getCourseForumLink(course.subject, course.catalog_number)}><button className="catalog-button">theCourseForum</button></a> </th>
            <th><a target="_blank" rel="noopener noreferrer" href={getVAGradesLink(course.subject, course.catalog_number)}> <button className="catalog-button hide-button">VA Grades</button></a></th>
            </div>
          </th>
          </tr>);

table.push(<tr className={`column-names ${trClassName}`}>          
        <th className="section-type">Section Type</th>
          <th className="section-number">Section Number</th>
          <th className="instructor">Instructor</th>
          <th className="enrollment">Enrollment</th>
          <th className="meeting-table"><table><td className='table-header'>Days</td><td className='table-header'>Time</td><td className='table-header'>Location</td></table></th>
        </tr>);

        for (const section of course.sessions) {
          const classSectionString = section.topic !== null ? `${section.class_section} - ${section.topic}` : `${section.class_section}`;

          table.push(<tr className={trClassName}>
            <td className="section-type">{section.section_type} ({section.units} units)</td>
            <td className="section-number">{classSectionString}</td>
            <td className="instructor">{generateInstructorHTML(section.instructors)}</td>
            <td className="enrollment">{`${section.enrollment_total}/${section.class_capacity}`}</td>
            <td className='meeting-table'><table>
            {generateMeetingTable(section.meetings)}</table>  </td>
          </tr>);
        }

          elements.push(
            <div>
              <table className={'custom-table'} id={tableKey}>
                <tbody>{table}</tbody>
              </table>
            </div>
          );

          if (isExpanded) {
            elements.push(<br />);
            elements.push(<br />);
          }

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
