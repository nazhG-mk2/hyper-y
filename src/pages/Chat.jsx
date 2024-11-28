import { useEffect, useRef, useState } from 'react';
import playIcon from '../assets/play.svg';
import chatStyles from './Chat.module.css';
import axios from 'axios';
import Question from '../componets/chat/Question';
import Response from '../componets/chat/Response';
import Suggestion from '../componets/chat/Suggestion';
// import Loading from '../componets/chat/Loading';
import Responding from '../componets/chat/Responding';
// import { GlobalContext } from '../contexts/Global';
import { useChatContext } from '../contexts/Chat';

const Chat = () => {
  // const { state: context } = GlobalContext();
  const { AddToCurrentChat, currentChat } = useChatContext();
  // const { token: user_id } = context;
  console.log({ currentChat: currentChat });

  // const [userId, setUserId] = useState('');
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [writing, setWriting] = useState(false);
  const [toWrite, setToWrite] = useState({});
  const [steps, setSteps] = useState([]);
  const [currentStep, setCurrentStep] = useState([]);
  const [writingLong, setWritingLong] = useState(false);
  const [toWriteLong, setToWriteLong] = useState({});

  const chatref = useRef(null);

  const suggestions = [
    'What is YMCA?',
    'YMCA locations in Europe',
    'YMCA locations in Italy',
  ];

  const formatThinkingSteps = (steps) => {
    // REFINING_SEARCH → "Making sure we find the right information..."
    // FORMING_RESPONSE → "Preparing your answer..."
    if (steps == 'REFINING_SEARCH') {
      return 'Making sure we find the right information...';
    }
    if (steps == 'FORMING_RESPONSE') {
      return 'Preparing your answer...';
    }
    return steps;
  }

  const handleSubmit = async (q) => {
    try {
      const gronkRequest = await axios.post('http://43.202.113.176/v1/chat/completions', {
        "messages": [
          {
            "role": "user",
            "content": `in 3 lines or less (respond in the language of the question/sentence): ${q}`,
          }
        ],
        "model": "grok-beta",
        "stream": false,
        "temperature": 0
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      }).then((response) => {
        const { data: { choices } } = response;
        const resp = choices[0].message.content;

        setToWrite({ text: resp, documents: [] });
        setWriting(true);
      });
      const fullRequest = await axios.post('http://18.219.124.9:9999/stream_chat', {
        "user_query": q,
        "searches": 4, "select_searches": [1, 2]
      }).then(async (response) => {
        const parts = response.data.split('\n');
        // get the text between FORMING_RESPONSE and END_RESPONSE in the response
        const match = response.data.match(/FORMING_RESPONSE([\s\S]*?)END_RESPONSE/);
        console.log({ match });

        setCurrentStep(() => 0);

        if (match) {
          console.log(match[1].trim());
          setToWriteLong(match[1].trim());
        } else {
          console.log("No match found");
        }

        // find the position of FORMING_RESPONSE
        const formingResponseIndex = parts.indexOf('FORMING_RESPONSE');
        const _steps = parts.slice(0, formingResponseIndex);
        // get only the _steps that are uppercase string no whitespaces
        const _stepsFiltered = _steps.filter(step => step.trim() === step.toUpperCase() && step.indexOf(' ') === -1);
        console.log({ _stepsFiltered });
        setSteps(_stepsFiltered);
        setLoading('Searching for the best answer...');

      });

      await Promise.all([gronkRequest, fullRequest]);
      console.log({
        toWriteLong,
        steps,
      });


    } catch (error) {
      console.error('Error while fetching data:', error);

      AddToCurrentChat({ type: 'response', error: true, txt: 'Error - Service Unavailable' });
    }
  };

  useEffect(() => {
    console.log({ steps, currentStep });

    if (steps.length === 0) return;

    let stepTimeout;
    if (currentStep < steps.length) {
      // Mostrar cada paso después de un segundo
      stepTimeout = setTimeout(() => {
        console.log('Step:', steps[currentStep]);
        setCurrentStep((prev) => prev + 1);
        setLoading(formatThinkingSteps(steps[currentStep]));
      }, 1000); // 1000 ms = 1 segundo
    } else {
      // Cuando todos los pasos se han mostrado, muestra el mensaje final
      setTimeout(() => {
        setLoading(false);
        setWritingLong(true);
        console.log('END');

      }, 1000); // Espera 1 segundo después de mostrar el último paso
    }

    // Limpiar el timeout cuando el componente se desmonte o cambie el estado
    return () => clearTimeout(stepTimeout);
  }, [currentStep, steps]);

  const handleAddQuestion = (question) => {
    AddToCurrentChat({ type: 'question', txt: question });
    handleSubmit(question);
    setQuery('');
    setLoading('Generating a quick response for you...');
  }

  return (
    <div className={`${chatStyles['chat-grid']} py-6 font-poppins md:text-sm`}>
      <section
        ref={chatref}
        className={`${chatStyles.chat} flex flex-col px-6 md:px-2`}>
        {
          currentChat?.chat.map((msg, index) => (
            msg.type === 'question' ? (
              <Question key={index} question={msg.txt} />
            ) : (
              <Response
                key={index}
                response={msg.txt}
                error={msg?.error}
                end={() => {
                  if (chatref.current) {
                    setTimeout(() => {
                      chatref.current.scrollTop = chatref.current.scrollHeight;
                    }, 0);
                  }
                }}
              />
            )))
        }
        {
          loading && (
            // <Loading />
            <div className="flex ml-14">
              <p className='text-base text-shyne'>{loading}</p>
              {/* <span className="emoji-rotator text-xs"></span> */}
            </div>
          )
        }
        {
          writing && <Responding data={ {text: toWrite.text, additional: 'Quick response 2.1 seconds'}} end={
            () => {
              setWriting(false);
              setToWrite({});
              AddToCurrentChat({ type: 'response', txt: toWrite.text, documents: toWrite.documents });
            }
          } />
        }
        {
          writingLong && <Responding data={{ text: toWriteLong, noImg: true, additional: 'Thought for 7.33 seconds'}} end={
            () => {
              setWritingLong(false);
              setToWriteLong({});
              AddToCurrentChat({ type: 'response', txt: toWriteLong.text, documents: [] });
            }
          } />
        }
      </section >
      {
        (!currentChat || currentChat?.length == 0) && (
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
      < section className={`${chatStyles['new-message']} flex justify-center pt-6 gap-2 px-6`}>
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
      </section >
    </div >
  )
}

export default Chat;
