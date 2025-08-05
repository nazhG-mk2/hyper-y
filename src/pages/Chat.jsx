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

const availableBackends = [
    { src: "/gpt.png", label: "gpt-4o", url: "https://llmdemos.hyperpg.site/backend-hypery-4" },
    { src: "/groq.png", label: "llama-3.3-70b", url: "https://llmdemos.hyperpg.site/backend-hypery-7" },
    { src: "/qwen.png", label: "qwen3:8b", url: "https://llmdemos.hyperpg.site/backend-hypery-1" },
    { src: "/gemma.png", label: "gemma3:4b", url: "https://llmdemos.hyperpg.site/backend-hypery-2" },
    { src: "/mistral.png", label: "mistral:7b", url: "https://llmdemos.hyperpg.site/backend-hypery-3" },
    { src: "/gpt.png", label: "gpt-4o-mini", url: "https://llmdemos.hyperpg.site/backend-hypery-6" },
    { src: "/gpt.png", label: "gpt-3.5-turbo", url: "https://llmdemos.hyperpg.site/backend-hypery-5" },
];

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
	const [selected, setSelected] = useState('');

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
				currentChat.chat.forEach(entry => {
					messages.push({
						role: entry.type === 'question' ? 'user' : 'assistant',
						content: entry.txt
					});
				});
			}
			// Add current user message
			messages.push({ role: 'user', content: query });

			setLoading("Obtaining token...");
			const backendToUse = selected.url || availableBackends[0].url; // Default to the first backend if none is selected
			const requestResponse = await axios.post(backendToUse + '/request', {
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
			const response = await fetch(backendToUse + '/chat', {
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
				className={`${chatStyles.chat} flex justify-end px-6 md:px-2 mr-20`}>
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
				{/* BUBBLES */}
				<div className="flex flex-col-reverse z-20 gap-2 max-h-12 md:max-h-10 self-end transition-all duration-1000 hover:max-h-full overflow-y-hidden hover:overflow-y-auto pr-[15px] md:hover:pr-2 hover:pr-0 fixed bottom-56 md:bottom-[125px] right-5 md:right-0">
					{availableBackends.map((backend, index, arr) => (
						<div
							key={index}
							className={`group transition-all duration-400 item flex gap-2 justify-end items-center ${selected.url === backend.url ? 'order-first ' : ''}`}
							onClick={() => {
								setSelected(backend);
							}}
						>
							<span className="max-w-0 p-2 bg-white rounded-lg bg-opacity-90 group-hover:max-w-[200px] opacity-0 group-hover:opacity-100 transition-all duration-300 text-gray-700 font-semibold whitespace-nowrap overflow-hidden">
								{backend.label}
							</span>
							<div
								className={`w-9 h-9 rounded-full overflow-hidden transition-transform duration-300
								${index === 0 ? "group-hover:-translate-x-1" : ""}
								${index === 1 || index === arr.length - 1 ? "group-hover:-translate-x-0.5" : ""}
								${selected.url === backend.url ? "ring-2 md:ring-1 md:mb-1 ring-primary mr-1" : ""}
								`}
							>
								<img
									src={backend.src}
									className="w-full h-full object-cover scale-[1.2]"
									alt={backend.label}
								/>
							</div>
						</div>
					))}
				</div>
				{/* END BUBBLES */}
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
								e.preventDefault(); // Prevenir el salto de línea
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
