import React from 'react';
import { useState } from 'react';



export default function Login() {
    const [username, setUsernmame] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit  =(event) => {
        event.preventDefault();

        console.log("Logging in");
    };

    return(
        <form onSubmit={handleSubmit}>
            <label>

                Username;
                <input 

                type="text" value={username} onChange={(e) => setUsername(e.target.value)}
                required
                />

            </label>

            <label>

                Password;
                <input 

                type="text" value={password} onChange={(e) => setPassword(e.target.value)}
                
                />

            </label>

            <button type="submit">Login</button>


        </form>
    );

}

