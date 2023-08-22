import React, { useState, useEffect } from 'react';
import CourseResultComponent from './CourseResultComponent';
import sabreImage from './sabre.png';


export default function SearchComponent() {



  const [members, setMembers] = useState([]);
  useEffect(() => {
    async function fetchMembers() {
      try {
        const response = await fetch('/members'); // Adjust the URL to your Flask backend URL
        const data = await response.json();
        setMembers(data.members);
        console.log('Members fetched:', data.members);
      } catch (error) {
        console.error('Error fetching members:', error);
      }
    }

    fetchMembers();
  }, []);



  const [searchInput, setSearchInput] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);


  const handleInputChange = (event) => {
      setSearchInput(event.target.value);
  };


  const handleKeyPress = (event) => {
      if (event.key === 'Enter') {
        event.preventDefault(); // Prevent the default Enter key behavior (usually adding a new line)
        handleSubmit();
      }
  };

  const handleSubmit = async () => {
      setIsLoading(true);
      const response = await fetch("/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ searchInput }),
      });
      const data = await response.json();
      setIsLoading(false);
      if (data && Array.isArray(data)) {
        console.log(data);
        const searchResults = data.map((result, index) => (
          <div key={index}>
            
            <CourseResultComponent  
              name={result.name}
              level={result.level}
              catalog_number={result.catalog_number}
              class_number={result.class_number}
              subject={result.subject}
              description = {result.description}
              mnemonic = {result.mnemonic}
              similarity_score = {result.similarity_score}
              credits = {result.credits}
            />
          </div>
        ));
        setSearchResults(searchResults);
      }
  };


  return (
    <div>
        <textarea value={searchInput} onChange={handleInputChange} onKeyDown={handleKeyPress} placeholder="What do you want to learn about?" />
        <div><button onClick={handleSubmit} style={{fontFamily:'Courier New', fontWeight:'bold'}}>Search</button></div>
        <div>{isLoading && <img src={sabreImage} className="App-logo" alt="logo" />}</div>
        <div>{isLoading && <h5>Running the OpenAI Embedding Engine...</h5>}</div>
        <div>{searchResults}</div>
    </div>
  )
}


