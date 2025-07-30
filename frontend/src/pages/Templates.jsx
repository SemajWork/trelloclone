import React, { useState,useEffect } from 'react';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import { useNavigate } from 'react-router-dom';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import GoTopButton from '../components/GoTopButton';
import './pagecss/Templates.css';
import { PopupForm } from '../components/PopupForm';
import ClickAwayListener from '@mui/material/ClickAwayListener';
const categories = [
  "Business", "Design", "Education", "Engineering", "Marketing",
  "HR & Operations", "Personal", "Productivity", "Product management",
  "Project management", "Remote work", "Sales", "Support", "Team management"
];

const templates = [
  {
    title: "Project Tracker",
    desc: "Track your projects with ease.",
    img: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=400&q=80"
  },
  {
    title: "Content Calendar",
    desc: "Plan and schedule your content.",
    img: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80"
  },
  {
    title: "Team Tasks",
    desc: "Collaborate and manage team tasks.",
    img: "https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&w=400&q=80"
  },
  {
    title: "Personal Goals",
    desc: "Organize your personal goals.",
    img: "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=400&q=80"
  }
];

export const Templates = () => {
  const [filteredData, setFilteredData] = useState([]);
  const [isVisible,setIsVisible] = useState(false);
  const navigate = useNavigate();

  const handleFilter = (event) => {
    const searchInput = event.target.value;

    const newFilter = categories.filter((value) => {
      return value.toLowerCase().includes(searchInput.toLowerCase());
    });
    setFilteredData(newFilter)
  }
  
  const goToPosition = (category) => {
    const element = document.getElementById(category);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  useEffect(() =>{
        const handleEvent= (event) =>{
            if(event.key === "Escape"){
                setIsVisible(false);
            }
        };
        addEventListener("keydown",handleEvent);
        return () => removeEventListener("keydown",handleEvent);
  },[]);
  const showCreate = () =>{
        setIsVisible(true); //shows the create popup 
  }
  return (
    <div className="workspace-container">
      <header className="workspace-header">
        <h1>Templates</h1>
        <p>Explore some of Brello's preset templates.</p>
      </header>
      
      <div className="workspace-main">
        <aside className="workspace-sidebar">
          <input type="text" placeholder="Find templates" className="find-templates" onChange={handleFilter}/>
          <Stack direction="column" spacing={1} className="category-stack">
            {categories.map(cat => (
              <Button key={cat} variant="text" className="category-btn" 
              onClick={()=>goToPosition(cat)}
              >{cat}</Button>
            ))}
          </Stack>
        </aside> 
        <section className="workspace-templates">
          {(filteredData.length > 0 ? filteredData : categories).map((category, index) => (
            <div key={index} id={category}>
              <h1>{category}</h1>
              <div className="templates-grid">
                {templates.map((tpl, idx) => (
                  <div className="template-card" key={idx}>
                    <img src={tpl.img} alt={tpl.title} className="template-img" />
                    <div className="template-info">
                      <h3>{tpl.title}</h3>
                      <p>{tpl.desc}</p>
                      <Button variant="contained" size="small" className="use-template-btn" onClick={showCreate}>
                        Use Template
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </section>
        {!isVisible && <GoTopButton/>}
      </div>
      {isVisible && (
        <div className="popup-background">
          <ClickAwayListener onClickAway={() => setIsVisible(false)}>
            <div>
              <PopupForm onClose={()=>setIsVisible(false)}/>
            </div>
          </ClickAwayListener>
        </div>
      )}
    </div>
  );
};
