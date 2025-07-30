import "./pagecss/Signuppage.css"
import backgroundimage from "../assets/backgroundclouds.jpg"
import { Button } from "@mui/material"
import { useState} from "react"
import axios from "axios"
import { useNavigate } from "react-router-dom"
export function SignUp(){
    const [username,setUsername] = useState('')
    const [password,setPassword]  = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [email,setEmail] = useState('')
    const [accountExist,setAccountExist] = useState(false)
    
    const navigate = useNavigate();

    const createAccount = async(event) =>{
        
        const data = {
            username: username,
            password: password,
            email: email
        };

        try{
            const response = await axios.post("http://localhost:5000/api/signup",{
                username,
                password,
                email
            })
            navigate("/Login")
            console.log("Login Successful")
        }catch (event){
            setAccountExist(true)
            console.log(event)
        }
    }
    const validForm = username.trim().length >=3 && 
                    password.trim().length >=6 && 
                    email.trim().includes('@') && 
                    password === confirmPassword;
    return(
        <>
            <div className="wrapper" style={{
                backgroundImage:`url(${backgroundimage})`,
                backgroundRepeat:"no-repeat",
                backgroundSize:"cover"
                
            }}>
                <form className="signup-form">
                    <h1 style={{color:"Black"}}>Sign Up</h1>
                    <div className="username">
                        <h2>Name</h2>
                        <input type="text" placeholder="e.g. Jones Hill" name="username" onChange={async (e)=>
                                setUsername(e.target.value)
                            }>
                        </input>
                        {username.length<3 && username.length!==0 && (
                            <div>Username needs to be 3 or more letters</div>
                        )}
                    </div>
                    <div className = "email">
                        <h2>Email</h2>
                        <input placeholder="e.g. jones.hill78@gmail.com" name="email" type="email" onChange={async (e)=>
                                    setEmail(e.target.value)
                        }/>
                        {!email.includes('@') && email.length>0 && (
                            <div>Your email must have an @ in it</div>
                        )}
                    </div>
                    <div className="password">
                        <h2>Password</h2>
                        <input placeholder="e.g. •••••••••" type="password" name="password" onChange={(e)=>setPassword(e.target.value)}/>
                    </div>
                    <div className="confirm-password" style={{marginBottom:"0.5rem"}}>
                        <h2>Confirm Password</h2>
                        <input placeholder="e.g. •••••••••" type="password" name="confirm-password" onChange={(e)=>{
                            setConfirmPassword(e.target.value)
                        }}/>
                        {password.trim().length<6 && password.trim().length !== 0 && (
                            <div>Password must be minimum of 6 characters</div>
                        )}
                        {(password!==confirmPassword) && password.length>=6 && confirmPassword.length >0 && (
                            <div>Passwords do not match!</div>
                        )}
                        {password===confirmPassword && password.length>=6 && confirmPassword.length>0 &&(
                            <div>Passwords match!</div>
                        )}
                    </div>
                    {accountExist && (
                        <div>There is an account associated to this email!</div>
                    )}
                    <div>
                        <Button className="create-new-account" disabled={!validForm} onClick={()=>createAccount()}>Sign Up</Button>
                    </div>
                    
                </form>
            </div>
        </>
    )
}