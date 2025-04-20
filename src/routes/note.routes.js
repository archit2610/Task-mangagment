import { Router } from "express";
import { notesValidator } from "../validators/index.js";
import { validate } from "../middlewares/validator.middleware.js";
import { auth, projectmiddeleware, notemiddeleware } from "../middlewares/jwt.middleware.js";
import { createNote,updateNote,getNoteById,getNotes,deleteNote} from '../controllers/note.controllers.js';

const router = Router()
router.route('/create').post(auth,projectmiddeleware, notesValidator(), validate, createNote);
router.route('/update').post(auth,projectmiddeleware, notesValidator(), validate, updateNote);
router.route('/delete/:noteId').get(auth,projectmiddeleware,notemiddeleware, deleteNote);
router.route('/get/:noteId').get(auth,projectmiddeleware,notemiddeleware, getNoteById);
router.route('/get').get(auth,projectmiddeleware,notemiddeleware, getNotes);

export default router