import PropTypes from 'prop-types';
import { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';

const speed = 20; 

const Response = ({
  response,
  error = false,
  open = false,
  noImg = false,
  shouldType = false,
}) => {
  const indexRef = useRef(0);
  const [displayedText, setDisplayedText] = useState('');
  const [forceComplete, setForceComplete] = useState(false);
  const responseRef = useRef(null);
  const [isReferencesOpened, setReferencesOpened] = useState(open);

  // Función para completar el texto inmediatamente
  const completeText = () => {
    if (shouldType && !forceComplete) {
      setForceComplete(true);
      indexRef.current = (response || '').length;
      setDisplayedText(response || '');
    }
  };

  // Efecto para escribir letra por letra
  useEffect(() => {
    if (!shouldType || forceComplete) {
      // Si no debe escribir o se forzó a completar, mostrar todo el texto
      setDisplayedText(response || '');
      indexRef.current = (response || '').length;
      return;
    }

    // Reset del índice cuando llega un nuevo response
    if (indexRef.current > (response || '').length) {
      indexRef.current = 0;
    }

    // Efecto de escritura
    if (indexRef.current < (response || '').length) {
      const timer = setTimeout(() => {
        indexRef.current += 1;
        setDisplayedText((response || '').slice(0, indexRef.current));
      }, speed);

      return () => clearTimeout(timer);
    }
  }, [response, shouldType, displayedText, forceComplete]);

  // Reset cuando cambia shouldType
  useEffect(() => {
    if (shouldType) {
      indexRef.current = 0;
      setDisplayedText('');
      setForceComplete(false);
    }
  }, [shouldType]);

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

  const extractThinkBlock = (text) => {
    const match = text.match(/<think>([\s\S]*?)<\/think>/);
    if (!match) return { think: null, rest: text };
    const think = match[1].trim();
    const rest = text.replace(match[0], '').trim();
    return { think, rest };
  };

  // Usar displayedText en lugar de response
  const { think, rest } = extractThinkBlock(displayedText || '');
  const isTyping = shouldType && indexRef.current < (response || '').length;

  return (
    <div className="flex gap-3 md:gap-1 response md:mr-5" ref={responseRef}>
      <div className="flex flex-col">
        <div 
          className={`rounded-md px-4 py-3 mr-[64px] max-w-full md:mr-0 flex-1 transition-all duration-300 min-w-0 w-full ${error ? 'bg-red-200 text-gray-950' : 'bg-[#F5F5F5]'} ${isTyping ? 'cursor-pointer' : ''}`}
          onClick={completeText}
          title={isTyping ? "Click para mostrar texto completo" : ""}
        >

          {displayedText ?
            (
              <>
                {think && (
                  <div className="collapse collapse-arrow mb-1">
                    <input type="checkbox" />
                    <div className="collapse-title font-medium">
                      <pre className="text-gray-600">Thought Process</pre>
                    </div>
                    <div className="collapse-content">
                      <pre className="whitespace-pre-wrap text-sm">{think}</pre>
                    </div>
                  </div>
                )}

                <div className={`whitespace-pre-line ${isTyping ? 'animate-typing' : ''}`}>
                  <ReactMarkdown
                    components={{
                      pre: (props) => (
                        <pre className="bg-gray-100 p-2 rounded text-sm whitespace-pre-wrap" {...props} />
                      ),
                      ul: ({ ...props }) => <ul className="list-disc pl-5 flex flex-col" {...props} />,
                      ol: ({ ...props }) => <ol className="list-decimal pl-5 flex flex-col" {...props} />,
                      li: ({ ...props }) => <li className="my-1 list-item" {...props} />,
                      strong: ({ ...props }) => <strong className="text-lg contents" {...props} />,
                      a: ({ ...props }) => <a className="text-blue-400 font-medium underline" {...props} />,
                    }}
                  >
                    {rest}
                  </ReactMarkdown>
                </div>
              </>
            ) : (shouldType ? 
              <div className="animate-typing text-gray-400">Escribiendo...</div> : 
              'No response yet'
            )
          }</div>
      </div>
      <div className="w-10 min-w-10 md:w-8 h-10 min-h-10 md:hidden md:h-8 p-[2px] antialiased rounded-full flex">
        <img className={`rounded-full h-8 w-8 object-cover invisible self-center ${!noImg && 'invisible'}`} src="https://upload.wikimedia.org/wikipedia/commons/b/b7/Flag_of_Europe.svg" />
      </div>
    </div>
  )
}

Response.propTypes = {
  response: PropTypes.string,
  error: PropTypes.bool,
  open: PropTypes.bool,
  noImg: PropTypes.bool,
  shouldType: PropTypes.bool,
};

export default Response
