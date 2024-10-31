import PropTypes from 'prop-types';
import { memo, useEffect, useMemo } from 'react';

const Response = ({
  response,
  error = false,
  documents = "",
  end = () => { }
}) => {
  useEffect(() => {
    end();
  }, [response, end]);

  return useMemo(() => (
    <div className="flex gap-3 md:gap-2 response">
      <div className="w-10 md:w-8 h-10 md:h-8 p-[2px] antialiased rounded-full border border-gray-500 flex">
        <img className="brightness-0 h-5 self-center" src="/logo.png" />
      </div>
      <div className={`rounded-md px-4 py-2 mr-[64px] md:mr-0 flex-1 transition-all duration-500 ${error ? 'bg-red-200 text-gray-950' : 'bg-[#F5F5F5]'}`}>
        {response ?
          (
            <>
              <span>{response}</span>
              {
                documents && !error && (
                  <div className='refs mb-2'>
                    <div className="divider my-1"></div>
                    <h2 className='mb-2 font-semibold'>References:</h2>
                    <ul className="flex flex-col list-disc marker:text-lightYellow pl-5">
                      {
                        documents.map((doc, index) => {
                          // const type = doc..replace("websites/", "").replace("pdfs/", "").replace("pdf/", "").replace("images/", "").replace("videos/", "").replace("audios/", "").replace("files/", "")
                          const _doc = doc
                            .replace("websites/", "")
                            .replace("pdf/", "")
                          const url = _doc.slice(0, _doc.indexOf('/'));
                          const path = _doc.slice(_doc.indexOf('/') + 1);
                          return (
                            <li key={index} className='text-sm md:text-base'>
                              <a href={`https://${url}`} target="_blank" rel="noreferrer" className="">{url}</a>: {path}
                            </li>)
                        })
                      }
                    </ul>
                  </div>
                )
              }
            </>
          ) : 'No response yet'
        }</div>
    </div>
  ), [response, error, documents])
}

Response.propTypes = {
  response: PropTypes.string,
  error: PropTypes.bool,
  documents: PropTypes.array,
  end: PropTypes.func
};

export default memo(Response)
