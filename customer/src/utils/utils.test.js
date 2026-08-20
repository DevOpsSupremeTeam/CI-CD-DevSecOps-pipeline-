const {
  GenerateSalt,
  GeneratePassword,
  ValidatePassword,
  FormateData,
} = require('../utils');

describe('utils', () => {
  test('GenerateSalt trả về chuỗi', async () => {
    const salt = await GenerateSalt();
    expect(typeof salt).toBe('string');
    expect(salt.length).toBeGreaterThan(0);
  });

  test('GeneratePassword + ValidatePassword khớp nhau', async () => {
    const salt = await GenerateSalt();
    const hash = await GeneratePassword('secret123', salt);
    await expect(ValidatePassword('secret123', hash, salt)).resolves.toBe(true);
    await expect(ValidatePassword('sai-mat-khau', hash, salt)).resolves.toBe(false);
  });

  test('FormateData bọc data khi có giá trị', () => {
    expect(FormateData({ id: 1 })).toEqual({ data: { id: 1 } });
  });

  test('FormateData ném lỗi khi rỗng', () => {
    expect(() => FormateData(null)).toThrow('Data Not found!');
  });
});
