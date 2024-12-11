import { useEffect, useMemo, useRef, useState } from 'react';
import playIcon from '../assets/play.svg';
import chatStyles from './Chat.module.css';
import axios from 'axios';
import Question from '../componets/chat/Question';
import Response from '../componets/chat/Response';
import Suggestion from '../componets/chat/Suggestion';
// import Loading from '../componets/chat/Loading';
import Responding from '../componets/chat/Responding';
// import { GlobalContext } from '../contexts/Global';
import { useChatContext } from '../contexts/Chat';

const requestLocation = () => {
	if ("geolocation" in navigator) {
		navigator.geolocation.getCurrentPosition(
			(position) => {
				console.log("Latitude:", position.coords.latitude);
				console.log("Longitude:", position.coords.longitude);
			},
			(error) => {
				console.error("Error fetching location:", error.message);
			}
		);
	} else {
		console.error("Geolocation is not supported by this browser.");
	}
};

const Chat = () => {
	// const { state: context } = GlobalContext();
	const { AddToCurrentChat, currentChat } = useChatContext();
	// const { token: user_id } = context;
	console.log({ currentChat: currentChat });

	// const [userId, setUserId] = useState('');
	const [query, setQuery] = useState('');
	const [loading, setLoading] = useState(false);
	const [writing, setWriting] = useState(false);
	const [toWrite, setToWrite] = useState({});
	const [steps, setSteps] = useState([]);
	const [currentStep, setCurrentStep] = useState([]);
	const [writingLong, setWritingLong] = useState(false);
	const [toWriteLong, setToWriteLong] = useState({});

	const chatref = useRef(null);

	const scrollToBottom = () => {
		if (chatref.current) {
			chatref.current.scrollTop = chatref.current.scrollHeight;
		}
	};

	const isAtBottom = () => {
		if (chatref.current) {
			const { scrollTop, scrollHeight, clientHeight } = chatref.current;
			return scrollHeight - scrollTop - clientHeight <= 50;
		}
		return false;
	}

	const script = useMemo(() => [
		{
			msg: (<Question
				refToScroll={chatref}
				key={0} question={'I want to play some pickleball.'} />),
		},
		{
			msg: (<Responding
				key={1}
				refToScroll={chatref}
				agent={'fast'}
				data={{
					text:
						'Okay, cool, I’ll pull in your local Y'
				}}
				end={() => {
					setLoading('We are connecting you with the West End YMCA...');
					setTimeout(() => {
						setScriptStep((prev) => prev + 1);
					}, 2000);
				}}
			/>),
		},
		{
			msg: (<div
				key={2}
			>
				<Responding
					key={3}
					refToScroll={chatref}
					agent={'precise'}
					data={{
						text:
							`Hi, here are the times available for pickleball today at our location:
* Learn to Play Pickleball: 9:00 AM – 10:00 AM.
* Open Play: 10:00 AM – 1:00 PM.

Would you like me to book a court for you?
`
					}}
					end={() => {
						setLoading(false);
						setTimeout(() => {
							setSuggestions(['I’m actually going to be on the east side of town. Can you find something for me there?']);
						}, 500);
					}}
				/>
			</div>),
		},
		{
			msg: (<Question key={4}
				refToScroll={chatref}
				question={'I’m actually going to be on the east side of town. Can you find something for me there?'
				} />),
		},
		{
			msg: (<Responding
				key={5}
				refToScroll={chatref}
				agent={'fast'}
				data={{
					text:
						'Sure, let me connect you with the YMCAs in the east side of Toronto.'
				}}
				end={() => {
					setLoading('We are connecting you with the YMCA GTA...');
					setTimeout(() => {
						setScriptStep((prev) => prev + 1);
					}, 3000);
				}}
			/>),
		},
		{
			msg: (<Responding
				key={6}
				agent={'toronto'}
				refToScroll={chatref}
				data={{
					text:
						`We have several YMCAs offering pickleball on the east side of Toronto. Here are some options:
- Steve & Sally Stavro Family YMCA (907 Kingston Rd):
	- Beginner's Learn to Play Pickleball Workshop: 5:00 PM – 6:00 PM
[Steve & Sally Stavro Family YMCA](https://www.ymcagta.org/find-a-y/the-steve-sally-stavro-family-ymca)
* North York YMCA (567 Sheppard Ave E):
  * Learn to Play Pickleball: Wednesdays, 9:00 AM – 10:00 AM
  * Open Play: Wednesdays, 10:00 AM – 1:00 PM
[North York YMCA](https://www.ymcagta.org/find-a-y/north-york-ymca)
* Scarborough YMCA (230 Town Centre Ct):
  * Open Play: 12:00 PM – 2:00 PM
  * Intermediate Play: 3:00 PM – 5:00 PM
[Scarborough YMCA](https://www.ymcagta.org/find-a-y/scarborough-ymca)
        `
				}}
				end={() => {
					setLoading(false);
					setTimeout(() => {
						setSuggestions(['How about the Stavro Y at 5 pm?']);
					}, 500);
				}}
			/>),
		},
		{
			msg: (<Question key={0}
				refToScroll={chatref}
				question={'How about the Stavro Y at 5 pm?'} />),
		},
		{
			msg: (<Responding
				key={1}
				refToScroll={chatref}
				agent={'fast'}
				data={{
					text:
						'Sure, I\'ll take care of that for you'
				}}
				end={() => {
					setLoading('inviting Steve & Sally Stavro Family YMCA to the chat...');
					setTimeout(() => {
						setScriptStep((prev) => prev + 1);
					}, 3000);
				}}
			/>),
		},
		{
			msg: (<Responding
				key={1}
				refToScroll={chatref}
				agent={'chat'}
				data={{
					text:
						`Hyper-Y invites Steve & Sally Stavro Family YMCA to the chat`
				}}
				end={() => {
					setLoading('Sally Stavro Family YMCA is typing...');
					console.log('Sally Stavro Family YMCA is typing...');
					
					setTimeout(() => {
						setLoading(false);
						setScriptStep((prev) => prev + 1);
					}, 3000);
				}}
			/>),
		},
		{
			msg: (<Responding
				key={1}
				refToScroll={chatref}
				agent={'family'}
				data={{
					text:
						`Great! I’ve booked you for the Beginner's Learn to Play Pickleball Workshop at 5 PM.`
				}}
				end={() => {

				}}
			/>),
		},
	], []);

	const [ScriptStep, setScriptStep] = useState(0);

	// useEffect(() => {
	//   if (ScriptStep === -1) return;
	//   let stepTimeout;
	//   if (ScriptStep == 0) {
	//     stepTimeout = 0;
	//   } else {
	//     stepTimeout = 3000
	//   }
	//   console.log(script[ScriptStep]?.type);

	//   if (ScriptStep === 1) {
	//     setLoading('Generating a quick response for you...');
	//   }
	//   if (ScriptStep === 2) {
	//     setLoading('Gathering more insights...');
	//   }
	//   if (ScriptStep === 3) {
	//     setLoading(false);
	//   }
	//   if (ScriptStep === 4) {
	//     setLoading('Generating a quick response for you...');
	//   }
	//   if (ScriptStep === 5) {
	//     setLoading('Gathering more insights...');
	//   }
	//   if (ScriptStep === 6) {
	//     setLoading(false);
	//   }

	//   if (ScriptStep < script.length) {

	//     setTimeout(() => {
	//       console.log('Step:', ScriptStep);
	//       setScriptStep((prev) => prev + 1);
	//     }, stepTimeout);
	//   }
	// }, [ScriptStep, script]);

	const [suggestions, setSuggestions] = useState([
		'I want to play some pickleball'
	]);

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

	const handleSubmit = async (q) => {
		try {
			const gronkRequest = await axios.post('http://43.202.113.176/v1/chat/completions', {
				"messages": [
					{
						"role": "system",
						"content": "You are an expert on the YMCA globally at all scales of the organization. You provide concise and clear answers. If you do not have a clear answer to what is being asked, you should guide the user to provide more information so that you can eventually provide either a very clear answer to the user's query, or direct them to a definite resource where they are likely to find what they need. In this initial response, you are to just provide a short response, in 5 lines or less, unless you are certain that you have the precise answer that the user is looking for, in which case a longer response is allowed. You will have the opportunity to perform a database search later in the process, so all the more reason to be brief here. You always respond in the language of the initial prompt from the user. You do not need to ask the user whether to perform a database search related to the query because it is going to be performed anyway. If you cannot provide useful general information indicate that you do not know and that you will look more into it for the user. If you can provide useful general information, just state it and indicate that you will look for more details."
					},
					{
						"role": "user",
						"content": q
					}
				],
				"model": "grok-beta",
				"stream": false,
				"temperature": .5
			}, {
				headers: {
					'Content-Type': 'application/json'
				}
			}).then((response) => {
				const { data: { choices } } = response;
				const resp = choices[0].message.content;

				setToWrite({ text: resp, documents: [] });
				setWriting(true);
			});
			const fullRequest = await axios.post('http://18.219.124.9:9999/stream_chat', {
				"user_query": q,
				"searches": 2
			}).then(async (response) => {
				const parts = response.data.split('\n');
				// get the text between FORMING_RESPONSE and END_RESPONSE in the response
				const match = response.data.match(/FORMING_RESPONSE([\s\S]*?)END_RESPONSE/);
				console.log({ match });

				setCurrentStep(() => 0);

				if (match) {
					console.log(match[1].trim());
					setToWriteLong({ text: match[1].trim() });
				} else {
					console.log("No match found");
				}

				// find the position of FORMING_RESPONSE
				const formingResponseIndex = parts.indexOf('FORMING_RESPONSE');
				const _steps = parts.slice(0, formingResponseIndex);
				// get only the _steps that are uppercase string no whitespaces
				const _stepsFiltered = _steps.filter(step => step.trim() === step.toUpperCase() && step.indexOf(' ') === -1);
				console.log({ _stepsFiltered });
				setSteps(_stepsFiltered);
				setLoading('Searching for the best answer...');

			});

			await Promise.all([gronkRequest, fullRequest]);
			console.log({
				toWriteLong,
				steps,
			});


		} catch (error) {
			console.error('Error while fetching data:', error);
			setSteps([]);
			setCurrentStep(0);
			setLoading(false);


			AddToCurrentChat({ type: 'response', error: true, txt: 'Error - Service Unavailable' });
		}
	};

	useEffect(() => {
		console.log({ steps, currentStep });

		if (steps.length === 0) return;

		let stepTimeout;
		if (currentStep < steps.length) {
			// Mostrar cada paso después de un segundo
			stepTimeout = setTimeout(() => {
				console.log('Step:', steps[currentStep]);
				setCurrentStep((prev) => prev + 1);
				setLoading(formatThinkingSteps(steps[currentStep]));
			}, 1000); // 1000 ms = 1 segundo
		} else {
			// Cuando todos los pasos se han mostrado, muestra el mensaje final
			setTimeout(() => {
				setLoading(false);
				setWritingLong(true);
				console.log('END');

			}, 1000); // Espera 1 segundo después de mostrar el último paso
		}

		// Limpiar el timeout cuando el componente se desmonte o cambie el estado
		return () => clearTimeout(stepTimeout);
	}, [currentStep, steps]);

	const handleAddQuestion = (question) => {
		if (!question) return;
		AddToCurrentChat({ type: 'question', txt: question });
		handleSubmit(question);
		setQuery('');
		setLoading('Generating a quick response for you...');
	}

	useEffect(() => {
		if (chatref?.current) {
			const { scrollTop, scrollHeight, clientHeight } = chatref.current;

			// Verificar si está cerca del final (puedes ajustar el margen, como 50px)
			const isAtBottom = scrollHeight - scrollTop - clientHeight <= 50;
			console.log("isAtBottom", isAtBottom ? "true" : "false");

			if (isAtBottom) {
				chatref.current.scrollTo({
					top: scrollHeight,
					behavior: "smooth",
				});
			}
		}
	}, [currentChat, loading]);

	const [height, setHeight] = useState(0);

	useEffect(() => {
		const observer = new ResizeObserver((entries) => {
			for (let entry of entries) {
				if (entry.target === chatref.current) {
					setHeight(entry.contentRect.height);
					console.log("Height:", entry.contentRect.height);
				}
			}
		});

		const currentChatRef = chatref.current;

		if (currentChatRef) {
			observer.observe(currentChatRef);
		}

		return () => {
			if (currentChatRef) {
				observer.unobserve(currentChatRef);
			}
		};
	}, []);

	return (
		<div className={`${chatStyles['chat-grid']} py-6 font-poppins md:text-sm`}>
			<section
				ref={chatref}
				className={`${chatStyles.chat} flex flex-col px-6 md:px-2 overflow-x-hidden`}>
				{/* SCROLL TEST */}
				{/* <span className='py-[45%] my-2 text-center rounded-xl bg-gray-200 border-double border-gray-300'>This Element is jus for test</span> */}
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
							/>
						)))
				}
				{/* SCRIPTING */}
				{
					ScriptStep >= 0 && script.slice(0, ScriptStep).map((step, index) => (
						<div className='flex' key={index}>{step.msg}</div>
					))
				}
				{
					steps.length > 0 && steps.map((step, index) => (
						<Response key={index} response={formatThinkingSteps(step)} />
					))
				}
				{
					loading && (
						// <Loading />
						<div className="flex ml-14">
							<p className='text-base text-shyne'>{loading}</p>
							{/* <span className="emoji-rotator text-xs"></span> */}
						</div>
					)
				}
				{
					writing && <Responding data={toWrite} end={
						() => {
							setWriting(false);
							setToWrite({});
							// change the msg to generate the complex response
							setLoading('Gathering more insights...');
							AddToCurrentChat({ type: 'response', txt: toWrite.text, documents: toWrite.documents });
						}
					} />
				}
				{
					writingLong && <Responding data={{ text: toWriteLong.text, noImg: true }} end={
						() => {
							setWritingLong(false);
							setToWriteLong({});
							console.log('End of long response 🔥🔥🔥',);

							AddToCurrentChat({ type: 'response', txt: toWriteLong.text, documents: [] });
						}
					} />
				}
			</section >
			{
				(true) && (
					<section className={`${chatStyles['suggestions']} ${suggestions.length == 0 && 'invisible'} gap-2 px-5 pb-2 w-2/3 md:w-full justify-self-center max-w-[100vw]`}>
						<p className="w-full text-xs pb-2">Suggestions:</p>
						<div className="flex flex-wrap sm:flex-nowrap text-sm gap-2 overflow-x-auto pb-1">
							{
								suggestions.map((suggestion, index) => (
									<Suggestion key={index} suggestion={suggestion} onClick={() => {
										setSuggestions(() => []);
										setScriptStep((prev) => prev + 1);
										// adding Steve & Sally Stavro Family YMCA to the chat
										setLoading('Generating a quick response for you...');
										setTimeout(() => {
											scrollToBottom();
										}, 2);
										setTimeout(() => {
											setLoading(false);
											setScriptStep((prev) => prev + 1)
										}, 3000);
									}
									} />
								))
							}
						</div>
					</section>
				)
			}
			< section className={`${chatStyles['new-message']} flex justify-center ${suggestions.length == 0 ? 'pt-6' : "pt-0"} gap-2 px-6`}>
				<div className="join gap-1 items-center bg-[#EBEBEB] text-[#747775] px-3 w-2/3 md:w-full disabled:bg-[#EBEBEB] disabled:text-[#747775] disabled:cursor-progress">
					<input
						value={query}
						onChange={(e) => setQuery(e.target.value)}
						onKeyDown={(e) => {
							if (e.key === 'Enter') {
								handleAddQuestion(query);
							}
						}}
						disabled={true}
						type="text" placeholder="New Message" className="w-full text-gray-950 placeholder:text-gray-400 p-2 cursor-not-allowed" />
					<img src={playIcon} alt="" className="w-8 h-8 cursor-not-allowed" onClick={() => {
						handleAddQuestion(query)
					}} />
				</div>
			</section >
		</div >
	)
}

export default Chat;
