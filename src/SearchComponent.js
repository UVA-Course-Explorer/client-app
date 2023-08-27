import React, { useState, useRef} from "react";
import CourseResultComponent from './CourseResultComponent';
import PlotlyGraph from './PlotlyGraph';

import sabreImage from './sabre.png';
import './index.css'

function SearchComponent() {
  const [searchInput, setSearchInput] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [academicLevelFilter, setAcademicLevelFilter] = useState("all");
  const [semesterFilter, setSemesterFilter] = useState("all");
  const [graph, setGraph] = useState(null); // state variable to store plotly graph
  const [isAboveThreshold, setIsAboveThreshold] = useState(false);

  const stateRef = useRef();

  const threshold = 768;


  const checkScreenSize = () => {
    const screenWidth = window.innerWidth;
    // const threshold = 768; // Adjust this threshold as needed
    setIsAboveThreshold(screenWidth > threshold);
  };

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


// function generateGraph(data, queryCoordinates) {
//   return <PlotlyGraph>data={data} queryCoordinates={queryCoordinates}</PlotlyGraph>;
// }


  function generateSearchResults(data) {
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
            academicLevelFilter={academicLevelFilter}
            semesterFilter={semesterFilter}/>
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

    // setGetGraph(window.innerWidth > threshold);
    // console.log("getGraph", getGraph);
    checkScreenSize();


    if(searchInput.length === 0) return; 
    setIsLoading(true);
    // const response = await fetch("https://server-app.fly.dev/search", {
    const response = await fetch("/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ 
        searchInput: searchInput,
        academicLevelFilter: academicLevelFilter,
        semesterFilter: semesterFilter,
        getGraphData: isAboveThreshold 
      }),
    });



    const data = await response.json();
    const resultData = data["resultData"];
    setSearchResults(generateSearchResults(resultData));

    if (isAboveThreshold) {
      setGraph(
        <PlotlyGraph data={data} />)
    }
    else {
      setGraph(null);
    }
  };

    stateRef.semesterFilter = semesterFilter;
    stateRef.academicLevelFilter = academicLevelFilter;


  const handleMoreLikeThisRequest = async (mnemonicInput, catalogNumberInput) => {
    checkScreenSize();
    // setGetGraph(window.innerWidth > threshold);
    scrollToTop();
    setSearchInput(`More like ${mnemonicInput} ${catalogNumberInput}`);
    setIsLoading(true);

    // const response = await fetch("https://server-app.fly.dev/similar_courses", {
    const response = await fetch("/similar_courses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        mnemonic: mnemonicInput,
        catalog_number: catalogNumberInput,
        academicLevelFilter: stateRef.academicLevelFilter,
        semesterFilter: stateRef.semesterFilter,
        getGraphData: isAboveThreshold 
      })
    });

    const data = await response.json();
    const resultData = data["resultData"];
    setSearchResults(generateSearchResults(resultData));

    if (isAboveThreshold) {
      setGraph(<PlotlyGraph data={data} />);
    }
    else {
      setGraph(null);
    }

  };




  const handleAcademicLevelFiterChange = (event) => {
    setAcademicLevelFilter(event.target.value);
  }

  const handleSemesterFilterChange = (event) => {
    setSemesterFilter(event.target.value);
  }

  const academicLevelFilterOptions = [
    { value: 'all', label: 'All Academic Levels' },
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
      <div><button className={"searchButton"} onClick={handleSearch}>Search</button></div>

      <div style={{ display: 'flex' , flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center'}}>
        <div>
          <select id="academicLevelDropdown" value={academicLevelFilter} onChange={handleAcademicLevelFiterChange}>
          {academicLevelFilterOptions.map((option) => (
            <option key={option.value} value={option.value}>
            {option.label}
            </option>))}

          </select>        
        </div>

        <div>
          <select id="semesterDropdown" value={semesterFilter} onChange={handleSemesterFilterChange}>
              {semesterFilterOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
            ))}
          </select>
        </div>
      </div>



      <div>{isLoading && <img src={sabreImage} className="App-logo" alt="logo" />}</div>
      <div>{isLoading && <h5>Loading...</h5>}</div>

      <div className="plotlyContainer">
        <div className="plotlyContainer">{graph}</div>
      </div>
      <div>{searchResults}</div>


    </div>
  );

}
export default SearchComponent;