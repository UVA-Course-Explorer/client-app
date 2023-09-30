import React, { useState, useRef, useEffect} from "react";
import CourseResultComponent from './CourseResultComponent';

import sabreImage from './sabre.png';
import './index.css'
import SampleSearches from "./SampleSearches";


function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]]; // Swap elements
  }
}

const searchOptions = SampleSearches;
shuffleArray(searchOptions); // Shuffle the search options


function SearchComponent() {
  const [searchInput, setSearchInput] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [academicLevelFilter, setAcademicLevelFilter] = useState("all");
  const [semesterFilter, setSemesterFilter] = useState("all");

  const [placeholderText, setPlaceholderText] = useState('');
  const [currentOptionIndex, setCurrentOptionIndex] = useState(0);
  const typingSpeed = 50; // Adjust the typing speed (milliseconds per character)


  // Function to simulate typing for the current placeholder option
  const typeCurrentOption = () => {
    const currentOption = searchOptions[currentOptionIndex];
    let currentText = '';
    let currentIndex = 0;
    
    const interval = setInterval(() => {
      if (currentIndex < currentOption.length) {
        currentText = currentOption.substring(0, currentIndex + 1);
        setPlaceholderText(currentText);
      } else {
        clearInterval(interval);
        setTimeout(() => {
          eraseCurrentOption();
        }, 1000); // Delay before erasing
      }
      currentIndex++;
    }, typingSpeed);
  };

  // Function to erase the current placeholder option
  const eraseCurrentOption = () => {
    const currentOption = searchOptions[currentOptionIndex];
    let currentIndex = currentOption.length;
    const interval = setInterval(() => {
      if (currentIndex > 0) {
        const currentText = currentOption.substring(0, currentIndex - 1);
        setPlaceholderText(currentText);
      } else {
        clearInterval(interval);
        const prevIndex = currentOptionIndex;
        setCurrentOptionIndex((prevIndex + 1) % searchOptions.length); // Cycle to the next option
        setTimeout(() => {
        }, 800); // Delay before typing the next option
      }
      currentIndex--;
    }, typingSpeed);
  };

  // Define a ref to store the function
  const typeCurrentOptionRef = useRef();

  // Assign the function to the ref
  typeCurrentOptionRef.current = typeCurrentOption;

  useEffect(() => {
    typeCurrentOptionRef.current();
  }, [currentOptionIndex]);

  
  const stateRef = useRef();
  const maxLength = 500;

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
            group={result.group}
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
    const inputText = event.target.value;
    if (inputText.length <= maxLength) {
      setSearchInput(event.target.value);
    }
    
  };

  const handleSearch = async () => {
    if(searchInput.length === 0) return; 
    setIsLoading(true);

    // const response = await fetch("/search", {
    const response = await fetch("https://server-app.fly.dev/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ 
        searchInput: searchInput,
        academicLevelFilter: academicLevelFilter,
        semesterFilter: semesterFilter,
        getGraphData: false 
      }),
    });

    const data = await response.json();
    const resultData = data["resultData"];
    setSearchResults(generateSearchResults(resultData));
  };

  stateRef.semesterFilter = semesterFilter;
  stateRef.academicLevelFilter = academicLevelFilter;


  const handleMoreLikeThisRequest = async (mnemonicInput, catalogNumberInput) => {
    scrollToTop();
    setSearchInput(`${mnemonicInput} ${catalogNumberInput}`);
    setIsLoading(true);

    const response = await fetch("https://server-app.fly.dev/similar_courses", {
    // const response = await fetch("/similar_courses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        mnemonic: mnemonicInput,
        catalog_number: catalogNumberInput,
        academicLevelFilter: stateRef.academicLevelFilter,
        semesterFilter: stateRef.semesterFilter,
        getGraphData: false 
      })
    });

    const data = await response.json();
    const resultData = data["resultData"];
    setSearchResults(generateSearchResults(resultData));
  };


  useEffect(() => {
    handleSearch();
  }, [academicLevelFilter, semesterFilter]);


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
      <div style={{position: 'relative'}}>
        <textarea placeholder={placeholderText} value={searchInput} onKeyDown={handleKeyPress} onChange={handleSearchInputChange} />
        <div className="character-count">
          {searchInput.length}/{maxLength}
        </div>
      </div>
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
      <div>{isLoading && <h5 className={"loadingText"}>Loading...</h5>}</div>
      <div>{searchResults}</div>
    </div>
  );

}
export default SearchComponent;