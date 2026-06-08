const router = require('express').Router();
const auth      = require('../middleware/auth');
const adminOnly = require('../middleware/adminOnly');
const ctrl      = require('../controllers/characters.controller');

router.get('/',               ctrl.getAll);
router.get('/:id',            ctrl.getOne);
router.post('/',              auth, adminOnly, ctrl.create);
router.put('/:id',            auth, adminOnly, ctrl.update);
router.delete('/:id',         auth, adminOnly, ctrl.remove);
router.patch('/:id/publish',  auth, adminOnly, ctrl.togglePublish);

module.exports = router;
