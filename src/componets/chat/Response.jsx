import PropTypes from 'prop-types';
import { memo } from 'react';

const Response = ({
  response
}) => {
  return (
    <div className="flex gap-3">

      <div className="w-10 h-10 p-[2px] antialiased rounded-full border border-gray-500 flex">
        <img className="brightness-0 h-5 self-center" src="/logo.png" />
      </div>
      <span className="bg-[#F5F5F5] rounded-md px-4 py-2 max-w-[75%]">{response ?
        response : 'No response yet'
      }</span>
    </div>
  )
}

Response.propTypes = {
  response: PropTypes.string,
};

export default memo(Response)
