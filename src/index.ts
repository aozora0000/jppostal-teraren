const URL = `https://postcode.teraren.com/postcodes`;

const validate = (value: string) =>
    value.match(/^([0-9]{7}|[0-9]{3}-[0-9]{4})$/);
const sanitize = (value: string) => value.replace(/-/g, "");

export const Prefectures = [
    '', '北海道', '青森県', '岩手県', '宮城県',
    '秋田県', '山形県', '福島県', '茨城県', '栃木県',
    '群馬県', '埼玉県', '千葉県', '東京都', '神奈川県',
    '新潟県', '富山県', '石川県', '福井県', '山梨県',
    '長野県', '岐阜県', '静岡県', '愛知県', '三重県',
    '滋賀県', '京都府', '大阪府', '兵庫県', '奈良県',
    '和歌山県', '鳥取県', '島根県', '岡山県', '広島県',
    '山口県', '徳島県', '香川県', '愛媛県', '高知県',
    '福岡県', '佐賀県', '長崎県', '熊本県', '大分県',
    '宮崎県', '鹿児島県', '沖縄県'
];

/**
 * @see https://postcode.teraren.com/doc/redoc#schema/Postcode
 */
export type Address = {
    // API Response
    old: string; // 旧３桁番号
    prefecture: string; // 都道府県
    prefecture_kana: string;　// 都道府県カナ
    prefecture_roman: string; // 都道府県ローマ字
    city: string; // 市名
    city_kana: string; // 市名カナ
    city_roman: string; // 市名ローマ字
    suburb: string; // 町名
    suburb_kana: string; // 町名カナ
    suburb_roman: string; // 町名ローマ字
    street_address: string; // 小字名、丁目、番地等
    office: string; // 大口事業所名
    office_kana: string; // 大口事業所名カナ
    office_roman: string; // 大口事業所名ローマ字
    is_separated_suburb: boolean;
    is_koaza: boolean;
    is_chome: boolean;
    is_include_area: boolean;

    // Custom Attribute
    prefecture_id: number; // 都道府県ID(Prefecturesの逆リレーション)
    address: string; // city + suburb + street_address
    fullAddress: string; // prefecture + city + suburb + street_address
};

const cache = new Map<string, Address>();
export const clearCache = () => cache.clear();

export const yubin = async (value: string): Promise<Address> => {
    return new Promise(async (resolve, reject) => {
        if(!validate(value)) {
            reject("THE POSTAL CODE IS INVALID");
        }
        try {
            const postalcode = sanitize(value);
            if(cache.has(postalcode)) {
                resolve(cache.get(postalcode)!)
                return;
            }
            const response =  await fetch(`${URL}/${postalcode}.json`);
            if(!response.ok) {
                reject("POSTAL CODE NOT FOUND");
                return;
            }
            const data: Address = await response.json();
            (Object.keys(data) as (keyof Address)[]).forEach(key => {
                if (data[key] === null) {
                    // @ts-ignore
                    data[key] = '';
                }
            });
            data.prefecture_id = Prefectures.indexOf(data.prefecture);
            data.address = [data.city, data.suburb, data.street_address, data.office].filter(val => val !== "").join(' ');
            data.fullAddress = [data.prefecture, data.city, data.suburb, data.street_address, data.office].filter(val => val !== "").join(' ');
            cache.set(postalcode, data);
            resolve(data);
        } catch(e) {
            reject("POSTAL CODE NOT FOUND");
        }
    })
};
