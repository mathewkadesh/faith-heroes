exports.getMe = (req, res) => {
  res.json({ success: true, data: { user: req.user, profile: req.profile } });
};
