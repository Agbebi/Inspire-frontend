import React from 'react'
import { Navigate, Outlet, useLocation } from "react-router-dom";


function CheckAuth({ isAuthenticated, user, children }) {

    const location = useLocation()
    const slug = user.slug || user.subDomain

    if (
        !isAuthenticated &&
        !(location.pathname.includes('/login') || location.pathname.includes('/register') || location.pathname.includes('/find'))) {
        return (
            <Navigate to='/auth/school/find' />
        )
    }

    else if (isAuthenticated && ((location.pathname.includes('login')) || (location.pathname.includes('register')))) {
        if (user?.role === 'superadmin') {
            return <Navigate to='/superadmin/dashboard' />
        }

        else if (user?.role === 'teacher') {
            return <Navigate to={`/${slug}/teacher/dashboard`}/>
        }

        else if (user?.role === 'admin') {
            return <Navigate to={`/${slug}/admin/dashboard`}/>
        }
        else{
            return <Navigate to={`/${slug}/student/dashboard`}/>
        }
    }

     if (isAuthenticated && user?.role !== 'superadmin' && (location.pathname.includes('superadmin'))){
        return <Navigate to='/unauth-page'/>          
    } else if (isAuthenticated && user?.role !== 'teacher' && (location.pathname.includes('teacher'))){
        return <Navigate to='/unauth-page'/>          
    } else if (isAuthenticated && user?.role !== 'admin' && (location.pathname.includes('admin'))){
        return <Navigate to='/unauth-page'/>          
    }

    if (isAuthenticated && (user?.role === 'superadmin') && (location.pathname.includes('find-school'))){
        return <Navigate to='/superadmin/dashboard'/>
    };

    return <>{children}</>

}


export default CheckAuth