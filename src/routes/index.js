import {Router} from 'express';
import swaggerUi from 'swagger-ui-express';

import swaggerDocument from './swagger.json';

const router = Router();

router.get('/', function(req, res, next) {
  res.json({ok: true});
});
router.use('/docs', swaggerUi.serve);
router.get('/docs', swaggerUi.setup(swaggerDocument));

const tkResponse = (req, res, next) => res.json({true: false});

// Organizations
router.get('/organizations', tkResponse);
router.get('/organizations/:id', tkResponse);
router.get('/organizations/:id/:column_name', tkResponse);

// Services
router.get('/services', tkResponse);
router.get('/services/:id', tkResponse);
router.get('/services/:id/:column_name', tkResponse);

// Users
router.get('/users', tkResponse);
router.get('/users/:user_id', tkResponse);
router.get('/users/:user_id/favorites', tkResponse);

export default router;
