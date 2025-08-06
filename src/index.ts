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

export type Address = {
    jis: string;
    old: string;
    prefecture: string;
    prefecture_id: number;
    prefecture_kana: string;
    prefecture_roman: string;
    city: string;
    city_kana: string;
    city_roman: string;
    suburb: string;
    suburb_kana: string;
    suburb_roman: string;
    street_address: string;
    office: string;
    office_kana: string;
    is_separated_suburb: boolean;
    is_koaza: boolean;
    is_chome: boolean;
    is_include_area: boolean;
};

const cache = new Map<string, Address>();

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
            cache.set(postalcode, data);
            resolve(data);
        } catch(e) {
            reject("POSTAL CODE NOT FOUND");
        }
    })
};
