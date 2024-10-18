import { useCallback, useEffect, useState } from 'react';
import playIcon from '../assets/play.svg';
import chatStyles from './Chat.module.css';
import axios from 'axios';
import Question from '../componets/chat/Question';
import Response from '../componets/chat/Response';
import Suggestion from '../componets/chat/Suggestion';
import Loading from '../componets/chat/Loading';


const Chat = () => {
  // const [userId, setUserId] = useState('');
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [writing, setWriting] = useState(false);
  const [written, setWritten] = useState('');

  const [chat, setChat] = useState([]);

  const suggestions = [
    'What is YMCA?',
    'YMCA locations in Europe',
    'YMCA locations in Italy',
  ];

  const processData = (inputString) => {
    const lines = inputString.replace(/\[END\]/g, '').split('\n');
    const data = [];
    const documents = [];

    lines.forEach(line => {
      if (line.startsWith("data:") && line.indexOf("Document:") === -1) {
        const content = line.slice(5);
        if (content) {
          data.push(content);
        }
      } else if (line.indexOf("Document:")) {
        const document = line.slice(9).replace(/rawdata\//g, '').replace(/pdf\//g, '');
        documents.push(document);
      }
    }, [query]);

    return {
      data: data,
      documents: documents
    };
  }

  const handleSubmit = useCallback(async () => {
    const timestamp = new Date().toISOString();
    const payload = {
      "user_id": "12345abcde",
      "query": query,
      "timestamp": timestamp
    };

    try {
      const response = await axios.post('http://18.208.232.208:8000/chat', payload, {
        headers: {
          'Content-Type': 'application/json',
        },
      }, [query]);

      const chunk = response.data;
      const formatedArr = processData(chunk);
      console.log(formatedArr.data);

      handleAddResponse(formatedArr.data);

    } catch (error) {
      console.error('Error while fetching data:', error);
    } finally {
      setLoading(false);
    }
  });

  const handleAddQuestion = (question) => {
    setChat([...chat, { type: 'question', txt: question }]);
    setQuery('');
    setLoading(true);
  }

  const handleAddResponse = (response) => {
    const delay = 1000;

    // setWriting(true);

    // for (let i = 0; i < response.length; i++) {
    //   setTimeout(() => {
    //     setWritten(response.slice(0, i + 1));
    //     if (i === response.length - 1) {
    //       console.log('response:', response[i]);

    //       setResponses([...responses, response[i]]);
    //       setChat([...chat, { type: 'response', txt: response[i] }]);
    //       setWriting(false);
    //     }
    //   }, delay);
    // }

    console.log(chat, response);
    const newChat = [
      ...chat,
      { type: 'response', txt: response.join('') }
    ]

    setChat(newChat);
  }

  useEffect(() => {
    if (loading == false) {
      return;
    }
    handleSubmit();
  }, [loading, handleSubmit]);

  return (
    <div className={`${chatStyles['chat-grid']} py-6 font-poppins`}>
      <section className={`${chatStyles.chat} flex flex-col gap-2 px-6`}>
        {
          chat.map((msg, index) => (
            msg.type === 'question' ? (
              <Question key={index} question={msg.txt} />
            ) : (
              <Response key={index} response={msg.txt} />
            )))
        }
        {
          loading && (
            <Loading />
          )
        }
        {
          writing && (
            <Response response={written + '✍️'} />
          )
        }
      </section>
      {
        chat.length == 0 && (
          <section className={`${chatStyles['suggestions']} gap-2 px-5 pb-1 w-2/3 justify-self-center`}>
            <p className="w-full text-sm pb-1">Ask your question in chat or select the following options to start from:</p>
            <div className="flex flex-wrap text-sm gap-2">
              {
                suggestions.map((suggestion, index) => (
                  <Suggestion key={index} suggestion={suggestion} onClick={() => handleAddQuestion(suggestion)} />
                ))
              }
            </div>
          </section>
        )
      }
      <section className={`${chatStyles['new-message']} flex justify-center py-2`}>
        <div className="avatar">
          <div className="w-10 h-10 rounded-full">
            <img src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp" />
          </div>
        </div>
        <div className="join gap-1 items-center bg-[#EBEBEB] text-[#747775] px-3 mx-2 w-2/3 disabled:bg-[#EBEBEB] disabled:text-[#747775] disabled:cursor-progress">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleAddQuestion(query);
              }
            }}
            disabled={loading}
            type="text" placeholder="New Message" className="w-full p-2 bg-transparent outline-none" />
          <img src={playIcon} alt="" className="w-8 h-8 cursor-pointer" onClick={handleSubmit} />
        </div>
      </section>
    </div>
  )
}

export default Chat;
