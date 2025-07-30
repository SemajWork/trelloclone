import{
    Children,
    createContext,
    useContext,
    useEffect,
    useLayoutEffect,
    useState,
} from 'react'
import {useNavigate } from 'react-router-dom';
import axios from 'axios'

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext)

export const AuthProvider = ({children}) => {
    const [isLogged,setIsLogged] = useState(false)
    const navigate = useNavigate();
    const checkTokenValidity = async () => {
            try{
                const response = await axios.post('http://localhost:5000/api/refresh',{},{withCredentials: true});
                setIsLogged(true)
                return true;
            }catch(err){
                console.log("Refresh failed",err);
                setIsLogged(false)
                return false;
        }
    }
    const login = async (username,password) => {
        try{
            const response = await axios.post('http://localhost:5000/api/login', {username,password},{withCredentials: true});
            console.log('Login response',response.data);

            await checkTokenValidity();
            return {success: true};
        }catch(error){
            return {success:false, error};
        }
    };

    const logout = async () => {
        try{
            await axios.post('http://localhost:5000/api/logout',{}, {withCredentials: true});
        }catch(error){
            console.log(`${error} -- still clearing local state anyways`);
        }

        setIsLogged(false);
        navigate('/Login');
    }
    useEffect(() =>{
        checkTokenValidity()

        const interval = setInterval(()=>{
            checkTokenValidity();
        },240000);

        return () => clearInterval(interval);
    },[])
    

    return(
        <AuthContext.Provider value={{isLogged,setIsLogged, checkTokenValidity,login,logout}}>
            {children}
        </AuthContext.Provider>
    )
}