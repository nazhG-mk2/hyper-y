function capitalizeFirstLetter(text) {
    return text.charAt(0).toUpperCase() + text.slice(1);
}

function ensurePeriod(text) {
    return text.endsWith('.') ? text : text + '.';
}

function stripDoublePeriods(text) {
    return text.replace(/\.\./g, '.');
}

const grammar = {
    "origin": [
        "#greeting.capitalize# #situation.capitalize#. #calmAdvice.capitalize#. #encouragement#",
        "#greeting.capitalize# #situation.capitalize#. #encouragement# #nextStep#",
        "#situation.capitalize#. #calmAdvice.capitalize#. #nextStep#"
    ],

    "greeting": ["take a moment", "breathe easy", "let's pause", "stay calm", "all is well"],
    "situation": ["there are more visitors than expected", "we're experiencing high traffic", "the site is very popular right now", "many people are here at the same time", "the system is handling a lot of requests"],
    "calmAdvice": ["take a deep breath", "things might take a little time", "these things happen", "we’re aware and looking into it", "thank you for your understanding"],
    "encouragement": ["We’re giving this our attention.", "Efforts are underway.", "We appreciate your patience.", "Thank you for hanging in there.", "We’re here and aware."],
    "nextStep": ["Please try refreshing the page.", "Give it another try in a moment.", "Check back in a few minutes.", "Reach out if the issue continues.", "Thank you for your patience and understanding."]
};

const generateMessage = () => {
    let template = grammar.origin[Math.floor(Math.random() * grammar.origin.length)];
    let message = template;

    for (const key in grammar) {
        if (key !== 'origin') {
            const options = grammar[key];
            while (message.includes(`#${key}.capitalize#`) || message.includes(`#${key}#`)) {
                let replacement = options[Math.floor(Math.random() * options.length)];
                if (message.includes(`#${key}.capitalize#`)) {
                    replacement = ensurePeriod(capitalizeFirstLetter(replacement));
                    message = message.replace(`#${key}.capitalize#`, replacement);
                } else if (message.includes(`#${key}#`)) {
                    replacement = ensurePeriod(replacement);
                    message = message.replace(`#${key}#`, replacement);
                }
            }
        }
    }
    return stripDoublePeriods(message);
}

export default generateMessage;
