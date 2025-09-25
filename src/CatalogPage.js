import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
      return (
        <div className="meeting-row" key="meeting-tba">
          <span className="days">TBA</span>
          <span className="time">TBA</span>
        </div>
      );
    }

    return meetings.map((meeting, index) => {
      const meetingDays = meeting?.days === '-' ? 'TBA' : meeting?.days || 'TBA';

      const hasTime =
        meeting?.start_time &&
        meeting?.end_time &&
        meeting.start_time !== '-' &&
        meeting.end_time !== '-';

      const meetingTimeString = hasTime ? `${meeting.start_time}-${meeting.end_time}` : 'TBA';

      return (
        <div className="meeting-row" key={`meeting-${meetingDays}-${meetingTimeString}-${index}`}>
          <span className="days">{meetingDays}</span>
          <span className="time">{meetingTimeString}</span>
        </div>
      );
    });
  };

  const generateInstructorHTML = (instructors = []) => {
    if (!instructors.length) {
      return <p key="instructor-tba">TBA</p>;
    }

    return instructors.map((instructor) => {
      const key = `${instructor.name}-${instructor.email || 'no-email'}`;

      if (instructor.email?.length) {
        return (
          <p key={key}>
            <a href={`mailto:${instructor.email}`}>{instructor.name}</a>
          </p>
        );
      }

      return <p key={key}>{instructor.name}</p>;
    });
  };


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


  const handleToggleKeyDown = (event, tableKey) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      toggleTableExpansion(tableKey);
    }
  };

  const departmentTitle = department.includes('-') ? requirementMapping[department] : null;

  let formattedLastUpdated = null;
  if (metadata?.semester && metadata?.last_updated) {
    const utcDate = new Date(metadata.last_updated);
    const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const userTimeOptions = {
      timeZone: userTimezone,
      hour12: true,
      year: '2-digit',
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
    };
    formattedLastUpdated = utcDate.toLocaleTimeString(undefined, userTimeOptions);
  }

  const renderCourseCard = (course) => {
    const tableKey = `${course.subject}${course.catalog_number}`;
    const isExpanded = tableExpansions[tableKey];
    const sectionId = `${tableKey}-content`;
    const sessions = course.sessions ?? [];

    return (
      <article className={`course-container ${isExpanded ? 'expanded' : ''}`} id={tableKey} key={tableKey}>
        <div className="course-header">
          <button
            type="button"
            className="course-toggle"
            onClick={() => toggleTableExpansion(tableKey)}
            onKeyDown={(event) => handleToggleKeyDown(event, tableKey)}
            aria-expanded={isExpanded}
            aria-controls={sectionId}
          >
            <div className="course-title">
              <span className="course-code">
                {course.subject} {course.catalog_number}
              </span>
              <span className="course-name">{course.descr}</span>
            </div>
            <span className="course-toggle-icon" aria-hidden="true">
              {isExpanded ? '−' : '+'}
            </span>
          </button>
          <div className="course-actions">
            <a
              target="_blank"
              rel="noopener noreferrer"
              href={getSisLink(course.subject, course.catalog_number)}
              className="catalog-button"
            >
              SIS
            </a>
            <a
              target="_blank"
              rel="noopener noreferrer"
              href={getCourseForumLink(course.subject, course.catalog_number)}
              className="catalog-button"
            >
              theCourseForum
            </a>
            <a
              target="_blank"
              rel="noopener noreferrer"
              href={getVAGradesLink(course.subject, course.catalog_number)}
              className="catalog-button hide-button"
            >
              VA Grades
            </a>
          </div>
        </div>
        <div
          id={sectionId}
          className={`section-table ${isExpanded ? 'expanded' : ''}`}
          hidden={!isExpanded}
        >
          <div className="section-header" role="row">
            <span className="column section-type">Section Type</span>
            <span className="column section-number">Section Number</span>
            <span className="column instructor">Instructor</span>
            <span className="column enrollment">Enrollment</span>
            <span className="column meeting-column">
              <span className="table-header">Days</span>
              <span className="table-header">Time</span>
            </span>
          </div>
          {sessions.map((section) => {
            const classSectionString =
              section.topic !== null ? `${section.class_section} - ${section.topic}` : `${section.class_section}`;
            const sectionKey = section.class_number || `${tableKey}-${classSectionString}`;

            return (
              <div className="section-row" key={sectionKey} role="row">
                <div className="column section-type" data-label="Section Type">
                  {section.section_type} ({section.units} units)
                </div>
                <div className="column section-number" data-label="Section Number">
                  {classSectionString}
                </div>
                <div className="column instructor" data-label="Instructor">
                  {generateInstructorHTML(section.instructors)}
                </div>
                <div className="column enrollment" data-label="Enrollment">
                  {`${section.enrollment_total}/${section.class_capacity}`}
                </div>
                <div className="column meeting-column" data-label="Meetings">
                  <div className="meeting-grid">{generateMeetingTable(section.meetings)}</div>
                </div>
              </div>
            );
          })}
        </div>
      </article>
    );
  };

  const renderCourses = () => {
    if (!data) {
      return null;
    }

    return Object.entries(data).map(([subject, courseArr]) => (
      <section key={subject} className="subject-section">
        <h2 className="subject">{subject}</h2>
        {courseArr.map((course) => renderCourseCard(course))}
      </section>
    ));
  };

  return (
    <div className="catalogPage">
      <div className="catalog-page-header">
        {departmentTitle && <h2 className="department-title">{departmentTitle}</h2>}
        {formattedLastUpdated && <h3>Last Updated on {formattedLastUpdated}</h3>}
        <div className="semester-select">
          <label htmlFor="semester-select">Semester</label>
          <select id="semester-select" value={selectedSemester} onChange={handleSemesterChange}>
            {allSemesters.map((sem) => (
              <option key={sem.strm} value={sem.strm}>
                {sem.name}
              </option>
            ))}
          </select>
        </div>
        {data && (
          <button onClick={toggleAllTablesExpansion} className="toggle-button">
            {allTablesExpanded ? 'Minimize' : 'Expand'} All Courses
          </button>
        )}
      </div>
      <div className="catalog-content">{renderCourses()}</div>
      {noDataFound && <h4>No classes found for {department} in the semester.</h4>}
      {showBackToTop && (
        <button onClick={scrollToTop} className="back-to-top show">
          ↑
        </button>
      )}
    </div>
  );







}







export default CatalogPage;
