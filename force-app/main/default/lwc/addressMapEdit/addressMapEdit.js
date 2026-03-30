import { api, track } from 'lwc';

import getData from '@salesforce/apex/AddressMapController.getData';

import LightningModal from 'lightning/modal';

const EVENT_TYPE = {
    SAVE: 'save',
    ERROR: 'error'
}

export default class AddressMapEdit extends LightningModal {

    @api latlng;
    @api addresses;
    @track lat;
    @track lng;
    @track _oldAddr;
    @track _newAddr;
    @track shippingAddress;
    @track billingAddress;
    isLoading = true;
    isShippingSelected = true;

    get oldAddr() {
        return this._oldAddr ? this._oldAddr : {
            state: '',
            city: '',
            street: '',
            country: '',
            postalCode: ''
        };
    }
    set oldAddr(val) {
        this._oldAddr = val;
    }

    get newAddr() {
        return this._newAddr ? this._newAddr : {
            state: '',
            city: '',
            street: '',
            country: '',
            postalCode: ''
        }
    }
    set newAddr(val) {
        this._newAddr = val;
    }

    get oldAddressLabel() {
        return this.isShippingSelected ? 'Old Shipping Address' : 'Old Billing Address';
    }

    get newAddressLabel() {
        return this.isShippingSelected ? 'New Shipping Address' : 'New Billing Address';
    }

    get getProvinceOptions() {
        return [
            { label: 'Andhra Pradesh', value: 'Andhra Pradesh' },
            { label: 'Arunachal Pradesh', value: 'Arunachal Pradesh' },
            { label: 'Assam', value: 'Assam' },
            { label: 'Bihar', value: 'Bihar' },
            { label: 'Chhattisgarh', value: 'Chhattisgarh' },
            { label: 'Goa', value: 'Goa' },
            { label: 'Gujarat', value: 'Gujarat' },
            { label: 'Haryana', value: 'Haryana' },
            { label: 'Himachal Pradesh', value: 'Himachal Pradesh' },
            { label: 'Jharkhand', value: 'Jharkhand' },
            { label: 'Karnataka', value: 'Karnataka' },
            { label: 'Kerala', value: 'Kerala' },
            { label: 'Madhya Pradesh', value: 'Madhya Pradesh' },
            { label: 'Maharashtra', value: 'Maharashtra' },
            { label: 'Manipur', value: 'Manipur' },
            { label: 'Meghalaya', value: 'Meghalaya' },
            { label: 'Mizoram', value: 'Mizoram' },
            { label: 'Nagaland', value: 'Nagaland' },
            { label: 'Odisha', value: 'Odisha' },
            { label: 'Punjab', value: 'Punjab' },
            { label: 'Rajasthan', value: 'Rajasthan' },
            { label: 'Sikkim', value: 'Sikkim' },
            { label: 'Tamil Nadu', value: 'Tamil Nadu' },
            { label: 'Telangana', value: 'Telangana' },
            { label: 'Tripura', value: 'Tripura' },
            { label: 'Uttar Pradesh', value: 'Uttar Pradesh' },
            { label: 'Uttarakhand', value: 'Uttarakhand' },
            { label: 'West Bengal', value: 'West Bengal' },

            // Union Territories
            { label: 'Andaman and Nicobar Islands', value: 'Andaman and Nicobar Islands' },
            { label: 'Chandigarh', value: 'Chandigarh' },
            { label: 'Dadra and Nagar Haveli and Daman and Diu', value: 'Dadra and Nagar Haveli and Daman and Diu' },
            { label: 'Delhi', value: 'Delhi' },
            { label: 'Jammu and Kashmir', value: 'Jammu and Kashmir' },
            { label: 'Ladakh', value: 'Ladakh' },
            { label: 'Lakshadweep', value: 'Lakshadweep' },
            { label: 'Puducherry', value: 'Puducherry' }
        ];
    }

    connectedCallback() {
        [this.lat, this.lng] = this.latlng
        this.shippingAddress = this.addresses?.shippingAddress;
        this.oldAddr = this.shippingAddress;
        this.billingAddress = this.addresses?.billingAddress;
        this.fetchNewAddressData();
        this.isLoading = false;
    }

    handleAddrTypeSelection(event) {
        const targets = this.template.querySelectorAll(`[data-id="Address"]`);
        const targetId = event.currentTarget.dataset.targetId;
        const target = Array.from(targets).find(btn => btn.dataset.targetId === targetId);
        
        Array.from(targets).forEach(elm => {
            elm.classList.remove('selectedAddrType');
            elm.setAttribute('data-target-selected', false);
        });

        if(!target.dataset.selected) {
            target.classList.add('selectedAddrType');
            target.setAttribute('data-target-selected', true);
            this.oldAddr = targetId === 'Shipping' ? this.shippingAddress : this.billingAddress;
            this.isShippingSelected = targetId === 'Shipping' ? true : false;
        }
    }

    async fetchNewAddressData() {
        try {
            const receivedAddressInfoStr = await getData({ latlng: this.latlng.toString() });
            const receivedAdd = JSON.parse(receivedAddressInfoStr);
            if (receivedAdd) {
                this.newAddr = {
                    street: receivedAdd.road,
                    city: receivedAdd.city,
                    state: receivedAdd.state,
                    country: receivedAdd.country,
                    postalCode: receivedAdd.postcode,
                }
            }
        } catch (error) {
            this.dispatchEventToParent(EVENT_TYPE.ERROR, error);
        }
    }

    handleChange(event) {
        this.newAddr = {
            state: event.target.province,
            city: event.target.city,
            street: event.target.street,
            country: event.target.country,
            postalCode: event.target.postalCode
        }
    }

    handleSave() {
        const detail = {
            isShippingUpdated: this.isShippingSelected,
            address: this.newAddr,
        }
        this.dispatchEventToParent(EVENT_TYPE.SAVE, detail)
        this.close();
    }

    dispatchEventToParent(eventType, data) {
        const passer = this.template.querySelector('c-event-passer');
        passer.dispatchEventExtended(new CustomEvent(eventType, {
            bubbles: true,
            composed: true,
            detail: data
        }));
    }

}