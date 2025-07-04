import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { useNavigate } from "react-router-dom"
import { useState } from "react";

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'https://llmdemos.hyperpg.site/demo-backend';

const Login = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [user, setUser] = useState("");
    const [pass, setPass] = useState("");
    const [error, setError] = useState("");

    const handleSuccess = async (credentialResponse) => {
        // credentialResponse.credential contains the ID token
        const idToken = credentialResponse.credential;
        console.log('ID Token:', idToken);

        // Send this ID token to your FastAPI backend
        const response = await fetch(BACKEND_URL + '/google-login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ id_token: idToken }),
        });
        const data = await response.json();
        // Handle the response from your backend (e.g., store your app's JWT)
        console.log(data);
            // navigate('/chat');
    };

    return (
        <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
            <main className="flex flex-col gap-4 justify-start sm:items-center sm:text-center">
                <h1 className="text-6xl font-bold sm:hidden">Hyper-Y Chatbot</h1>
                <p className="text-xl text-center sm:text-sm sm:font-semibold">Select a service to Login</p>
                <div className="w-fit flex flex-col mx-auto mb-4 mt-8 gap-4 text-lg">
                    <GoogleLogin
                        onSuccess={handleSuccess}
                        onError={() => console.log('Login Failed')}
                    />
                </div>
            </main>
        </GoogleOAuthProvider>
    )
}

export default Login
