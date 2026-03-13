import React, { useEffect, useState } from 'react';
import Plot from 'react-plotly.js';


const MAX_DEFAULT_SESSIONS = 10;


function sortSessionEntries(sessionA, sessionB) {
  const sectionTypeCompare = (sessionA.section_type || '').localeCompare(sessionB.section_type || '', undefined, {
    numeric: true,
    sensitivity: 'base',
  });
  if (sectionTypeCompare !== 0) {
    return sectionTypeCompare;
  }

  return (sessionA.class_section || '').localeCompare(sessionB.class_section || '', undefined, {
    numeric: true,
    sensitivity: 'base',
  });
}


function getInstructorLabel(instructors = []) {
  const names = instructors
    .map((instructor) => instructor?.name)
    .filter(Boolean);

  return names.length > 0 ? names.join(', ') : 'Staff';
}


function getInstructorShortLabel(instructors = []) {
  const names = instructors
    .map((instructor) => instructor?.name)
    .filter(Boolean)
    .map((name) => {
      const nameParts = name.trim().split(/\s+/);
      return nameParts[nameParts.length - 1];
    });

  return names.length > 0 ? names.join(', ') : 'Staff';
}


function buildSessionLabel(session) {
  const labelParts = [
    `${session.section_type || 'Section'} ${session.class_section || 'TBA'}`.trim(),
  ];

  if (session.class_nbr !== null && session.class_nbr !== undefined) {
    labelParts.push(`#${session.class_nbr}`);
  }

  labelParts.push(getInstructorLabel(session.instructors));
  return labelParts.join(' · ');
}


function buildCompactSessionLabel(session) {
  const labelParts = [
    `${session.class_section || 'TBA'}`.trim(),
    getInstructorShortLabel(session.instructors),
  ].filter(Boolean);

  return labelParts.join(' · ');
}


function getDefaultSessionKeys(sessionEntries) {
  return sessionEntries
    .slice(0, MAX_DEFAULT_SESSIONS)
    .map((session) => session.session_key);
}


