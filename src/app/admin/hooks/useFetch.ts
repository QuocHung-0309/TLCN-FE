"use client";
import axios from "axios"
import { useEffect, useState } from "react"

interface FetchState<T> {
    data: T | null;
    error: string | null;
    loading: boolean;
  }

const useFetch =  <T = any>(url: string, token?: string): FetchState<T> => {

    const [data, setData] = useState<T | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(()=>{
        if(!url || !token) return;        

        const fetchData = async() => {
            setLoading(true)

            try {
                const res = await axios.get<T>(url, {
                    headers: token ? { Authorization: `Bearer ${token}` } : undefined
                });
                console.log("Fetched data:", res.data); 
                setData(res.data)
                setLoading(false)               

            } catch(err:any) {
                setError(err.response?.data?.message || err.message)
                setLoading(false)
            }
        }
        fetchData()
    }, [url, token])
    return {
        data, error, loading,
    }   
}

export default useFetch