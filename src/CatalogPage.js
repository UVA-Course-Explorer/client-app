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

    const generateMeetingString = (meetings) => {
        let meetingString = "";

        if ( !meetings || meetings[0]?.days === '-') {
            return "N/A";
        }
        for (const meeting of meetings){
            meetingString += `${meeting.days} ${meeting.start_time}-${meeting.end_time} at ${meeting.facility_descr}`;
        }
        return meetingString;
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
      // if(props.strm.toString() === latestSem){
        //search link
        return `https://sisuva.admin.virginia.edu/psp/ihprd/UVSS/SA/s/WEBLIB_HCX_CM.H_CLASS_SEARCH.FieldFormula.IScript_Main?catalog_nbr=${catalog_number}&subject=${subject}`
      // }
    //   //share link
    //   return `https://sisuva.admin.virginia.edu/psc/ihprd/UVSS/SA/s/WEBLIB_HCX_CM.H_CLASS_DETAILS.FieldFormula.IScript_Main?institution=UVA01&term=${props.strm}&class_nbr=${props.class_number}`
    // }
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
              <th colSpan="4" className='course-title'>{course.subject} {course.catalog_number}: {course.descr}</th>
              <th><a target="_blank" rel="noopener noreferrer" href={getSisLink(course.subject, course.catalog_number) }><button className="catalog-button">SIS</button></a></th>
              <th><a target="_blank" rel="noopener noreferrer" href={getCourseForumLink(course.subject, course.catalog_number)}><button className="catalog-button">theCourseForum</button></a> </th>

              </tr>);

            table.push(<tr className="column-names">
                <th>Section Type</th>
                <th>Section Number</th>
                <th>Instructor</th>
                <th>Enrollment</th>
                <th>Waitlist</th>
                <th>Meeting Information</th>
            </tr>);


            for (const section of course.sessions){

                table.push(<tr>
                    <td>{section.section_type}</td>
                    <td>{section.class_section}</td>
                    <td>{generateInstructorHTML(section.instructors)}</td>
                    <td>{`${section.enrollment_total}/${section.class_capacity}`}</td>
                    <td>{`${section.wait_tot}/${section.wait_cap}`}</td>
                    <td>{generateMeetingString(section.meetings)}</td>
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

export default CatalogPage;
