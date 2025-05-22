import ServerURL from './Config'
export default class APIManager {
    static async ApiRequest(Endpoint, Options = {}) {
        try {
            console.log('Sending API Request:', Endpoint, {credentials: 'include', ...Options});
            const Response = await fetch(`${ServerURL}${Endpoint}`, {
                credentials: 'include',
                ...Options
            });
            if (!Response.ok) {
                throw new Error(`Request failed: ${Response.status}`);
            }
            return await Response.json();
        } catch (Error) {
            console.error(Error);
            return null;
        }
    }

    static async GetRequest(Endpoint) {
        return this.ApiRequest(Endpoint, { method: 'GET' });
    }

    static async PostRequest(Endpoint, Body) {
        return this.ApiRequest(Endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(Body)
        });
    }
}