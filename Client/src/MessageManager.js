import APIManager from "./APIManager";

export default class MessageManager {
    constructor(SessionID) {
        this.MessagesElement = document.getElementById('Messages');
        this.SessionID = SessionID;
        this.RenderedMessages = new Map();
    }

    async FetchMessages() {
        try {
            const Messages = await APIManager.GetRequest(`/fetch-messages`);
            return Messages;
        } catch (Error) {
            console.error('Error fetching messages:', Error);
            return [];
        }
    }

    async RenderMessages() {
        const PrevCount = this.RenderedMessages.size;
        const Messages = await this.FetchMessages();
        const MessagesByID = new Map(Messages.map(M => [M.messageid, M]));
        const ChatStart = document.getElementById('ChatStart');
        for (const [ID, Elem] of this.RenderedMessages.entries()) {
            if (!MessagesByID.has(ID)) {
                console.log(ChatStart);
                if (Elem == ChatStart) continue;
                this.MessagesElement.removeChild(Elem);
                this.RenderedMessages.delete(ID);
            }
        }

        Messages.slice().reverse().forEach(Message => {
            let MessageDiv = this.RenderedMessages.get(Message.messageid);

            if (!MessageDiv) {
                MessageDiv = document.createElement('div');
                MessageDiv.className = 'Message';
                MessageDiv.dataset.MessageID = Message.messageid;

                const HeaderDiv = document.createElement('div');
                HeaderDiv.className = 'MessageHeader';

                const UsernameSpan = document.createElement('span');
                UsernameSpan.className = 'MessageUsername';
                HeaderDiv.appendChild(UsernameSpan);

                const TimestampSpan = document.createElement('span');
                TimestampSpan.className = 'MessageTimestamp';
                HeaderDiv.appendChild(TimestampSpan);

                if (Message.sessionid === this.SessionID) {
                    const DeleteBtn = document.createElement('button');
                    DeleteBtn.className = 'DeleteMessageBtn';
                    DeleteBtn.textContent = 'Delete';
                    DeleteBtn.onclick = async () => {
                        try {
                            await APIManager.PostRequest('/delete-message', { MessageID: Message.messageid });
                        } catch (Err) {
                            console.error('Error deleting message:', Err);
                        }
                    };
                    HeaderDiv.appendChild(DeleteBtn);
                }

                const ContentDiv = document.createElement('div');
                ContentDiv.className = 'MessageContent';

                MessageDiv.appendChild(HeaderDiv);
                MessageDiv.appendChild(ContentDiv);

                this.MessagesElement.appendChild(MessageDiv);
                this.RenderedMessages.set(Message.messageid, MessageDiv);
            }

            const HeaderDiv = MessageDiv.querySelector('.MessageHeader');
            const UsernameSpan = HeaderDiv.querySelector('.MessageUsername');
            const TimestampSpan = HeaderDiv.querySelector('.MessageTimestamp');
            const ContentDiv = MessageDiv.querySelector('.MessageContent');

            UsernameSpan.textContent = Message.username || 'User';
            const DateObj = new Date(Message.timestamp);
            TimestampSpan.textContent = DateObj.toLocaleString();
            ContentDiv.textContent = Message.messagecontent || '';
        });

        if (this.RenderedMessages.size != PrevCount) {
            this.MessagesElement.scrollTop = this.MessagesElement.scrollHeight;
        }
    }

}
