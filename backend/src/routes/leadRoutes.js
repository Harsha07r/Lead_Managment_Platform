const express = require('express');
const { body } = require('express-validator');
const { protect, authorize } = require('../middleware/authMiddleware');
const { getLeads, getLeadById, createLeadPublic, updateLead, addNote, assignLead } = require('../controllers/leadController');

const router = express.Router();

router.post(
  '/public',
  [
    body('name').notEmpty(),
    body('email').isEmail(),
    body('phone').notEmpty(),
    body('company').notEmpty(),
    body('source').notEmpty(),
    body('message').notEmpty(),
  ],
  createLeadPublic,
);

router.use(protect);
router.get('/', getLeads);
router.get('/:id', getLeadById);
router.put('/:id', updateLead);
router.post('/:id/notes', addNote);
router.patch('/:id/assign', authorize('admin'), assignLead);

module.exports = router;
