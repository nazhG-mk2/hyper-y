import { useEffect, useRef, useState } from 'react';
import playIcon from '../assets/play.svg';
import chatStyles from './Chat.module.css';
import axios from 'axios';
import Question from '../componets/chat/Question';
import Response from '../componets/chat/Response';
import Responding from '../componets/chat/Responding';
import { useChatContext } from '../contexts/Chat';
import { useTranslation } from 'react-i18next';
import Error from '../componets/common/Error';
import { GlobalContext } from '../contexts/Global';
import { useLocation } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'https://llmdemos.hyperpg.site/demo-backend';

const aviableModels = [
	{ src: "/groq.png", label: "Groq Llama 3", model: "groq-llama3" },
	{ src: "/openai.png", label: "OpenAI GPT-4.1 Nano", model: "openai-gpt-4.1-nano" },
	{ src: "/openai.png", label: "OpenAI GPT-4.1", model: "openai-gpt-4.1" },
	{ src: "/openai.png", label: "OpenAI O3 Mini", model: "openai-o3-mini" },
	{ src: "/claude.png", label: "Anthropic Claude 3.7", model: "anthropic-claude-3.7" },
	{ src: "/gemini.png", label: "Google Gemini 2.0", model: "google-gemini-2.0" },
	{ src: "/gemini.png", label: "Google Gemini Pro", model: "google-gemini-pro" },
	{ src: "/grok.png", label: "xAI Grok 2", model: "xai-grok2" },
	{ src: "/grok.png", label: "xAI Grok 3 Mini", model: "xai-grok-3-mini" },
];


const Chat = () => {
	const { t } = useTranslation();
	const { AddToCurrentChat, currentChat } = useChatContext();
	const { state } = GlobalContext();
	const systemPrompt = state.prompt;

	const [query, setQuery] = useState('');
	const [loading, setLoading] = useState(false);
	const [writing, setWriting] = useState(false);
	const [toWrite, setToWrite] = useState({});

	const [selected, setSelected] = useState('');

	const [chatHistory, setChatHistory] = useState([]);

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

		handleResize(); // Para validar inicialmente
	}, [query]);

	const addToChatHistory = (message, sender) => {
		setChatHistory(prevHistory => [...prevHistory, { message, sender }]);
	};


	const makeLocalAskRequest = async (query) => {
		const lang = localStorage.getItem('locale') || 'en';
		setLoading("Consulting Agent...");
		try {
			// Construir el historial de chat para el mensaje
			const messages = [];
			// Incluir el prompt del sistema
			messages.push({
				role: 'system',
				content: `You must answer strictly in ${lang.toUpperCase()} language. ${systemPrompt}`
			});
			// Incluir el historial de chat
			chatHistory.forEach(entry => {
				messages.push({
					role: entry.sender === 'user' ? 'user' : 'assistant',
					content: entry.message
				});
			});
			// Agregar el mensaje actual del usuario
			messages.push({ role: 'user', content: query });

			// Paso 1: Obtener el token del endpoint request
			setLoading("Obtaining token...");
			const requestResponse = await axios.post(BACKEND_URL+'/request', {
				model: "qwen3:8b",
				messages: messages,
				think: false
			}, {
				headers: {
					'Content-Type': 'application/json'
				}
			});

			// Extraer el token de la respuesta
			const token = requestResponse.data.token;
			if (!token) {
				throw new Error('No token received from request endpoint');
			}

			// Paso 2: Usar el token para obtener la respuesta del chat via streaming
			setLoading("Getting response...");

			// Usar fetch para manejar el streaming
			const response = await fetch(BACKEND_URL+'/chat', {
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

			// Preparar para recibir el streaming
			
			let fullAnswer = '';
			const reader = response.body.getReader();
			const decoder = new TextDecoder();
			
			try {
				setLoading(false);
				let isDone = false;
				while (!isDone) {
					const { done, value } = await reader.read();

					if (done) {
						isDone = true;
						break;
					}

					const chunk = decoder.decode(value, { stream: true });

					// Divide por líneas y filtra las que inician con "data:"
					const lines = chunk.split('\n').filter(line => line.startsWith('data:'));

					for (const line of lines) {
						const jsonString = line.replace('data: ', '').trim();
						try {
							const parsed = JSON.parse(jsonString);
							fullAnswer += parsed.token;
						} catch (e) {
							console.warn('Error al parsear chunk JSON:', jsonString);
						}
					}
				}

				// Ahora sí, setear todo al final
				setToWrite({ text: fullAnswer, documents: [] });
				setWriting(true);

			} finally {
				console.log('Finalizando lectura del stream');
				reader.releaseLock();
				setLoading(false);
			}

			// addToChatHistory(fullAnswer, 'assistant');
		} catch (error) {
			console.error('Error al consultar el servicio:', error);
			errorRef.current.showError();
		}
	};

	const handleAddQuestion = async (question) => {
		setQuery('');
		setIsExpanded(false);
		AddToCurrentChat({ type: 'question', txt: question });
		await makeLocalAskRequest(question);
	}

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
				<div className="flex flex-col-reverse z-20 gap-2 max-h-12 self-end transition-all duration-1000 hover:max-h-full overflow-y-hidden hover:overflow-y-auto pr-[15px] hover:pr-0 fixed bottom-6 right-5">
					{aviableModels.map((flag, index, arr) => (
						<div
							key={index}
							className={`group transition-all duration-400 item flex gap-2 justify-end items-center ${selected.model === flag.model ? 'order-first ' : ''}`}
							onClick={() => setSelected(flag)}
						>
							<span className="max-w-0 p-2 bg-white rounded-lg bg-opacity-90 group-hover:max-w-[200px] opacity-0 group-hover:opacity-100 transition-all duration-300 text-gray-700 font-semibold whitespace-nowrap overflow-hidden">
								{flag.label}
							</span>
							<div
								className={`w-9 h-9 rounded-full overflow-hidden transition-transform duration-300
								${index === 0 ? "group-hover:-translate-x-1" : ""}
								${index === 1 || index === arr.length - 1 ? "group-hover:-translate-x-0.5" : ""}
								${selected.model === flag.model ? "ring-2 ring-primary mr-1" : ""}
								`}
							>
								<img
									src={flag.src}
									className="w-full h-full object-cover scale-[1.2]"
									alt={flag.label}
								/>
							</div>
						</div>
					))}
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
