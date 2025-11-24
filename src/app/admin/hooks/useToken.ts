"use client";
import {useEffect, useState} from 'react'
 

export function useToken() {
    const [token, setToken] = useState<string|undefined>(undefined)
    
    useEffect(()=>{
        const stored = localStorage.getItem("accessToken")
        if (stored) setToken(stored)
        console.log("Loaded token:", stored)
    },[])

    return token
} 