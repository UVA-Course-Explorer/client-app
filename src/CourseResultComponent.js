import React from 'react'
import './index.css'; // Import the CSS file


// TODO: move this to an environment variable that gets automatically changed
const latestSem = "1238"; // var used to get link to SIS

function mapNumberToSeasonWithMiddleDigits(number) {
  if (typeof number !== 'number' || number < 1000 || number > 9999) {
      return "N/A";
  }

  const lastDigit = number % 10;
  const middleDigits = Math.floor((number / 10) % 100);
  let result = '';
  switch (lastDigit) {
      case 8:
          result = "Fall ";
          break;
      case 2:
          result = "Spring ";
          break;
      case 1:
          result = "Winter ";
          break;
      case 6:
          result = "Summer ";
          break;
      default:
          result = "";
          break;
  }

  result += "'" + middleDigits.toString();
  return result;
}

const CourseResultComponent = (props) => {


  const handleMoreLikeThisButtonClick = () => {
    props.onMoreLikeThisClick(props.mnemonic, props.catalog_number);
  }

  // const getSisLink = () => {
  //   if(props.strm.toString() === latestSem){
  //     //search link
  //     return `https://sisuva.admin.virginia.edu/psp/ihprd/UVSS/SA/s/WEBLIB_HCX_CM.H_CLASS_SEARCH.FieldFormula.IScript_Main?catalog_nbr=${props.catalog_number}&subject=${props.mnemonic}`
  //   }
  //   //share link
  //   return `https://sisuva.admin.virginia.edu/psc/ihprd/UVSS/SA/s/WEBLIB_HCX_CM.H_CLASS_DETAILS.FieldFormula.IScript_Main?institution=UVA01&term=${props.strm}&class_nbr=${props.class_number}`
  // }

  const getLink = () => {

    const splitCatalog = props.catalog_number.split(".")[0];
    if(props.strm.toString() === latestSem){
      //search link
      return `/catalog/${props.group}/${props.mnemonic}/${splitCatalog}`
    }
    //share link
    return `https://sisuva.admin.virginia.edu/psc/ihprd/UVSS/SA/s/WEBLIB_HCX_CM.H_CLASS_DETAILS.FieldFormula.IScript_Main?institution=UVA01&term=${props.strm}&class_nbr=${props.class_number}`
}

  return (
    <React.Fragment>
      <div className="accordion" style={{paddingBottom:'20px'}}>
        <div className="accordion-item">
          <a href={getLink()} target="_blank" rel="noopener noreferrer" className="accordion-title">
            <div>
              <div className="accordion-title-content">
                {props.mnemonic} {props.catalog_number}: {props.name} ({props.level})
              </div>
            </div>
          </a>
          <div className="accordion-content">
            <div className='course-description'>{props.description}</div>



            <div style={{display: 'flex' , flexDirection: 'row', flexWrap: 'nowrap', justifyContent: 'space-between', alignItems: 'center'}}>
              <div className="search-info">Similarity Score: {props.similarity_score.toFixed(3)}</div>
              <div className="search-info">Credits: {props.credits}</div>
              <div className="search-info">Latest Sem: {mapNumberToSeasonWithMiddleDigits(props.strm)}</div>
            </div>
            <button className="moreLikeThisButton" onClick={handleMoreLikeThisButtonClick}>Find more like this</button>
          </div>
        </div>        
      </div>
    </React.Fragment>
  );
}

export default CourseResultComponent
