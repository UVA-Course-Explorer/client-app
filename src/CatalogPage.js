import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Link , useParams} from 'react-router-dom';

function CatalogPage() {
    const { department } = useParams();

    const [data, setData] = useState(null);

    async function fetchCatalogIndexData() {
      try {
        const response = await fetch(`https://uva-course-explorer.github.io/json/${department}.json`);
        const jsonData = await response.json();
        setData(jsonData);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    }
  
    useEffect(() => {
      fetchCatalogIndexData();
    }, []);


    console.log(data);


    const generateMeetingString = (meetings) => {
        let meetingString = "";

        if (meetings[0].days === '-') {
            return "N/A";
        }
        for (const meeting of meetings){
            meetingString += `${meeting.days} ${meeting.start_time}-${meeting.end_time} at ${meeting.facility_descr}\n`;
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

    // generate list of HTML elements
    // loop over the data and create a list of links
    const elements = [];
    if(data){
        for (const [subject, courseArr] of Object.entries(data)) {
            console.log(`${subject}: [${courseArr}]`);
            elements.push(<h2>{subject}</h2>);
            for (const course of courseArr){
                            // create a table
            
            elements.push(<h3>{course.mnemonic} {course.catalog_number}: {course.descr}</h3>)
            elements.push(<p>{course.description}</p>)
            const table = [];
            table.push(<tr>

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
                elements.push(<table>{table}</table>);

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
