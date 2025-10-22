// src/routes/strings.js
import express from 'express';
import stringsController from '../controllers/stringsController.js';
import validation from '../middlewares/validation.js';

const router = express.Router();

router.post('/', validation.requireValueField, stringsController.createString);
router.get('/', stringsController.getAllStrings);
router.get('/natural', stringsController.naturalFilter);
router.get('/:string_value', stringsController.getString);
router.delete('/:string_value', stringsController.deleteString);

export default router;
