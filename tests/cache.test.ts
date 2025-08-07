//
import {clearCache, yubin} from '../src';
import {afterEach, beforeEach, describe, expect, it, MockInstance, vi} from "vitest";

describe('キャッシュ機能のテスト', () => {
    let fetchMock: MockInstance<typeof fetch>;

    beforeEach(() => {
        // 各テスト前にモックをリセット
        vi.resetAllMocks();
        clearCache();

        fetchMock = vi.spyOn(global, 'fetch')
            .mockImplementation(async () => new Response(JSON.stringify({
                jis: "13101",
                old: "100",
                prefecture: "東京都",
                prefecture_kana: "トウキョウト",
                prefecture_roman: "tokyo",
                city: "千代田区",
                city_kana: "チヨダク",
                city_roman: "chiyoda-ku",
                suburb: "千代田",
                suburb_kana: "チヨダ",
                suburb_roman: "chiyoda",
                street_address: "",
                office: "",
                office_kana: "",
                is_separated_suburb: false,
                is_koaza: false,
                is_chome: false,
                is_include_area: false
            })));
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('同じ郵便番号で2回呼び出した場合、2回目はキャッシュから取得される', async () => {
        // 1回目の呼び出し
        const result1 = await yubin('100-0001');
        expect(fetchMock).toHaveBeenCalledTimes(1);

        // 2回目の呼び出し（同じ郵便番号）
        const result2 = await yubin('100-0001');
        // fetchが追加で呼ばれていないことを確認（キャッシュから取得）
        expect(fetchMock).toHaveBeenCalledTimes(1);

        // 両方の結果が同じであることを確認
        expect(result2).toEqual(result1);
        expect(result1.prefecture).toBe('東京都');
    });

    it('ハイフンの有無は同一のキャッシュとして扱われる', async () => {
        // ハイフンありで1回目の呼び出し
        const result1 = await yubin('100-0001');
        expect(fetchMock).toHaveBeenCalledTimes(1);

        // ハイフンなしで2回目の呼び出し
        const result2 = await yubin('1000001');
        // fetchが追加で呼ばれていないことを確認（キャッシュから取得）
        expect(fetchMock).toHaveBeenCalledTimes(1);

        // 両方の結果が同じであることを確認
        expect(result2).toEqual(result1);
    });

    it('異なる郵便番号の場合は別々にAPIが呼ばれる', async () => {
        // 1つ目の郵便番号
        await yubin('100-0001');
        expect(fetchMock).toHaveBeenCalledTimes(1);

        // 2つ目の郵便番号（異なる）
        await yubin('150-0001');
        expect(fetchMock).toHaveBeenCalledTimes(2);
        expect(fetchMock).toHaveBeenNthCalledWith(2, 'https://postcode.teraren.com/postcodes/1500001.json');
    });

    it('キャッシュされた結果は正しいデータ構造を持つ', async () => {
        // 1回目の呼び出し
        const result1 = await yubin('100-0001');

        // 2回目の呼び出し（キャッシュから取得）
        const result2 = await yubin('100-0001');

        // データ構造の確認
        expect(result2).toHaveProperty('prefecture');
        expect(result2).toHaveProperty('prefecture_id');
        expect(result2).toHaveProperty('city');
        expect(result2.prefecture_id).toBe(13);
        expect(fetchMock).toHaveBeenCalledTimes(1);
    });
});
