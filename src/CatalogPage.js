import React, { Suspense, lazy, useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useMatch } from 'react-router-dom';
import './Catalog.css';
import { requirementMapping } from './RequirementMap';


const EnrollmentHistoryPanel = lazy(() => import('./EnrollmentHistoryPanel'));


function findCourseByRoute(data, org, number) {
  if (!data || !org || !number) {
    return null;
  }

  for (const courseArr of Object.values(data)) {
    const matchingCourse = courseArr.find((course) => (
      course.subject === org &&
      String(course.catalog_number) === String(number)
    ));

    if (matchingCourse) {
      return matchingCourse;
    }
  }

  return null;
}


function CatalogPage() {
  const { semester, department, org, number } = useParams();
  const navigate = useNavigate();
  const isEnrollmentHistoryRoute = Boolean(
    useMatch('/catalog/:semester/:department/:org/:number/enrollment')
  );
  const routeCourseKey = org && number ? `${org}${number}` : null;

  const [data, setData] = useState(null);
  const [metadata, setMetadata] = useState(null);
  const [tableExpansions, setTableExpansions] = useState({});
  const [allTablesExpanded, setAllTablesExpanded] = useState(false);
  const [activeCourseKey, setActiveCourseKey] = useState(routeCourseKey);
  const [allSemesters, setAllSemesters] = useState([]);
  const [selectedSemester, setSelectedSemester] = useState(semester);
  const [noDataFound, setNoDataFound] = useState(false);
  const [departmentHistory, setDepartmentHistory] = useState(null);
  const [historyStatus, setHistoryStatus] = useState('idle');
  const [historyError, setHistoryError] = useState(null);
  const [showBackToTop, setShowBackToTop] = useState(false);

  const selectedCourse = findCourseByRoute(data, org, number);
  const selectedCourseTitle = selectedCourse
    ? `${selectedCourse.subject} ${selectedCourse.catalog_number}: ${selectedCourse.descr}`
    : (org && number ? `${org} ${number}` : null);
  const historyCourse = org && number
    ? departmentHistory?.courses?.[`${org}::${number}`]
    : null;
  const effectiveHistoryStatus = isEnrollmentHistoryRoute && !departmentHistory && !historyError
    ? 'loading'
    : historyStatus;
  const isCatalogLoading = !data && !noDataFound;

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
    setSelectedSemester(semester);
    setDepartmentHistory(null);
    setHistoryStatus('idle');
    setHistoryError(null);
    setActiveCourseKey(isEnrollmentHistoryRoute ? null : routeCourseKey);
  }, [department, semester, routeCourseKey, isEnrollmentHistoryRoute]);

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
    if (!data) {
      return;
    }

    const newTableExpansions = {};
    for (const [, courseArr] of Object.entries(data)) {
      for (const course of courseArr) {
        const tableKey = `${course.subject}${course.catalog_number}`;
        newTableExpansions[tableKey] = false;
      }
    }

    if (!isEnrollmentHistoryRoute && org && number) {
      newTableExpansions[`${org}${number}`] = true;
    }

    setTableExpansions(newTableExpansions);
    setAllTablesExpanded(false);
  }, [data, org, number, isEnrollmentHistoryRoute]);

  const fetchCatalogIndexData = useCallback(async () => {
    setNoDataFound(false);
    setData(null);
    setMetadata(null);

    try {
      const response = await fetch(`https://raw.githubusercontent.com/UVA-Course-Explorer/course-data/main/data/${semester}/${department}.json`);
      if (!response.ok) {
        throw new Error('Data not found');
      }

      const jsonData = await response.json();
      setData(jsonData);

      const metadataResponse = await fetch(`https://raw.githubusercontent.com/UVA-Course-Explorer/course-data/main/data/${semester}/metadata.json`);
      if (metadataResponse.ok) {
        const jsonMetadata = await metadataResponse.json();
        setMetadata(jsonMetadata);
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
    if (!isEnrollmentHistoryRoute || !routeCourseKey) {
      return;
    }

    let isActive = true;

    async function fetchDepartmentHistory() {
      setHistoryStatus('loading');
      setHistoryError(null);

      try {
        const response = await fetch(`https://raw.githubusercontent.com/UVA-Course-Explorer/course-data/main/history/${semester}/${department}.json`);
        if (!response.ok) {
          throw new Error('Enrollment history has not been published for this department yet.');
        }

        const jsonData = await response.json();
        if (!isActive) {
          return;
        }

        setDepartmentHistory(jsonData);
        setHistoryStatus('success');
      } catch (error) {
        if (!isActive) {
          return;
        }

        console.error('Error fetching enrollment history:', error);
        setDepartmentHistory(null);
        setHistoryStatus('error');
        setHistoryError(error.message);
      }
    }

    fetchDepartmentHistory();

    return () => {
      isActive = false;
    };
  }, [department, isEnrollmentHistoryRoute, routeCourseKey, semester]);

  useEffect(() => {
    if (!org || !number || isEnrollmentHistoryRoute) {
      return;
    }

    setTimeout(() => {
      const tableElement = document.getElementById(`${org}${number}`);
      if (tableElement) {
        tableElement.scrollIntoView({ behavior: 'smooth' });
      }
    }, 750);
  }, [number, org, isEnrollmentHistoryRoute]);

  const toggleTableExpansion = (tableKey) => {
    setTableExpansions((prevTableExpansions) => (
      { ...prevTableExpansions, [tableKey]: !prevTableExpansions[tableKey] }
    ));
  };

  const handleCourseTitleClick = (tableKey) => {
    const shouldExpand = !tableExpansions[tableKey];
    toggleTableExpansion(tableKey);

    if (shouldExpand) {
      setActiveCourseKey(tableKey);
      return;
    }

    if (activeCourseKey === tableKey) {
      setActiveCourseKey(null);
    }
  };

  const toggleAllTablesExpansion = () => {
    setAllTablesExpanded((prevExpanded) => {
      const nextExpanded = !prevExpanded;
      const nextTableExpansions = Object.keys(tableExpansions).reduce((state, tableKey) => {
        state[tableKey] = nextExpanded;
        return state;
      }, {});

      setTableExpansions(nextTableExpansions);
      return nextExpanded;
    });
  };

  const generateMeetingTable = (meetings) => {
    if (!meetings || meetings.length === 0) {
      return [
        <div className="meeting-row" key="meeting-tba">
          <span className="days">TBA</span>
          <span className="time">TBA</span>
        </div>,
      ];
    }

    return meetings.map((meeting, index) => {
      const meetingDays = meeting?.days === '-' ? 'TBA' : (meeting?.days || 'TBA');
      const hasTime = (
        meeting?.start_time &&
        meeting?.end_time &&
        meeting.start_time !== '-' &&
        meeting.end_time !== '-'
      );
      const meetingTimeString = hasTime
        ? `${meeting.start_time} - ${meeting.end_time}`
        : 'TBA';

      return (
        <div className="meeting-row" key={`meeting-${meetingDays}-${meetingTimeString}-${index}`}>
          <span className="days">{meetingDays}</span>
          <span className="time">{meetingTimeString}</span>
        </div>
      );
    });
  };

  const generateInstructorHTML = (instructors) => instructors.map((instructor, index) => {
    if (instructor.email && instructor.email.length > 0) {
      return (
        <p key={`instructor-${instructor.email}-${index}`}>
          <a href={`mailto:${instructor.email}`}>{instructor.name}</a>
        </p>
      );
    }

    return <p key={`instructor-${instructor.name}-${index}`}>{instructor.name}</p>;
  });

  const getSisLink = (subject, catalogNumber) => (
    `https://sisuva.admin.virginia.edu/psp/ihprd/UVSS/SA/s/WEBLIB_HCX_CM.H_CLASS_SEARCH.FieldFormula.IScript_Main?catalog_nbr=${catalogNumber}&subject=${subject}`
  );

  const getCourseForumLink = (subject, catalogNumber) => (
    `https://thecourseforum.com/course/${subject}/${catalogNumber}`
  );

  const openEnrollmentHistory = (subject, catalogNumber) => {
    navigate(`/catalog/${semester}/${department}/${subject}/${catalogNumber}/enrollment`);
  };

  const handleSemesterChange = (event) => {
    const newSemester = event.target.value;
    setSelectedSemester(newSemester);

    if (isEnrollmentHistoryRoute && org && number) {
      navigate(`/catalog/${newSemester}/${department}/${org}/${number}/enrollment`);
      return;
    }

    if (org && number) {
      navigate(`/catalog/${newSemester}/${department}/${org}/${number}`);
      return;
    }

    navigate(`/catalog/${newSemester}/${department}`);
  };

  const renderCourseTable = ({
    course,
    isExpanded,
    onTitleClick,
    showEnrollmentButton,
    useStaticTitle,
  }) => {
    const tableKey = `${course.subject}${course.catalog_number}`;
    const courseTitle = `${course.subject} ${course.catalog_number}: ${course.descr}`;
    const rowClassName = `${isExpanded ? 'expanded' : 'collapsed'} animate-expansion`;

    return (
      <div key={`${tableKey}-table`}>
        <table className="custom-table" id={tableKey}>
          <tbody>
            <tr className="title-header" key={`${tableKey}-title`}>
              <th colSpan="5" className="title-header-cell">
                <div className="title-header-content">
                  {useStaticTitle ? (
                    <div className="course-title course-title-static">{courseTitle}</div>
                  ) : (
                    <button
                      type="button"
                      className="course-title"
                      onClick={() => onTitleClick(tableKey)}
                    >
                      {courseTitle}
                    </button>
                  )}
                  <div className="external-buttons">
                    {showEnrollmentButton && (
                      <button
                        type="button"
                        className="catalog-button"
                        onClick={() => openEnrollmentHistory(course.subject, course.catalog_number)}
                      >
                        Enrollment Graph
                      </button>
                    )}
                    <a
                      target="_blank"
                      rel="noopener noreferrer"
                      href={getSisLink(course.subject, course.catalog_number)}
                    >
                      <button className="catalog-button">SIS</button>
                    </a>
                    <a
                      target="_blank"
                      rel="noopener noreferrer"
                      href={getCourseForumLink(course.subject, course.catalog_number)}
                    >
                      <button className="catalog-button">theCourseForum</button>
                    </a>
                  </div>
                </div>
              </th>
            </tr>

            <tr className={`column-names ${rowClassName}`} key={`${tableKey}-columns`}>
              <th className="section-type">Section Type</th>
              <th className="section-number">Section Number</th>
              <th className="instructor">Instructor</th>
              <th className="enrollment">Enrollment</th>
              <th className="meeting-table">
                <div className="meeting-table-head">
                  <span className="table-header">Days</span>
                  <span className="table-header">Time</span>
                </div>
              </th>
            </tr>

            {course.sessions.map((section, index) => {
              const classSectionString = section.topic !== null
                ? `${section.class_section} - ${section.topic}`
                : `${section.class_section}`;

              return (
                <tr className={rowClassName} key={`${tableKey}-section-${section.class_section}-${index}`}>
                  <td className="section-type">{section.section_type} ({section.units} units)</td>
                  <td className="section-number">{classSectionString}</td>
                  <td className="instructor">{generateInstructorHTML(section.instructors)}</td>
                  <td className="enrollment">{`${section.enrollment_total}/${section.class_capacity}`}</td>
                  <td className="meeting-table">
                    <div className="meeting-table-content">
                      {generateMeetingTable(section.meetings)}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {isExpanded && !useStaticTitle && (
          <>
            <br />
            <br />
          </>
        )}
      </div>
    );
  };

  const requirementName = department.includes('-')
    ? requirementMapping[department]
    : null;

  let lastUpdatedLabel = null;
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
    lastUpdatedLabel = utcDate.toLocaleTimeString(undefined, userTimeOptions);
  }

  const sharedHeader = (
    <>
      {requirementName && <h2 className="department-title">{requirementName}</h2>}
      {lastUpdatedLabel && <h3>Last Updated on {lastUpdatedLabel}</h3>}
      <div>
        <select value={selectedSemester} onChange={handleSemesterChange}>
          {allSemesters.map((sem) => (
            <option key={sem.strm} value={sem.strm}>
              {sem.name}
            </option>
          ))}
        </select>
      </div>
    </>
  );

  const loadingMessage = isEnrollmentHistoryRoute
    ? 'Loading class details...'
    : 'Loading courses...';

  return (
    <div className="catalogPage">
      <div>
        {sharedHeader}

        {isEnrollmentHistoryRoute ? (
          <>
            <div className="enrollment-history-screen-nav">
              <button
                type="button"
                className="toggle-button"
                onClick={() => navigate(`/catalog/${semester}/${department}/${org}/${number}`)}
              >
                Back to Class
              </button>
              <button
                type="button"
                className="toggle-button"
                onClick={() => navigate(`/catalog/${semester}/${department}`)}
              >
                Back to Department
              </button>
            </div>

            {isCatalogLoading && <h4>{loadingMessage}</h4>}
            {noDataFound && <h4>No classes found for {department} in the semester.</h4>}
            {!isCatalogLoading && !noDataFound && !selectedCourse && (
              <h4>No class found for {org} {number} in this semester.</h4>
            )}

            {selectedCourse && (
              <div className="enrollment-history-screen">
                {renderCourseTable({
                  course: selectedCourse,
                  isExpanded: true,
                  showEnrollmentButton: false,
                  useStaticTitle: true,
                })}
                <Suspense
                  fallback={(
                    <div className="enrollment-history-panel">
                      <p className="enrollment-history-status">Loading enrollment history...</p>
                    </div>
                  )}
                >
                  <EnrollmentHistoryPanel
                    courseTitle={selectedCourseTitle}
                    historyCourse={historyCourse}
                    historyStatus={effectiveHistoryStatus}
                    historyError={historyError}
                  />
                </Suspense>
              </div>
            )}
          </>
        ) : (
          <>
            {data && (
              <button onClick={toggleAllTablesExpansion} className="toggle-button">
                {allTablesExpanded ? 'Minimize' : 'Expand'} All Tables
              </button>
            )}

            {isCatalogLoading && <h4>{loadingMessage}</h4>}

            {data && Object.entries(data).map(([subject, courseArr]) => (
              <React.Fragment key={subject}>
                <h2 className="subject">{subject}</h2>
                {courseArr.map((course) => {
                  const tableKey = `${course.subject}${course.catalog_number}`;
                  return renderCourseTable({
                    course,
                    isExpanded: Boolean(tableExpansions[tableKey]),
                    onTitleClick: handleCourseTitleClick,
                    showEnrollmentButton: true,
                    useStaticTitle: false,
                  });
                })}
              </React.Fragment>
            ))}

            {noDataFound && <h4>No classes found for {department} in the semester.</h4>}
          </>
        )}
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
