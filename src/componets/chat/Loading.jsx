

const Loading = ({
    children
}) => {
    return (
        <div className="flex gap-3">

            <div className="w-10 h-10 p-[2px] antialiased rounded-full border border-gray-500 flex">
                <img className="brightness-0 h-5 self-center" src="/logo.png" />
            </div>
            <span className="loading loading-dots loading-sm text-lightYellow"></span>
        </div>
    )
}

export default Loading
