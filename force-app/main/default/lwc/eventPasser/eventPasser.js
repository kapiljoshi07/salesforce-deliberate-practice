import { LightningElement, api } from 'lwc';

export default class EventPasser extends LightningElement {

    @api dispatchEventExtended(event) {
        this.dispatchEvent(event)
    }
}