import { z } from 'zod';

export const registerSchema = z.object({
  name: z
    .string({
      required_error: 'Name is required',
    })
    .min(2, 'Name must be at least 2 characters long')
    .max(100, 'Name cannot exceed 100 characters')
    .trim(),

  email: z
    .string({
      required_error: 'Email is required',
    })
    .email('Invalid email address')
    .toLowerCase()
    .trim(),

  password: z
    .string({
      required_error: 'Password is required',
    })
    .min(8, 'Password must be at least 8 characters long')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    ),

  phone: z
    .string({
      required_error: 'Phone number is required',
    })
    .regex(
      /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/,
      'Invalid phone number format'
    )
    .trim(),

  role: z.enum(['Patient', 'Doctor', 'Ambulance Driver', 'Hospital Admin'], {
    errorMap: () => ({ message: 'Invalid role selected' }),
  }),
});

export const loginSchema = z.object({
  email: z
    .string({
      required_error: 'Email is required',
    })
    .email('Invalid email address')
    .toLowerCase()
    .trim(),

  password: z
    .string({
      required_error: 'Password is required',
    })
    .min(1, 'Password is required'),
});

export const validateRequest = (schema) => {
  return (req, res, next) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        }));

        return res.status(400).json({
          status: 'fail',
          message: 'Validation failed',
          errors,
        });
      }
      next(error);
    }
  };
};
