import {React,useState} from 'react'
import Button from '@mui/material/Button'
import { useNavigate } from 'react-router-dom'
import "./componentscss/PopupForm.css"
import {v4 as uuid} from 'uuid';

export const PopupForm = ({onClose}) => {
    const navigate = useNavigate();
    const [workspaceName,setWorkspaceName] = useState('');
    const [isEmpty,setIsEmpty] = useState(false);

    const naviToBoards = () =>{
        if(workspaceName.trim().length>0){
            // Generate unique board ID
            const boardId = uuid();
            
            // Create new board data
            const newBoard = {
                id: boardId,
                name: workspaceName.trim(),
                date: new Date().toISOString(),
                starred: false
            };
            
            // Add to master list of boards
            const allBoards = JSON.parse(localStorage.getItem('allBoards') || '[]');
            allBoards.push(newBoard);
            localStorage.setItem('allBoards', JSON.stringify(allBoards));
            
            // Initialize empty board data
            const initialBoardData = {
                tasks: {},
                columns: {},
                columnOrder: []
            };
            localStorage.setItem(`Boards_${boardId}`, JSON.stringify(initialBoardData));
            
            navigate(`/Boards/${boardId}`);
            onClose();
            
        }else{
            setIsEmpty(true);
        }
    };
    return (
        <form className="create-popup">
            <h1 style={{
                fontSize: 25
            }}>Create a new Workspace</h1>
            <h3 style={{
                fontSize: 15,
                marginTop:0
            }}>Boost your productivity by making it easier 
            for everyone to access boards in one location</h3>

            <p style={{fontWeight:"bold"}}>Workspace name</p>
            <input maxLength="10" type="text" id="workspace-name"

            onChange={(e)=>setWorkspaceName(e.target.value)}></input>

            {isEmpty && <p style={{color:"red",marginTop: 0}}>This field is required!</p>}
            {/* will appear if workspace name isnt filled out */}
            <p style={{
                marginTop:6,
                fontSize:13,
                color:'gray'
            }}>This is the name of your company, team or organization.</p>
            {/* This would be dropdownmenu asking Workspace Type */}
            <p style={{
                marginBottom:6
            }}>Workspace type</p>
            <button>Choose...</button>
            <p><span style={{fontWeight:"bold"}}>Workspace description</span> <span style={{color:'gray'}}>Optional</span></p>
            <textarea type="text" placeholder="Our team organizes everything here." className="workspace-description" id="workspace-description">
            </textarea>
            <p style={{
                fontSize:13,
                color:'gray',
                marginTop:6,
                
            }}>Get your members on board with a few words about your Workspace.</p>

            <Button className="continue-button"
            onClick={naviToBoards}>Continue</Button>
        </form>
  )
}
