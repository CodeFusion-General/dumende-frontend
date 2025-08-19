/**
 * Tarayıcı bilgilerini ve kullanıcı aygıt bilgilerini toplar
 */
export const getBrowserInfo = (): string => {
  const nav = navigator;
  const info = {
    userAgent: nav.userAgent,
    platform: nav.platform,
    language: nav.language,
    cookieEnabled: nav.cookieEnabled,
    onLine: nav.onLine,
    screen: {
      width: screen.width,
      height: screen.height,
      colorDepth: screen.colorDepth,
    },
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    timestamp: new Date().toISOString(),
  };

  return JSON.stringify(info);
};

/**
 * İstemci IP adresini almaya çalışır
 * Not: Bu sadece bir tahmini bilgidir ve gerçek IP'yi garanti etmez
 * Gerçek IP backend'te HttpServletRequest'ten alınmalıdır
 */
export const getClientIP = async (): Promise<string> => {
  try {
    // Public IP servisleri kullanarak IP almaya çalış
    const response = await fetch('https://api.ipify.org?format=json', {
      timeout: 5000,
    });
    const data = await response.json();
    return data.ip || 'unknown';
  } catch (error) {
    console.warn('IP adresi alınamadı:', error);
    return 'unknown';
  }
};

/**
 * Kullanıcı bilgilerini toplayan yardımcı fonksiyon
 */
export const getUserDeviceInfo = () => {
  return {
    browserInfo: getBrowserInfo(),
    timestamp: new Date().toISOString(),
  };
};
