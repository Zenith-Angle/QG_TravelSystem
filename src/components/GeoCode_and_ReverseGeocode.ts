import axios, {AxiosResponse} from 'axios';
import {mapCenter} from './mapConfig';
import {amapWebServiceKey} from "../config";

// 定义一个接口来描述高德地理逆编码 API 返回的 JSON 结构
interface ReverseGeocodeResult {
    status: string;
    info: string;
    infocode: string;
    regeocode: {
        addressComponent: {
            city: string;
            province: string;
            adcode: string;
            district: string;
            towncode: string;
            streetNumber: {
                number: string[];
                direction: string[];
                distance: string[];
                street: string[];
            };
            country: string;
            township: string;
            businessAreas: Array<any[]>;
            building: {
                name: string[];
                type: string[];
            };
            neighborhood: {
                name: string[];
                type: string[];
            };
            citycode: string;
        };
        formatted_address: string;
    };
}

export async function reverseGeocodeCurrentLocation(): Promise<ReverseGeocodeResult> {
    const response: AxiosResponse<ReverseGeocodeResult> = await axios.get('https://restapi.amap.com/v3/geocode/regeo', {
        params: {
            key: amapWebServiceKey,
            location: mapCenter.value.join(','),
            output: 'json', // 指定返回格式为 JSON
            radius: '1000', // 设定搜索半径为 1000 米
            extensions: 'base' // 请求基础信息
        },
        timeout: 10000
    });
    return response.data;
}

// 定义一个接口来描述高德地理编码 API 返回的 JSON 结构
interface GeocodeResult {
    status: string;
    info: string;
    infocode: string;
    geocodes: Array<{
        formatted_address: string;
        country: string;
        province: string;
        citycode: string;
        city: string;
        district: string;
        township: string;
        neighborhood: {
            name: string;
            type: string;
        };
        building: {
            name: string;
            type: string;
        };
        adcode: string;
        street: string;
        number: string;
        location: string;
        level: string;
    }>;
}

export async function geocodeLocation(address: string): Promise<GeocodeResult> {
    const response: AxiosResponse<GeocodeResult> = await axios.get('https://restapi.amap.com/v3/geocode/geo', {
        params: {
            key: amapWebServiceKey,
            address: address,
            output: 'json' // 指定返回格式为 JSON
        },
        timeout: 10000
    });
    return response.data;
}
