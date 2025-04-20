import { ProjectNote } from '../models/note.models.js';
import { ApiError } from "../utils/api-error.js";
import { ApiResponse } from "../utils/api-response.js";
import { asyncHandler } from "../utils/async-handler.js";


const getNotes = asyncHandler(async (req, res) => {
const notes = await ProjectNote.find({ user: req.user._id }).populate("project");

 if (!notes || notes.length === 0) {
    return res.status(200).json(
      new ApiResponse(200, [], "User has not made any notes")
    );
  }

  const note = notes.map((m) => m.content);

  res.status(200).json(new ApiResponse (200,{note},'All notes user has made'))
});

const getNoteById = asyncHandler(async (req, res) => {
  const { noteId } = req.params;
  
  const note = await ProjectNote.findById(noteId);
  
  if(!note) {
    throw new ApiError (400,'Select a note before creating a project')
  }

  res.status(200).json(new ApiResponse (200,{note}, `Here is the note`))
});

const createNote = asyncHandler(async (req, res) => {
const { content } = req.body;
const { projectId } = req.params;
const userId = req.user._id;

if(!projectId){
  throw new ApiError (400,'Select a project before creating a note')
}
const Note = await ProjectNote.create({
  project: projectId,
  createdBy: userId,
  content: content,
});

res.status(200).json(new ApiResponse (200,{note}, `New note created`))
});

const updateNote = asyncHandler(async (req, res) => {
  const { oldcontent,newcontent } = req.body;
  const  { projectId } = req.params;
  const userId = req.user._id;
  
  const note =  await ProjectNote.find({
    project: projectId,
    createdBy: userId,
    content: oldcontent,
  });
  
  if(!note) {
    throw new error (400,'There is no note to update')
  } else {
    note.content = newcontent;
    await note.save();
  }
  
  res.status(200).json(new ApiResponse (200,{note}, `Note changed`))
  
});

const deleteNote = asyncHandler(async (req, res) => {
  const { noteId } = req.params;
  
  const deletednote = ProjectNote.findByIdAndDelete(noteId);
  
  if (!deletednote) {
    throw new ApiError (400,{},'note not founded')
  }
  res.status(200).json(new ApiResponse (200,{}, `Note deleted`))
});

export { createNote, deleteNote, getNoteById, getNotes, updateNote };
