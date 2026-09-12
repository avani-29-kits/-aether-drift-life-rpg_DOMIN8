const { body, validationResult } = require('express-validator');

function handleValidation(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: errors.array()[0].msg });
  }
  next();
}

const signupRules = [
  body('name').trim().isLength({ min: 1, max: 100 }).withMessage('Name is required.'),
  body('email').trim().isEmail().withMessage('Enter a valid email address.'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters.')
    .matches(/[A-Za-z]/)
    .withMessage('Password must include a letter.')
    .matches(/[0-9]/)
    .withMessage('Password must include a number.'),
  body('confirmPassword').custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error('Passwords do not match.');
    }
    return true;
  }),
  handleValidation,
];

const loginRules = [
  body('email').trim().isEmail().withMessage('Enter a valid email address.'),
  body('password').notEmpty().withMessage('Password is required.'),
  handleValidation,
];

const CATEGORIES = ['coding', 'study', 'fitness', 'reading', 'health', 'personal', 'creativity', 'other'];
const DIFFICULTIES = ['easy', 'medium', 'hard', 'epic'];
const ATTRIBUTES = ['strength', 'intellect', 'agility', 'vitality'];

const questRules = [
  body('title').trim().isLength({ min: 1, max: 150 }).withMessage('Title is required.'),
  body('description').optional({ checkFalsy: true }).isLength({ max: 2000 }).withMessage('Description is too long.'),
  body('category').optional().isIn(CATEGORIES).withMessage('Invalid category.'),
  body('difficulty').optional().isIn(DIFFICULTIES).withMessage('Invalid difficulty.'),
  body('attribute').optional().isIn(ATTRIBUTES).withMessage('Invalid attribute.'),
  body('dueDate').optional({ checkFalsy: true }).isISO8601().withMessage('Invalid due date.'),
  // Deliberately no xp_reward/gold_reward rule: even if the client sends
  // those fields, the controller never reads them from req.body.
  handleValidation,
];

module.exports = { signupRules, loginRules, questRules };
