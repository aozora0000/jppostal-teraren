import { yubin, Prefectures } from '../src';
import {describe, test, expect} from "vitest";

describe('郵便番号検索機能のテスト', () => {
    // 正常系のテスト
    test('有効な郵便番号（ハイフンあり）で検索できる', async () => {
        const result = await yubin('100-0001');
        expect(result.prefecture).toBe('東京都');
        expect(result.prefecture_id).toBe(13);
        expect(result.city).toBeDefined();
    });

    test('有効な郵便番号（ハイフンなし）で検索できる', async () => {
        const result = await yubin('1000001');
        expect(result.prefecture).toBe('東京都');
        expect(result.prefecture_id).toBe(13);
        expect(result.city).toBeDefined();
    });

    // 住所フィールドのテスト
    test('addressフィールドが正しく設定される', async () => {
        const result = await yubin('100-0001');
        expect(result.address).toBeDefined();
        expect(result.address).toBe('千代田区 千代田')
    });

    test('fullAddressフィールドが正しく設定される', async () => {
        const result = await yubin('100-0001');
        expect(result.fullAddress).toBeDefined();
        expect(result.fullAddress).toBe('東京都 千代田区 千代田')
    });

    test('fullAddressフィールドに専用番号の事業者オフィス名が入る', async () => {
        const result = await yubin('540-8510');
        expect(result.fullAddress).toBeDefined();
        expect(result.fullAddress).toBe("大阪府 大阪市中央区 城見 １丁目３番５０号読売テレビ本社ウエストウイング７階 株式会社　エイデック")
    });

    // 異常系のテスト
    test('無効な郵便番号でエラーになる', async () => {
        await expect(yubin('1234567890')).rejects.toEqual('THE POSTAL CODE IS INVALID');
    });

    test('存在しない郵便番号でエラーになる', async () => {
        await expect(yubin('999-9999')).rejects.toEqual('POSTAL CODE NOT FOUND');
    });

    test('不正なフォーマットでエラーになる', async () => {
        await expect(yubin('12-34567')).rejects.toEqual('THE POSTAL CODE IS INVALID');
    });
});

describe('Prefectures配列のテスト', () => {
    test('都道府県が正しい順序で格納されている', () => {
        expect(Prefectures[1]).toBe('北海道');
        expect(Prefectures[13]).toBe('東京都');
        expect(Prefectures[47]).toBe('沖縄県');
    });

    test('都道府県の総数が47+1（空文字含む）である', () => {
        expect(Prefectures.length).toBe(48);
    });

    test('存在しないインデックスはundefinedを返す', () => {
        expect(Prefectures[48]).toBeUndefined();
        expect(Prefectures[-1]).toBeUndefined();
        expect(Prefectures[100]).toBeUndefined();
    });
});
