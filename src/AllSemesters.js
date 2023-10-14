import React, { useState, useEffect } from 'react';
import './Catalog.css';
import { Link } from 'react-router-dom';



function AllSemesters(){

    // fetch json list
    const [data, setData] = useState([]);
    const jsonLink = 'https://raw.githubusercontent.com/UVA-Course-Explorer/course-data/main/previousSemesters.json'; // Replace with your JSON link



    useEffect(() => {
        // Fetch the JSON data when the component mounts
        fetch(jsonLink)
          .then((response) => response.json())
          .then((jsonData) => setData(jsonData.reverse()))
          .catch((error) => console.error('Error fetching data:', error));
      }, []);


      console.log(data);
      // reverse the data so that the most recent semester is first
    
      return (
        <div>
          <h1>All Semesters</h1>
            {data.map((item) => (
                <Link to={`/catalog/${item.strm}`}><h2>{item.name}</h2></Link>

                // <h1><a href={`/catalog/${item.strm}`}>{item.name}</a></h1>
            ))}
        </div>
      );
}


export default AllSemesters;