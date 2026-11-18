import { Schema, model } from 'mongoose';
import { SERVICE_RECORD_TYPES } from '../types/serviceRecord';

const toDateString = (value: unknown): unknown =>
  value instanceof Date ? value.toISOString().slice(0, 10) : value;

const serviceRecordSchema = new Schema(
  {
    carId: { type: String, required: true, index: true },
    type: { type: String, enum: SERVICE_RECORD_TYPES, required: true },
    description: { type: String, required: true },
    cost: { type: Number, required: true },
    date: { type: Date, required: true },
    mileage: { type: Number, required: true },
    warrantyMonths: { type: Number },
    warrantyExpiresAt: { type: Date },
  },
  {
    versionKey: false,
    toJSON: {
      transform: (_document, result: Record<string, unknown>) => {
        result.id = String(result._id);
        delete result._id;
        result.date = toDateString(result.date);
        result.warrantyExpiresAt = toDateString(result.warrantyExpiresAt);
        if (result.warrantyExpiresAt === undefined) {
          delete result.warrantyExpiresAt;
        }
        return result;
      },
    },
  },
);

export const ServiceRecordModel = model('ServiceRecord', serviceRecordSchema, 'serviceRecords');
