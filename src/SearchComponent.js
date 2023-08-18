import React, { useState } from "react";

export default function SearchComponent() {

    const [searchInput, setSearchInput] = useState("");

    const handleInputChange = (event) => {
        setSearchInput(event.target.value);
    };

    const handleKeyPress = (event) => {
        if (event.key === 'Enter') {
          event.preventDefault(); // Prevent the default Enter key behavior (usually adding a new line)
          handleSubmit();
        }
    };

    const handleSubmit = () => {
        console.log('Input value:', searchInput); // Log the input value
    };

  return (
    <div>
        <textarea value={searchInput} onChange={handleInputChange} onKeyDown={handleKeyPress} placeholder="What do you want to learn about?" />
        <div><button onClick={handleSubmit} style={{fontFamily:'Courier New', fontWeight:'bold'}}>Search</button></div>
    </div>
  )
}
