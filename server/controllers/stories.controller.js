const supabase = require('../config/supabase');
const { emitToAdmins } = require('../services/socket.service');

exports.getApproved = async (req, res, next) => {
  try {
    const status = req.query.status || 'approved';
    const { data, error } = await supabase
      .from('community_stories')
      .select('*, profiles(full_name, avatar_url)')
      .eq('status', status)
      .order('created_at', { ascending: false });
    if (error) throw error;
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

exports.getPending = async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('community_stories')
      .select('*, profiles(full_name, email)')
      .eq('status', 'pending')
      .order('created_at', { ascending: false });
    if (error) throw error;
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

exports.submit = async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('community_stories')
      .insert([{ ...req.body, user_id: req.user.id, status: 'pending' }])
      .select().single();
    if (error) throw error;
    emitToAdmins('story:new', data);
    res.status(201).json({ success: true, data });
  } catch (err) { next(err); }
};

exports.approve = async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('community_stories').update({ status: 'approved' })
      .eq('id', req.params.id).select().single();
    if (error) throw error;
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

exports.reject = async (req, res, next) => {
  try {
    const { admin_notes } = req.body;
    const { data, error } = await supabase
      .from('community_stories').update({ status: 'rejected', admin_notes })
      .eq('id', req.params.id).select().single();
    if (error) throw error;
    res.json({ success: true, data });
  } catch (err) { next(err); }
};
