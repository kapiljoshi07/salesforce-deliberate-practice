public with sharing class GeocoderServices {
    
    public static GeocoderServices.ComponentsWrapper fetchDataFromGeocoder(String query) {
        HttpRequest httpReq = new HttpRequest();
        String encodedQuery = EncodingUtil.urlEncode(query, 'UTF-8');
        String endPointUrl = System.label.OPENCAGE_API_URL + '?q=' + encodedQuery + '&key=' + System.label.OPENCAGE_API_KEY;
        httpReq.setEndpoint(endPointUrl);
        httpReq.setHeader('Content-Type', 'application/json');
        httpReq.setHeader('Accept','application/json');
        httpReq.setMethod('GET');
        Http http = new Http();
        HttpResponse res = http.send(httpReq);
        GeocoderResponseWrapper responseWrapper = (GeocoderResponseWrapper)JSON.deserialize(res.getBody(), GeocoderResponseWrapper.class);
        return responseWrapper.results[0].components;
    }

    public class GeocoderResponseWrapper {
        public List<ResultsWrapper> results;
    }

    public class ResultsWrapper {
        public ComponentsWrapper components;
    }

    public class ComponentsWrapper {
        public String road;
        public String city;
        public String state;
        public String country;
        public String postcode;
    }

}