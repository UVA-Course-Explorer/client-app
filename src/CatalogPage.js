import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './Catalog.css';
import { requirementMapping } from './RequirementMap';

const CourseCard = ({
  course,
  isExpanded,
  onToggle,
  getSisLink,
  getCourseForumLink,
  getVAGradesLink,
  generateInstructorHTML,
  generateMeetingTable,
}) => {
  const tableKey = `${course.subject}${course.catalog_number}`;
  const handleToggle = () => onToggle(tableKey);

  return (
    <div className={`course-card ${isExpanded ? 'course-card--expanded' : ''}`} id={tableKey}>
      <div className="course-card__header">
        <button
          type="button"
          className="course-card__toggle"
          onClick={handleToggle}
          aria-expanded={isExpanded}
          aria-controls={`${tableKey}-content`}
        >
          <span className="course-card__title" id={`${tableKey}-title`}>
            {course.subject} {course.catalog_number}: {course.descr}
          </span>
          <span
            className={`course-card__chevron ${isExpanded ? 'course-card__chevron--open' : ''}`}
            aria-hidden="true"
          />
        </button>
        <div className="course-card__actions">
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
            className="catalog-button catalog-button--optional"
          >
            VA Grades
          </a>
        </div>
      </div>
      {isExpanded && (
        <div
          className="course-card__content"
          id={`${tableKey}-content`}
          role="region"
          aria-labelledby={`${tableKey}-title`}
        >
          <div className="course-grid course-grid--header" aria-hidden="true">
            <span className="course-grid__cell course-grid__cell--header">Section Type</span>
            <span className="course-grid__cell course-grid__cell--header">Section Number</span>
            <span className="course-grid__cell course-grid__cell--header">Instructor</span>
            <span className="course-grid__cell course-grid__cell--header">Enrollment</span>
            <span className="course-grid__cell course-grid__cell--header">Meetings</span>
          </div>
          {course.sessions.map((section) => {
            const classSectionString =
              section.topic !== null && section.topic !== ''
                ? `${section.class_section} - ${section.topic}`
                : `${section.class_section}`;

            return (
              <div className="course-grid" key={`${section.class_section}-${section.class_number}`}>
                <div className="course-grid__cell" data-label="Section Type">
                  {section.section_type} ({section.units} units)
                </div>
                <div className="course-grid__cell" data-label="Section Number">
                  {classSectionString}
                </div>
                <div className="course-grid__cell" data-label="Instructor">
                  {generateInstructorHTML(section.instructors)}
                </div>
                <div className="course-grid__cell" data-label="Enrollment">
                  {`${section.enrollment_total}/${section.class_capacity}`}
                </div>
                <div className="course-grid__cell course-grid__cell--meetings" data-label="Meetings">
                  <div className="meeting-table-content">{generateMeetingTable(section.meetings)}</div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

function CatalogPage() {
  const { semester, department, org, number } = useParams();
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
    if (org && number) {
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
    setAllTablesExpanded((prev) => {
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
    if (!Array.isArray(meetings) || meetings.length === 0) {
      return [
        <div className="meeting-row" key="meeting-tba">
          <span className="days">TBA</span>
          <span className="time">TBA</span>
        </div>,
      ];
    }

    return meetings.map((meeting, index) => {
      const meetingDays = meeting?.days === '-' ? 'TBA' : meeting?.days || 'TBA';

      const hasTime =
        meeting?.start_time &&
        meeting?.end_time &&
        meeting.start_time !== '-' &&
        meeting.end_time !== '-';

      const meetingTimeString = hasTime
        ? `${meeting.start_time}-${meeting.end_time}`
        : 'TBA';

      return (
        <div className="meeting-row" key={`meeting-${meetingDays}-${meetingTimeString}-${index}`}>
          <span className="days">{meetingDays}</span>
          <span className="time">{meetingTimeString}</span>
        </div>
      );
    });
  };

  const generateInstructorHTML = (instructors) => {
    if (!Array.isArray(instructors) || instructors.length === 0) {
      return <p className="instructor-name">TBA</p>;
    }

    return instructors.map((instructor) => {
      const key = `${instructor.name}-${instructor.email || 'no-email'}`;

      if (instructor.email && instructor.email.length > 0) {
        return (
          <p key={key} className="instructor-name">
            <a href={`mailto:${instructor.email}`}>{instructor.name}</a>
          </p>
        );
      }

      return (
        <p key={key} className="instructor-name">
          {instructor.name}
        </p>
      );
    });
  };


  const getSisLink = (subject, catalog_number) => {
    return `https://sisuva.admin.virginia.edu/psp/ihprd/UVSS/SA/s/WEBLIB_HCX_CM.H_CLASS_SEARCH.FieldFormula.IScript_Main?catalog_nbr=${catalog_number}&subject=${subject}`;
}

  const getVAGradesLink = (subject, catalog_number) => {
    return `https://vagrades.com/uva/${subject}${catalog_number}`;
  };

  const getCourseForumLink = (subject, catalog_number) => {
    return `https://thecourseforum.com/course/${subject}/${catalog_number}`;
  };

  const handleSemesterChange = (event) => {
    const newSemester = event.target.value;
    setSelectedSemester(newSemester);
    navigate(`/catalog/${newSemester}/${department}`);
  };


  const requirementName = department.includes('-') ? requirementMapping[department] : null;

  let lastUpdatedText = null;

  if (metadata?.last_updated) {
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
    lastUpdatedText = utcDate.toLocaleTimeString(undefined, userTimeOptions);
  }

  const hasCourseData = data && Object.keys(data).length > 0;

  return (
    <div className="catalogPage">
      <div className="catalogPage__intro">
        {requirementName && <h2 className="department-title">{requirementName}</h2>}
        {lastUpdatedText && <h3 className="catalogPage__last-updated">Last Updated on {lastUpdatedText}</h3>}
        <div className="catalogPage__controls">
          <label className="catalogPage__semester-select">
            <span className="sr-only">Select semester</span>
            <select value={selectedSemester} onChange={handleSemesterChange}>
              {allSemesters.map((sem) => (
                <option key={sem.strm} value={sem.strm}>
                  {sem.name}
                </option>
              ))}
            </select>
          </label>
          {hasCourseData && (
            <button type="button" onClick={toggleAllTablesExpansion} className="toggle-button">
              {allTablesExpanded ? 'Minimize All Courses' : 'Expand All Courses'}
            </button>
          )}
        </div>
      </div>

      {hasCourseData ? (
        Object.entries(data).map(([subject, courseArr]) => (
          <section key={subject} className="subject-section">
            <h2 className="subject">{subject}</h2>
            <div className="subject-courses">
              {courseArr.map((course) => {
                const tableKey = `${course.subject}${course.catalog_number}`;
                const isExpanded = Boolean(tableExpansions[tableKey]);

                return (
                  <CourseCard
                    key={tableKey}
                    course={course}
                    isExpanded={isExpanded}
                    onToggle={toggleTableExpansion}
                    getSisLink={getSisLink}
                    getCourseForumLink={getCourseForumLink}
                    getVAGradesLink={getVAGradesLink}
                    generateInstructorHTML={generateInstructorHTML}
                    generateMeetingTable={generateMeetingTable}
                  />
                );
              })}
            </div>
          </section>
        ))
      ) : (
        noDataFound && <h4>No classes found for {department} in the semester.</h4>
      )}

      {showBackToTop && (
        <button onClick={scrollToTop} className="back-to-top show" aria-label="Back to top">
          ↑
        </button>
      )}
    </div>
  );







}







export default CatalogPage;
