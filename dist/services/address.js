"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddressService = void 0;
class AddressService {
    constructor(client) {
        this.client = client;
    }
    async seedReferenceData(headers) {
        return this.client.makeRequest('GET', '/address-seed', { headers });
    }
    // Country operations
    async createCountry(name, isoCode, headers) {
        const data = { name };
        if (isoCode)
            data.iso_code = isoCode;
        return this.client.makeRequest('POST', '/country', { data, headers });
    }
    async listCountries(headers) {
        return this.client.makeRequest('GET', '/country', { headers });
    }
    async getCountry(countryId, headers) {
        return this.client.makeRequest('GET', `/country/${countryId}`, { headers });
    }
    async updateCountry(countryId, name, isoCode, headers) {
        const data = {};
        if (name)
            data.name = name;
        if (isoCode)
            data.iso_code = isoCode;
        return this.client.makeRequest('PATCH', `/country/${countryId}`, { data, headers });
    }
    // State operations
    async createState(name, countryId, headers) {
        return this.client.makeRequest('POST', '/state', { data: { name, country_id: countryId }, headers });
    }
    async listStatesByCountry(countryId, headers) {
        return this.client.makeRequest('GET', `/state/country/${countryId}`, { headers });
    }
    async getState(stateId, headers) {
        return this.client.makeRequest('GET', `/state/${stateId}`, { headers });
    }
    async updateState(stateId, name, countryId, headers) {
        const data = {};
        if (name)
            data.name = name;
        if (countryId)
            data.country_id = countryId;
        return this.client.makeRequest('PATCH', `/state/${stateId}`, { data, headers });
    }
    // City operations
    async createCity(name, stateId, postalCodePrefix, headers) {
        const data = { name, state_id: stateId };
        if (postalCodePrefix)
            data.postal_code_prefix = postalCodePrefix;
        return this.client.makeRequest('POST', '/city', { data, headers });
    }
    async listCitiesByState(stateId, headers) {
        return this.client.makeRequest('GET', `/city/state/${stateId}`, { headers });
    }
    async getCity(cityId, headers) {
        return this.client.makeRequest('GET', `/city/${cityId}`, { headers });
    }
    async updateCity(cityId, name, stateId, postalCodePrefix, headers) {
        const data = {};
        if (name)
            data.name = name;
        if (stateId)
            data.state_id = stateId;
        if (postalCodePrefix)
            data.postal_code_prefix = postalCodePrefix;
        return this.client.makeRequest('PATCH', `/city/${cityId}`, { data, headers });
    }
    // Company address management
    async createAddress(streetAddress, cityId, stateId, countryId, options, headers) {
        const data = {
            street_address: streetAddress,
            city_id: cityId,
            state_id: stateId,
            country_id: countryId,
            ...options,
        };
        return this.client.makeRequest('POST', '/address', { data, headers });
    }
    async getCompanyAddress(headers) {
        return this.client.makeRequest('GET', '/address', { headers });
    }
}
exports.AddressService = AddressService;
//# sourceMappingURL=address.js.map