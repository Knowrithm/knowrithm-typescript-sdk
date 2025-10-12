import { KnowrithmClient } from '../client';
export declare class AddressService {
    private client;
    constructor(client: KnowrithmClient);
    seedReferenceData(headers?: Record<string, string>): Promise<any>;
    createCountry(name: string, isoCode?: string, headers?: Record<string, string>): Promise<any>;
    listCountries(headers?: Record<string, string>): Promise<any>;
    getCountry(countryId: number, headers?: Record<string, string>): Promise<any>;
    updateCountry(countryId: number, name?: string, isoCode?: string, headers?: Record<string, string>): Promise<any>;
    createState(name: string, countryId: number, headers?: Record<string, string>): Promise<any>;
    listStatesByCountry(countryId: number, headers?: Record<string, string>): Promise<any>;
    getState(stateId: number, headers?: Record<string, string>): Promise<any>;
    updateState(stateId: number, name?: string, countryId?: number, headers?: Record<string, string>): Promise<any>;
    createCity(name: string, stateId: number, postalCodePrefix?: string, headers?: Record<string, string>): Promise<any>;
    listCitiesByState(stateId: number, headers?: Record<string, string>): Promise<any>;
    getCity(cityId: number, headers?: Record<string, string>): Promise<any>;
    updateCity(cityId: number, name?: string, stateId?: number, postalCodePrefix?: string, headers?: Record<string, string>): Promise<any>;
    createAddress(streetAddress: string, cityId: number, stateId: number, countryId: number, options?: {
        lat?: number;
        lan?: number;
        postal_code?: string;
        is_primary?: boolean;
    }, headers?: Record<string, string>): Promise<any>;
    getCompanyAddress(headers?: Record<string, string>): Promise<any>;
}
//# sourceMappingURL=address.d.ts.map