function EnrollmentHistoryPanel({
  courseTitle,
  historyCourse,
  historyStatus,
  historyError,
}) {
  const [sessionQuery, setSessionQuery] = useState('');
  const [selectedSessionKeys, setSelectedSessionKeys] = useState([]);
  const [isMobileViewport, setIsMobileViewport] = useState(
    typeof window !== 'undefined' &&
    window.matchMedia &&
    window.matchMedia('(max-width: 768px)').matches
  );

  const prefersLightMode =
    typeof window !== 'undefined' &&
    window.matchMedia &&
    window.matchMedia('(prefers-color-scheme: light)').matches;

  const plotFontColor = prefersLightMode ? '#111827' : '#f8fafc';
  const gridColor = prefersLightMode ? 'rgba(15, 23, 42, 0.12)' : 'rgba(226, 232, 240, 0.18)';

  const sessionEntries = historyCourse
    ? Object.values(historyCourse.sessions || {}).sort(sortSessionEntries)
    : [];

  useEffect(() => {
    setSessionQuery('');
    const defaultSessionKeys = historyCourse
      ? getDefaultSessionKeys(Object.values(historyCourse.sessions || {}).sort(sortSessionEntries))
      : [];
    setSelectedSessionKeys(defaultSessionKeys);
  }, [historyCourse]);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) {
      return undefined;
    }

    const mobileViewportQuery = window.matchMedia('(max-width: 768px)');

    const handleViewportChange = (event) => {
      setIsMobileViewport(event.matches);
    };

    setIsMobileViewport(mobileViewportQuery.matches);

    if (mobileViewportQuery.addEventListener) {
      mobileViewportQuery.addEventListener('change', handleViewportChange);
      return () => mobileViewportQuery.removeEventListener('change', handleViewportChange);
    }

    mobileViewportQuery.addListener(handleViewportChange);
    return () => mobileViewportQuery.removeListener(handleViewportChange);
  }, []);

  if (historyStatus === 'loading') {
    return (
      <div className="enrollment-history-panel">
        <h4>Enrollment History</h4>
        <p className="enrollment-history-status">Loading historical enrollment snapshots for {courseTitle}...</p>
      </div>
    );
  }

  if (historyStatus === 'error') {
    return (
      <div className="enrollment-history-panel">
        <h4>Enrollment History</h4>
        <p className="enrollment-history-status">{historyError || 'Enrollment history is unavailable right now.'}</p>
      </div>
    );
  }

  if (!historyCourse) {
    return (
      <div className="enrollment-history-panel">
        <h4>Enrollment History</h4>
        <p className="enrollment-history-status">No published enrollment history is available for this course yet.</p>
      </div>
    );
  }

  const filteredSessions = sessionEntries.filter((session) =>
    buildSessionLabel(session).toLowerCase().includes(sessionQuery.trim().toLowerCase())
  );

  const selectedSessions = sessionEntries.filter((session) => selectedSessionKeys.includes(session.session_key));

  const traces = selectedSessions.map((session) => ({
    type: 'scatter',
    mode: session.points.length > 1 ? 'lines+markers' : 'markers',
    name: isMobileViewport ? buildCompactSessionLabel(session) : buildSessionLabel(session),
    x: session.points.map((point) => point.timestamp),
    y: session.points.map((point) => point.enrollment_total),
    customdata: session.points.map((point) => [point.class_capacity, point.wait_tot, point.wait_cap]),
    hovertemplate:
      `Enrollment: %{y}<br>Capacity: %{customdata[0]}<br>Waitlist: %{customdata[1]}/%{customdata[2]}<br>%{x}<extra>${buildSessionLabel(session)}</extra>`,
  }));

  const hasSessionOverflow = sessionEntries.length > MAX_DEFAULT_SESSIONS;
  const hasOnlySingleSnapshot = selectedSessions.length > 0 && selectedSessions.every((session) => session.points.length <= 1);

  const toggleSession = (sessionKey) => {
    setSelectedSessionKeys((previousKeys) => (
      previousKeys.includes(sessionKey)
        ? previousKeys.filter((key) => key !== sessionKey)
        : [...previousKeys, sessionKey]
    ));
  };

  const selectVisibleSessions = () => {
    setSelectedSessionKeys((previousKeys) => {
      const mergedKeys = new Set(previousKeys);
      filteredSessions.forEach((session) => mergedKeys.add(session.session_key));
      return Array.from(mergedKeys);
    });
  };

  const clearSelections = () => {
    setSelectedSessionKeys([]);
  };

  return (
    <div className="enrollment-history-panel">
      <div className="enrollment-history-header">
        <h4>Enrollment History</h4>
        <p className="enrollment-history-caption">
          X-axis is snapshot time. Y-axis is enrolled students.
        </p>
      </div>

      {hasSessionOverflow && (
        <div className="enrollment-history-controls">
          <div className="enrollment-history-toolbar">
            <input
              className="enrollment-history-search"
              type="text"
              value={sessionQuery}
              onChange={(event) => setSessionQuery(event.target.value)}
              placeholder="Filter by section or instructor"
            />
            <button type="button" className="catalog-button" onClick={selectVisibleSessions}>
              Add Visible
            </button>
            <button type="button" className="catalog-button" onClick={clearSelections}>
              Clear
            </button>
          </div>
          <div className="enrollment-history-checklist">
            {filteredSessions.map((session) => {
              const sessionLabel = buildSessionLabel(session);
              return (
                <label className="enrollment-history-option" key={session.session_key}>
                  <input
                    type="checkbox"
                    checked={selectedSessionKeys.includes(session.session_key)}
                    onChange={() => toggleSession(session.session_key)}
                  />
                  <span>{sessionLabel}</span>
                </label>
              );
            })}
          </div>
        </div>
      )}

      {selectedSessions.length === 0 ? (
        <p className="enrollment-history-status">Select at least one session to plot enrollment history.</p>
      ) : (
        <Plot
          data={traces}
          layout={{
            autosize: true,
            margin: isMobileViewport
              ? { l: 44, r: 12, t: 12, b: 88 }
              : { l: 56, r: 24, t: 18, b: 64 },
            paper_bgcolor: 'transparent',
            plot_bgcolor: 'transparent',
            font: {
              color: plotFontColor,
              size: isMobileViewport ? 11 : 12,
            },
            xaxis: {
              title: isMobileViewport ? 'Time' : 'Snapshot time',
              type: 'date',
              gridcolor: gridColor,
              zerolinecolor: gridColor,
              automargin: true,
              tickfont: {
                size: isMobileViewport ? 10 : 12,
              },
              tickformat: isMobileViewport ? '%b %d<br>%I:%M %p' : undefined,
            },
            yaxis: {
              title: isMobileViewport ? 'Enroll.' : 'Enrollment',
              rangemode: 'tozero',
              gridcolor: gridColor,
              zerolinecolor: gridColor,
              automargin: true,
              tickfont: {
                size: isMobileViewport ? 10 : 12,
              },
            },
            legend: {
              orientation: 'h',
              y: isMobileViewport ? -0.42 : -0.28,
              x: 0,
              font: {
                size: isMobileViewport ? 10 : 12,
              },
            },
          }}
          config={{
            displayModeBar: false,
            responsive: true,
          }}
          useResizeHandler
          className="enrollment-history-plot"
          style={{ width: '100%', height: isMobileViewport ? '360px' : '430px' }}
        />
      )}

      {hasOnlySingleSnapshot && (
        <p className="enrollment-history-caption">
          Only one snapshot is available so far for the selected sessions.
        </p>
      )}
    </div>
  );
}


export default EnrollmentHistoryPanel;
