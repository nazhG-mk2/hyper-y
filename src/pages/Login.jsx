import facebookIcon from "../assets/facebook.svg"
import googleIcon from "../assets/google.svg"
import appleIcon from "../assets/apple.svg"
import emailIcon from "../assets/email.svg"

const Login = () => {

    const handleLogin = () => {
        window.location.href = '/chat'
    }

    return (
        <main className="flex flex-col gap-4 justify-start">
            <h1 className="text-6xl font-bold">Hyper-Y Chatbot</h1>
            <p className="text-xl">Select a service to Login</p>
            <div className="w-fit flex flex-col mb-4 mt-8 gap-4 text-lg">
                <button className="btn bg-blue text-white"
                    onClick={handleLogin}
                >
                    <img src={facebookIcon} alt="" />
                    Login with Facebook
                </button>
                <button className="btn border border-gray-700"
                    onClick={handleLogin}
                >
                    <img src={googleIcon} alt="" />
                    Login with Google
                </button>
                <button className="btn border border-gray-700"
                    onClick={handleLogin}
                >
                    <img src={appleIcon} alt="" />
                    Login with Apple
                </button>
                <button className="btn border border-gray-700"
                    onClick={handleLogin}
                >
                    <img src={emailIcon} alt="" />
                    Login with Email
                </button>
            </div>
            <p className="font-semibold">
                Don’t have an account?   <a href="/singup" className="text-yellow">Signup</a>
            </p>
        </main>
    )
}

export default Login