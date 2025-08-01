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
  
  const location = useLocation();
  const {query: encodedQuery} = useParams();
  const queryParams = new URLSearchParams(location.search);  
  const encodedAcademicFilter = queryParams.get('academicLevel');
  const encodedSemesterFilter = queryParams.get('semester');  
  
  
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


  // stateRef.searchInput = searchInput;
  stateRef.semesterFilter = semesterFilter;
  stateRef.academicLevelFilter = academicLevelFilter;


const memoizedHandleSearch = useCallback(async (shouldNavigate = true) => {
  if (searchInput.length === 0) {
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
      searchInput: searchInput,
      academicLevelFilter: academicLevelFilter,
      semesterFilter: semesterFilter,
      getGraphData: false,
    }),
  });
  const data = await response.json();
  const resultData = data["resultData"];
  setSearchResults(generateSearchResults(resultData));

  if (shouldNavigate) {
    navigate(`/search/${encodedQuery}?academicLevel=${academicLevelFilter}&semester=${semesterFilter}`);
  }
}, [searchInput, academicLevelFilter, semesterFilter, generateSearchResults, navigate]);




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


  
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (encodedAcademicFilter && encodedAcademicFilter !== academicLevelFilter) {
      setAcademicLevelFilter(encodedAcademicFilter);
    }
    
    if (encodedSemesterFilter && encodedSemesterFilter !== semesterFilter) {
      setSemesterFilter(encodedSemesterFilter);
    }
    
    if (encodedQuery && encodedQuery !== searchInput) {
      setSearchInput(encodedQuery);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [encodedQuery, encodedAcademicFilter, encodedSemesterFilter]);
  


  // This effect runs when searchInput, academicLevelFilter, or semesterFilter changes
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    // Only trigger the search if the encoded values match the current state
    if ((encodedAcademicFilter === academicLevelFilter) &&
        (encodedSemesterFilter === semesterFilter) &&
        (encodedQuery === searchInput)) {
      memoizedHandleSearch(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchInput, academicLevelFilter, semesterFilter]); // Add dependencies here

  

  return (
    <div>
      <div style={{position: 'relative'}}>
        <textarea placeholder={placeholderText} value={searchInput} onKeyDown={handleKeyPress} onChange={handleSearchInputChange} />
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