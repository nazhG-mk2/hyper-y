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
import { FaLightbulb, FaRegLightbulb } from "react-icons/fa";

// const GROK_URL = 'http://15.164.237.192/v1/chat/completions'

const GROK_URL = 'https://hyperpg.site/forward/15.164.237.192/80/v1/chat/completions'
const ELASTICSEARCH_URL = 'http://18.219.124.9:8888/stream_chat';

const grokPrompt = `
You are an expert on the YMCA globally at all scales of the organization.
You provide concise and clear answers.
If you do not have a clear answer to what is being asked, you should guide the user to provide more information so that you can eventually provide either a very clear answer to the user's query, or direct them to a definite resource where they are likely to find what they need.
In this initial response, you are to just provide a short response, in 5 lines or less, unless you are certain that you have the precise answer that the user is looking for, in which case a longer response is allowed.
You will have the opportunity to perform a database search later in the process, so all the more reason to be brief here.
You always respond in the language of the initial prompt from the user.
You do not need to ask the user whether to perform a database search related to the query because it is going to be performed anyway.
If you cannot provide useful general information indicate that you do not know and that you will look more into it for the user.
If you can provide useful general information, just state it and indicate that you will look for more details.
`;

const basicPrompt = `
Be a very helpful chatbot that helps the user.
`;


const ChatBasic = () => {
	const { t } = useTranslation();
	const { AddToCurrentChat, currentChat } = useChatContext();

	const [query, setQuery] = useState('');
	const [loading, setLoading] = useState(false);
	const [writing, setWriting] = useState(false);
	const [toWrite, setToWrite] = useState({});
	const [steps, setSteps] = useState([]);
	const [currentStep, setCurrentStep] = useState([]);
	const [on, setOn] = useState(false);

	const [chatHistory, setChatHistory] = useState([]);

	const [isExpanded, setIsExpanded] = useState(false);

	const [outputHTML, setOutputHTML] = useState(null);

	const chatref = useRef(null);
	const inputRef = useRef(null);
	const errorRef = useRef(null);

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
				let refinedAnswer = response.data.choices[0].message.content;
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

	const handleAddQuestion = async (question) => {
		setQuery('');
		setIsExpanded(false);
		AddToCurrentChat({ type: 'question', txt: question });
		await makeGrokRequest(question);
		// if (on) {
		// 	await makeElasticSearchRequest(question);
		// }
	}

	return (

		<div className={`${chatStyles['chat-grid']} py-6 pb-10 font-poppins md:text-sm`}>
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
			</section >
			< section className={`${chatStyles['new-message']} flex justify-center pt-6 gap-2 px-6`}>
				<div className="flex join gap-1 items-center bg-[#EBEBEB] text-[#747775] px-3 w-2/3 md:w-full disabled:bg-[#EBEBEB] disabled:text-[#747775] disabled:cursor-progress">
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
						<img
							src={playIcon}
							alt=""
							className="w-8 h-8 cursor-pointer"
							onClick={() => handleAddQuestion(query)}
						/>
					</div>
				</div>
				<br />
				<div className='flex items-center gap-2 text-gray-500'>
					Powered by llama3-70b-8192
				</div>
			</section >
			<Error ref={errorRef} />
		</div >
	)
}

export default ChatBasic;
