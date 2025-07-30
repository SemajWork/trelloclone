import { Link,Navigate,useNavigate,redirect} from "react-router-dom"
import './pagecss/Loginpage.css'
import { useState, useEffect, createContext, useContext, useMemo} from "react"
import { useAuth } from "../components/Authentication"
import axios from "axios"

import backgroundclouds from "../assets/backgroundclouds.jpg"

export function Loginpage(){
    const {login} = useAuth();
    const [username, setUsername] =useState('');
    const [password, setPassword] = useState(''); 
    const navigate = useNavigate();
    const [wrongPW,setWrongPW] = useState(false)
    
    const handleLogin = async (event) =>{
        
        const result = await login(username,password);
        if(result.success === true){
            setWrongPW(false);
            navigate("/Home");
        }else{
            setWrongPW(true);
            console.log(result.error)
        }
    };
    return(
        <>  
            <div className="wrapper" 
                style={{
                    backgroundImage: `url(${backgroundclouds})`,
                    backgroundRepeat: "no-repeat",
                    backgroundSize: "cover"
                }}
            >
                <form className="form-section">
                    <div className="login-text">
                        Welcome to Brello
                    </div>
                    <div>
                        <input 
                        type="text" 
                        placeholder="Username" 
                        name="username" 
                        className="username-field"
                        value={username}
                        onChange={(e)=>{setUsername(e.target.value)}}/>
                    </div>
                    <div>
                        <input 
                        type="password" 
                        placeholder="Password" 
                        name="password" 
                        className="password-field"
                        value={password}
                        onChange={(e)=>{setPassword(e.target.value)}}/>
                    </div>
                    {wrongPW && (
                        <div>Wrong Username or Password!</div>
                    )}
                    <div>
                        <label>
                            <input type="checkbox"/>
                            Remember me
                        </label>
                        <div className="forgot-pw">Forgot your password? <Link to="/reset-password" >Reset it.</Link></div>
                        
                    </div>
                    <div>
                        <button 
                        type="button"
                        className="login-button"
                        onClick={()=>{if(username.trim().length > 0 && password.trim().length>0) {handleLogin()} else{setWrongPW(true)}}}
                        >Login</button>
                    </div>
                    <div>
                        <Link to="/signup"className="create-account">Don't have an account? Create one</Link>
                    </div>
                </form>
            </div>
        </>
    )
}