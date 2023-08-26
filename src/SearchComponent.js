import React, { useState} from "react";
import CourseResultComponent from './CourseResultComponent';

import sabreImage from './sabre.png';

function SearchComponent() {
  const [searchInput, setSearchInput] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const [academicLevelFilter, setAcademicLevelFilter] = useState("all");

  const [semesterFilter, setSemesterFilter] = useState("all");

  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault(); // Prevent the default Enter key behavior (usually adding a new line)
      handleSearch();
    }
};


const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth' // Optional: Adds smooth scrolling animation
  });
};


  function getSearchResults(data) {
    if (data && Array.isArray(data)) {
      const searchResults = data.map((result, index) => (
        <div key={index}>
          <CourseResultComponent  
            name={result.name}
            level={result.level}
            catalog_number={result.catalog_number}
            class_number={result.class_number}
            subject={result.subject}
            description={result.description}
            mnemonic={result.mnemonic}
            strm={result.strm}
            similarity_score={result.similarity_score}
            credits={result.credits}
            onMoreLikeThisClick={handleMoreLikeThisRequest}
          />
        </div>
      ));
      setIsLoading(false);
      return searchResults; // Return the populated array if data is available
    } else {
      setIsLoading(false);
      return []; // Return an empty array if data is not available or not an array
    }
  }

  const handleSearchInputChange = (event) => {
    setSearchInput(event.target.value);
  };

  const handleSearch = async () => {
    if(searchInput.length === 0) return; 
    setIsLoading(true);
    const response = await fetch("https://server-app.fly.dev/search", {
    // const response = await fetch("/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        'X-API-Key': process.env.SERVER_APP_API_KEY
      },
      body: JSON.stringify({ 
        searchInput: searchInput ,
        academicLevelFilter: academicLevelFilter,
        semesterFilter: semesterFilter
      }),
    });
      const data = await response.json();
      setSearchResults(getSearchResults(data)); 
  };

  const handleMoreLikeThisRequest = async (mnemonicInput, catalogNumberInput) => {
    setSearchInput(`More like ${mnemonicInput} ${catalogNumberInput}`);
    setIsLoading(true);
    const response = await fetch("https://server-app.fly.dev/similar_courses", {
    // const response = await fetch("/similar_courses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json", 
        'X-API-Key': process.env.SERVER_APP_API_KEY
      },
      body: JSON.stringify({
        mnemonic: mnemonicInput,
        catalog_number: catalogNumberInput,
        academicLevelFilter: academicLevelFilter,
        semesterFilter: semesterFilter
      })
    });

    const data = await response.json();
    setSearchResults(getSearchResults(data));
    scrollToTop();
  };



  const handleAcademicLevelFiterChange = (event) => {
    setAcademicLevelFilter(event.target.value);
  }

  const handleSemesterFilterChange = (event) => {
    setSemesterFilter(event.target.value);
  }


  const academicLevelFilterOptions = [
    { value: 'all', label: 'All' },
    { value: 'Undergraduate', label: 'Undergraduate' },
    { value: 'Graduate', label: 'Graduate' },
    { value: 'Law', label: 'Law' },
    { value: 'Graduate Business', label: 'Graduate Business'},
    { value: 'Medical School', label: 'Medical School'},
    {value: "Non-Credit", label: 'Non-Credit'}
  ]


  const semesterFilterOptions = [
    { value: 'all', label: 'All Semesters' },
    { value: "latest", label: "Only Fall 23"}
  ]
  
  return (
    <div>
      <div><textarea placeholder="What do you want to learn about?" value={searchInput} onKeyDown={handleKeyPress} onChange={handleSearchInputChange} /></div>
      <div><button onClick={handleSearch} style={{fontFamily:'Courier New', fontWeight:'bold'}}>Search</button></div>

      <div>
                <label htmlFor="dropdown">Academic Level:</label>
                <select id="dropdown" value={academicLevelFilter} onChange={handleAcademicLevelFiterChange}>
                {academicLevelFilterOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                  {option.label}
                  </option>))}

                </select>

                <label htmlFor="dropdown">Semester:</label>
                <select id="dropdown" value={semesterFilter} onChange={handleSemesterFilterChange}>
                    {semesterFilterOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
                  ))}
                </select>
      </div>

      <div>{isLoading && <img src={sabreImage} className="App-logo" alt="logo" />}</div>
      <div>{isLoading && <h5>Loading...</h5>}</div>
      <div>{searchResults}</div>
    </div>
  );

}
export default SearchComponent;