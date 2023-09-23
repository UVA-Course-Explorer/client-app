import React, { useState, useEffect, useCallback} from 'react';
import { useParams} from 'react-router-dom';


import './Catalog.css'

function CatalogPage() {
    const { department } = useParams();

    const [data, setData] = useState(null);

// Define fetchCatalogIndexData using useCallback
const fetchCatalogIndexData = useCallback(async () => {
  try {
    const response = await fetch(`https://uva-course-explorer.github.io/json/${department}.json`);
    const jsonData = await response.json();
    setData(jsonData);
  } catch (error) {
    console.error('Error fetching data:', error);
  }
}, [department]); // Include department in the dependency array
  
    useEffect(() => {
      fetchCatalogIndexData();
    }, [fetchCatalogIndexData]);


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
                <td>{meeting.days}</td>
                <td>{meetingTimeString}</td>
                <td>{meeting.facility_descr}</td>
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
        return `https://sisuva.admin.virginia.edu/psp/ihprd/UVSS/SA/s/WEBLIB_HCX_CM.H_CLASS_SEARCH.FieldFormula.IScript_Main?catalog_nbr=${catalog_number}&subject=${subject}`
    }


    const getCourseForumLink = (subject, catalog_number) => {
      return `https://thecourseforum.com/course/${subject}/${catalog_number}`
    }

    // generate list of HTML elements
    // loop over the data and create a list of links
    const elements = [];
    if(data){
        for (const [subject, courseArr] of Object.entries(data)){
            elements.push(<h2>{subject}</h2>);
            for (const course of courseArr){
            const table = [];

            table.push(<tr className="title-header">
              <th colSpan="3" className='course-title'>{course.subject} {course.catalog_number}: {course.descr}</th>
              <th><a target="_blank" rel="noopener noreferrer" href={getSisLink(course.subject, course.catalog_number) }><button className="catalog-button">SIS</button></a></th>
              <th><a target="_blank" rel="noopener noreferrer" href={getCourseForumLink(course.subject, course.catalog_number)}><button className="catalog-button">theCourseForum</button></a> </th>

              </tr>);

            table.push(<tr className="column-names">
                <th>Section Type</th>
                <th>Section Number</th>
                <th>Instructor</th>
                <th>Enrollment</th>
                <th>Meeting Info</th>
            </tr>);


            for (const section of course.sessions){
                const classSectionString = section.topic !== null ? `${section.class_section} - ${section.topic}` : `${section.class_section}`;

                table.push(<tr>
                    <td>{section.section_type} ({section.units} units)</td>
                    <td>{classSectionString}</td>
                    <td>{generateInstructorHTML(section.instructors)}</td>
                    <td>{`${section.enrollment_total}/${section.class_capacity}`}</td>
                    
                    <td><table className='meeting-table'>
                    {generateMeetingTable(section.meetings)}</table>  </td>
                </tr>);
            }
                elements.push(
                <div className="custome-table-container">
                  <table className="custom-table">
                    <tbody>
                    {table}
                    </tbody>
                    </table>
                </div>);
                elements.push(<br/>);
                elements.push(<br/>);
                elements.push(<br/>);
        }
    }

  return (    
    <div className="header">
      <div>
        {/* <h1>{department}</h1> */}
        {elements}

      </div>
    </div>
  );
}
}
export default CatalogPage;
