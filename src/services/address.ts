// src/services/address.ts
import { KnowrithmClient } from '../client';

export class AddressService {
  constructor(private client: KnowrithmClient) {}

  async seedReferenceData(headers?: Record<string, string>): Promise<any> {
    return this.client.makeRequest('GET', '/address-seed', { headers });
  }

  // Country operations
  async createCountry(name: string, isoCode?: string, headers?: Record<string, string>): Promise<any> {
    const data: any = { name };
    if (isoCode) data.iso_code = isoCode;
    return this.client.makeRequest('POST', '/country', { data, headers });
  }

  async listCountries(headers?: Record<string, string>): Promise<any> {
    return this.client.makeRequest('GET', '/country', { headers });
  }

  async getCountry(countryId: number, headers?: Record<string, string>): Promise<any> {
    return this.client.makeRequest('GET', `/country/${countryId}`, { headers });
  }

  async updateCountry(
    countryId: number,
    name?: string,
    isoCode?: string,
    headers?: Record<string, string>
  ): Promise<any> {
    const data: any = {};
    if (name) data.name = name;
    if (isoCode) data.iso_code = isoCode;
    return this.client.makeRequest('PATCH', `/country/${countryId}`, { data, headers });
  }

  // State operations
  async createState(name: string, countryId: number, headers?: Record<string, string>): Promise<any> {
    return this.client.makeRequest('POST', '/state', { data: { name, country_id: countryId }, headers });
  }

  async listStatesByCountry(countryId: number, headers?: Record<string, string>): Promise<any> {
    return this.client.makeRequest('GET', `/state/country/${countryId}`, { headers });
  }

  async getState(stateId: number, headers?: Record<string, string>): Promise<any> {
    return this.client.makeRequest('GET', `/state/${stateId}`, { headers });
  }

  async updateState(
    stateId: number,
    name?: string,
    countryId?: number,
    headers?: Record<string, string>
  ): Promise<any> {
    const data: any = {};
    if (name) data.name = name;
    if (countryId) data.country_id = countryId;
    return this.client.makeRequest('PATCH', `/state/${stateId}`, { data, headers });
  }

  // City operations
  async createCity(
    name: string,
    stateId: number,
    postalCodePrefix?: string,
    headers?: Record<string, string>
  ): Promise<any> {
    const data: any = { name, state_id: stateId };
    if (postalCodePrefix) data.postal_code_prefix = postalCodePrefix;
    return this.client.makeRequest('POST', '/city', { data, headers });
  }

  async listCitiesByState(stateId: number, headers?: Record<string, string>): Promise<any> {
    return this.client.makeRequest('GET', `/city/state/${stateId}`, { headers });
  }

  async getCity(cityId: number, headers?: Record<string, string>): Promise<any> {
    return this.client.makeRequest('GET', `/city/${cityId}`, { headers });
  }

  async updateCity(
    cityId: number,
    name?: string,
    stateId?: number,
    postalCodePrefix?: string,
    headers?: Record<string, string>
  ): Promise<any> {
    const data: any = {};
    if (name) data.name = name;
    if (stateId) data.state_id = stateId;
    if (postalCodePrefix) data.postal_code_prefix = postalCodePrefix;
    return this.client.makeRequest('PATCH', `/city/${cityId}`, { data, headers });
  }

  // Company address management
  async createAddress(
    streetAddress: string,
    cityId: number,
    stateId: number,
    countryId: number,
    options?: {
      lat?: number;
      lan?: number;
      postal_code?: string;
      is_primary?: boolean;
    },
    headers?: Record<string, string>
  ): Promise<any> {
    const data: any = {
      street_address: streetAddress,
      city_id: cityId,
      state_id: stateId,
      country_id: countryId,
      ...options,
    };
    return this.client.makeRequest('POST', '/address', { data, headers });
  }

  async getCompanyAddress(headers?: Record<string, string>): Promise<any> {
    return this.client.makeRequest('GET', '/address', { headers });
  }
}
