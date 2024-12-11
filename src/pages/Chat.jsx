import { useEffect, useRef, useState } from 'react';
import playIcon from '../assets/play.svg';
import chatStyles from './Chat.module.css';
import axios from 'axios';
import Question from '../componets/chat/Question';
import Response from '../componets/chat/Response';
import Suggestion from '../componets/chat/Suggestion';
import Responding from '../componets/chat/Responding';
import { useChatContext } from '../contexts/Chat';

const GROK_URL = 'http://43.202.113.176/v1/chat/completions';
const ELASTICSEARCH_URL = 'http://18.219.124.9:9999/stream_chat';

const formatGrokResponse = (response) => {
	const { data: { choices } } = response;
	const assistantResponse = choices[0].message.content.trim();

	// Now we parse the assistantResponse to extract ORIGINAL_ANSWER, SCORE, EXPLANATION, and REFINED_ANSWER.
	// We expect the response in the format:
	// ORIGINAL_ANSWER: ...
	// SCORE: ...
	// EXPLANATION: ...
	// REFINED_ANSWER: ...

	// A regex approach:
	// We can use something like:
	// ORIGINAL_ANSWER:\s*(.*)
	// SCORE:\s*(\d+)
	// EXPLANATION:\s*(.*?)(?=REFINED_ANSWER:)
	// REFINED_ANSWER:\s*(.*)

	const originalMatch = assistantResponse.match(/ORIGINAL_ANSWER:\s*(.*)/);
	const scoreMatch = assistantResponse.match(/SCORE:\s*(\d+)/);
	const explanationMatch = assistantResponse.match(/EXPLANATION:\s*([\s\S]*?)\nREFINED_ANSWER:/);
	const refinedMatch = assistantResponse.match(/REFINED_ANSWER:\s*(.*)/);

	const originalAnswer = originalMatch ? originalMatch[1].trim() : '';
	const score = scoreMatch ? scoreMatch[1].trim() : '';
	const explanation = explanationMatch ? explanationMatch[1].trim() : '';
	const refinedAnswer = refinedMatch ? refinedMatch[1].trim() : '';

	return { originalAnswer, score, explanation, refinedAnswer };
}

const formatThinkingSteps = (steps) => {
	// REFINING_SEARCH → "Making sure we find the right information..."
	// FORMING_RESPONSE → "Preparing your answer..."
	// FORMING_SEARCH_QUERY → "Forming the search query..."
	// GETTING_RESPONSE → "Getting the response..."
	if (steps == 'REFINING_SEARCH') {
		return 'Making sure we find the right information...';
	}
	if (steps == 'FORMING_RESPONSE') {
		return 'Preparing your answer...';
	}
	if (steps == 'FORMING_SEARCH_QUERY') {
		return 'Forming the search query...';
	}
	if (steps == 'GETTING_RESPONSE') {
		return 'Getting the response...';
	}

	return steps;
}

