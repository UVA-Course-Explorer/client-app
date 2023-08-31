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

  const getSisLink = () => {
    if(props.strm.toString() === latestSem){
      //search link
      return `https://sisuva.admin.virginia.edu/psp/ihprd/UVSS/SA/s/WEBLIB_HCX_CM.H_CLASS_SEARCH.FieldFormula.IScript_Main?catalog_nbr=${props.catalog_number}&subject=${props.mnemonic}`
    }
    //share link
    return `https://sisuva.admin.virginia.edu/psc/ihprd/UVSS/SA/s/WEBLIB_HCX_CM.H_CLASS_DETAILS.FieldFormula.IScript_Main?institution=UVA01&term=${props.strm}&class_nbr=${props.class_number}`
  }

  return (
    <React.Fragment>
      <div className="accordion">
        <div className="accordion-item">
          <a href={getSisLink()} target="_blank" rel="noopener noreferrer" style={{color:'white'}}>
            <div className="accordion-title">
              <div>
                {props.mnemonic} {props.catalog_number}: {props.name} ({props.level})
              </div>
            </div>
          </a>
          <div className="accordion-content">
            <div style={{marginBottom: '1.5rem', textAlign:'left', paddingLeft:'1rem', paddingRight:'1rem'}}>{props.description}</div>
            <div style={{display: 'flex' , flexDirection: 'row', flexWrap: 'nowrap', justifyContent: 'space-between', alignItems: 'center'}}>
              <div style={{fontSize: '70%', fontWeight:'bold', marginLeft:'1rem', marginRight:'1rem'}}>Similarity Score: {props.similarity_score.toFixed(3)}</div>
              <div style={{fontSize: '70%', fontWeight:'bold', marginLeft:'1rem', marginRight:'1rem'}}>Credits: {props.credits}</div>
              <div style={{fontSize: '70%', fontWeight:'bold', marginLeft:'1rem', marginRight:'1rem'}}>Latest Sem: {mapNumberToSeasonWithMiddleDigits(props.strm)}</div>
            </div>
            <button className="moreLikeThisButton" onClick={handleMoreLikeThisButtonClick}>Find more like this</button>
          </div>
        </div>        
      </div>
    </React.Fragment>
  );
}

export default CourseResultComponent
