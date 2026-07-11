import { z } from 'zod';

export const createEmergencySchema = z.object({
  patient: z.string({ required_error: 'Patient ID is required' }),

  type: z.enum(
    [
      'Cardiac Arrest',
      'Accident',
      'Stroke',
      'Respiratory Distress',
      'Trauma',
      'Burn',
      'Poisoning',
      'Allergic Reaction',
      'Seizure',
      'Other',
    ],
    { errorMap: () => ({ message: 'Invalid emergency type' }) }
  ),

  severity: z
    .enum(['Critical', 'High', 'Medium', 'Low'], {
      errorMap: () => ({ message: 'Invalid severity level' }),
    })
    .default('Medium'),

  description: z
    .string({ required_error: 'Description is required' })
    .min(10, 'Description must be at least 10 characters long')
    .max(1000, 'Description cannot exceed 1000 characters')
    .trim(),

  location: z.object({
    coordinates: z
      .array(z.number())
      .length(2, 'Coordinates must have exactly 2 values [longitude, latitude]')
      .refine(
        (coords) => coords[0] >= -180 && coords[0] <= 180,
        'Longitude must be between -180 and 180'
      )
      .refine(
        (coords) => coords[1] >= -90 && coords[1] <= 90,
        'Latitude must be between -90 and 90'
      ),
    address: z.string({ required_error: 'Address is required' }).trim(),
  }),

  contactNumber: z
    .string({ required_error: 'Contact number is required' })
    .regex(
      /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/,
      'Invalid contact number format'
    )
    .trim(),

  vitals: z
    .object({
      bloodPressure: z.string().optional(),
      heartRate: z.number().optional(),
      oxygenLevel: z.number().optional(),
      temperature: z.number().optional(),
      respiratoryRate: z.number().optional(),
    })
    .optional(),

  symptoms: z.array(z.string()).optional(),
  allergies: z.array(z.string()).optional(),
  currentMedications: z.array(z.string()).optional(),
  medicalHistory: z.string().optional(),

  callerName: z.string().trim().optional(),
  callerRelation: z
    .enum(['Self', 'Family', 'Friend', 'Bystander', 'Healthcare Worker', 'Other'])
    .optional(),
});

export const updateEmergencySchema = createEmergencySchema.partial();

export const updateStatusSchema = z.object({
  status: z.enum([
    'Pending',
    'Ambulance Dispatched',
    'Ambulance En Route',
    'Ambulance On Scene',
    'Transporting',
    'Arrived at Hospital',
    'Completed',
    'Cancelled',
  ]),
});

export const assignAmbulanceSchema = z.object({
  ambulanceId: z.string({ required_error: 'Ambulance ID is required' }),
  estimatedArrival: z.string().datetime().optional(),
});

export const assignHospitalSchema = z.object({
  hospitalId: z.string({ required_error: 'Hospital ID is required' }),
});
