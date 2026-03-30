public with sharing class AddressMapController {
    
    @AuraEnabled
    public static String getData(String latlng){
        String response = JSON.serialize(GeocoderServices.fetchDataFromGeocoder(latlng));
        return response;
    }

    @AuraEnabled(cacheable=true)
    public static String getAccountData(String accountId) {
        String queryString = 'SELECT ShippingStreet, ShippingCity, ShippingState, ShippingCountry, ShippingPostalCode,'+
                             'BillingStreet, BillingCity, BillingState, BillingCountry, BillingPostalCode,'+
                             'ShippingLongitude,BillingLongitude, ShippingLatitude, BillingLatitude '+
                             'FROM Account WHERE Id =:accountId';
        Map<String, Object> params = new Map<String, Object>();
        params.put('accountId', accountId);
        Account acc = Database.queryWithBinds(queryString, params, AccessLevel.USER_MODE);
        if (acc != null) {
            AccountAddressWrapper wrapper = new AccountAddressWrapper(acc); 
            return JSON.serialize(wrapper);
        }
        return '';
    }

    public class AccountAddressWrapper {
        public ShippingAddressWrapper shippingAddress;
        public BillingAddressWrapper billingAddress;

        AccountAddressWrapper(Account data) {
            ShippingAddressWrapper shippingWrapper = new ShippingAddressWrapper();
            shippingWrapper.street = data.ShippingStreet;
            shippingWrapper.city = data.ShippingCity;
            shippingWrapper.state = data.ShippingState;
            shippingWrapper.country = data.ShippingCountry;
            shippingWrapper.postalCode = data.ShippingPostalCode;
            shippingWrapper.shippingLat = data.ShippingLatitude;
            shippingWrapper.shippingLng = data.ShippingLongitude;
            BillingAddressWrapper billingWrapper = new BillingAddressWrapper();
            billingWrapper.street = data.BillingStreet;
            billingWrapper.city = data.BillingCity;
            billingWrapper.state = data.BillingState;
            billingWrapper.country = data.BillingCountry;
            billingWrapper.postalCode = data.BillingPostalCode;
            billingWrapper.billingLat = data.BillingLatitude;
            billingWrapper.billingLng = data.BillingLongitude;
            this.shippingAddress = shippingWrapper;
            this.billingAddress = billingWrapper;
        }
    }

    public class ShippingAddressWrapper {
        @AuraEnabled public String street;
        @AuraEnabled public String city;
        @AuraEnabled public String state;
        @AuraEnabled public String country;
        @AuraEnabled public String postalCode;
        @AuraEnabled public Decimal shippingLat;
        @AuraEnabled public Decimal shippingLng;
    }

    public class BillingAddressWrapper {
        @AuraEnabled public String street;
        @AuraEnabled public String city;
        @AuraEnabled public String state;
        @AuraEnabled public String country;
        @AuraEnabled public String postalCode;
        @AuraEnabled public Decimal billingLat;
        @AuraEnabled public Decimal billingLng;
    }
}