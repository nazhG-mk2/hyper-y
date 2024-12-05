import PropTypes from 'prop-types';
import { memo, useEffect, useMemo, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';

const Response = ({
  agent,
  response,
  error = false,
  end = () => { },
  open = false,
  noImg = false,
  additionalResponse = ''
}) => {
  useEffect(() => {
    end();
  }, [response, end]);

  const responseRef = useRef(null);
  const [isReferencesOpened, setReferencesOpened] = useState(open);

  useEffect(() => {
    // if is open see is click is outside
    const handleClickOutside = (e) => {
      if (responseRef.current && !responseRef.current.contains(e.target)) {
        setReferencesOpened(false);
      }
    };

    if (isReferencesOpened) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    }
  })

  return useMemo(() => (
    <div className="flex gap-3 md:gap-1 response md:mr-5" ref={responseRef}>
      <div className={`w-10 min-w-10 md:w-8 h-10 min-h-10 md:h-8 p-[2px] antialiased rounded-full flex ${agent == 'chat' && 'invisible'}`}>
        {
          agent == 'fast' && (
            <span className='text-3xl'>⚡</span>
          )
        }
        {
          agent == 'precise' && (
            <span className='text-3xl'>🎯</span>
          )
        }
        {
          agent == 'toronto' && (
            <span className='text-3xl'>🇨🇦</span>
          )
        }
        {
          agent == 'family' && (
            <span className='text-3xl'>👨‍👩‍👧‍👦</span>
          )
        }
        {
          !agent && (
            <span>🤖</span>
          )
        }
        {/* <img className="rounded-full self-center" src="/hyperY.png" /> */}
      </div>
      <div className="flex flex-col">
        {
          additionalResponse && (
            <span className='text-secondary text-sm my-2'>{additionalResponse}</span>
          )
        }
        {
          agent == 'fast' && (
            <span className='text-secondary text-sm my-2'>Dispatcher</span>
          )
        }
        {
          agent == 'precise' && (
            <span className='text-secondary text-sm my-2'>West End YMCA</span>
          )
        }
        {
          agent == 'toronto' && (
            <span className='text-secondary text-sm my-2'>YMCA GTA (ymcagta.org)</span>
          )
        }
        {
          agent == 'family' && (
            <span className='text-secondary text-sm my-2'>Steve & Sally Stavro Family YMCA</span>
          )
        }
        {
          agent == 'chat' && (
            <span className="text-gray-400 text-xs mt-4">Dispatcher invites Steve & Sally Stavro Family YMCA to the chat</span>
          )
        }
        {
          agent != 'chat' && (

            <div className={`rounded-md px-4 py-3 mr-[64px] md:mr-0 flex-1 transition-all duration-500 ${error ? 'bg-red-200 text-gray-950' : 'bg-[#F5F5F5]'}`}>


              {response ?
                (
                  <>
                    <span className='whitespace-pre-line max-h-full'>
                      <ReactMarkdown
                        components={{
                          ul: ({ ...props }) => <ul className="list-disc pl-5 flex flex-col" {...props} />,
                          ol: ({ ...props }) => <ol className="list-decimal pl-5 flex flex-col" {...props} />,
                          li: ({ ...props }) => <li className="my-1 flex flex-col list-item" {...props} />,
                          strong: ({ ...props }) => <strong className="text-lg contents" {...props} />,
                          a: ({ ...props }) => <a className="text-blue-400 font-medium underline" {...props} />,
                        }}>
                        {response}
                      </ReactMarkdown>
                    </span>
                  </>
                ) : 'No response yet'
              }</div>)
        }
      </div>
    </div>
  ), [response, error, additionalResponse, agent]);
}

Response.propTypes = {
  agent: PropTypes.string,
  response: PropTypes.string,
  error: PropTypes.bool,
  end: PropTypes.func,
  open: PropTypes.bool,
  noImg: PropTypes.bool,
  additionalResponse: PropTypes.string
};

export default memo(Response)
