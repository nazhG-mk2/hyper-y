import facebookIcon from "../assets/facebook.svg"
import googleIcon from "../assets/google.svg"
import appleIcon from "../assets/apple.svg"
import emailIcon from "../assets/email.svg"

const SingUp = () => {

    const handleSingUp = () => {
        window.location.href = '/chat'
    }

    return (
        <main className="flex flex-col gap-4 justify-start">
            <h1 className="text-6xl font-bold">Hyper-Y Chatbot</h1>
            <p className="text-xl">Select a service to SignUp</p>
            <div className="w-fit flex flex-col mb-4 mt-8 gap-4 text-lg">
                <button className="btn bg-blue text-white"
                    onClick={handleSingUp}
                >
                    <img src={facebookIcon} alt="" />
                    Sign up with Facebook
                </button>
                <button className="btn border border-gray-700"
                    onClick={handleSingUp}
                >
                    <img src={googleIcon} alt="" />
                    Sign up with Google
                </button>
                <button className="btn border border-gray-700"
                    onClick={handleSingUp}
                >
                    <img src={appleIcon} alt="" />
                    Sign up with Apple
                </button>
                <button className="btn border border-gray-700"
                    onClick={handleSingUp}
                >
                    <img src={emailIcon} alt="" />
                    Sign up with Email
                </button>
            </div>
            <p className="font-semibold">
                Already have an account? <a href="/login" className="text-yellow">Login</a>
            </p>
        </main>
    )
}

export default SingUp
