import PropTypes from 'prop-types';
import downArrowIcon from "../../assets/downArrow.svg"
import { memo, useEffect, useMemo, useRef, useState } from 'react';

const Response = ({
  response,
  error = false,
  documents = "",
  end = () => { },
  open = false
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
      <div className="w-10 md:w-8 h-10 md:h-8 p-[2px] antialiased rounded-full border border-gray-500 flex">
        <img className="brightness-0 h-5 self-center" src="/logo.png" />
      </div>
      <div className={`rounded-md px-4 py-3 mr-[64px] md:mr-0 flex-1 transition-all duration-500 ${error ? 'bg-red-200 text-gray-950' : 'bg-[#F5F5F5]'}`}>


        {response ?
          (
            <>
              <span className='whitespace-pre-line'>{response}</span>
            </>
          ) : 'No response yet'
        }</div>
    </div>
  ), [response, error]);
}

Response.propTypes = {
  response: PropTypes.string,
  error: PropTypes.bool,
  documents: PropTypes.array,
  end: PropTypes.func,
  open: PropTypes.bool
};

export default memo(Response)
