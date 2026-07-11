import { z } from 'zod';

export const createVitalSchema = z.object({
  patient: z.string({ required_error: 'Patient ID is required' }),

  emergency: z.string().optional(),
  consultation: z.string().optional(),

  bloodPressure: z
    .object({
      systolic: z.number().min(40).max(300).optional(),
      diastolic: z.number().min(20).max(200).optional(),
    })
    .optional(),

  heartRate: z
    .object({
      value: z.number().min(20).max(300).optional(),
    })
    .optional(),

  oxygenSaturation: z
    .object({
      value: z.number().min(0).max(100).optional(),
    })
    .optional(),

  temperature: z
    .object({
      value: z.number().min(80).max(115).optional(),
      unit: z.enum(['F', 'C']).default('F'),
    })
    .optional(),

  respiratoryRate: z
    .object({
      value: z.number().min(5).max(60).optional(),
    })
    .optional(),

  bloodGlucose: z
    .object({
      value: z.number().min(20).max(600).optional(),
    })
    .optional(),

  weight: z
    .object({
      value: z.number().min(1).max(1000).optional(),
      unit: z.enum(['kg', 'lbs']).default('lbs'),
    })
    .optional(),

  height: z
    .object({
      value: z.number().min(20).max(300).optional(),
      unit: z.enum(['cm', 'inches']).default('inches'),
    })
    .optional(),

  painLevel: z.number().min(0).max(10).optional(),

  consciousness: z.enum(['Alert', 'Verbal', 'Pain', 'Unresponsive']).optional(),

  notes: z.string().max(500, 'Notes cannot exceed 500 characters').trim().optional(),

  location: z
    .enum(['Home', 'Hospital', 'Ambulance', 'Clinic', 'Emergency Room', 'Other'])
    .default('Hospital'),

  recordedAt: z.string().datetime().optional(),
});

export const updateVitalSchema = createVitalSchema.partial().omit({ patient: true });
