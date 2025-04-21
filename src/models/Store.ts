import { Schema, model, models } from 'mongoose';

const StoreSchema = new Schema(
    {
        name: { type: String, required: true },
        slug: { type: String, required: true, unique: true },
        logoUrl: { type: String, required: true },
        domain: { type: String },
        description: { type: String },
    },
    { timestamps: true }
);

export const Store = models.Store || model('Store', StoreSchema);
