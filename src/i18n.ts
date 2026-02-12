import { getRequestConfig } from 'next-intl/server';

export default getRequestConfig(async () => {
    // Default to Indonesian
    const locale = 'id';
    return {
        locale,
        messages: (await import(`./messages/${locale}.json`)).default,
    };
});
