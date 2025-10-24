import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthCallback = () => {
    const [authId, setAuthId] = useState(null); // Store the auth_id in state
    const navigate = useNavigate();

    useEffect(() => {
        //console.log("AuthCallback component mounted");

        const urlParams = new URLSearchParams(window.location.search);
        const retrievedAuthId = urlParams.get('auth_id');
        //console.log("Auth ID: ", retrievedAuthId);

        if (retrievedAuthId) {
            setAuthId(retrievedAuthId); // Store the auth_id in state
            localStorage.setItem('auth_id', retrievedAuthId);
            
            // Delay the navigation to ensure the redirect happens after processing
            setTimeout(() => {
                navigate('/'); // Redirect after auth_id is stored
            }, 100); // Small delay to allow state to update and localStorage to save
        }
    }, [navigate]);

    if (!authId) {
        return <div>Loading...</div>; // Show loading until auth_id is processed
    }

    //return <div>Logged in with Auth ID: {authId}</div>; // Temporary feedback to verify auth_id
};

export default AuthCallback;

