import { body } from 'express-validator';

// Validation rules for creating/updating accessories
const accessoryValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Description is required')
    .isLength({ min: 10, max: 500 })
    .withMessage('Description must be between 10 and 500 characters'),
  
  body('price')
    .customSanitizer((value) => {
      if (value === '' || value === undefined || value === null) return undefined;
      if (value === 'NaN') return undefined;
      return value;
    })
    .isNumeric()
    .withMessage('Price must be a number')
    .isFloat({ min: 0 })
    .withMessage('Price must be greater than or equal to 0'),
  
  body('stock')
    .optional({ checkFalsy: true })
    .customSanitizer((value) => {
      if (value === '' || value === undefined || value === null) return undefined;
      if (value === 'NaN') return undefined;
      return value;
    })
    .isInt({ min: 0 })
    .withMessage('Stock must be a non-negative integer'),
  
  body('category')
    .customSanitizer((value) => (value === '' || value === undefined ? 'Other' : value))
    .isIn(['Interior', 'Exterior', 'Electronics', 'Other'])
    .withMessage('Category must be one of: Interior, Exterior, Electronics, Other'),
  
  // image is handled via file upload when provided
  body('image').optional(),
  
  body('brand')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Brand name cannot exceed 50 characters'),
  
  body('weight')
    .optional()
    .isNumeric()
    .withMessage('Weight must be a number')
    .isFloat({ min: 0 })
    .withMessage('Weight must be greater than or equal to 0'),
  
  body('dimensions.length')
    .optional()
    .isNumeric()
    .withMessage('Length must be a number')
    .isFloat({ min: 0 })
    .withMessage('Length must be greater than or equal to 0'),
  
  body('dimensions.width')
    .optional()
    .isNumeric()
    .withMessage('Width must be a number')
    .isFloat({ min: 0 })
    .withMessage('Width must be greater than or equal to 0'),
  
  body('dimensions.height')
    .optional()
    .isNumeric()
    .withMessage('Height must be a number')
    .isFloat({ min: 0 })
    .withMessage('Height must be greater than or equal to 0'),
  
  body('compatibility')
    .optional()
    .customSanitizer((value) => {
      if (typeof value === 'string') {
        try { return JSON.parse(value); } catch { return value; }
      }
      return value;
    })
    .isArray()
    .withMessage('Compatibility must be an array'),
  
  body('compatibility.*')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Each compatibility item must be between 1 and 50 characters'),
  
  body('tags')
    .optional()
    .customSanitizer((value) => {
      if (typeof value === 'string') {
        try { return JSON.parse(value); } catch { return value; }
      }
      return value;
    })
    .isArray()
    .withMessage('Tags must be an array'),
  
  body('tags.*')
    .optional()
    .trim()
    .isLength({ min: 1, max: 20 })
    .withMessage('Each tag must be between 1 and 20 characters')
];

// Validation rules for creating orders
const orderValidation = [
  body('user')
    .isMongoId()
    .withMessage('User ID must be a valid MongoDB ObjectId'),
  
  body('items')
    .isArray({ min: 1 })
    .withMessage('Items must be a non-empty array'),
  
  body('items.*.accessory')
    .isMongoId()
    .withMessage('Each item must have a valid accessory ID'),
  
  body('items.*.quantity')
    .isInt({ min: 1 })
    .withMessage('Each item quantity must be at least 1'),
  
  body('shippingAddress.street')
    .trim()
    .notEmpty()
    .withMessage('Street address is required'),
  
  body('shippingAddress.city')
    .trim()
    .notEmpty()
    .withMessage('City is required'),
  
  body('shippingAddress.state')
    .trim()
    .notEmpty()
    .withMessage('State is required'),
  
  body('shippingAddress.zipCode')
    .trim()
    .notEmpty()
    .withMessage('ZIP code is required'),
  
  body('paymentMethod')
    .isIn(['Credit Card', 'Debit Card', 'PayPal', 'Cash on Delivery'])
    .withMessage('Payment method must be one of: Credit Card, Debit Card, PayPal, Cash on Delivery'),
  
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Notes cannot exceed 500 characters')
];

// Validation rules for updating order status
const orderStatusValidation = [
  body('status')
    .isIn(['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'])
    .withMessage('Status must be one of: Pending, Processing, Shipped, Delivered, Cancelled'),
  
  body('trackingNumber')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Tracking number must be between 1 and 50 characters'),
  
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Notes cannot exceed 500 characters')
];

// Validation rules for updating stock
const stockUpdateValidation = [
  body('quantity')
    .isNumeric()
    .withMessage('Quantity must be a number')
    .custom((value) => {
      if (value === 0) {
        throw new Error('Quantity cannot be zero');
      }
      return true;
    })
];

export {
  accessoryValidation,
  orderValidation,
  orderStatusValidation,
  stockUpdateValidation
};
