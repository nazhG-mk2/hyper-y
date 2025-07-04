import { GoogleOAuthProvider, GoogleLogin  } from '@react-oauth/google';
import { useNavigate, Link } from "react-router-dom"
import { useState } from "react";
import facebookIcon from "../assets/facebook.svg"
import googleIcon from "../assets/google.svg"
import appleIcon from "../assets/apple.svg"
import emailIcon from "../assets/email.svg"

const Login = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [user, setUser] = useState("");
    const [pass, setPass] = useState("");
    const [error, setError] = useState("");

    const handleLogin = (e) => {
        e.preventDefault();
        setError("");
        if (!user || !pass) {
            setError("User and password are required");
            return;
        }
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            navigate('/chat');
        }, 1200);
    }

    const handleSuccess = async (credentialResponse) => {
        // credentialResponse.credential contains the ID token
        const idToken = credentialResponse.credential;
        console.log('ID Token:', idToken);

        // Send this ID token to your FastAPI backend
        const response = await fetch('http://127.0.0.1:9000/google-login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ id_token: idToken }),
        });
        const data = await response.json();
        // Handle the response from your backend (e.g., store your app's JWT)
        console.log(data);
    };

    const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

    return (
        <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
            <main className="flex flex-col gap-4 justify-start sm:items-center sm:text-center">
                <h1 className="text-6xl font-bold sm:hidden">Hyper-Y Chatbot</h1>
                <p className="text-xl text-center sm:text-sm sm:font-semibold">Select a service to Login</p>
                <div className="w-fit flex flex-col mx-auto mb-4 mt-8 gap-4 text-lg">
                    {/* <button className="btn bg-blue-facebook hover:text-white text-white border-none"
                        onClick={handleLogin}
                        >
                        <img src={facebookIcon} alt="" />
                        Login with Facebook
                        </button> */}
                    <GoogleLogin
                        onSuccess={handleSuccess}
                        onError={() => console.log('Login Failed')}
                    />
                    {/* <button className="btn border border-gray-700 text-gray-950 bg-transparent"
                        onClick={handleLogin}
                        >
                        <img src={appleIcon} alt="" />
                        Login with Apple
                        </button> */}
                    {/* <button className="btn border border-gray-700 text-gray-950 bg-transparent"
                        onClick={handleLogin}
                        >
                        <img src={emailIcon} alt="" />
                        Login with Email
                    </button> */}
                </div>
                {/* <hr className="mb-4" />
                <div className="w-full max-w-xs mx-auto bg-white/80 rounded-lg shadow p-6 flex flex-col gap-3 border border-gray-200">
                <h2 className="text-lg font-semibold mb-2">Login with Email</h2>
                <form onSubmit={handleLogin} className="flex flex-col gap-3">
                <input
                type="text"
                className="input input-bordered !bg-stone-100 w-full"
                placeholder="User"
                value={user}
                onChange={e => setUser(e.target.value)}
                required
                />
                <input
                type="password"
                className="input input-bordered !bg-stone-100 w-full"
                placeholder="Password"
                value={pass}
                onChange={e => setPass(e.target.value)}
                required
                />
                {error && <div className="text-red-500 text-sm">{error}</div>}
                <button type="submit" className="btn text-white btn-primary hover:!bg-slate-600 w-full" disabled={loading}>
                {loading ? "Loading..." : "Login"}
                </button>
                </form>
                </div>
                <p className="font-semibold mt-8 -mb-10">
                Don't have an account?   <Link to="/singup" className="text-primary">Signup</Link>
                </p> */}
            </main>
        </GoogleOAuthProvider>
    )
}

export default Login
