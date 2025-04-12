import { ApiError } from "../utils/api-error.js";
import { ApiResponse } from "../utils/api-response.js";
import { asyncHandler } from "../utils/async-handler.js";
import { Project } from "../models/project.models.js";
import { ProjectMember } from "../models/projectmember.models.js";
import { User } from "../models/user.models.js";
import { UserRolesEnum } from "../utils/constants.js";

const getProjects = asyncHandler(async (req, res) => {
  
  const memberships = await ProjectMember.find({ user: req.user._id }).populate("project");

  if (!memberships || memberships.length === 0) {
    return res.status(200).json(
      new ApiResponse(200, [], "User is not part of any projects")
    );
  }

  const project = memberships.map((m) => m.project);

  res.status(200).json(new ApiResponse (200,{project},'All projects user is a member of'))
});

const getProjectById = asyncHandler(async (req, res) => {
  const project = req.project;

  console.log(project);
  res.status(200).json(
    new ApiResponse (200,{ project })
  )
});

const createProject = asyncHandler(async (req, res) => {
  const {name, description } = req.body;
  const user =  req.user?._id;

  if (!name || !description ){
    throw new ApiError(200,'All details are needed')
  }

  if(await Project.findOne({name})){
    throw new ApiError (400, 'Project with same name already exsists')
  } 

  const project = await Project.create(
    {
      name,
      description,
      createdBy: user,
    }
  )
  console.log(project._id);
  res.status(200).json(new ApiResponse(201,{project},'Project created succesfully'))
});

const updateProject =asyncHandler(async (req, res) => {
 const {oldname,description,newname} = req.body;
 
 const user = await ProjectMember.findOne({
  user: req.user._id,
 });

 const project = await Project.findOne({
  name: oldname,
 });
 if (user.role === UserRolesEnum.ADMIN || user.role === UserRolesEnum.PROJECT_ADMIN){
  project.name = newname;
  project.description = description;
  await project.save();

  res.status(200).json(new ApiResponse(200,{},'Project updated successfully'))
 }
 else {
  throw new ApiError (400,'User does not have permission to change details of project')
 }

});

const deleteProject = asyncHandler(async (req, res) => {
  const {name} = req.body;
  const project = await Project.findOne({name})

  if (!project){
    throw new ApiError (400,'NO project with given name')
  }
  const user = await  ProjectMember.findOne({
    user: req.user._id,
    project: project._id,
  });
  
    if (!user){
      throw new ApiError (400,'user is not a part of project ')
    }
  
  if (user.role === UserRolesEnum.ADMIN || user.role === UserRolesEnum.PROJECT_ADMIN){
    const deletedproject = await Project.findByIdAndDelete(project._id);
    await ProjectMember.deleteMany({ project: project._id });

    res.status(200).json(new ApiResponse(200,{deletedproject},'Project deleted '))
  }
  else {
    throw new ApiError(200,'You do not have permission to delete the project')
  }

});

const getProjectMembers = asyncHandler(async (req, res) => {
  const project = req.project;

  const projectmembers = await ProjectMember.find({
    project: project.id,
  }).populate('user');

  const members = projectmembers.map((m) => m.user);

  res.status(200).json(new ApiResponse (200, {members},'All members'))
});

const addMemberToProject = asyncHandler(async (req, res) => {
  const {name,role} = req.body;

  const project = await Project.findOne({name});
  if (!project) {
    throw new ApiError (400,'Project with following name does not exsist')
  }

    const exsistinguser = await ProjectMember.findOne({
      user: req.user._id,
      project: project._id
    });

    if(exsistinguser) {
      throw new ApiError (400,'user is already a part of this project')
    }
  
  if (!Object.values(UserRolesEnum).includes(role)) {
    throw new ApiError(400, 'Invalid role provided');
  }

  const member = await ProjectMember.create({
    user: req.user._id,
    project: project._id,
    role: role,
  })
  console.log(role, member.role)
  res.status(200).json(new ApiResponse(200,'Member created successfully'))
});

const deleteMember = asyncHandler(async (req, res) => {
  const  { projectId } = req.params;
  const user = req.user._id;

  const projectmember = await ProjectMember.deleteOne({
    user: user,
    project: projectId,
  });

  res.status(200).json(
    new ApiResponse(200,null,'Projectmember deleted')
  );
});

const updateMemberRole = asyncHandler(async (req, res) => {

  const {newRole} = req.body;
  const { projectId } = req.params;
  const { userId } = req.user._id;

  if (!Object.values(UserRolesEnum).includes(newRole)) {
    throw new ApiError(400, 'Invalid role provided');
  }
  
  const user = await ProjectMember.findOneAndUpdate({
    user: userId,
    project: projectId,
    },{role: newRole},
);
  
  res.status(200).json(new ApiResponse(200,'Role updateed'));
});

export {
  addMemberToProject,
  createProject,
  deleteMember,
  deleteProject,
  getProjectById,
  getProjectMembers,
  getProjects,
  updateMemberRole,
  updateProject,
};
