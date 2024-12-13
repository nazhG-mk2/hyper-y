import PropTypes from 'prop-types';
import { memo, useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';

const Response = ({
  response,
  error = false,
  end = () => { },
  open = false,
  noImg = false,
  additionalResponse = '',
  documents = [],
  funcOne = () => { },
  funcTwo = () => { },
  funcThree = () => { },
  showMoreOptions = false,
  accuracy = 0,
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

  return (
    <div className="flex gap-3 md:gap-1 response md:mr-5" ref={responseRef}>
      <div className="w-10 min-w-10 md:w-8 h-10 min-h-10 md:h-8 p-[2px] antialiased rounded-full flex">
        <img className={`rounded-full self-center ${!noImg && 'invisible'}`} src="/hyperY.png" />
      </div>
      <div className="flex flex-col">
        {
          additionalResponse && (
            <span className='text-secondary text-sm mb-4'>{additionalResponse}</span>
          )
        }
        <div className={`rounded-md px-4 py-3 mr-[64px] md:mr-0 flex-1 transition-all duration-500 ${error ? 'bg-red-200 text-gray-950' : 'bg-[#F5F5F5]'}`}>


          {response ?
            (
              <>
                <span className='whitespace-pre-line'>
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

                {
                  documents && documents.length > 0 && !error && (
                    <>
                      <div className='mb-2 relative'>
                        <div className="divider divider-start font-medium after:bg-[#ddd]">References</div>
                        <ul className="flex flex-col list-disc marker:text-lightYellow pl-5">
                          {
                            documents.map((doc, index) => {
                              // const type = doc..replace("websites/", "").replace("pdfs/", "").replace("pdf/", "").replace("images/", "").replace("videos/", "").replace("audios/", "").replace("files/", "")
                              return (
                                <li key={index} className='text-sm'>
                                  <a href={`https://${doc}`} target="_blank" rel="noreferrer" className="">{doc}</a>
                                </li>)
                            })
                          }
                        </ul>
                        {/* {
                          accuracy && accuracy > 0 && (
                          )
                        } */}
                        <span title="Confidence score based on document analysis accuracy" className="badge absolute right-0 bottom-0 bg-[#eee] text-secondary border-[#ddd] text-xs px-2 py-1">Accuracy: {accuracy}%</span>
                      </div>
                    </>
                  )
                }
              </>
            ) : 'No response yet'
          }</div>
        {
          showMoreOptions && (
            <div className='flex w-full gap-2 mt-2 flex-wrap'>
              <span className='bg-light transition-colors hover:bg-primary-soft hover:text-white px-3 py-2 rounded cursor-pointer'
                onClick={funcOne}
              >
                Look for more details
              </span>
              <span className='bg-light transition-colors hover:bg-primary-soft hover:text-white px-3 py-2 rounded cursor-pointer'
                onClick={funcTwo}
              >
                Do a database search
              </span>
              <span className='bg-light transition-colors hover:bg-primary-soft hover:text-white px-3 py-2 rounded cursor-pointer'
                onClick={funcThree}
              >
                Refine your question
              </span>
            </div>)
        }
      </div>
    </div>
  )
}

Response.propTypes = {
  accuracy: PropTypes.number,
  documents: PropTypes.array,
  response: PropTypes.string,
  error: PropTypes.bool,
  end: PropTypes.func,
  open: PropTypes.bool,
  noImg: PropTypes.bool,
  additionalResponse: PropTypes.string,
  funcOne: PropTypes.func,
  funcTwo: PropTypes.func,
  funcThree: PropTypes.func,
  showMoreOptions: PropTypes.bool,
};

export default memo(Response)
