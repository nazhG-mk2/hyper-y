import { useRef, useState } from 'react';
import playIcon from '../assets/play.svg';
import chatStyles from './Chat.module.css';
import axios from 'axios';
import Question from '../componets/chat/Question';
import Response from '../componets/chat/Response';
import Suggestion from '../componets/chat/Suggestion';
import Loading from '../componets/chat/Loading';
import Responding from '../componets/chat/Responding';
import { GlobalContext } from '../contexts/Global';

const processData = (inputString) => {
  const lines = inputString.replace(/\[END\]/g, '').split('\n');
  const data = [];
  const documents = [];

  const _DOCUMENT = "Document: ";
  const _DATA = "data: ";

  lines.forEach(line => {
    if (line.startsWith(_DATA) && line.indexOf(_DOCUMENT) === -1) {
      const content = line.slice(_DATA.length);
      if (content) {
        data.push(content);
      }
    } else if (line.indexOf(_DOCUMENT) !== -1) {

      const document = line.replace(_DOCUMENT, '').replace(_DATA, '').replace("rawdata/", "");
      console.log({ document });
      
      documents.push(document);
    }
  });

  console.log(
    {
      data,
      documents
    }
  );


  return {
    data: data,
    documents: documents
  };
}

const Chat = () => {
  // const [userId, setUserId] = useState('');
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [writing, setWriting] = useState(false);
  const [toWrite, setToWrite] = useState({});

  const [chat, setChat] = useState([]);

  const chatref = useRef(null);

  const { state: { token } } = GlobalContext();
  console.log({ token });

  const suggestions = [
    'What is YMCA?',
    'YMCA locations in Europe',
    'YMCA locations in Italy',
  ];

  const handleSubmit = async (q) => {
    console.log('Query:', q);

    const timestamp = new Date().toISOString();
    const payload = {
      "user_id": token,
      "query": q,
      "timestamp": timestamp
    };

    try {
      const response = await axios.post('http://54.166.117.117:8000/chat', payload, {
        headers: {
          'Content-Type': 'application/json',
        },
      }, [query]);

      const chunk = response.data;

      console.log({ chunk });
      const { data, documents } = processData(chunk);
      const formattedData = {
        text: data.join(''),
        documents: documents
      }
      setToWrite(formattedData);
      setWriting(true);

    } catch (error) {
      console.error('Error while fetching data:', error);
      setChat([...chat, { type: 'response', error: true, txt: 'Error - Service Unavailable' }]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddQuestion = (question) => {
    setChat([...chat, { type: 'question', txt: question }]);
    handleSubmit(question);
    setQuery('');
    setLoading(true);
    if (chatref.current) { // scroll to the bottom of the chat
      chatref.current.scrollTop = chatref.current.scrollHeight;
    }
  }

  return (
    <div className={`${chatStyles['chat-grid']} py-6 font-poppins md:text-sm`}>
      <section
        ref={chatref}
        className={`${chatStyles.chat} flex flex-col gap-5 px-6 md:px-2`}>
        {
          chat.map((msg, index) => (
            msg.type === 'question' ? (
              <Question key={index} question={msg.txt} />
            ) : (
              <Response
                key={index}
                response={msg.txt}
                error={msg?.error}
                documents={msg.documents}
                end={() => {
                  if (chatref.current) {
                    chatref.current.scrollTop = chatref.current.scrollHeight;
                  }
                }}
              />
            )))
        }
        {
          loading && (
            <Loading />
          )
        }
        {
          writing && <Responding data={toWrite} end={
            () => {
              setWriting(false);
              setToWrite({});
              setChat([...chat, { type: 'response', txt: toWrite.text, documents: toWrite.documents }]);
            }
          } />
        }
      </section>
      {
        chat.length == 0 && (
          <section className={`${chatStyles['suggestions']} gap-2 px-5 pb-2 w-2/3 md:w-full justify-self-center max-w-[100vw]`}>
            <p className="w-full text-sm pb-2">Ask your question in chat or select the following options to start from:</p>
            <div className="flex flex-wrap sm:flex-nowrap text-sm gap-2 overflow-x-auto pb-1">
              {
                suggestions.map((suggestion, index) => (
                  <Suggestion key={index} suggestion={suggestion} onClick={() => handleAddQuestion(suggestion)} />
                ))
              }
            </div>
          </section>
        )
      }
      <section className={`${chatStyles['new-message']} flex justify-center py-2 gap-2 px-6`}>
        <div className="avatar">
          <div className="w-10 h-10 rounded-full">
            <img src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp" />
          </div>
        </div>
        <div className="join gap-1 items-center bg-[#EBEBEB] text-[#747775] px-3 w-2/3 md:w-full disabled:bg-[#EBEBEB] disabled:text-[#747775] disabled:cursor-progress">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleAddQuestion(query);
              }
            }}
            disabled={loading}
            type="text" placeholder="New Message" className="w-full text-gray-950 placeholder:text-gray-400 p-2" />
          <img src={playIcon} alt="" className="w-8 h-8 cursor-pointer" onClick={() => {
            handleAddQuestion(query)
          }} />
        </div>
      </section>
    </div>
  )
}

export default Chat;
