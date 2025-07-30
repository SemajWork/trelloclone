import { Link } from "react-router-dom"
import "./componentscss/Navbar.css"
import react from "../assets/react.svg"
import PFP from "../assets/PFP.jpg"
import GEARICON2 from "../assets/GEARICON2.png"
import Button from '@mui/material/Button';
import Avatar from "@mui/material/Avatar";
import Stack from "@mui/material/Stack";
import Icon from "@mui/material/Icon"
import NotificationsIcon from '@mui/icons-material/Notifications';
import AddIcon from '@mui/icons-material/Add';
import Dropdown from "./Dropdown"
import MenuListComposition from "./MenuListComponsition"
import { useNavigate } from "react-router-dom"
import { Templates } from "../pages/Templates"
import { PopupForm } from "./PopupForm"
import { useState,useEffect } from "react"
import ClickAwayListener from '@mui/material/ClickAwayListener';
export function Navbar(){
    const navigate = useNavigate();
    const [isVisible,setIsVisible] = useState(false);
    
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
        setIsVisible(!isVisible); //shows the create popup 
    }
    return(
        <>
            <div className="nav">
                <div className="nav-left">
                    <Link to="/Home">
                        <img src={react}/>
                    </Link>
                    <Button onClick={()=>{navigate("/Templates")}}>Templates</Button>
                    <Button onClick={()=>{navigate("/Workspaces")}}>Workspaces</Button>
                    <Button>Starred</Button>
                    <Button onClick={showCreate} className="create-button" style={{backgroundColor:"#1A8BF1",color:"white"}}>
                            Create
                    </Button>
                </div>
                
                <div className="nav-right">
                    <Stack direction={"row"} spacing={0} alignItems={"center"}>
                        <input type="text" className="search-bar"/>
                        
                        <Button >
                            <span className="to-notif">
                                <NotificationsIcon />
                            </span>
                        </Button>
                        <Button>
                            <MenuListComposition/>
                        </Button>
                    </Stack>
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

