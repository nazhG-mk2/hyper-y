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
import { GlobalContext } from '../contexts/Global';
import { defaultPrompt } from '../contexts/Chat';

const GROK_URL = 'http://15.164.237.192/v1/chat/completions';
const ELASTICSEARCH_URL = 'http://18.219.124.9:8888/stream_chat';
const HOST = import.meta.env.VITE_HOST;
const AUTH = import.meta.env.VITE_AUTH;
const MODEL = import.meta.env.VITE_MODEL;

const VITE_BASE_ROUTE = import.meta.env.VITE_BASE_ROUTE;

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
	// EXPLANATION:\s*([\s\S]*?)\nREFINED_ANSWER:
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
	const { state } = GlobalContext();
	const systemPrompt = state.prompt || defaultPrompt;

	const [query, setQuery] = useState('');
	const [loading, setLoading] = useState(false);
	const [writing, setWriting] = useState(false);
	const [toWrite, setToWrite] = useState({});
	const [steps, setSteps] = useState([]);
	const [currentStep, setCurrentStep] = useState([]);
	const [writingLong, setWritingLong] = useState(false);
	const [toWriteLong, setToWriteLong] = useState({});
	const [on, setOn] = useState(false);

	const [selected, setSelected] = useState('');

	const [chatHistory, setChatHistory] = useState([]);

	const [isExpanded, setIsExpanded] = useState(false);

	const chatref = useRef(null);
	const inputRef = useRef(null);
		const errorRef = useRef(null);

	const suggestions = [
		t('suggestion_1'),
		t('suggestion_2'),
		t('suggestion_3'),
	];

	useEffect(() => {
		const handleResize = () => {
			if (inputRef.current) {
				const { scrollHeight } = inputRef.current;

				setIsExpanded(scrollHeight > 40 && query.length > 10);
			}
		};

		handleResize(); // Para validar inicialmente
	}, [query]);

	const buildRequestOptions = (url, messages, query) => {
		let requestBody = {};
		let requestHeaders = {};

		if (url === GROK_URL) {
			requestBody = {
				"messages": messages,
				"model": "llama3-70b-8192",
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
				'timeout': 10000,
				'Content-Type': 'application/json',
			};
		}

		return { requestBody, requestHeaders };
	};

	const makeRequest = async (query, url, prompt = false) => {
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

		// display a loading message
		if (url === GROK_URL) setLoading("Generating a quick response for you...");
		if (url === ELASTICSEARCH_URL) setLoading("Searching the database...");

		const { requestBody, requestHeaders } = buildRequestOptions(url, messages, query);

		try {
			// fetch the data
			console.log('Fetching data from:', url);

			const response = await axios.post(url, requestBody, {
				headers: requestHeaders
			});


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
				// set the current step to 0 to start from the beginning
				setCurrentStep(() => 0);

				// we spect to find FORMING_RESPONSE warpping the text to write
				// if we don't find it, log an error and return
				if (!match) return console.error("No match found");

				// Get the documents from the response
				const docLabel = 'REFERENCES';
				const docIndex = parts.indexOf(docLabel);
				let documents = [];
				let additionalResponse = '';
				try { // try to parse the documents
					documents = JSON.parse(parts.slice(docIndex + 1, docIndex + 2)).map(doc => doc[4] == "" ? doc[2].slice(0, doc[2].indexOf('_') > -1 ? doc[2].indexOf('_') : doc[2].length) : doc[4]);
					// remove suplicate documents
					documents = [...new Set(documents)];
					additionalResponse = t('database_search');
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
		} catch (error) {
			console.error('Error while fetching data:', error);
			console.warn('Datos parciales:', error.response.data);
			errorRef.current.showError();
			// AddToCurrentChat({ type: 'response', error: true, txt: 'Service Unavailable' });
			setLoading(false);
		} finally {
			// clear the loading message
			setLoading(false);
		}
	}

	const addToChatHistory = (message, sender) => {
		setChatHistory(prevHistory => [...prevHistory, { message, sender }]);
	};

	const makeGrokRequest = async (query) => {
		if (on) {
			await makeRequest(query, GROK_URL, grokPrompt);
		} else {
			await makeRequest(query, GROK_URL, basicPrompt);
		}
	};
	const makeElasticSearchRequest = async (query) => {
		// this is the prompt use in "Do a database search"
		await makeRequest(query, ELASTICSEARCH_URL);
	}
	const makeLocalAskRequest = async (query) => {
		setLoading("Consultando OpenAI...");
		try {
			const modelToUse = selected.model || MODEL;
			// Construir el historial de chat para el mensaje
			const messages = [];
			// Incluir el prompt del sistema
			if (systemPrompt) {
				messages.push({ role: 'system', content: systemPrompt });
			}
			// Incluir el historial de chat
			chatHistory.forEach(entry => {
				messages.push({
					role: entry.sender === 'user' ? 'user' : 'assistant',
					content: entry.message
				});
			});
			// Agregar el mensaje actual del usuario
			messages.push({ role: 'user', content: query });

			const response = await axios.post(HOST, {
				messages,
				model: modelToUse
			}, {
				headers: {
					Authorization: `Bearer ${AUTH}`
				}
			});
			let answer = "...";
			switch (modelToUse) {
				case "xai-grok-3-mini":
					answer = response.choices[0].message.content;
					break;
				case "openai-gpt-4.1-nano":
				case "openai-gpt-4.1":
				case "openai-o3-mini":
				case "anthropic-claude-3.7":
				case "google-gemini-2.0":
				case "google-gemini-pro":
				case "xai-grok2":
					answer = response.data.choices?.[0]?.message?.content || response.data.response;
					break;
				default:
					answer = response.data.response;
					break;
			}
			setToWrite({ text: answer, documents: [] });
			setWriting(true);
			addToChatHistory(answer, 'assistant');
		} catch (error) {
			console.error('Error al consultar OpenAI:', error);
			errorRef.current.showError();
			setLoading(false);
		} finally {
			setLoading(false);
		}
	};

	const handleAddQuestion = async (question) => {
		setQuery('');
		setIsExpanded(false);
		AddToCurrentChat({ type: 'question', txt: question });
		await makeLocalAskRequest(question);
		// Si quieres seguir usando makeGrokRequest o makeElasticSearchRequest, puedes agregarlos aquí
	}

	return (
		<div className={`${chatStyles['chat-grid']} py-6 font-poppins md:text-sm`}>
			<section
				ref={chatref}
				className={`${chatStyles.chat} flex justify-end px-6 md:px-2`}>
				<div className="flex flex-1 flex-col gap-5 max-w-full overflow-visible">
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
									noImg={!(index != 0 && currentChat.chat[index - 1].type === 'response')}
									documents={msg.documents}
									additionalResponse={msg.additionalResponse}
									accuracy={msg.accuracy}
								/>
							)))
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
					{
						loading && (
							<div className="flex ml-14">
								<p className='text-base text-shyne'>{loading}</p>
							</div>
						)
					}
				</div>
				<div className="flex flex-col-reverse z-20 gap-2 max-h-14 self-end transition-all duration-1000 hover:max-h-full overflow-y-hidden hover:overflow-y-auto pr-[15px] hover:pr-0 fixed bottom-5 right-5">
					{[
						{ src: "https://flagcdn.com/ca.svg", label: "YMCA - Canada", model: "openai-gpt-4.1-nano" },
						{ src: "https://flagcdn.com/us.svg", label: "YMCA - US", model: "openai-gpt-4.1" },
						{ src: "https://upload.wikimedia.org/wikipedia/commons/b/b7/Flag_of_Europe.svg", label: "YMCA - Europe", model: "openai-o3-mini" },
						{ src: "https://flagcdn.com/fr.svg", label: "YMCA - France", model: "anthropic-claude-3.7" },
						{ src: "https://flagcdn.com/de.svg", label: "YMCA - Germany", model: "google-gemini-2.0" },
						{ src: "https://flagcdn.com/es.svg", label: "YMCA - Spain", model: "google-gemini-pro" },
						{ src: "https://flagcdn.com/it.svg", label: "YMCA - Italy", model: "xai-grok-3-mini" },
						{ src: "https://flagcdn.com/gb.svg", label: "YMCA - United Kingdom", model: "xai-grok2" },
					].map((flag, index, arr) => (
						<div
							key={index}
							className={`group transition-all duration-400 item flex gap-2 justify-end items-center ${selected.model === flag.model ? 'order-first ' : ''}`}
							onClick={() => setSelected(flag)}
						>
							<span className="max-w-0 p-2 bg-white rounded-lg bg-opacity-90 group-hover:max-w-[150px] opacity-0 group-hover:opacity-100 transition-all duration-300 text-gray-700 font-semibold whitespace-nowrap overflow-hidden">
								{flag.label} <br /> <span className="text-xs text-gray-500">{flag.model}</span>
							</span>
							<div
								className={`w-10 h-10 rounded-full overflow-hidden border border-gray-400 transition-transform duration-300
								${index === 0 ? "group-hover:-translate-x-1" : ""}
								${index === 1 || index === arr.length - 1 ? "group-hover:-translate-x-0.5" : ""}
								${selected.model === flag.model ? "ring-2 ring-primary" : ""}
								`}
							>
								<img
									src={flag.src}
									className="w-full h-full object-cover"
									alt={flag.label}
								/>
							</div>
						</div>
					))}
					{selected.model && (
						<div className="text-xs text-center text-primary font-semibold mt-2">Modelo seleccionado: {selected.model}</div>
					)}
				</div>
			</section >
			< section className={`${chatStyles['new-message']} flex justify-center pt-6 gap-2 px-6`}>
				<div className="join gap-1 items-center bg-[#EBEBEB] text-[#747775] px-3 w-2/3 md:w-full disabled:bg-[#EBEBEB] disabled:text-[#747775] disabled:cursor-progress">
					<textarea
						value={query}
						onChange={(e) => {
							setQuery(e.target.value)
							if (inputRef.current) {
								const { scrollWidth, clientWidth } = inputRef.current;
								setIsExpanded(scrollWidth > clientWidth);
							}
						}}
						onKeyDown={(e) => {
							if (e.key === 'Enter') {
								if (!query || query.trim() === '') {
									console.error('Cannot send an empty query');
									return;
								}
								handleAddQuestion(query)
							}
						}}
						disabled={loading}
						ref={inputRef}
						type="text" placeholder={t("new_message")}
						className={`w-full resize-none bg-transparent outline-none text-gray-950 placeholder:text-gray-400 p-2 transition-all ${isExpanded ? "h-20" : "h-10"}`} />
					<div className="flex items-center gap-1">
						<div className="tooltip tooltip-primary flex items-center" data-tip={t("deep_search")}>
							{on ? (
								<img src={`${VITE_BASE_ROUTE}/logo_ymca.png`} alt=""
									className='w-14 cursor-pointer'
									onClick={() => setOn(!on)}
								/>
							) : (
								<img src={`${VITE_BASE_ROUTE}/logo_ymca.png`} alt=""
									className='w-14 cursor-pointer filter grayscale'
									onClick={() => setOn(!on)}
								/>
							)}
						</div>
						<img
							src={playIcon}
							alt=""
							className="w-8 h-8 cursor-pointer"
							onClick={() => handleAddQuestion(query)}
						/>
					</div>
				</div>
			</section >
			<Error ref={errorRef} />
		</div >
	)
}

export default Chat;
