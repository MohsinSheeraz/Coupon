export interface Coupon {
    _id: string;
    title: string;
    code: string;
    description?: string;
    discountType: 'percent' | 'fixed' | 'free_shipping';
    discountValue: number;
    expiryDate?: string;
    url?: string;
    store: {
        _id: string;
        name: string;
        slug: string;
        logoUrl: string;
    };
}
