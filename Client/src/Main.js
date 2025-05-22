import './Style.css'
import APIManager from './APIManager';
import FormManager from './FormManager';
import MessageManager from './MessageManager';

async function GetSessionId() {
  const Data = await APIManager.GetRequest('/get-session');
  return Data ? Data.SessionID : null;
}

GetSessionId().then(async SessionID => {
  if(SessionID == null){
    return;
  }
  console.log('Session Started: ', SessionID);

  //Handle Forms
  let Form = new FormManager(SessionID);
  Form.AddEventListener();
  
  //Handle Messages
  let MessageManagerInstance = new MessageManager(SessionID);
  setInterval(async () => {
    await MessageManagerInstance.RenderMessages();
  }, 500);
});

