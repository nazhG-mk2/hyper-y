import { useEffect, useRef, useState } from 'react';
import playIcon from '../assets/play.svg';
import chatStyles from './Chat.module.css';
import axios from 'axios';
import Question from '../componets/chat/Question';
import Response from '../componets/chat/Response';
import Suggestion from '../componets/chat/Suggestion';
import Responding from '../componets/chat/Responding';
import { useChatContext } from '../contexts/Chat';
import { useTranslation } from 'react-i18next';
import Error from '../componets/common/Error';

const GROK_URL = 'http://43.202.113.176/v1/chat/completions';
const ELASTICSEARCH_URL = 'http://18.219.124.9:9999/stream_chat';

const analyticalSystemPrompt = `
System Prompt Instructions:
	1. Write the ORIGINAL_ANSWER in 2-3 sentences. After writing the answer, check the end:
		- If the ORIGINAL_ANSWER ends with a colon (:) or with a colon immediately followed by one or more backticks (e.g., :\` or : \` or similar), add extra words so that the sentence does not end with that pattern. Perform this fix only once.
		- Ensure the final ORIGINAL_ANSWER does not end with a colon, nor with a colon followed by backticks.
	2. Assign a SCORE (0-100) based on accuracy and confidence.
	3. EXPLANATION: In 1-2 sentences, explain why you gave that score. Reference known facts, expertise, and any speculative elements.
	4. Refine your answer based on the SCORE:
		- 90-100 (High Confidence):
        	- REFINED_ANSWER = ORIGINAL_ANSWER exactly.
        	- NEXT_STEPS: Ask if the user wants more details or another related query. If the query is not location-specific, note that accuracy may vary by location.
    	- 70-89 (Moderate Confidence):
        	- REFINED_ANSWER = ORIGINAL_ANSWER, adding minimal clarifications if they reduce uncertainty.
        	- NEXT_STEPS: Explain why it might be incomplete, offer a database search, and suggest follow-up queries.
    	- 0-69 (Low Confidence):
        	- REFINED_ANSWER = ORIGINAL_ANSWER improved if possible.
        	- NEXT_STEPS: Acknowledge uncertainty, recommend further research, and external verification.

**Final Output Format (use exactly these labels):**
\`\`\`
ORIGINAL_ANSWER: <Your initial 2-3 sentence answer>
SCORE: <Numerical score between 0 and 100>
EXPLANATION: <A brief explanation of why you assigned that score>
REFINED_ANSWER: <Your refined answer following the rules above>
NEXT_STEPS: <Suggestions based on the score, including recommended actions>
\`\`\`
`;

const addDetailsPrompt = `
You are an expert on the YMCA globally, and your role is to help the user get an accurate answer to their query.
You can be as detailed as you like in your response, but make sure to provide accurate information
and cite your sources where necessary. Please provide sources as clickable links whenever possible.
Follow these steps in generating your response:

1. Review the previous chat history and the user's most recent input.
2. Clarify ambiguities or incomplete information as needed.
3. Do not regurgitate information from the previous chat history, and ensure that the user's most reecent query is adequately addressed.
4. Deliver a refined answer that directly addresses the user's most recent query.
`;

