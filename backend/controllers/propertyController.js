import config from '../config/database.js';

export const getPublicProperties = async (req, res) => {
  const { search, location, minPrice, maxPrice, beds, type } = req.query;

  let properties = db.properties.find({ status: 'approved' });

  if (search) {
    const q = search.toLowerCase();
    properties = properties.filter((p) =>
      p.title.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.location.toLowerCase().includes(q)
    );
  }

  if (location) {
    const loc = location.toLowerCase();
    properties = properties.filter((p) => p.location.toLowerCase().includes(loc));
  }

  if (minPrice) {
    const min = parseFloat(minPrice);
    if (!Number.isNaN(min)) {
      properties = properties.filter((p) => p.price >= min);
    }
  }

  if (maxPrice) {
    const max = parseFloat(maxPrice);
    if (!Number.isNaN(max)) {
      properties = properties.filter((p) => p.price <= max);
    }
  }

  if (beds) {
    const b = parseInt(beds, 10);
    if (!Number.isNaN(b) && b > 0) {
      properties = properties.filter((p) => p.beds >= b);
    }
  }

  if (type && ['sale', 'rent'].includes(type)) {
    properties = properties.filter((p) => p.type === type);
  }

  return res.json(properties);
};

export const getPropertyById = async (req, res) => {
  const property = db.properties.findById(req.params.id);
  if (!property) {
    return res.status(404).json({ message: 'Property not found.' });
  }
  return res.json(property);
};

export const getDashboardProperties = async (req, res) => {
  if (req.user.role === 'admin') {
    return res.json(db.properties.find());
  }

  return res.json(db.properties.find({ agentId: req.user.id }));
};

export const createProperty = async (req, res) => {
  const { title, description, price, beds, baths, area, location, address, type, image } = req.body;

  if (!title || !price || !location || !address || !type) {
    return res.status(400).json({ message: 'Title, price, location, address, and type (sale/rent) are required.' });
  }

  const initialStatus = req.user.role === 'admin' ? 'approved' : 'pending';

  try {
    const newProperty = db.properties.create({
      title,
      description: description || 'No description provided.',
      price: parseFloat(price),
      beds: parseInt(beds, 10) || 0,
      baths: parseFloat(baths) || 0,
      area: parseInt(area, 10) || 0,
      location,
      address,
      type,
      image: image || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80',
      status: initialStatus,
      agentId: req.user.id,
      agentName: req.user.name
    });

    return res.status(201).json({
      message: req.user.role === 'admin' ? 'Property listed successfully!' : 'Property submitted successfully! It is currently pending Admin review.',
      property: newProperty
    });
  } catch (error) {
    return res.status(500).json({ message: 'Error listing property.', error: error.message });
  }
};

export const updateProperty = async (req, res) => {
  const property = db.properties.findById(req.params.id);
  if (!property) {
    return res.status(404).json({ message: 'Property not found.' });
  }

  if (req.user.role !== 'admin' && property.agentId !== req.user.id) {
    return res.status(403).json({ message: 'Access denied. You do not own this property listing.' });
  }

  const { title, description, price, beds, baths, area, location, address, type, image } = req.body;

  const updates = {};
  if (title) updates.title = title;
  if (description) updates.description = description;
  if (price) updates.price = parseFloat(price);
  if (beds !== undefined) updates.beds = parseInt(beds, 10);
  if (baths !== undefined) updates.baths = parseFloat(baths);
  if (area !== undefined) updates.area = parseInt(area, 10);
  if (location) updates.location = location;
  if (address) updates.address = address;
  if (type) updates.type = type;
  if (image) updates.image = image;

  if (req.user.role === 'agent') {
    updates.status = 'pending';
  }

  const updatedProperty = db.properties.findByIdAndUpdate(req.params.id, updates);

  return res.json({
    message: req.user.role === 'agent' ? 'Property updated. It is now pending admin re-approval.' : 'Property updated successfully.',
    property: updatedProperty
  });
};

export const deleteProperty = async (req, res) => {
  const property = db.properties.findById(req.params.id);
  if (!property) {
    return res.status(404).json({ message: 'Property not found.' });
  }

  if (req.user.role !== 'admin' && property.agentId !== req.user.id) {
    return res.status(403).json({ message: 'Access denied. You do not own this property listing.' });
  }

  db.properties.findByIdAndDelete(req.params.id);
  return res.json({ message: 'Property deleted successfully.' });
};

export const approveProperty = async (req, res) => {
  const { status } = req.body;

  if (!['approved', 'rejected', 'pending'].includes(status)) {
    return res.status(400).json({ message: "Invalid status. Must be 'approved', 'rejected' or 'pending'." });
  }

  const property = db.properties.findById(req.params.id);
  if (!property) {
    return res.status(404).json({ message: 'Property not found.' });
  }

  const updatedProperty = db.properties.findByIdAndUpdate(req.params.id, { status });
  return res.json({
    message: `Property status set to: ${status}`,
    property: updatedProperty
  });
};
