import { useEffect, useRef, useState } from 'react';
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

			setLoading(false);

			const question = "Please do a search for me."

			AddToCurrentChat({ type: 'question', txt: question });
			return;

		} catch (error) {
			console.error('Error while fetching data:', error);
			AddToCurrentChat({ type: 'response', error: true, txt: 'Error - Service Unavailable' });
		}
	};

	const makeGrokkRequest = async (q) => {
		/// q is the input question
		/// currentChat is all the conversation

		console.log("Making Grokk request for:", q);
		setLoading("Making Grokk request");

		try {
			const response = await axios.post('http://43.202.113.176/v1/chat/completions', {
				"messages": [
					{
						"role": "system",
						"content": `
						promt here
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
			console.log({ response });

			setToWrite({ text: 'Well done! 😎', documents: [] });
			setWriting(true);
			setLoading(false);
		} catch (error) {
			console.error('Error while fetching data:', error);
			AddToCurrentChat({ type: 'response', error: true, txt: 'Error - Service Unavailable' });
		}
	}
	const makeElasticSearchRequest = async (q) => {
		console.log("Making Elastic Search request for:", q);
	}

	//   const handleSubmit = async (q) => {
	//     try {
	//       const gronkRequest = await axios.post('http://43.202.113.176/v1/chat/completions', {
	//         "messages": [
	//           {
	//             "role": "system",
	//             "content": "You are an expert on the YMCA globally at all scales of the organization. You provide concise and clear answers. If you do not have a clear answer to what is being asked, you should guide the user to provide more information so that you can eventually provide either a very clear answer to the user'\''s query, or direct them to a definite resource where they are likely to find what they need. In this initial response, you are to just provide a short response, in 5 lines or less, unless you are certain that you have the precise answer that the user is looking for, in which case a longer response is allowed. You will have the opportunity to perform a database search later in the process, so all the more reason to be brief here. You always respond in the language of the initial prompt from the user. You do not need to ask the user whether to perform a database search related to the query because it is going to be performed anyway. If you cannot provide useful general information indicate that you do not know and that you will look more into it for the user. If you can provide useful general information, just state it and indicate that you will look for more details."
	//           },
	//           {
	//             "role": "user",
	//             "content": q
	//           }
	//         ],
	//         "model": "grok-beta",
	//         "stream": false,
	//         "temperature": .5
	//       }, {
	//         headers: {
	//           'Content-Type': 'application/json'
	//         }
	//       }).then((response) => {
	//         const { data: { choices } } = response;
	//         const resp = choices[0].message.content;

	//         setToWrite({ text: resp, documents: [] });
	//         setWriting(true);
	//       });
	//   const fullRequest = await axios.post('http://18.219.124.9:9999/stream_chat', {
	//     "user_query": q,
	//     "searches": 2
	//   }).then(async (response) => {
	//     const parts = response.data.split('\n');
	//     // get the text between FORMING_RESPONSE and END_RESPONSE in the response
	//     const match = response.data.match(/FORMING_RESPONSE([\s\S]*?)END_RESPONSE/);
	//     console.log({ match });

	//     setCurrentStep(() => 0);

	//     if (match) {
	//       console.log(match[1].trim());
	//       setToWriteLong({ text: match[1].trim() });
	//     } else {
	//       console.log("No match found");
	//     }

	//     // find the position of FORMING_RESPONSE
	//     const formingResponseIndex = parts.indexOf('FORMING_RESPONSE');
	//     const _steps = parts.slice(0, formingResponseIndex);
	//     // get only the _steps that are uppercase string no whitespaces
	//     const _stepsFiltered = _steps.filter(step => step.trim() === step.toUpperCase() && step.indexOf(' ') === -1);
	//     console.log({ _stepsFiltered });
	//     setSteps(_stepsFiltered);
	//     setLoading('Searching for the best answer...');

	//   });

	//await Promise.all([gronkRequest, fullRequest]);
	//      await gronkRequest;
	// 	  console.log({
	//         toWriteLong,
	//         steps,
	//       });


	//     } catch (error) {
	//       console.error('Error while fetching data:', error);
	//       setSteps([]);
	//       setCurrentStep(0);
	//       setLoading(false);


	//       AddToCurrentChat({ type: 'response', error: true, txt: 'Error - Service Unavailable' });
	//     }
	//   };

	//   useEffect(() => {
	//     console.log({ steps, currentStep });

	//     if (steps.length === 0) return;

	//     let stepTimeout;
	//     if (currentStep < steps.length) {
	//       // Mostrar cada paso después de un segundo
	//       stepTimeout = setTimeout(() => {
	//         console.log('Step:', steps[currentStep]);
	//         setCurrentStep((prev) => prev + 1);
	//         setLoading(formatThinkingSteps(steps[currentStep]));
	//       }, 1000); // 1000 ms = 1 segundo
	//     } else {
	//       // Cuando todos los pasos se han mostrado, muestra el mensaje final
	//       setTimeout(() => {
	//         setLoading(false);
	//         setWritingLong(true);
	//         console.log('END');

	//       }, 1000); // Espera 1 segundo después de mostrar el último paso
	//     }

	//     // Limpiar el timeout cuando el componente se desmonte o cambie el estado
	//     return () => clearTimeout(stepTimeout);
	//   }, [currentStep, steps]);

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
								funcOne={() => makeGrokkRequest()}
								funcTwo={makeElasticSearchRequest}
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
					//   loading && (
					//     // <Loading />
					//     <div className="flex ml-14">
					//       <p className='text-base text-shyne'>{loading}</p>
					//       {/* <span className="emoji-rotator text-xs"></span> */}
					//     </div>
					//   )
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
									makeGrokkRequest(query);
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
							makeGrokkRequest(query);
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
