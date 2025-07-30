import "./pagecss/Home.css"
import { useState,useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { PopupForm } from "../components/PopupForm";
import { ClickAwayListener } from "@mui/material";

export function Home(){
    const [allBoards,setAllBoards] = useState(()=>{
        const saved = localStorage.getItem('allBoards');
        return saved ? JSON.parse(saved) : [];
    });

    const [isVisible,setIsVisible] = useState(false);
    const showCreate = () =>{
        setIsVisible(!isVisible);
    }
    const [showAll, setShowAll] = useState(false);
    const navigate = useNavigate();
    const [showStarred,setShowStarred] = useState(false)
    // Sort boards by most recent first (by creation date or last accessed)
    const sortedBoards = [...allBoards].sort((a, b) => {
        const dateA = a.lastAccessed || a.createdAt || 0;
        const dateB = b.lastAccessed || b.createdAt || 0;
        return dateB - dateA;
    });

    // Get starred boards (sorted by most recent)
    const starredBoards = sortedBoards.filter(board => board.starred);
    const [showAllBoards,setShowAllBoards] = useState(false)

    const toggleShowAllBoards = () => {
        setShowAllBoards(!showAllBoards);
    };

    const toggleStarredSection = () => {
        setShowStarred(!showStarred);
    };

    // Toggle star status
    const toggleStar = (e, boardId) => {
        e.stopPropagation(); // Prevent board navigation when clicking star
        
        const updatedBoards = allBoards.map(board => {
            if (board.id === boardId) {
                return { ...board, starred: !board.starred };
            }
            return board;
        });
        
        setAllBoards(updatedBoards);
        localStorage.setItem('allBoards', JSON.stringify(updatedBoards));
    };

    // Navigate to board and update last accessed time
    const navigateToBoard = (boardId) => {
        const updatedBoards = allBoards.map(board => {
            if (board.id === boardId) {
                return { ...board, lastAccessed: Date.now() };
            }
            return board;
        });
        
        setAllBoards(updatedBoards);
        localStorage.setItem('allBoards', JSON.stringify(updatedBoards));
        navigate(`/Boards/${boardId}`);
    };

    return(
        <>  
        <div className="home-layout">
            <div className="sidebar">
                <div className="sidebar-header">
                    <h3>Menu</h3>
                </div>
                <div className="sidebar-menu">
                    <div className="menu-item" onClick={() => navigate('/Templates')}>
                        <div className="menu-icon">📋</div>
                        <div className="menu-text">Templates</div>
                    </div>
                    <div className="menu-item" onClick={() => navigate('/Workspaces')}>
                        <div className="menu-icon">🏢</div>
                        <div className="menu-text">Workspaces</div>
                    </div>
                    <div className="menu-item" onClick={() => navigate('/Setting')}>
                        <div className="menu-icon">⚙️</div>
                        <div className="menu-text">Settings</div>
                    </div>
                    <div className="menu-divider"></div>
                    <div className="menu-item">
                        <div className="menu-icon">📊</div>
                        <div className="menu-text">Activity</div>
                    </div>
                    <div className="menu-item" onClick={toggleStarredSection}>
                        <div className="menu-icon">⭐</div>
                        <div className="menu-text">Starred</div>
                    </div>
                </div>
            </div>

            <div className="main-content">
                <div className="welcome-section">
                    <h1>Welcome back!</h1>
                </div>
                
                <div className="home-page-container">
                    
                    {showStarred && starredBoards.length > 0 && (
                        <div className="section-container">
                            <h1 className="section-header">⭐ Starred</h1>
                            <div className="home-page">
                                {starredBoards.map((board,boardKey)=>{
                                    return (
                                        <div key={boardKey} className="board-card" onClick={()=>navigateToBoard(board.id)}>
                                            <div className="board-content">
                                                <div className="board-name">{board.name}</div>
                                                <div className="star-button starred" onClick={(e) => toggleStar(e, board.id)}>
                                                    ⭐
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {!showStarred && (<div className="section-container">
                        <h1 className="section-header">Recently Viewed</h1>
                        
                        <div className="home-page">
                            {sortedBoards.slice(0,4).map((board,boardKey)=>{
                                return (
                                    <div key={boardKey} className="board-card" onClick={()=>navigateToBoard(board.id)}>
                                        <div className="board-content">
                                            <div className="board-name">{board.name}</div>
                                            <div className={`star-button ${board.starred ? 'starred' : ''}`} onClick={(e) => toggleStar(e, board.id)}>
                                                {board.starred ? '⭐' : '☆'}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
)}
                    <div className="section-divider"></div>

                                    {!showStarred && (
                        <div className="section-container">
                                <h1 className="section-header">Your Workspaces 
                                    <span onClick={toggleShowAllBoards} className="view-all-boards">
                                        {showAllBoards ? 'Show Less' : 'View All Boards'}
                                    </span>
                                </h1>
                            <div className="home-page">
                                {sortedBoards.slice(0, showAllBoards ? sortedBoards.length : 7).map((board,boardKey)=>{
                                return (
                                    <div key={boardKey} className="board-card" onClick={()=>navigateToBoard(board.id)}>
                                        <div className="board-content">
                                            <div className="board-name">{board.name}</div>
                                            <div className={`star-button ${board.starred ? 'starred' : ''}`} onClick={(e) => toggleStar(e, board.id)}>
                                                {board.starred ? '⭐' : '☆'}
                                            </div>
                                        </div>
                                    </div>
                                );
                                })}
                                <div className="board-card create-board-card" onClick={showCreate}>
                                    <div className="create-board-content">
                                        <div className="create-icon">+</div>
                                        <div>Create New Board</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
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
        </>
    )
}