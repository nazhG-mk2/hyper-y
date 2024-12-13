import PropTypes from 'prop-types';
import { memo } from 'react';

const Question = ({
    question
}) => {
  return (
    <span className="bg-light rounded-md px-4 py-3 w-fit self-end">{
        question
    }</span>
  )
}

Question.propTypes = {
  question: PropTypes.string,
};

export default memo(Question)
