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
              UVA Course Explorer is a search engine and catalog for courses at the University of Virginia.  
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
            You can also explore a 2D visualization of the courses at UVA at this <a href="https://atlas.nomic.ai/map/1396b263-a4fe-4f30-9ce5-d29e63c7ef84/ac2a9fda-7273-42a2-80c3-4891c136ca97?xs=-34.64853&xf=35.80976&ys=-25.79601&yf=26.13196" className="modal-link">link</a>.
            <br></br>
            <br></br>

            <span>Our catalog contains course information for all semesters since Summer 2020. We are currently updating the 2025 Fall catalog every hour and the 2025 Summer catalog daily.</span>
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


        {/* <h6>
          The OpenAI API we use to process natural lanugage searches is down. As a result, you may be unable to submit natural language searches. You should still be able to search for courses by department and course number (CS 2130) and use the catalog. You can monitor status of the API here <a href="https://status.openai.com/">status.openai.com</a>. We are sorry for the inconvenience.
          </h6> */}
        
        <p className="App-Title">UVA Course Explorer</p>


        <div className="nav-bar">
          <a className={`nav-button ${renderTarget === 'catalog' || renderTarget === 'catalog-page' || renderTarget === 'catalog-semester-list' ? 'underlined' : ''}`} href={`/catalog/${latestSemester}`}>Catalog</a>
          <a className={`nav-button ${renderTarget === 'search' ? 'underlined' : ''}`} href="/search">Search</a>
        </div>
        {content}
      </header>
    </div>
  );
}

export default PageTemplate;