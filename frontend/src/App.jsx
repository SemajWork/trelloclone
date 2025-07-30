import "./App.css"
import {HashRouter as Router, Routes, Route, Navigate} from 'react-router-dom'
import {React, useEffect} from 'react'
import { Loginpage } from "./pages/Loginpage"
import { Taskboard } from "./pages/taskboard"
import { Layout } from "./Layout"
import { Setting } from "./pages/Setting"
import { Create } from "./pages/Create"
import { Home } from "./pages/Home"
import { SignUp } from "./pages/Signuppage"
import { ResetPassword } from "./pages/ResetPW"
import { Templates } from "./pages/Templates"
import MenuListComposition from "./components/MenuListComponsition"
import { Workspaces } from "./pages/Workspaces"
import { Boards } from "./pages/Boards"
import { AuthProvider } from "./components/Authentication"

export const App = () => {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/signup" element={<SignUp/>}/>
          <Route path="/Login" element={<Loginpage/>}/>
          <Route path="/reset-password" element={<ResetPassword/>}/>
          <Route path="/" element={<Navigate to="/Login"/>}/>
          <Route path="/Randshit" element={<MenuListComposition/>}/>
          
          <Route element={<Layout/>}>
            <Route path="/Boards/:id" element={<Boards/>}/>
            <Route path="/Workspaces" element={<Workspaces/>}/>
            <Route path="/Templates" element={<Templates/>}/>
            <Route path="/Home" element={<Home/>}/>
            <Route path="/Taskboard" element={<Taskboard/>}/>
            <Route path="/Setting" element={<Setting/>}/>
            <Route path="/Create" element={<Create/>}/>
          </Route>
        </Routes>
      </AuthProvider>
    </Router>
  )
}
