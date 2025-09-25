import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './Catalog.css';
import { requirementMapping } from './RequirementMap';

function CatalogPage() {
  const { semester, department, org, number } = useParams();
  const [data, setData] = useState(null);
  const [metadata, setMetadata] = useState(null);
  const navigate = useNavigate();

  const [tableExpansions, setTableExpansions] = useState({});
  const [allTablesExpanded, setAllTablesExpanded] = useState(false);

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
        const metadataJson = await metadataResponse.json();
        setMetadata(metadataJson);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setData(null);
      setMetadata(null);
      setNoDataFound(true);
    }
  }, [department, semester]);

  useEffect(() => {
    fetchCatalogIndexData();
  }, [fetchCatalogIndexData]);

  useEffect(() => {
    let scrollKey = null;
    if (org && number) {
      scrollKey = org + number;
    }
    if (scrollKey) {
      setTimeout(() => {
        const tableElement = document.getElementById(scrollKey);
        if (tableElement) {
          tableElement.scrollIntoView({ behavior: 'smooth' });
        }
      }, 750);
    }
  }, [number, org]);

  const toggleTableExpansion = (tableKey) => {
    setTableExpansions((prevTableExpansions) => ({
      ...prevTableExpansions,
      [tableKey]: !prevTableExpansions[tableKey]
    }));
  };

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
    if (!meetings || meetings.length === 0) {
      return [
        <div className="meeting-slot" key="meeting-tba">
          <span className="meeting-slot__days">TBA</span>
          <span className="meeting-slot__time">TBA</span>
        </div>
      ];
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
        <div className="meeting-slot" key={`meeting-${meetingDays}-${meetingTimeString}-${index}`}>
          <span className="meeting-slot__days">{meetingDays}</span>
          <span className="meeting-slot__time">{meetingTimeString}</span>
        </div>
      );
    });
  };

  const generateInstructorHTML = (instructors = []) => {
    if (instructors.length === 0) {
      return <p>Staff</p>;
    }

    return instructors.map((instructor) => {
      const key = `${instructor.name}-${instructor.email || 'no-email'}`;
      if (instructor.email?.length > 0) {
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
  };

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

  const renderCourseCard = (course) => {
    const tableKey = `${course.subject}${course.catalog_number}`;
    const isExpanded = Boolean(tableExpansions[tableKey]);
    const classSectionRows = course.sessions || [];

    return (
      <article className={`course-card ${isExpanded ? 'course-card--expanded' : ''}`} id={tableKey} key={tableKey}>
        <header className="course-card__header">
          <button
            type="button"
            className="course-card__toggle"
            onClick={() => toggleTableExpansion(tableKey)}
            aria-expanded={isExpanded}
          >
            <span className="course-card__title">
              {course.subject} {course.catalog_number}: {course.descr}
            </span>
            <span className="course-card__chevron" aria-hidden="true" />
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
              className="catalog-button hide-button"
            >
              VA Grades
            </a>
          </div>
        </header>
        <div className="course-card__body" hidden={!isExpanded}>
          <div className="session-grid session-grid--header">
            <div className="session-cell">Section Type</div>
            <div className="session-cell">Section Number</div>
            <div className="session-cell">Instructor</div>
            <div className="session-cell">Enrollment</div>
            <div className="session-cell">Meetings</div>
          </div>
          {classSectionRows.map((section, index) => {
            const classSectionString = section.topic !== null ? `${section.class_section} - ${section.topic}` : `${section.class_section}`;
            const sectionKey = `${section.class_section}-${section.topic || 'default'}-${index}`;

            return (
              <div className="session-grid" key={sectionKey}>
                <div className="session-cell">
                  <span className="cell-label">Section Type</span>
                  <div className="cell-value">{section.section_type} ({section.units} units)</div>
                </div>
                <div className="session-cell">
                  <span className="cell-label">Section Number</span>
                  <div className="cell-value">{classSectionString}</div>
                </div>
                <div className="session-cell">
                  <span className="cell-label">Instructor</span>
                  <div className="cell-value instructor-cell">{generateInstructorHTML(section.instructors)}</div>
                </div>
                <div className="session-cell">
                  <span className="cell-label">Enrollment</span>
                  <div className="cell-value">{`${section.enrollment_total}/${section.class_capacity}`}</div>
                </div>
                <div className="session-cell session-cell--meetings">
                  <span className="cell-label">Meetings</span>
                  <div className="cell-value meeting-list">{generateMeetingTable(section.meetings)}</div>
                </div>
              </div>
            );
          })}
        </div>
      </article>
    );
  };

  const departmentTitle = department.includes('-') ? requirementMapping[department] : null;

  let lastUpdatedText = null;
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
      minute: 'numeric'
    };
    lastUpdatedText = utcDate.toLocaleTimeString(undefined, userTimeOptions);
  }

  return (
    <div className="catalogPage">
      <div>
        {departmentTitle && <h2 className="department-title">{departmentTitle}</h2>}
        {lastUpdatedText && <h3>Last Updated on {lastUpdatedText}</h3>}

        <div className="semester-select">
          <label htmlFor="semester-select" className="visually-hidden">
            Select semester
          </label>
          <select id="semester-select" value={selectedSemester} onChange={handleSemesterChange}>
            {allSemesters.map((sem) => (
              <option key={sem.strm} value={sem.strm}>
                {sem.name}
              </option>
            ))}
          </select>
        </div>

        {data && (
          <>
            <button onClick={toggleAllTablesExpansion} className="toggle-button">
              {allTablesExpanded ? 'Minimize' : 'Expand'} All Tables
            </button>

            {Object.entries(data).map(([subject, courseArr]) => (
              <section key={subject}>
                <h2 className="subject">{subject}</h2>
                {courseArr.map((course) => renderCourseCard(course))}
              </section>
            ))}
          </>
        )}

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
