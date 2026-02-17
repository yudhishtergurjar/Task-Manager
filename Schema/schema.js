import Joi from "joi";
import { title } from "process";
export const userRegisterSchema = Joi.object({
    username:Joi.string().min(3).required(),
    email:Joi.string().email().required(),
    password: Joi.string().min(6).required()
})

export const userLoginSchema = Joi.object({
    email:Joi.string().email().required(),
    password: Joi.string().min(6).required()
})

export const createProjectSchema = Joi.object({
    title:Joi.string().min(5).required(),
    description:Joi.string().min(5).required()
})

export const updateProjectSchema = Joi.object({
    title:Joi.string().min(5).required(),
    description:Joi.string().min(10).required()
})

export const createTaskSchema = Joi.object({
  title: Joi.string().min(3).required(),
  description: Joi.string().min(5).required()
});

export const updateTaskSchema = Joi.object({
  title: Joi.string().min(3).required(),
  description: Joi.string().min(5).required()
});

export const updateStatusSchema = Joi.object({
  status: Joi.string().valid("pending", "completed").required()
});