const refiningPrompt = `
As a global YMCA expert, refine the user's query based on the previous conversation to provide a precise, helpful answer. Follow these steps:

1. Review the previous chat history and the user's most recent input.
2. Clarify ambiguities or incomplete information as needed.
3. Do not regurgitate information from the previous chat history, and ensure that the user's most reecent query is adequately addressed.
4. Deliver a refined answer that directly addresses the user's most recent query.
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
	const nextStepsMatch = assistantResponse.match(/NEXT_STEPS:\s*([\s\S]*?)$/);

	const originalAnswer = originalMatch ? originalMatch[1].trim() : '';
	const score = scoreMatch ? scoreMatch[1].trim() : '';
	const explanation = explanationMatch ? explanationMatch[1].trim() : '';
	const refinedAnswer = refinedMatch ? refinedMatch[1].trim() : '';
	const nextSteps = nextStepsMatch ? nextStepsMatch[1].trim() : '';

	return { originalAnswer, score, explanation, refinedAnswer, nextSteps };
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

const isValidMessage = (message) => {
	return (
		typeof message.role === 'string' &&
		typeof message.content === 'string' &&
		message.content.trim().length > 0
	);
};

const validateChatHistory = (chatHistory) => {
	return chatHistory.every(isValidMessage);
};

const Chat = () => {
	const { t } = useTranslation();
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
	const [nextSteps, setNextSteps] = useState('');

	const [isRefiningQuery, setIsRefiningQuery] = useState(false);

	const chatref = useRef(null);
	const inputRef = useRef(null);
	const errorRef = useRef(null);

	const suggestions = [
		'What is YMCA?',
		'YMCA locations in Europe',
		'YMCA locations in Italy',
	];

	const buildRequestOptions = (url, messages, query, prompt) => {
		let requestBody = {};
		let requestHeaders = {};

		if (url === GROK_URL) {
			requestBody = {
				"messages": messages,
				"model": "grok-beta",
				"stream": false,
				"temperature": 0.5,
			};
			requestHeaders = {
				'Content-Type': 'application/json',
			};
		} else if (url === ELASTICSEARCH_URL) {
			requestBody = {
				"user_query": query,
				"searches": 2,
			};
			requestHeaders = {
				// Add any necessary headers for Elasticsearch
			};
		}

		return { requestBody, requestHeaders };
	};

	useEffect(() => {
		if (isRefiningQuery) {
			const lastQuestion = [...currentChat.chat].reverse().find((msg) => msg.type === 'question');
			setQuery('');
		}
	}, [isRefiningQuery, currentChat]);

	const handleSubmit = async (q, prompt = analyticalSystemPrompt, chatHistory = []) => {
		setLoading("Generating a quick response for you...");
		try {
			// const response = await axios.post('http://43.202.113.176/v1/chat/completions', {
			// 	"messages": [
			// 		{
			// 			"role": "system",
			// 			"content": analyticalSystemPrompt
			// 		},
			// 		{
			// 			"role": "user",
			// 			"content": q
			// 		}
			// 	],
			// 	"model": "grok-beta",
			// 	"stream": false,
			// 	"temperature": 0.5
			// }, {
			// 	headers: {
			// 		'Content-Type': 'application/json'
			// 	}
			// });

			// Construct the messages array
			let messages = [];

			// Include the previous chat history
			chatHistory.forEach(entry => {
				messages.push({
					"role": entry.sender === 'user' ? 'user' : 'assistant',
					"content": entry.message
				});
			});

			// Include the system prompt if it exists
			if (prompt) {
				messages.push({
					"role": "system",
					"content": prompt
				});
			}

			// Add the current user query
			messages.push({
				"role": "user",
				"content": q
			});

			// Use the buildRequestOptions function
			const { requestBody, requestHeaders } = buildRequestOptions(GROK_URL, messages, q, prompt);

			// Make the API call
			const response = await axios.post(GROK_URL, requestBody, {
				headers: requestHeaders,
			});
			// Handle the response as needed

			// Add the user's query to the chat history here
			addToChatHistory(q, 'user');

			const { originalAnswer, score, explanation, refinedAnswer, nextSteps } = formatGrokResponse(response);

			setOriginalAnswer(originalAnswer);
			setScore(score);
			setExplanation(explanation);
			setRefinedAnswer(refinedAnswer);
			setNextSteps(nextSteps)


			// for (let i = 0; i < nextSteps.length; i++) {
			// 	console.log(`Character at ${i}: '${nextSteps[i]}' (Code: ${nextSteps.charCodeAt(i)})`);
			// }

			// Display the refined answer and next steps to the user
			const cleanedNextSteps = nextSteps.replace(/```\s*$/, '').trim();
			const responseToWrite = `${refinedAnswer}\n\n${cleanedNextSteps}`.trimEnd();
			setToWrite({ text: responseToWrite, documents: [] });
			setWriting(true);

			// Add the user's query to the chat history here
			addToChatHistory(responseToWrite, 'assistant');

		} catch (error) {
			errorRef.current.showError();
			console.error('Error while fetching data:', error);
			AddToCurrentChat({ type: 'response', error: true, txt: 'Service Unavailable' });
		}
		setLoading(false);
	};

	const makeRequest = async (query, url, prompt, chatHistory = []) => {
		/// TODO: handle stop writing
		// if (writing) {}

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

		console.log("Making request for:", query);
		console.log("with messages:", messages);
		// display a loading message
		setLoading("Requesting data...");

		const { requestBody, requestHeaders } = buildRequestOptions(url, messages, query, prompt);

		console.log({ requestBody, requestHeaders });

		try {
			// fetch the data
			const response = await axios.post(url, requestBody, {
				headers: requestHeaders
			});

			// Add the user's query to the chat history here
			addToChatHistory(query, 'user');

			// console.log({ response });
			// Handle the response
			const data = response.data;
			console.log("Response data:", data);

			let additionalResponse = '';

			if (url === GROK_URL) {
				const refinedAnswer = response.data.choices[0].message.content;

				// Display anwser to the user
				setToWrite({ text: refinedAnswer, documents: [] });
				setWriting(true);

				// Update chat history with the response
				addToChatHistory(refinedAnswer, 'assistant');
			}

			if (url === ELASTICSEARCH_URL) {
				const parts = response.data.split('\n');
				// get the text between FORMING_RESPONSE and END_RESPONSE in the response
				const match = response.data.match(/FORMING_RESPONSE([\s\S]*?)END_RESPONSE/);
				console.log({ match });
				// set the current step to 0 to start from the beginning
				setCurrentStep(() => 0);

				// we spect to find FORMING_RESPONSE warpping the text to write
				// if we don't find it, log an error and return
				if (!match) return console.error("No match found");

				// Get the documents from the response
				const docLabel = 'REFERENCES';
				const docIndex = parts.indexOf(docLabel);
				let documents = [];
				try { // try to parse the documents
					documents = JSON.parse(parts.slice(docIndex + 1, docIndex + 2)).map(doc => doc[4] == "" ? doc[2].slice(0, doc[2].indexOf('_') > -1 ? doc[2].indexOf('_') : doc[2].length) : doc[4]);
					// remove suplicate documents
					documents = [...new Set(documents)];
					additionalResponse = 'Database search results:';
					console.log({ documents });

				} catch (error) {
					console.error('Error while parsing documents:', error);
				}

				// Get the accuracy score from the response
				let accuracy = 0;
				const accuracyLabel = 'RATING_ACCURACY';
				try {
					const accuracyIndex = parts.indexOf(accuracyLabel);
					accuracy = JSON.parse(parts.slice(accuracyIndex + 1, accuracyIndex + 2)).accuracy;
					console.info('Accuracy:', accuracy);
				} catch (error) {
					console.error('Error while parsing accuracy:', error);
				}

				// set the text to write
				setToWrite({ text: match[1].trim(), documents, additionalResponse, accuracy });
				setWriting(true);

				// find the position of FORMING_RESPONSE
				const formingResponseIndex = parts.indexOf('FORMING_RESPONSE');
				const _steps = parts.slice(0, formingResponseIndex);
				// get only the _steps that are uppercase string no whitespaces
				const _stepsFiltered = _steps.filter(step => step.trim() === step.toUpperCase() && step.indexOf(' ') === -1);
				setSteps(_stepsFiltered);

				// Update chat history with the response
				addToChatHistory(match[1].trim(), 'assistant');
			}

			// clear the loading message
			setLoading(false);
		} catch (error) {
			errorRef.current.showError();
			// clear the loading message
			setLoading(false);
			console.error('Error while fetching data:', error);
			AddToCurrentChat({ type: 'response', error: true, txt: 'Service Unavailable' });
			setLoading(false);
		}
	}

	const addToChatHistory = (message, sender) => {
		setChatHistory(prevHistory => [...prevHistory, { message, sender }]);
	};

	const makeGrokRequest = async (query, prompt = '', chatHistory = []) => {
		if (isRefiningQuery) {
			prompt = refiningPrompt;
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
								showMoreOptions={index === currentChat.chat.length - 1 && !(loading || writing)}
								funcOne={() => makeGrokRequest('Please expand on your initial response with more details.', addDetailsPrompt, chatHistory)}
								funcTwo={() => makeElasticSearchRequest()}
								funcThree={() => {
									inputRef.current.focus();
									setIsRefiningQuery(true);
								}}
								noImg={!(index != 0 && currentChat.chat[index - 1].type === 'response')}
								documents={msg.documents}
								additionalResponse={msg.additionalResponse}
								accuracy={msg.accuracy}
							/>
						)))
				}
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
							// change the msg to generate the complex response
							AddToCurrentChat({ type: 'response', txt: toWrite.text, documents: toWrite.documents, additionalResponse: toWrite.additionalResponse, accuracy: toWrite.accuracy });
							setToWrite({});
						}}
					/>
				}
			</section >
			{
				(!currentChat || currentChat?.length == 0) && (
					<section className={`${chatStyles['suggestions']} gap-2 px-5 pb-2 w-2/3 md:w-full justify-self-center max-w-[100vw]`}>
						<p className="w-full text-sm pb-2">{t("suggestion_msg")}</p>
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
								title='Cancel refining the query'
								className='cursor-pointer'
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
								if (!query || query.trim() === '') {
									console.error('Cannot send an empty query');
									return;
								}
								if (isRefiningQuery) {
									// clear input field
									setQuery('');
									// add the user's query to the chat history
									AddToCurrentChat({ type: 'question', txt: query });

									makeGrokRequest(query, '', chatHistory);
									setIsRefiningQuery(false);
								} else {
									handleAddQuestion(query)
								}
							}
						}}
						disabled={loading}
						ref={inputRef}
						type="text" placeholder={t("new_message")} className="w-full text-gray-950 placeholder:text-gray-400 p-2" />
					<img src={playIcon} alt="" className="w-8 h-8 cursor-pointer" onClick={() => {
						if (query === '') return;
						if (isRefiningQuery) {
							// const prompt = `You are an expert in the YMCA globally at all levels.
							// Your role is to help the user get an accurate answer to their query.
							// Consider the user's current question and the previous context in
							// formulating your response.`

							// clear input field
							setQuery('');
							// add the user's query to the chat history
							AddToCurrentChat({ type: 'question', txt: query });

							makeGrokRequest(query, addDetailsPrompt, chatHistory);
							setIsRefiningQuery(false);
						} else {
							handleAddQuestion(query)
						}
					}} />
				</div>
			</section >

			<Error ref={errorRef} />
		</div >
	)
}

export default Chat;
