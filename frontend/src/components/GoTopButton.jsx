import {React, useState, useEffect, useRef} from 'react'
import Button from '@mui/material/Button';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';

const GoTopButton = () => {

  const [showGoTop,setShowGoTop] = useState(false);

  const handleVisibleButton = () =>{ //will change state according to position of scrollbar
    setShowGoTop(window.pageYOffset > 50);
  }
  const handleScrollUp = () => {
    window.scrollTo( { left: 0, top: 0, behavior: 'smooth' } )
  }

  useEffect(()=>{ //will constantly check if the scroll is past or before 50px
    window.addEventListener("scroll",handleVisibleButton);
    return () =>{
      window.removeEventListener("scroll",handleVisibleButton);
    };
  },[]);
  return (
    <>
      <div
  onClick={handleScrollUp}
  style={{
    position: 'fixed',
    bottom: '2rem',
    right: '2rem',
    zIndex: 999, // High enough to be on top of all content
    opacity: showGoTop ? 1 : 0,
    pointerEvents: showGoTop ? 'auto' : 'none',
    transition: 'opacity 0.3s ease',
  }}
>
        <Button 
        variant="outlined"
        style={{
          background: "#2074d4",
          color:"white"
        }} 
        className="go-to-top">
          Go to the top <KeyboardArrowUpIcon/>
        </Button>
      </div>
    </>
  );
};

export default GoTopButton
