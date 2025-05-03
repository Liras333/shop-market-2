import { useState, useEffect } from 'react';

export function useProducts(searched = '', query = '') {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('')
    const [products, setProducts] = useState([]);

    useEffect(function () {
        async function fetchProducts() {
            try {
                setIsLoading(true);
                setError('');
                const res = await fetch(`https://api.escuelajs.co/api/v1/${query}`);
                const data = await res.json();

                if (!data.Response === 'false') throw new Error("Error in fetching data");

                setProducts(data);
            } catch (err) {
                setError(err.message)
            }
            finally {
                setIsLoading(false)
            }
        }
        fetchProducts();
    }, [searched, query, setProducts])

    return {isLoading, error, products}
}