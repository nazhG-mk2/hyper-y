import { useLayoutEffect } from 'react';
import { useNavigate } from "react-router-dom";

const StartScreen = () => {
    const navigate = useNavigate();
    useLayoutEffect(() => {

    }, [])

    return (
        <main className="w-full flex flex-col gap-4 justify-start sm:text-center sm:items-center">
            <h1 className="text-6xl sm:text-xl font-bold sm:hidden">Hyper-Y Chatbot</h1>
            <p className="text-xl sm:hidden">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
            <div className="w-fit flex flex-col mt-8">
                <span className="hidden sm:block mb-4 font-semibold">
                    Let’s Get Started!
                </span>
                <button className="px-8 md:px-4 py-4  mb-4 btn-primary md:bg-primary-soft md:border"
                    onClick={() => navigate('/login')}
                >
                    <span className="md:hidden">Login to Coninue</span>
                    <span className="hidden md:block font-poppins text-white">I already have an account</span>
                </button>
                {/* <button className="px-8 md:px-4 py-4 btn-secondary"
                    onClick={() => navigate('/singup')}
                >
                    <span className="md:hidden">Create new account</span>
                    <span className="hidden md:block font-poppins">Register a new account</span></button> */}
            </div>
        </main>
    )
}

export default StartScreen