const Chat = () => {
	const { AddToCurrentChat, currentChat } = useChatContext();

	const [query, setQuery] = useState('');
	const [loading, setLoading] = useState(false);
	const [writing, setWriting] = useState(false);
	const [toWrite, setToWrite] = useState({});
	const [steps, setSteps] = useState([]);
	const [currentStep, setCurrentStep] = useState([]);
	const [writingLong, setWritingLong] = useState(false);
	const [toWriteLong, setToWriteLong] = useState({});

	const [originalAnswer, setOriginalAnswer] = useState('');
	const [score, setScore] = useState('');
	const [explanation, setExplanation] = useState('');
	const [refinedAnswer, setRefinedAnswer] = useState('');

	const [isRefiningQuery, setIsRefiningQuery] = useState(false);

	const chatref = useRef(null);
	const inputRef = useRef(null);

	const suggestions = [
		'What is YMCA?',
		'YMCA locations in Europe',
		'YMCA locations in Italy',
	];

	const handleSubmit = async (q) => {
		setLoading("Generating a quick response for you...");
		try {
			const response = await axios.post('http://43.202.113.176/v1/chat/completions', {
				"messages": [
					{
						"role": "system",
						"content": `
  You are an expert on the YMCA globally and your role is to help the user get to an accurate answer to their query.
  You are to follow these instructions very carefully. For the next user query you receive, do the following steps and produce the final answer in the specified format:

  1. Answer the question briefly in 2-3 sentences. This is your initial response.
  2. Assign an accuracy score from 0 to 100 based on factual correctness and confidence.
  3. Explain why you assigned this score, considering known facts, your familiarity with the subject, and any speculative elements.
  4. Refine your initial response based on the score:
	 - **Score 90-100 (High Confidence):** Expand with more depth and examples, citing relevant supporting information.
	 - **Score 70-89 (Moderate Confidence):** Rephrase unclear sections, add more supporting details, and identify where additional research might help.
	 - **Score 50-69 (Low Confidence):** Acknowledge uncertainty, provide a more cautious answer, and suggest verification steps or external references.
	 - **Score 0-49 (Very Low Confidence):** State that the response is speculative, avoid unsupported claims, and recommend seeking expert advice or reliable sources.

  **Final Output Format (use exactly these labels):**
  \`\`\`
  ORIGINAL_ANSWER: <Your initial 2-3 sentence answer>
  SCORE: <Numerical score between 0 and 100>
  EXPLANATION: <A brief explanation of why you assigned that score>
  REFINED_ANSWER: <Your refined answer following the rules above>
  \`\`\`
  `
					},
					{
						"role": "user",
						"content": q
					}
				],
				"model": "grok-beta",
				"stream": false,
				"temperature": 0.5
			}, {
				headers: {
					'Content-Type': 'application/json'
				}
			});

			const { originalAnswer, score, explanation, refinedAnswer } = formatGrokResponse(response);

			setOriginalAnswer(originalAnswer);
			setScore(score);
			setExplanation(explanation);
			setRefinedAnswer(refinedAnswer);

			// Display the refined answer to the user
			setToWrite({ text: refinedAnswer, documents: [] });
			setWriting(true);

			// Store or log the other details as needed
			console.log("Original Answer:", originalAnswer);
			console.log("Score:", score);
			console.log("Explanation:", explanation);

			// If you'd like to store these in state, define corresponding states:
			// setOriginalAnswer(originalAnswer);
			// setScore(score);
			// setExplanation(explanation);

		} catch (error) {
			console.error('Error while fetching data:', error);
			AddToCurrentChat({ type: 'response', error: true, txt: 'Error - Service Unavailable' });
		}
		setLoading(false);
	};

	const makeRequest = async (query, url, promt) => {
		// check if there is a query
		if (!query) {
			// if there is no query, get the last question from the chat
			// this can happen if the user presses the suggestion button without typing anything
			const lastQuestion = [...currentChat.chat].reverse().find((msg) => msg.type === 'question');
			// if there is no question in the chat, log an error and return
			if (!lastQuestion) {
				console.error('No question found in chat');
				AddToCurrentChat({ type: 'response', error: true, txt: 'No question found in chat' });
				return;
			}
			// set the query to the last question
			query = lastQuestion.txt;
		}
		console.log({ query });

		console.log("Making Grokk request for:", query);
		// display a loading message
		setLoading("Requesting data...");

		// fetch the data
		try {
			const response = await axios.post(url, {
				"messages": [
					{
						"role": "system",
						"content": promt
					},
					{
						"role": "user",
						"content": query
					}
				],
				"model": "grok-beta",
				"stream": false,
				"temperature": 0.5
			}, {
				headers: {
					'Content-Type': 'application/json'
				}
			});

			console.log({ response });

			if ( url === GROK_URL ) {
					const refinedAnswer = response.data.choices[0].message.content;
					
					// Display anwser to the user
					setToWrite({ text: refinedAnswer, documents: [] });
					setWriting(true);
					
			}

			if ( url === ELASTICSEARCH_URL ) {
				// TODO: Handle the response from the ElasticSearch API
			}

			// clear the loading message
			setLoading(false);
		} catch (error) {
			console.error('Error while fetching data:', error);
			AddToCurrentChat({ type: 'response', error: true, txt: 'Error - Service Unavailable' });
		}
	}

	const makeGrokRequest = async (query) => {
		let promt = ''; // This is the prompt used in "Look for more details"
		if ( isRefiningQuery ) {
			promt = 'REFINING_SEARCH'; // This is the prompt used in "Refine your question"
		}
		await makeRequest(query, GROK_URL, promt);
	}
	const makeElasticSearchRequest = async (query) => {
		// this is the prompt use in "Do a database search"
		const promt = '';
		await makeRequest(query, ELASTICSEARCH_URL, promt);
	}

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
				className={`${chatStyles.chat} flex flex-col gap-5 px-6 md:px-2 overflow-x-hidden`}>
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
											// chatref.current.scrollTop = chatref.current.scrollHeight;
										}, 0);
									}
								}}
								funcOne={() => makeGrokRequest()}
								funcTwo={() => makeElasticSearchRequest()}
								funcThree={() => {
									inputRef.current.focus();
									setIsRefiningQuery(true);
								}}
							/>
						)))
				}
				{/* <p className='text-base text-shyne'>Robert</p> */}


				{/* <Response response="hola"
					funcOne={() => {
						inputRef.current.focus();
						setIsRefiningQuery(true);
					}}
					funcTwo={makeElasticSearchRequest}
					funcThree={() => makeGrokkRequest()}
				/> */}


				{
					loading && (
						<div className="flex ml-14">
							<p className='text-base text-shyne'>{loading}</p>
						</div>
					)
				}
				{
					writing && <Responding data={toWrite} end={
						() => {
							setWriting(false);
							setToWrite({});
							// change the msg to generate the complex response
							AddToCurrentChat({ type: 'response', txt: toWrite.text, documents: toWrite.documents });
						}}
					/>
				}
				{
					//   writingLong && <Responding data={{ text: toWriteLong.text, noImg: true }} end={
					//     () => {
					//       setWritingLong(false);
					//       setToWriteLong({});
					//       console.log('End of long response 🔥🔥🔥',);

					//       AddToCurrentChat({ type: 'response', txt: toWriteLong.text, documents: [] });
					//     }
					//   } />
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
					{
						isRefiningQuery && (
							<span
								onClick={() => {
									setIsRefiningQuery(false);
								}}
							>
								Refining
							</span>
						)
					}
					<input
						value={query}
						onChange={(e) => setQuery(e.target.value)}
						onKeyDown={(e) => {
							if (e.key === 'Enter') {
								if (isRefiningQuery) {
									makeGrokRequest(query);
									setIsRefiningQuery(false);
								} else {
									handleAddQuestion(query)
								}
							}
						}}
						disabled={loading}
						ref={inputRef}
						type="text" placeholder="New Message" className="w-full text-gray-950 placeholder:text-gray-400 p-2" />
					<img src={playIcon} alt="" className="w-8 h-8 cursor-pointer" onClick={() => {
						if (isRefiningQuery) {
							makeGrokRequest(query);
							setIsRefiningQuery(false);
						} else {
							handleAddQuestion(query)
						}
					}} />
				</div>
			</section >
			{/* Debug section (remove or comment out when done verifying) */}
			<div style={{ border: '1px solid gray', padding: '10px', marginTop: '20px' }}>
				<h2>Debug Info:</h2>
				<p><strong>Original Answer:</strong> {originalAnswer}</p>
				<p><strong>Score:</strong> {score}</p>
				<p><strong>Explanation:</strong> {explanation}</p>
				<p><strong>Refined Answer:</strong> {refinedAnswer}</p>
			</div>
		</div >
	)
}

export default Chat;
