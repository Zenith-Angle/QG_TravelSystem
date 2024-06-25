import axios, {AxiosResponse} from 'axios';
import {mapCenter} from './mapConfig';
import keys from "../keys.json";

const AMAP_API_KEY = keys.AMAP_KEY;

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

// 创建一个全局变量来保存逆地理编码的结果
let geocodeResult: ReverseGeocodeResult | null = null;

export async function reverseGeocodeCurrentLocation() {
    // const location = mapCenter.value.join(',');
    const response: AxiosResponse<ReverseGeocodeResult> = await axios.get('https://restapi.amap.com/v3/geocode/regeo', {
        params: {
            key: AMAP_API_KEY,
            location: location,
            output: 'json', // 指定返回格式为 JSON
            radius: '1000', // 设定搜索半径为 1000 米
            extensions: 'base' // 请求基础信息
        }
    });
    geocodeResult = response.data; // 将结果保存到全局变量中
    return geocodeResult;
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

// 创建一个全局变量来保存地理编码的结果
let geocodingResult: GeocodeResult | null = null;

export async function geocodeLocation(address: string) {
    const response: AxiosResponse<GeocodeResult> = await axios.get('https://restapi.amap.com/v3/geocode/geo', {
        params: {
            key: AMAP_API_KEY,
            address: address,
            output: 'json' // 指定返回格式为 JSON
        }
    });
    geocodingResult = response.data; // 将结果保存到全局变量中
    return geocodingResult;
}
