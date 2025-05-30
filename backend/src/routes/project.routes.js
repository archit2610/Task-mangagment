import { Router } from "express";
import { createProjectValidator, addMemberToProjectValidator } from "../validators/index.js";
import { validate } from "../middlewares/validator.middleware.js";
import { createProject, 
    addMemberToProject, 
    updateProject, 
    getProjects, 
    getProjectById,
    deleteProject,
    getProjectMembers,
    updateMemberRole,
    deleteMember}from  "../controllers/project.controllers.js";
import { auth, projectmiddeleware } from "../middlewares/jwt.middleware.js";

const router = Router()
router.route('/create').post(auth, createProjectValidator(), validate, createProject);
router.route('/add-member').post(auth, addMemberToProjectValidator(), validate, addMemberToProject);
router.route('/update-project').post(auth,updateProject);
router.route('/get-projects').get(auth,getProjects);
router.route('/get-project/:projectId').get(projectmiddeleware,getProjectById);
router.route('/delete-project/:projectId').post(auth,projectmiddeleware,deleteProject);//to test
router.route('/get-project-members/:projectId').get(projectmiddeleware,getProjectMembers);
router.route('/delete-member/:projectId').get(auth,projectmiddeleware,deleteMember);//to test
router.route('/update-member/:projectId').post(auth,projectmiddeleware,updateMemberRole);

export default router