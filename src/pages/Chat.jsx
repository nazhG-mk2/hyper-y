import { useEffect, useRef, useState } from 'react';
import { IoSend } from 'react-icons/io5';
import chatStyles from './Chat.module.css';
import axios from 'axios';
import Question from '../componets/chat/Question';
import Response from '../componets/chat/Response';
import { useChatContext } from '../contexts/Chat';
import { useTranslation } from 'react-i18next';
import Error from '../componets/common/Error';
import { GlobalContext } from '../contexts/Global';
import { useLocation } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'https://llmdemos.hyperpg.site/demo-backend';

const Chat = () => {
	// State to control if the question has already been processed
	const [lastQuestionId, setLastQuestionId] = useState(null);
	const { t } = useTranslation();
	const { AddToCurrentChat, currentChat } = useChatContext();
	const { state } = GlobalContext();
	const systemPrompt = state.prompt;

	const [query, setQuery] = useState('');
	const [loading, setLoading] = useState(false);
	const [writing, setWriting] = useState(false);
	const [toWrite, setToWrite] = useState({});

	const [isExpanded, setIsExpanded] = useState(false);

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

		handleResize(); // To validate initially
	}, [query]);

	const makeLocalAskRequest = async (query) => {
		const lang = localStorage.getItem('locale') || 'en';
		setLoading("Consulting Agent...");
		try {
			// Build chat history for the message
			const messages = [];
			// Include system prompt
			messages.push({
				role: 'system',
				content: `You must answer strictly in ${lang.toUpperCase()} language. ${systemPrompt}`
			});
			// Include chat history
			console.log('Chat history:', currentChat);
			if (currentChat && currentChat.chat && currentChat.chat.length > 0) {
				const maxHistory = 10;
				const truncatedHistory = currentChat.chat.slice(-maxHistory);
				const uniqueMessages = new Set();
				const maxMessageLength = 150; // Define the maximum length for messages
				truncatedHistory.forEach(entry => {
					let messageContent = entry.txt.trim();
					// Ensure truncation for assistant messages
					if (entry.type === "response" && messageContent.length > maxMessageLength) {
						messageContent = messageContent.slice(0, maxMessageLength) + '...'; // Truncate and add ellipsis
					}

					if (messageContent !== '' && !uniqueMessages.has(messageContent)) {
						console.log('Adding unique message:', messageContent.length);
						uniqueMessages.add(messageContent);
						messages.push({
							role: entry.type === 'question' ? 'user' : 'assistant',
							content: messageContent
						});
					}
				});
			}
			setLoading("Obtaining token...");
			const requestResponse = await axios.post(BACKEND_URL + '/request', {
				messages: messages,
				think: false
			}, {
				headers: {
					'Content-Type': 'application/json'
				}
			});

			// Extract token from response
			const token = requestResponse.data.token;
			if (!token) {
				throw new Error('No token received from request endpoint');
			}

			// Step 2: Use the token to get the chat response via streaming
			setLoading("Getting response...");

			// Use fetch to handle streaming
			const response = await fetch(BACKEND_URL + '/chat', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					token: token
				})
			});

			console.log('Response received from chat endpoint:', response);

			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}

			// Prepare to receive streaming
			let fullAnswer = '';
			const reader = response.body.getReader();
			const decoder = new TextDecoder();

			try {
				let isDone = false;
				while (!isDone) {
					const { done, value } = await reader.read();

					if (done) {
						isDone = true;
						break;
					}

					const chunk = decoder.decode(value, { stream: true });

					// Split by lines and filter those starting with "data:"
					const lines = chunk.split('\n').filter(line => line.startsWith('data:'));
					setLoading(false);
					setWriting(true);

					for (const line of lines) {
						const jsonString = line.replace('data: ', '').trim();
						try {
							const parsed = JSON.parse(jsonString);
							if (parsed.token != undefined && parsed.token != 'undefined') {
								fullAnswer += parsed.token;
								setToWrite({ text: fullAnswer, documents: [] });
							}
						} catch (e) {
							console.warn('Error al parsear chunk JSON:', jsonString);
						}
					}
				}

			} finally {
				console.log('Finishing stream reading');
				reader.releaseLock();

				setWriting(false);
				AddToCurrentChat(
					{ type: 'response', txt: fullAnswer, documents: null, additionalResponse: null, accuracy: null }
				)
				setToWrite({});
			}

		} catch (error) {
			console.error('Error al consultar el servicio:', error);
			errorRef.current.showError();
		} finally {
			setLoading(false);
		}
	};

	const handleAddQuestion = async (question) => {
		setQuery('');
		setIsExpanded(false);
		AddToCurrentChat({ type: 'question', txt: question });
	}

	useEffect(() => {
		if (currentChat && currentChat.chat && currentChat.chat.length > 0) {
			const lastMsg = currentChat.chat[currentChat.chat.length - 1];
			// Only if it's a question and hasn't been processed
			if (lastMsg.type === 'question' && lastMsg.txt && lastMsg.id !== lastQuestionId) {
				makeLocalAskRequest(lastMsg.txt);
				setLastQuestionId(lastMsg.id || lastMsg.txt); // Use id if exists, otherwise use text
			}
		}
	}, [currentChat]);


	const location = useLocation();
	const navigate = useNavigate();

	useEffect(() => {
		const params = new URLSearchParams(location.search);
		const token = params.get('token');

		if (token) {
			Cookies.set('token', token, { expires: 1 / 24 }); // 1 hour
		} else {
			const cookieToken = Cookies.get('token');
			if (!cookieToken) {
				navigate('/login');
			}
		}
	}, [location, navigate]);

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
						writing &&
						<Response
							response={toWrite.text}
							noImg={true}
							shouldType={true}
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
				<div></div>
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
								e.preventDefault(); // Prevent line breaks
								if (!query || query.trim() === '') {
									console.error('Cannot send an empty query');
									return;
								}
								handleAddQuestion(query);
							}
						}}
						disabled={loading}
						ref={inputRef}
						type="text" placeholder={t("new_message")}
						className={`w-full resize-none bg-transparent outline-none text-gray-950 placeholder:text-gray-400 p-2 transition-all ${isExpanded ? "h-20" : "h-10"}`} />
					<div className="flex items-center gap-1">
						<IoSend
							className={`w-5 h-5 cursor-pointer transition-colors duration-200 ${loading || !query.trim()
								? 'text-gray-400 cursor-not-allowed'
								: 'text-primary hover:text-primary-soft'
								}`}
							onClick={() => {
								if (!loading && query.trim()) {
									handleAddQuestion(query);
								}
							}}
						/>
					</div>
				</div>
			</section >
			<Error ref={errorRef} />
		</div >
	)
}

export default Chat;
