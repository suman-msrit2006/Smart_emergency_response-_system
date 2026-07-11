import { z } from 'zod';

export const createAmbulanceSchema = z.object({
  vehicleNumber: z
    .string({ required_error: 'Vehicle number is required' })
    .trim()
    .toUpperCase(),

  type: z.enum(
    ['Basic Life Support', 'Advanced Life Support', 'Air Ambulance', 'Patient Transport'],
    { errorMap: () => ({ message: 'Invalid ambulance type' }) }
  ),

  hospital: z.string({ required_error: 'Associated hospital is required' }),

  driver: z.string({ required_error: 'Driver is required' }),

  paramedics: z.array(z.string()).optional(),

  equipment: z
    .object({
      defibrillator: z.boolean().optional(),
      oxygenSupply: z.boolean().optional(),
      ventilator: z.boolean().optional(),
      stretcher: z.boolean().optional(),
      firstAidKit: z.boolean().optional(),
      spinalBoard: z.boolean().optional(),
    })
    .optional(),

  capacity: z.number().int().min(1).max(6).optional(),

  licensePlate: z
    .string({ required_error: 'License plate is required' })
    .trim()
    .toUpperCase(),

  model: z.string().trim().optional(),

  year: z
    .number()
    .int()
    .min(1990, 'Year must be 1990 or later')
    .max(new Date().getFullYear() + 1, 'Year cannot be in the future')
    .optional(),
});

export const updateAmbulanceSchema = createAmbulanceSchema.partial();

export const updateLocationSchema = z.object({
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
});

export const updateStatusSchema = z.object({
  status: z.enum([
    'Available',
    'En Route',
    'On Scene',
    'Transporting',
    'At Hospital',
    'Out of Service',
  ]),
});

export const updateFuelSchema = z.object({
  fuelLevel: z.number().min(0, 'Fuel level cannot be negative').max(100, 'Fuel level cannot exceed 100%'),
});
