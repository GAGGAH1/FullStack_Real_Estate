import config from '../config/database.js';

export const createInquiry = async (req, res) => {
  const { propertyId, message } = req.body;

  if (!propertyId || !message) {
    return res.status(400).json({ message: 'propertyId and message are required.' });
  }

  const property = db.properties.findById(propertyId);
  if (!property) {
    return res.status(404).json({ message: 'Property not found.' });
  }

  try {
    const newInquiry = db.inquiries.create({
      propertyId,
      propertyName: property.title,
      buyerId: req.user.id,
      buyerName: req.user.name,
      buyerEmail: req.user.email,
      message,
      agentId: property.agentId,
      status: 'unread',
      replyMessage: ''
    });

    return res.status(201).json({
      message: 'Inquiry submitted successfully! The agent will be notified.',
      inquiry: newInquiry
    });
  } catch (error) {
    return res.status(500).json({ message: 'Error submitting inquiry.', error: error.message });
  }
};

export const getInquiries = async (req, res) => {
  try {
    let inquiries = [];

    if (req.user.role === 'admin') {
      inquiries = db.inquiries.find();
    } else if (req.user.role === 'agent') {
      inquiries = db.inquiries.find({ agentId: req.user.id });
    } else {
      inquiries = db.inquiries.find({ buyerId: req.user.id });
    }

    return res.json(inquiries);
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching inquiries.', error: error.message });
  }
};

export const replyToInquiry = async (req, res) => {
  const { replyMessage } = req.body;

  if (!replyMessage) {
    return res.status(400).json({ message: 'replyMessage is required.' });
  }

  const inquiry = db.inquiries.findById(req.params.id);
  if (!inquiry) {
    return res.status(404).json({ message: 'Inquiry not found.' });
  }

  if (req.user.role === 'agent' && inquiry.agentId !== req.user.id) {
    return res.status(403).json({ message: 'Access denied. This inquiry is for another agent.' });
  }

  try {
    const updatedInquiry = db.inquiries.findByIdAndUpdate(req.params.id, {
      status: 'replied',
      replyMessage
    });

    return res.json({
      message: 'Reply sent successfully!',
      inquiry: updatedInquiry
    });
  } catch (error) {
    return res.status(500).json({ message: 'Error replying to inquiry.', error: error.message });
  }
};
