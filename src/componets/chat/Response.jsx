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
              <span>{response}</span>
              {
                documents && !error && (
                  <div className={`collapse-custom relative ${isReferencesOpened ? "collapse-custom-open" : ""}`}>
                    {/* <div className="divider my-1 mt-2 cursor-pointer"
                      onClick={() => {
                        console.log('clicked', isReferencesOpened);
                        setReferencesOpened(!isReferencesOpened)

                      }}>
                      <span className='flex mr-3 text-gray-400 text-xs select-none'>
                        References
                        <img
                          className={`w-4 h-4 opacity-40 ${isReferencesOpened == true ? "rotate-180" : ""}`}

                          src={downArrowIcon}
                          alt="" />
                      </span>
                    </div> */}
                    <div className='absolute right-0 bottom-0'>
                      <img
                        className={`w-4 h-4 opacity-40 transition-all ${isReferencesOpened == true ? "rotate-180" : ""}`}
                        onClick={() => {
                          setReferencesOpened(!isReferencesOpened)
                        }}
                        src={downArrowIcon}
                        alt="" />
                    </div>
                    <div className={`collapse-custom-content`}>
                      <div className="divider my-0"></div>
                      <ul className="flex duration-500 transition-all flex-col list-disc marker:text-lightYellow pl-5">
                        {
                          documents.map((doc, index) => {
                            // const type = doc..replace("websites/", "").replace("pdfs/", "").replace("pdf/", "").replace("images/", "").replace("videos/", "").replace("audios/", "").replace("files/", "")
                            const _doc = doc
                              .replace("websites/", "")
                              .replace("pdf/", "")
                            const url = _doc.slice(0, _doc.indexOf('/'));
                            const path = _doc.slice(_doc.indexOf('/') + 1);
                            return (
                              <li key={index} className='text-sm'>
                                <a
                                  href={`https://${url}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className=""
                                  onClick={(e) => e.preventDefault()}
                                >{url}</a>: {path} {index === documents.length - 1 ? '   ' : ''}

                              </li>)
                          })
                        }
                      </ul>
                    </div>
                  </div>
                )
              }
            </>
          ) : 'No response yet'
        }</div>
    </div>
  ), [response, error, documents, isReferencesOpened]);
}

Response.propTypes = {
  response: PropTypes.string,
  error: PropTypes.bool,
  documents: PropTypes.array,
  end: PropTypes.func,
  open: PropTypes.bool
};

export default memo(Response)
