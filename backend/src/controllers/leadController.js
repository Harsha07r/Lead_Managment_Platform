const { validationResult } = require('express-validator');
const Lead = require('../models/Lead');
const User = require('../models/User');
const { logActivity } = require('../utils/activityLogger');

const buildLeadQuery = (req) => {
  const query = {};
  const { status, assignedTo, search } = req.query;

  if (status) query.status = status;
  if (assignedTo) query.assignedTo = assignedTo;

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { company: { $regex: search, $options: 'i' } },
    ];
  }

  return query;
};

const getLeads = async (req, res) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const query = buildLeadQuery(req);

  if (req.user.role === 'member') {
    query.assignedTo = req.user._id;
  }

  try {
    const total = await Lead.countDocuments(query);
    const leads = await Lead.find(query)
      .populate('assignedTo', 'name email role')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    res.json({ leads, total, page, pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch leads' });
  }
};

const getLeadById = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id).populate('assignedTo', 'name email role');
    if (!lead) return res.status(404).json({ message: 'Lead not found' });

    if (req.user.role === 'member' && lead.assignedTo?.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json({ lead });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch lead' });
  }
};

const createLeadPublic = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const lead = await Lead.create({
      ...req.body,
      status: 'New',
    });

    lead.activity.push(logActivity('lead', lead._id, 'Lead created', 'Public lead captured', 'system'));
    await lead.save();

    res.status(201).json({ lead });
  } catch (error) {
    res.status(500).json({ message: 'Lead creation failed' });
  }
};

const updateLead = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);
    if (!lead) return res.status(404).json({ message: 'Lead not found' });

    if (req.user.role === 'member' && lead.assignedTo?.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    if (req.body.status && req.body.status !== lead.status) {
      lead.activity.push(logActivity('lead', lead._id, 'Status updated', `Status changed to ${req.body.status}`, req.user.name));
    }

    const fieldsToUpdate = { ...req.body };
    delete fieldsToUpdate.activity;
    Object.assign(lead, fieldsToUpdate);

    await lead.save();
    res.json({ lead });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update lead' });
  }
};

const addNote = async (req, res) => {
  const { text } = req.body;
  if (!text) return res.status(400).json({ message: 'Note text is required' });

  try {
    const lead = await Lead.findById(req.params.id);
    if (!lead) return res.status(404).json({ message: 'Lead not found' });

    if (req.user.role === 'member' && lead.assignedTo?.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    lead.notes.push({ author: req.user._id, text });
    lead.activity.push(logActivity('lead', lead._id, 'Note added', text, req.user.name));
    await lead.save();
    res.json({ lead });
  } catch (error) {
    res.status(500).json({ message: 'Failed to add note' });
  }
};

const assignLead = async (req, res) => {
  const { assignedTo } = req.body;
  try {
    const lead = await Lead.findById(req.params.id);
    if (!lead) return res.status(404).json({ message: 'Lead not found' });

    const member = await User.findById(assignedTo);
    if (!member || member.role !== 'member') {
      return res.status(400).json({ message: 'Assigned user must be a member' });
    }

    lead.assignedTo = assignedTo;
    lead.activity.push(logActivity('lead', lead._id, 'Lead assigned', `Assigned to ${member.name}`, req.user.name));
    await lead.save();
    res.json({ lead });
  } catch (error) {
    res.status(500).json({ message: 'Failed to assign lead' });
  }
};

module.exports = { getLeads, getLeadById, createLeadPublic, updateLead, addNote, assignLead };
