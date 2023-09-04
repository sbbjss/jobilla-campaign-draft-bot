export enum Message {
    Welcome =
        'Welcome dear Jobillian! This tool is created to help you create a campaign draft easily. ' +
        'All sensitive data about customer and recruitment are not shared with OpenAI and not stored anywhere.',
    ChoosePII =
        'There are two ways to start: \n' +
        '• Make sure your campaign draft has no sensitive data and send it to Jobilla Bot. \n' +
        '• Leave your campaign draft as it is and let Jobilla Bot handle it.',
    SendCampaignDraft = 'Please send a message with your campaign draft, or a .docx file containing it.',
    IncorrectFile = 'The file is not a valid .docx file. Start over?',
    SomethingWentWrong = 'Something went wrong. Please try again.',
    FileSuccess = 'Success! Processing your campaign draft...',
}