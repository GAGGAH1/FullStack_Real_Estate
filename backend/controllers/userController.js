import User from '../models/userModel.js';

export const getUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });

    const sanitizedUsers = users.map((user) => ({
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
    }));

    return res.json(sanitizedUsers);
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching users.', error: error.message });
  }
};

export const updateUserRole = async (req, res) => {
  const { role } = req.body;
  const allowedRoles = ['buyer', 'agent', 'admin'];

  if (!allowedRoles.includes(role)) {
    return res.status(400).json({ message: 'Invalid role. Must be buyer, agent, or admin.' });
  }

  if (req.params.id === req.user.id && role !== 'admin') {
    return res.status(400).json({ message: 'Lockout protection: you cannot remove your own admin role.' });
  }

  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    user.role = role;
    await user.save();

    return res.json({
      message: `User role updated successfully to ${role}.`,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: 'Error updating user role.', error: error.message });
  }
};

export const deleteUser = async (req, res) => {
  if (req.params.id === req.user.id) {
    return res.status(400).json({ message: 'Lockout protection: you cannot delete your own account.' });
  }

  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    await User.findByIdAndDelete(req.params.id);
    return res.json({ message: 'User account deleted successfully.' });
  } catch (error) {
    return res.status(500).json({ message: 'Error deleting user.', error: error.message });
  }
};
