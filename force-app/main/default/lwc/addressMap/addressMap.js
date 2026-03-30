import { LightningElement, api, wire, track } from 'lwc';
import { loadScript, loadStyle } from 'lightning/platformResourceLoader'
import { ShowToastEvent } from 'lightning/platformShowToastEvent'
import { getRecord, updateRecord } from 'lightning/uiRecordApi';

import ACCOUNT_ID from '@salesforce/schema/Account.Id';
import BILLING_STREET from '@salesforce/schema/Account.BillingStreet'; 
import BILLING_CITY from '@salesforce/schema/Account.BillingCity'; 
import BILLING_STATE from '@salesforce/schema/Account.BillingState'; 
import BILLING_POSTAL_CODE from '@salesforce/schema/Account.BillingPostalCode'; 
import BILLING_COUNTRY from '@salesforce/schema/Account.BillingCountry';
import BILLING_LATITUDE from '@salesforce/schema/Account.BillingLatitude';
import BILLING_LONGITUDE from '@salesforce/schema/Account.BillingLongitude'; 
import SHIPPING_STREET from '@salesforce/schema/Account.ShippingStreet'; 
import SHIPPING_CITY from '@salesforce/schema/Account.ShippingCity'; 
import SHIPPING_STATE from '@salesforce/schema/Account.ShippingState'; 
import SHIPPING_POSTAL_CODE from '@salesforce/schema/Account.ShippingPostalCode'; 
import SHIPPING_COUNTRY from '@salesforce/schema/Account.ShippingCountry';
import SHIPPING_LATITUDE from '@salesforce/schema/Account.ShippingLatitude';
import SHIPPING_LONGITUDE from '@salesforce/schema/Account.ShippingLongitude';

import LEAFLET from "@salesforce/resourceUrl/leaflet";

import AddressMapEditModal from 'c/addressMapEdit';

const ACCOUNT_FIELDS = [
    ACCOUNT_ID,
    BILLING_STREET,
    BILLING_CITY,
    BILLING_STATE,
    BILLING_POSTAL_CODE, 
    BILLING_COUNTRY,
    BILLING_LATITUDE,
    BILLING_LONGITUDE,
    SHIPPING_STREET, 
    SHIPPING_CITY, 
    SHIPPING_STATE, 
    SHIPPING_POSTAL_CODE,
    SHIPPING_COUNTRY,
    SHIPPING_LATITUDE,
    SHIPPING_LONGITUDE
];

export default class AddressMap extends LightningElement {

    @api recordId;
    @track accountRecord;
    currentUserLongitude;
    currentUserLatitude;
    newLongitude;
    newLatitude;
    shippingMarker;
    billingMarker;
    isLeafletLoaded = false;
    isRendered = false;
    isLoading = true;
    map;

    @wire(getRecord, { recordId: '$recordId', fields: ACCOUNT_FIELDS })
    accountData({data, error}) {
        if (data) {
            this.parseAccountRecord(data);

            if (this.isLeafletLoaded) {
                this.placeExistingMarker(this.accountRecord);
            }
        } else if (error) {
            this.showErrorToast(data);
        }
    }

    parseAccountRecord(data) {
        const shippingAddress = JSON.parse(JSON.stringify({
            street: data?.fields?.ShippingStreet.value || '',
            city: data?.fields?.ShippingCity.value || '',
            state: data?.fields?.ShippingState.value || '',
            country: data?.fields?.ShippingCountry.value || '',
            postalCode: data?.fields?.ShippingPostalCode.value || '',
            shippingLat: data?.fields?.ShippingLatitude.value || '',
            shippingLng: data?.fields?.ShippingLongitude.value || ''
        }));
        const billingAddress = JSON.parse(JSON.stringify({
            street: data?.fields?.BillingStreet.value || '',
            city: data?.fields?.BillingCity.value || '',
            state: data?.fields?.BillingState.value || '',
            country: data?.fields?.BillingCountry.value || '',
            postalCode: data?.fields?.BillingPostalCode.value || '',
            billingLat: data?.fields?.BillingLatitude.value || '',
            billingLng: data?.fields?.BillingLongitude.value || ''
        }));
        this.accountRecord = { shippingAddress, billingAddress };
    }
    
    renderedCallback() {
        if (this.isRendered) {
            return;
        }

        this.isRendered = true;

        Promise.all([
            loadScript(this, LEAFLET + '/dist/leaflet.js'),
            loadStyle(this, LEAFLET + '/dist/leaflet.css')
        ]).then(async () => {
            this.isLeafletLoaded = true;
            await this.getUserLocation();
        }).then(() =>{
            this.loadMap();
            this.placeExistingMarker(this.accountRecord);
        });
    }

    getUserLocation() {
        return new Promise((resolve, reject) => {
            if (!navigator?.geolocation) {
                return reject(new Error('location not available'));
            }

            const options = { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 };
            navigator.geolocation.getCurrentPosition( (position) => {
                this.currentUserLatitude = position.coords.latitude;
                this.currentUserLongitude = position.coords.longitude;
                this.isLoading = false;
                resolve();
            },
            (error) => { reject(new Error('Geolocation error: '+ error?.message))},
            options);
        });
    }

