export enum Message {
    Welcome =
        'Welcome dear Jobillian! This tool is created to help you create a campaign draft easily. ' +
        'All sensitive data about customer and recruitment are not shared with OpenAI and not stored anywhere.',
    AskRole =
        'What is the role you are hiring for?',
    AskDetails =
        'Great! \n' +
        'Please specify the types of questions you want to ask. The more specific you are, the better the results will be 🔥 \n' +
        'Answer example: \n' +
        'Experience in driving cargo truck, soft skills and overall life attitude',
    // NextQuestion = 'Nice! Onto the next question.',
    ChoosePIIMethod =
        'There are two ways to proceed: \n' +
        '• Make sure your campaign draft has no sensitive data and proceed. \n' +
        '• Leave your campaign draft as it is and let Jobilla Bot handle it.',
    PIIInstructions =
        'For Jobilla Bot to keep PII safe, please go ahead and modify your campaign draft as following: \n' +
        'Use $ sign followed by MACRO_CASE to give names for data that needs to stay in secret followed by = sign, followed by the data itself. \n' +
        'For example: to keep company name "Harnaś Entertainment" safe, use [$COMPANY_NAME=Harnaś Entertainment] \n' +
        'To keep candidate name "John Doe" safe, use [$CANDIDATE_NAME=John Doe] \n' +
        'To keep salary "1000€" safe, use [$SALARY=1000€] \n' +
        'You can use any names (and how many) you want, but make sure to only use the same name for the same data. \n' +
        'After making sure your campaign draft is safe, send it to Jobilla Bot as a text message or as a .docx file.',
    SendCampaignDraft = 'Please send a message with your campaign draft, or a .docx file containing it. After your campaign draft is generated, feel free to modify it\'s content by talking with Jobilla Bot.',
    IncorrectFile = 'This is not a valid .docx file. Start over?',
    SomethingWentWrong = 'Something went wrong. Please try again.',
    FileSuccess = 'Success! Processing your campaign draft...',
}