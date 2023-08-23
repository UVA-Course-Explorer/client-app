import React, { useState } from 'react'


/*
name
level
catalog_number
class_number
subject
*/

const CourseResultComponent = (props) => {
  const [isActive] = useState(false);
  const [sessions] = useState([]);
  const [isLoading] = useState(false);


  const handleClick = async () => {
    console.log("clicked");
    // setIsActive(!isActive);
    // setIsLoading(true);
    // console.log("clicked");

    // const response = await fetch("/detailed_info", {
    //   method: "POST",
    //   headers: {
    //     "Content-Type": "application/json",
    //   },
    //   body: JSON.stringify({ catalog_number: props.catalog_number, mnemonic: props.mnemonic}),
    // });
    // const data = await response.json();
    // setIsLoading(false);

    // if (data && Array.isArray(data)) {
    //   const sessions = data.map((result, index) => (
    //     <div key={index}>
    //       <SessionResultComponent 
    //       instructor = {result.instructor}
    //       type = {result.type}
    //       location = {result.location}
    //       enrollment_capacity = {result.enrollment_capacity}
    //       current_enrolled = {result.current_enrolled}
    //       waitlist_capacity = {result.waitlist_capacity}
    //       current_waitlisted = {result.current_waitlisted}
    //       days = {result.days}
    //       start_time = {result.start_time}
    //       end_time = {result.end_time}
    //       />
    //     </div>
    //   ));
    //   console.log(sessions);
    //   setSessions(sessions);
    // }
  }
  
  
  return (
    <React.Fragment>
      <div className="accordion" style={{paddingBottom:'20px'}}>
        <div className="accordion-item">
          <div 
          className="accordion-title"
          onClick={handleClick}>
            <div>
              {props.subject} {props.catalog_number}: {props.name} ({props.level})
            </div>
            <div>{isActive ? '-' : '+'}</div>
          </div>
          <div className="accordion-content">
            <div style={{fontWeight:'bold'}}>Similarity Score: {props.similarity_score}</div>
            <div style={{fontWeight:'bold'}}>Credits: {props.credits}</div>
            <div>{props.description}</div>
          </div>
        </div>
        {isActive && <div className="accordion-content">
        <div>{isLoading && <h5>Detailed Info not Implemented Yet</h5>}</div> 
        {sessions} 
        </div>}
      </div>
    </React.Fragment>
  );
  
}

export default CourseResultComponent

