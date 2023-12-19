import React, { useState, useRef, useEffect, useCallback} from "react";
import { useNavigate, useLocation, useParams } from 'react-router-dom';

import CourseResultComponent from './CourseResultComponent';
import sabreImage from './sabre.png';
import './index.css'
import SampleSearches from "./SampleSearches";
import { latestSemsterName } from "./LatestSemester";


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
  const [semesterFilter, setSemesterFilter] = useState("latest");
  const [previousAcademicLevelFilter, setPreviousAcademicLevelFilter] = useState(academicLevelFilter);
  const [previousSemesterFilter, setPreviousSemesterFilter] = useState(semesterFilter);

  const navigate = useNavigate();
  const {query: encodedQuery} = useParams(); // fetch query from URL
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const encodedAcademicFilter = params.get('academicLevel');
  const encodedSemesterFilter = params.get('semester');

  const [shouldTriggerSearch, setShouldTriggerSearch] = useState(true);

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
        }, 1500); // Delay before erasing
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
      memoizedHandleSearch();
    }
  };



  // ping the server to wake it up
  // eslint-disable-next-line
  useEffect(() => {
    // This code will run when the component is first rendered
    const ping = async () => {
      try {
        const response = await fetch('https://server-app.fly.dev/helloWorld');
        if (response.ok) {
          await response.json();
        } else {
          // Handle the API error
          console.error('API request failed');
        }
      } catch (error) {
        console.error('An error occurred:', error);
      }
    };
    ping();
  }, []); // The empty dependency array ensures it runs only on the initial render


  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth' // Optional: Adds smooth scrolling animation
    });
  };

// eslint-disable-next-line
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


  stateRef.searchInput = searchInput;
  stateRef.semesterFilter = semesterFilter;
  stateRef.academicLevelFilter = academicLevelFilter;


// Define handleSearch using useCallback
const memoizedHandleSearch = useCallback(async () => {
  if (stateRef.searchInput.length === 0) {
    console.log("search input is empty");
    return;
  }
  setIsLoading(true);

  const encodedQuery = encodeURIComponent(searchInput);

  // const response = await fetch("/search", {
  const response = await fetch("https://server-app.fly.dev/search", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      searchInput: stateRef.searchInput,
      academicLevelFilter: stateRef.academicLevelFilter,
      semesterFilter: stateRef.semesterFilter,
      getGraphData: false,
    }),
  });
  const data = await response.json();
  const resultData = data["resultData"];
  setSearchResults(generateSearchResults(resultData));
  navigate(`/search/${encodedQuery}?academicLevel=${academicLevelFilter}&semester=${semesterFilter}`);
}, [searchInput, academicLevelFilter, semesterFilter, generateSearchResults, navigate]);



useEffect(() => {
  // if (!shouldTriggerSearch) {
  //   return;
  // }
  // Decode the query parameter when the component mounts
  if (encodedQuery) {
    const decodedQuery = decodeURIComponent(encodedQuery);
    // Set the searchQuery state to automatically populate the search field
    setSearchInput(decodedQuery);
  }
  if(encodedAcademicFilter){
    console.log("setting academic filter", encodedAcademicFilter);
    setAcademicLevelFilter(encodedAcademicFilter);
  }

  if(encodedSemesterFilter){
    console.log("setting semester filter", encodedSemesterFilter);
    setSemesterFilter(encodedSemesterFilter);
  }

  setTimeout(() => {
    // Code to execute after the delay
    console.log("triggering search");
    memoizedHandleSearch();
  }, 200);

  setShouldTriggerSearch(false);

}, [shouldTriggerSearch, memoizedHandleSearch, location.search]);




  const handleMoreLikeThisRequest = async (mnemonicInput, catalogNumberInput) => {
    scrollToTop();
    setSearchInput(`${mnemonicInput} ${catalogNumberInput}`);

    const encodedQuery = encodeURIComponent(`${mnemonicInput} ${catalogNumberInput}`);
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
    navigate(`/search/${encodedQuery}?academicLevel=${academicLevelFilter}&semester=${semesterFilter}`);
  };




  useEffect(() => {
    // This effect runs when the component mounts and any time the URL changes
    const handleUrlChange = async () => {
      const params = new URLSearchParams(location.search);
      const encodedQuery = params.get('query');
      const academicLevel = params.get('academicLevel');
      const semester = params.get('semester');
  
      if (encodedQuery) {
        const decodedQuery = decodeURIComponent(encodedQuery);
        setSearchInput(decodedQuery);
      }
  
      if (academicLevel) {
        setAcademicLevelFilter(academicLevel);
      }
  
      if (semester) {
        setSemesterFilter(semester);
      }
  
      // Only trigger search if there is a query
      if (encodedQuery) {
        setIsLoading(true);
        await memoizedHandleSearch();
        setIsLoading(false);
      }
    };
  
    handleUrlChange();
  }, [location.search, memoizedHandleSearch]); // Depend on location.search to re-run the effect when URL search params change

  


  useEffect(() => {
    // Update the previous filters when they change
    setPreviousAcademicLevelFilter(academicLevelFilter);
    setPreviousSemesterFilter(semesterFilter);
  }, [academicLevelFilter, semesterFilter]);

  // Trigger handleSearch when academicLevelFilter or semesterFilter changes
  useEffect(() => {
    if (academicLevelFilter !== previousAcademicLevelFilter || semesterFilter !== previousSemesterFilter) {
      memoizedHandleSearch();
    }
  }, [academicLevelFilter, semesterFilter, previousAcademicLevelFilter, previousSemesterFilter, navigate, memoizedHandleSearch]);

  const handleAcademicLevelFilterChange = (event) => {
    setAcademicLevelFilter(event.target.value);
  };

  const handleSemesterFilterChange = (event) => {
    setSemesterFilter(event.target.value);
  };


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
    { value: "latest", label: `Only ${latestSemsterName}`},
    { value: 'all', label: 'All Semesters' }
  ]
  

  return (
    <div>
      <div style={{position: 'relative'}}>
        <textarea placeholder={placeholderText} value={searchInput} onKeyDown={handleKeyPress} onChange={handleSearchInputChange} />
        <div className="character-count">
          {searchInput.length}/{maxLength}
        </div>
      </div>
      <div><button className={"searchButton"} onClick={memoizedHandleSearch}>Search</button></div>

      <div style={{ display: 'flex' , flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center'}}>
        <div>
          <select id="academicLevelDropdown" value={academicLevelFilter} onChange={handleAcademicLevelFilterChange}>
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