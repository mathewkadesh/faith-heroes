const supabase = require('../config/supabase');
const { emitToAdmins } = require('./socket.service');

function startRealtime() {
  supabase
    .channel('db-orders')
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'orders' }, payload => {
      emitToAdmins('order:new', payload.new);
    })
    .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'orders' }, payload => {
      emitToAdmins('order:updated', payload.new);
    })
    .subscribe();

  supabase
    .channel('db-stories')
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'community_stories' }, payload => {
      emitToAdmins('story:new', payload.new);
    })
    .subscribe();

  supabase
    .channel('db-products')
    .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'products' }, payload => {
      if (payload.new.stock_qty < 5) {
        emitToAdmins('product:low_stock', payload.new);
      }
    })
    .subscribe();
}

module.exports = { startRealtime };