    loadMap() {
        let lat = this.currentUserLatitude;
        let lng = this.currentUserLongitude;

        this.map = L.map(this.refs.map).setView([lat, lng], 15);
        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(this.map);
        const circle = L.circle([lat, lng], {
            color: '#00b4d8',
            fillColor: '#caf0f8',
            fillOpacity: 0.5,
            radius: 11
        }).addTo(this.map);
        circle.bindPopup("Current location").openPopup();
        this.map.on('click', this.handleClickOnMap.bind(this));
    }

    handleClickOnMap(event) {
        const lnglat = L.GeoJSON.latLngToCoords(event.latlng);
        [this.newLongitude, this.newLatitude] = lnglat;
        AddressMapEditModal.open({
            size: 'medium',
            latlng: lnglat.reverse(),
            addresses: this.accountRecord,
            onsave: (e) => {
                e.stopPropagation();
                this.saveAddress(e.detail.isShippingUpdated, e.detail.address);
                this.placeMarkerOnMap(e.detail.isShippingUpdated, e.detail.address, [this.newLatitude, this.newLongitude]);
                this.showSuccessToast();
            },
            onerror: (e) => {
                e.stopPropagation();
                this.showErrorToast(e.detail);
            }
        });
    }

    placeExistingMarker(accountObj) {
        const isValidShippingAddress = this.validateAddress(accountObj?.shippingAddress);
        const isValidBillingAddress = this.validateAddress(accountObj?.billingAddress);
        
        if (isValidShippingAddress) {
            this.placeMarkerOnMap(true, accountObj.shippingAddress, [accountObj.shippingAddress.shippingLat, accountObj.shippingAddress.shippingLng]);
        } else {
            this.removeMarker(this.shippingMarker);
        }
        
        if (isValidBillingAddress) {
            this.placeMarkerOnMap(false, accountObj.billingAddress, [accountObj.billingAddress.billingLat, accountObj.billingAddress.billingLng]);
        } else {
            this.removeMarker(this.billingMarker);
        }

        const corner1 = [accountObj.shippingAddress.shippingLat, accountObj.shippingAddress.shippingLng];
        const corner2 = [accountObj.billingAddress.billingLat, accountObj.billingAddress.billingLng];
        this.map.fitBounds([corner1, corner2], { animate: true });
        this.shippingMarker?.closePopup();
        this.billingMarker?.closePopup();
    }

    placeMarkerOnMap(isShippingMarker, addressObj , latlngObj) {
        if (isShippingMarker) {
            this.removeMarker(this.shippingMarker);
            this.shippingMarker = L.marker(latlngObj).addTo(this.map);
            this.shippingMarker.bindPopup(`<b>Shipping Address</b><br>
                                            ${addressObj?.street}, ${addressObj?.city},<br>
                                            ${addressObj?.state}, ${addressObj?.country},<br>
                                            ${addressObj?.postalCode}`).openPopup();
        } else {
            this.removeMarker(this.billingMarker);
            this.billingMarker = L.marker(latlngObj).addTo(this.map);
            this.billingMarker.bindPopup(`<b>Billing Address</b><br>
                                            ${addressObj?.street}, ${addressObj?.city},<br>
                                            ${addressObj?.state}, ${addressObj?.country},<br>
                                            ${addressObj?.postalCode}`).openPopup();
        }
    }

    validateAddress(address) {
        return address?.street && address?.city && address?.state && address?.country && address?.postalCode;
    }

    removeMarker(marker) {
        if (marker) {
            marker.remove();
        }
    }

    saveAddress(isShipping, record) {
        const fields = {};
        if (isShipping) {
            fields[SHIPPING_STREET.fieldApiName] = record.street;
            fields[SHIPPING_CITY.fieldApiName] = record.city;
            fields[SHIPPING_STATE.fieldApiName] = record.state;
            fields[SHIPPING_POSTAL_CODE.fieldApiName] = record.postalCode;
            fields[SHIPPING_COUNTRY.fieldApiName] = record.country;
            fields[SHIPPING_LATITUDE.fieldApiName] = this.newLatitude;
            fields[SHIPPING_LONGITUDE.fieldApiName] = this.newLongitude;
        } else {
            fields[BILLING_STREET.fieldApiName] = record.street;
            fields[BILLING_CITY.fieldApiName] = record.city;
            fields[BILLING_STATE.fieldApiName] = record.state;
            fields[BILLING_POSTAL_CODE.fieldApiName] = record.postalCode;
            fields[BILLING_COUNTRY.fieldApiName] = record.country;
            fields[BILLING_LATITUDE.fieldApiName] = this.newLatitude;
            fields[BILLING_LONGITUDE.fieldApiName] = this.newLongitude;
        }
        fields[ACCOUNT_ID.fieldApiName] = this.recordId;
        updateRecord({ fields }).then(() => {
            this.showSuccessToast();
        }).catch( error => {
            this.showErrorToast(error)
        });
    }

    showSuccessToast() {
        const event = new ShowToastEvent({
            title: 'Success',
            message: 'Address updated successfully',
            variant: 'success'
        });
        this.dispatchEvent(event);
    }

    showErrorToast(error) {
        let errorMessage;
        
        if (Array.isArray(error.body)) {
            errorMessage = error.body.map(e => e.message).join(', ');
        } else if (typeof error.body.message === 'string') {
            errorMessage = error.body.message;
        }

        this.dispatchEvent(new ShowToastEvent({
            title: 'An error occurred',
            message: errorMessage,
            variant: 'error'
        }));
    }

}