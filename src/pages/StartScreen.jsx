
const StartScreen = () => {

    return (
        <main className="flex flex-col gap-4 justify-start">
            <h1 className="text-6xl font-bold">Hyper-Y Chatbot</h1>
            <p className="text-xl">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
            <div className="w-fit flex flex-col">
                <button className="px-8 py-4 bg-yellow rounded mb-4 mt-8"
                    onClick={() => window.location.href = '/login'}
                >Login to Coninue</button>
                <button className="px-8 py-4 text-black border border-yellow rounded"
                    onClick={() => window.location.href = '/singup'}
                >Create new account</button>
            </div>
        </main>
    )
}

export default StartScreen
