import addIcon from '../assets/add.svg';
import chatStyles from './Chat.module.css';

const Chat = () => {
  return (
    <div className={`${chatStyles['chat-grid']} py-6 font-poppins`}>
      <section className={`${chatStyles.chat} flex flex-col gap-2 px-6`}>
          <span className="bg-lightYellow rounded-md px-4 py-2 w-fit self-end">What is YMCA?</span>
        <div className="flex gap-3">

            <div className="w-10 h-10 p-[2px] antialiased rounded-full border border-gray-500 flex">
              <img className="brightness-0 h-5 self-center" src="/logo.png" />
            </div>
          <span className="bg-[#F5F5F5] rounded-md px-4 py-2 max-w-[75%]">YMCA is the oldest and one of the largest youth organisations in the world. Its goal is to be the global youth empowerment organisation of choice: empowering, inspiring and mobilising young people to find and share their voice on the issues that matter to them and to the world.</span>
        </div>

      </section>
      <section className={`${chatStyles['suggestions']} gap-2 px-5 pb-1 w-2/3 justify-self-center`}>
        <p className="w-full text-sm pb-1">Ask your question in chat or select the following options to start from:</p>
        <div className="flex flex-wrap text-sm gap-2">
          <span className="px-4 py-2 bg-lightYellow text-black rounded-md cursor-pointer hover:bg-yellow">
            What is YMCA?
          </span>
          <span className="px-4 py-2 bg-lightYellow text-black rounded-md cursor-pointer hover:bg-yellow">
            YMCA locations in Europe
          </span>
          <span className="px-4 py-2 bg-lightYellow text-black rounded-md cursor-pointer hover:bg-yellow">
            YMCA locations in Italy
          </span>
        </div>
      </section>
      <section className={`${chatStyles['new-message']} flex justify-center py-2`}>
        <div className="avatar">
          <div className="w-10 h-10 rounded-full">
            <img src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp" />
          </div>
        </div>
        <div className="join gap-1 items-center bg-[#EBEBEB] text-[#747775] px-3 mx-2 w-2/3">
          <input type="text" placeholder="New Message" className="w-full p-2 bg-transparent outline-none" />
          <img src={addIcon} alt="" className="w-6 h-6 cursor-pointer" />
        </div>
      </section>
    </div>
  )
}

export default Chat;
