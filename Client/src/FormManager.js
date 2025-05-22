import ServerURL from "./Config";
import APIManager from "./APIManager";
export default class FormManager {
    constructor(SessionId) {
        this.FormElement = document.getElementById('Form');;
        this.SessionId = SessionId;
        this.HandleSubmit = this.HandleSubmit.bind(this);
    }

    AddEventListener() {
        if (this.FormElement) {
            this.FormElement.addEventListener('submit', this.HandleSubmit);
        }
    }

    RemoveEventListener() {
        if (this.FormElement) {
            this.FormElement.removeEventListener('submit', this.HandleSubmit);
        }
    }

    HandleSubmit(Event) {
        Event.preventDefault();
        const RawData = new FormData(Event.target);
        const Data = Object.fromEntries(RawData.entries());
        if (this.SessionId == null) {
            return;
        }
        this.FormElement[1].value = '';
        APIManager.PostRequest('/add-message', Data)
            .then(Response => {
                console.log('Form submitted:', Response);
            })
            .catch(Error => {
                console.error('Form submission error:', Error);
            });
    }
}
