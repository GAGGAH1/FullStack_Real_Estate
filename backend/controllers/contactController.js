import contactModel from '../models/contactModel.js';
import propertyModel from '../models/propertyModel.js';

// @desc    Get all contacts (for agents/admins to see messages about their properties)
// @route   GET /api/contacts
// @access  Private
export const getContacts = async (req, res) => {
  try {
    // If user is an agent or admin, they can see contacts for their properties
    let contacts;
    if (req.user.role === 'agent') {
      // Find properties by this agent, then get contacts for those properties
      const properties = await propertyModel.find({ agent: req.user.id });
      const propertyIds = properties.map(property => property._id);
      contacts = await contactModel.find({ property: { $in: propertyIds } })
        .populate('property', 'title')
        .populate('user', 'name email');
    } else if (req.user.role === 'admin') {
      contacts = await contactModel.find()
        .populate('property', 'title')
        .populate('user', 'name email');
    } else {
      // Buyers can only see their own contacts
      contacts = await contactModel.find({ user: req.user.id })
        .populate('property', 'title')
        .populate('user', 'name email');
    }

    res.json(contacts);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get single contact
// @route   GET /api/contacts/:id
// @access  Private
export const getContact = async (req, res) => {
  try {
    const contact = await contactModel.findById(req.params.id)
      .populate('property', 'title')
      .populate('user', 'name email');

    if (!contact) {
      return res.status(404).json({ message: 'Contact not found' });
    }

    // Check if the logged-in user is authorized to view this contact
    if (req.user.role === 'buyer' && contact.user._id.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized to view this contact' });
    }

    if (req.user.role === 'agent') {
      const property = await propertyModel.findById(contact.property._id);
      if (property.agent.toString() !== req.user.id) {
        return res.status(401).json({ message: 'Not authorized to view this contact' });
      }
    }

    res.json(contact);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Create a contact (message to agent about a property)
// @route   POST /api/contacts
// @access  Private (buyer, agent, admin)
export const createContact = async (req, res) => {
  try {
    const { property, message } = req.body;

    const propertyExists = await propertyModel.findById(property);
    if (!propertyExists) {
      return res.status(404).json({ message: 'Property not found' });
    }

    const contact = await contactModel.create({
      property,
      user: req.user.id,
      message,
    });

    res.status(201).json(contact);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};