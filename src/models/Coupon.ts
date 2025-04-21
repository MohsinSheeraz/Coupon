import { Schema, model, models, Types } from 'mongoose';

const CouponSchema = new Schema(
    {
        store: { type: Types.ObjectId, ref: 'Store', required: true },
        title: { type: String, required: true },
        code: { type: String, required: true },
        description: { type: String },
        discountType: {
            type: String,
            enum: ['percent', 'fixed', 'free_shipping'],
            required: true,
        },
        discountValue: { type: Number, required: true },
        expiryDate: { type: Date },
        url: { type: String },
        isActive: { type: Boolean, default: true },
    },
    { timestamps: true }
);

export const Coupon = models.Coupon || model('Coupon', CouponSchema);
