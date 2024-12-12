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

const analyticalSystemPrompt = `
You are an expert on the YMCA globally, and your role is to help the user get an accurate answer to their query.
You are to follow these instructions very carefully. For the next user query you receive, do the following steps and produce the final answer in the specified format:

    1. Answer the question briefly in 2-3 sentences. Do not end your initial response with a colon. If you must list something, complete the list within these 2-3 sentences.
    2. Assign an accuracy score from 0 to 100 based on factual correctness and confidence.
    3. Explain why you assigned this score, considering known facts, your familiarity with the subject, and any speculative elements.
    4. Refine your initial response based on the score:
        - Score 90-100 (High Confidence): Present your initial response and then ask whether the user needs more details or if they want to look into something else, suggesting something relevant.
        - Score 70-89 (Moderate Confidence): Present your original response while making it clear that you are unsure about your response and ask whether you should do a database search, unless the question is subjective or speculative, in which case include probing the same topic more deeply as an additional option.
        - Score 0-69 (Low Confidence): Acknowledge uncertainty, provide a more cautious answer, and recommend a deeper search with verification steps or external references.

If your initial response unintentionally ends with a colon (implying more details were expected):

    In the REFINED_ANSWER step, provide the missing details to ensure the answer is complete and does not leave the user hanging.

**Final Output Format (use exactly these labels):**
\`\`\`
ORIGINAL_ANSWER: <Your initial 2-3 sentence answer>
SCORE: <Numerical score between 0 and 100>
EXPLANATION: <A brief explanation of why you assigned that score>
REFINED_ANSWER: <Your refined answer following the rules above>
\`\`\`
`;

const simpleSystemPrompt = `
You are an expert on the YMCA globally, and your role is to help the user get an accurate answer to their query.
You can be as detailed as you like in your response, but make sure to provide accurate information
and cite your sources where necessary. Please provide sources as clickable links whenever possible.
`;

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

	const [chatHistory, setChatHistory] = useState([]);

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
						"content": analyticalSystemPrompt
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

			// Add the user's query to the chat history here
			addToChatHistory(q, 'user');

			const { originalAnswer, score, explanation, refinedAnswer } = formatGrokResponse(response);

			setOriginalAnswer(originalAnswer);
			setScore(score);
			setExplanation(explanation);
			setRefinedAnswer(refinedAnswer);

			// Display the refined answer to the user
			setToWrite({ text: refinedAnswer, documents: [] });
			setWriting(true);

			// Add the user's query to the chat history here
			addToChatHistory(refinedAnswer, 'assistant');

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

	const makeRequest = async (query, url, prompt, chatHistory = []) => {
		// check if there is a query
		if (!query) {
			// Handle missing query
			console.error('No query provided');
			return;
		}
		// if (!query) {
		// 	// if there is no query, get the last question from the chat
		// 	// this can happen if the user presses the suggestion button without typing anything
		// 	const lastQuestion = [...currentChat.chat].reverse().find((msg) => msg.type === 'question');
		// 	// if there is no question in the chat, log an error and return
		// 	if (!lastQuestion) {
		// 		console.error('No question found in chat');
		// 		AddToCurrentChat({ type: 'response', error: true, txt: 'No question found in chat' });
		// 		return;
		// 	}
		// 	// set the query to the last question
		// 	query = lastQuestion.txt;
		// }
		// Add the user query to the chat history

		// Add the user's query to the chat history here
		addToChatHistory(query, 'user');

		// Construct the messages array
		let messages = [];

		// Include the system prompt if it exists
		if (prompt) {
			messages.push({
				"role": "system",
				"content": prompt
			});
		}

		// Include the previous chat history
		chatHistory.forEach(entry => {
			messages.push({
				"role": entry.sender === 'user' ? 'user' : 'assistant',
				"content": entry.message
			});
		});

		// Add the current user query
		messages.push({
			"role": "user",
			"content": query
		});

		// Log the messages for debugging
		console.log({ messages });

		console.log("Making Grokk request for:", query);
		console.log("with messages:", messages);
		// display a loading message
		setLoading("Requesting data...");

		// fetch the data
		try {
			const response = await axios.post(url, {
				"messages": messages,
				"model": "grok-beta",
				"stream": false,
				"temperature": 0.4
			}, {
				headers: {
					'Content-Type': 'application/json'
				}
			});

			// console.log({ response });
			// Handle the response
			const data = response.data;
			console.log("Response data:", data);

			if ( url === GROK_URL ) {
					const refinedAnswer = response.data.choices[0].message.content;
					
					// Display anwser to the user
					setToWrite({ text: refinedAnswer, documents: [] });
					setWriting(true);

					// Update chat history with the response
					addToChatHistory(refinedAnswer, 'assistant');
					
			}

			if ( url === ELASTICSEARCH_URL ) {
				// TODO: Handle the response from the ElasticSearch API
			}

			// clear the loading message
			setLoading(false);
		} catch (error) {
			console.error('Error while fetching data:', error);
			AddToCurrentChat({ type: 'response', error: true, txt: 'Error - Service Unavailable' });
			setLoading(false);
		}
	}

    const addToChatHistory = (message, sender) => {
        setChatHistory(prevHistory => [...prevHistory, { message, sender }]);
    };
	// const makeGrokRequest = async (query) => {
	// 	let prompt = ''; // This is the prompt used in "Look for more details"
	// 	if ( isRefiningQuery ) {
	// 		promt = 'REFINING_SEARCH'; // This is the prompt used in "Refine your question"
	// 	}
	// 	await makeRequest(query, GROK_URL, prompt);
	// }
	const makeGrokRequest = async (query, prompt = '', chatHistory = []) => {
		if (isRefiningQuery) {
			prompt = 'REFINING_SEARCH';
		}
		await makeRequest(query, GROK_URL, prompt, chatHistory);
	};
	const makeElasticSearchRequest = async (query, prompt = '', chatHistory = []) => {
		// this is the prompt use in "Do a database search"
		await makeRequest(query, ELASTICSEARCH_URL, prompt, chatHistory);
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
								funcOne={() => makeGrokRequest('Please expand on your initial response with more details.', simpleSystemPrompt, chatHistory)}
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
									makeGrokRequest(query, '', chatHistory);
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
							// const prompt = `You are an expert in the YMCA globally at all levels.
							// Your role is to help the user get an accurate answer to their query.
							// Consider the user's current question and the previous context in
							// formulating your response.`
							makeGrokRequest(query, simpleSystemPrompt, chatHistory);
							setIsRefiningQuery(false);
						} else {
							handleAddQuestion(query)
						}
					}} />
				</div>
			</section >
			{/* Debug section (remove or comment out when done verifying)
			<div style={{ border: '1px solid gray', padding: '10px', marginTop: '20px' }}>
				<h2>Debug Info:</h2>
				<p><strong>Original Answer:</strong> {originalAnswer}</p>
				<p><strong>Score:</strong> {score}</p>
				<p><strong>Explanation:</strong> {explanation}</p>
				<p><strong>Refined Answer:</strong> {refinedAnswer}</p>
			</div> */}
		</div >
	)
}

export default Chat;
