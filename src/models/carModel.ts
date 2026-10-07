import { Schema, model } from 'mongoose';
import type { CarData } from '../types/car';

const carSchema = new Schema<CarData>(
  {
    userId: { type: String, required: true },
    brand: { type: String, required: true },
    model: { type: String, required: true },
    year: { type: Number, required: true },
    plate: { type: String, required: true },
    mileage: { type: Number, required: true },
    nickname: { type: String },
  },
  {
    versionKey: false,
    toJSON: {
      transform: (_document, result: Record<string, unknown>) => {
        result.id = String(result._id);
        delete result._id;
        return result;
      },
    },
  },
);

carSchema.index({ userId: 1, plate: 1 }, { unique: true });

export const CarModel = model<CarData>('Car', carSchema, 'cars');
