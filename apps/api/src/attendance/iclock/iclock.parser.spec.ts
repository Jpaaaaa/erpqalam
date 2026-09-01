import {
  buildHandshakeConfig,
  mapVerifyMode,
  parseAttlogBody,
  parseDeviceUserBody,
  shouldApplyDeviceUserName,
} from './iclock.parser';

describe('iclock.parser', () => {
  describe('mapVerifyMode', () => {
    it('maps known modes', () => {
      expect(mapVerifyMode(1)).toBe('finger');
      expect(mapVerifyMode(0)).toBe('pin');
      expect(mapVerifyMode(2)).toBe('pin');
      expect(mapVerifyMode(15)).toBe('face');
      expect(mapVerifyMode(4)).toBe('card');
      expect(mapVerifyMode(99)).toBe('finger');
    });
  });

  describe('parseAttlogBody', () => {
    it('parses tab-separated ATTLOG rows', () => {
      const body =
        '101\t2026-08-31 08:30:00\t0\t1\t0\t0\n102\t2026-08-31 17:00:00\t1\t4\t0\t0';
      const rows = parseAttlogBody(body);
      expect(rows).toHaveLength(2);
      expect(rows[0].deviceUserId).toBe('101');
      expect(rows[0].verifyType).toBe('finger');
      expect(rows[0].timestamp.getFullYear()).toBe(2026);
      expect(rows[0].timestamp.getMonth()).toBe(7);
      expect(rows[0].timestamp.getDate()).toBe(31);
      expect(rows[0].timestamp.getHours()).toBe(8);
      expect(rows[0].timestamp.getMinutes()).toBe(30);
      expect(rows[1].verifyType).toBe('card');
    });

    it('skips invalid lines', () => {
      expect(parseAttlogBody('bad line\n')).toHaveLength(0);
    });
  });

  describe('buildHandshakeConfig', () => {
    it('includes serial number', () => {
      expect(buildHandshakeConfig('SN123')).toContain('GET OPTION FROM: SN123');
      expect(buildHandshakeConfig('SN123')).toContain('Realtime=1');
    });
  });

  describe('parseDeviceUserBody', () => {
    it('parses USER lines with spaces or tabs', () => {
      const body = [
        'USER PIN=982 Name=Richard Passwd=9822 Card=13375590 Grp=1 TZ=',
        'USER PIN=101\tName=Ahmed Ali\tPri=0',
      ].join('\n');
      const users = parseDeviceUserBody(body);
      expect(users).toHaveLength(2);
      expect(users[0]).toEqual({ deviceUserId: '982', name: 'Richard' });
      expect(users[1]).toEqual({ deviceUserId: '101', name: 'Ahmed Ali' });
    });
  });

  describe('shouldApplyDeviceUserName', () => {
    it('ignores placeholder name equal to PIN when a real name exists', () => {
      expect(shouldApplyDeviceUserName('101', '101', 'Ahmed')).toBe(false);
      expect(shouldApplyDeviceUserName('101', 'Ahmed', '101')).toBe(true);
    });
  });
});
