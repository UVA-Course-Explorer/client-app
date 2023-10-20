import Modal from 'react-modal';
import React, { useState} from "react";
import Catalog from './Catalog';
import SearchComponent from './SearchComponent';
import CatalogPage from './CatalogPage';
import './modalStyles.css'
import {latestSemester} from './LatestSemester';
import AllSemesters from './AllSemesters';

function PageTemplate(props){
    
  const [isModalOpen, setIsModalOpen] = useState(false);

  Modal.setAppElement('#root');

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const renderTarget = props.target;
  console.log(renderTarget);
  let content;

  if (renderTarget === "search"){
    content = <SearchComponent/>;
  } else if (renderTarget === "catalog"){
    content = <Catalog/>;
  }
  else if (renderTarget === "catalog-page"){
    content = <CatalogPage/>;
  }

  else if(renderTarget === "catalog-semester-list"){
    content = <AllSemesters/>;
  }
  



  return (
    <div className="App">
      <header className="App-header">

        { renderTarget !== "catalog-page" && <button onClick={openModal} className="fixed-button" style={{textAlign: "center"}}><span className='info-character'>i</span></button>}
      
        <div className="modal-background">
        <Modal
          isOpen={isModalOpen}
          onRequestClose={closeModal}
          contentLabel="Example Modal"
          className="modal">
  
          <div className='scroll-div'>
            <h2 className="modal-content">Info</h2>
            <span className="modal-content">
              UVA Course Explorer is an AI-powered search engine and catalog for UVA courses.    
            </span>
            <br></br><br></br>

            <span>With the search engine, you can search for courses using natural language. Example queries include: </span>
            <br></br><br></br>
            <li>How has music evolved over time? 🎹</li>
            <li>What happened before the Big Bang? 💥</li>
            <li>How will artificial intelligence impact society? 🤖</li>

            <br></br>
            <span>You can also search for a specific class with its department and course number (CS 1110). We have indexed courses from previous semesters dating back to Fall 2021. <b>Disclaimer</b>: We log search queries, but do not save any user-specific information.</span>
            
            <br></br>
            <br></br>

            <span>Our catalog contains course information for all semesters since Summer 2020. We are currently updating the 2024 Spring catalog hourly and the 2024 J-Term catalog daily.</span>
            <br></br>
            <br></br>


            If you have any questions or feedback, please reach out to us through this <a href="https://forms.gle/Jq2di8Zji4tDNKZF8" className="modal-link">form</a>. 
            For a technical overview of the project, a discussion of its limitations, and planned future features, please refer to our <a href="https://github.com/UVA-Course-Explorer" className="modal-link">GitHub</a>.
            
            <br></br> <br></br>
            We hope you find this tool useful 😊.
          </div>
          <div>
            <button onClick={closeModal} className="close-button">X</button>
          </div>
        </Modal>
        </div>

        <p>***The OpenAI API we use to generate embeddings for our search has been unfortunately been down since 8:00 PM. As a result, our search page is not working for natural language searches. <br></br><br></br>You can still search for specific classes by using the department abbreviation and catalog number(e.g. CS 2120). <br></br>You can view the status of the API here: <br></br> <br></br><a href="https://status.openai.com/">https://status.openai.com/</a></p>
          
          <p></p>

        <p className="App-Title">UVA Course Explorer</p>


        <div className="nav-bar">
          <a className={`nav-button ${renderTarget === 'search' ? 'underlined' : ''}`} href="/search">Search</a>
          <a className={`nav-button ${renderTarget === 'catalog' || renderTarget === 'catalog-page' || renderTarget === 'catalog-semester-list' ? 'underlined' : ''}`} href={`/catalog/${latestSemester}`}>Catalog</a>
        </div>
        {content}
      </header>
    </div>
  );
}

export default PageTemplate;