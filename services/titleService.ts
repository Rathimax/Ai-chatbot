import { Message, ChatSettings, Sender } from '../types';
import { streamChatResponse } from './chatService';

export const generateTitle = async (
    messages: Message[],
    settings: ChatSettings
): Promise<string> => {
    const prompt = "Generate a short, concise title (max 5 words) for this conversation based on the user's first message. Do not use quotes.";
    let title = "";

    await new Promise<void>((resolve, reject) => {
        streamChatResponse(
            [...messages, { id: 'title-prompt', sender: Sender.User, text: prompt, timestamp: new Date().toISOString() }],
            settings,
            (chunk) => { title += chunk; },
            () => resolve(),
            (err) => reject(err)
        );
    });

    return title.replace(/^["']|["']$/g, '').trim();
};
